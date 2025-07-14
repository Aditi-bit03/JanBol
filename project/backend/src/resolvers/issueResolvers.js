const Issue = require('../models/Issue');
const User = require('../models/User');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const logger = require('../utils/logger');

const issueResolvers = {
  Query: {
    issue: async (parent, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const issue = await Issue.findById(id)
        .populate('reporter', 'name email phone role')
        .populate('assignedTo', 'name email phone role');

      if (!issue) throw new UserInputError('Issue not found');

      // Check if user can view this issue
      if (!issue.isPublic && issue.reporter.toString() !== user.id && user.role !== 'admin' && user.role !== 'official') {
        throw new ForbiddenError('Access denied');
      }

      // Increment view count
      await issue.incrementEngagement('views');

      return issue;
    },

    issues: async (parent, { filter, sort, pagination }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const query = { isPublic: true };

      // Apply filters
      if (filter) {
        if (filter.status) query.status = { $in: filter.status.map(s => s.toLowerCase()) };
        if (filter.category) query.category = { $in: filter.category.map(c => c.toLowerCase()) };
        if (filter.priority) query.priority = { $in: filter.priority.map(p => p.toLowerCase()) };
        if (filter.assignedTo) query.assignedTo = filter.assignedTo;
        if (filter.reporter) query.reporter = filter.reporter;
        if (filter.isUrgent !== undefined) query.isUrgent = filter.isUrgent;
        if (filter.tags && filter.tags.length > 0) query.tags = { $in: filter.tags };
        if (filter.department) query.department = filter.department;

        if (filter.location) {
          if (filter.location.district) query['location.district'] = filter.location.district;
          if (filter.location.state) query['location.state'] = filter.location.state;
          if (filter.location.coordinates && filter.location.radius) {
            query['location.coordinates'] = {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: filter.location.coordinates.coordinates
                },
                $maxDistance: filter.location.radius * 1000 // Convert km to meters
              }
            };
          }
        }

        if (filter.dateRange) {
          query.createdAt = {};
          if (filter.dateRange.from) query.createdAt.$gte = filter.dateRange.from;
          if (filter.dateRange.to) query.createdAt.$lte = filter.dateRange.to;
        }
      }

      // If user is not admin/official, only show public issues
      if (user.role !== 'admin' && user.role !== 'official') {
        query.isPublic = true;
      }

      // Apply sorting
      const sortOptions = {};
      if (sort) {
        const field = sort.field.toLowerCase().replace('_', '.');
        if (field === 'urgency.score') {
          sortOptions['aiAnalysis.urgencyScore'] = sort.order === 'ASC' ? 1 : -1;
        } else {
          sortOptions[field] = sort.order === 'ASC' ? 1 : -1;
        }
      } else {
        sortOptions.createdAt = -1;
      }

      // Apply pagination
      const limit = pagination?.first || 20;
      const skip = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0;

      const issues = await Issue.find(query)
        .populate('reporter', 'name email phone role')
        .populate('assignedTo', 'name email phone role')
        .sort(sortOptions)
        .limit(limit + 1)
        .skip(skip);

      const hasNextPage = issues.length > limit;
      if (hasNextPage) issues.pop();

      const edges = issues.map((issue, index) => ({
        node: issue,
        cursor: Buffer.from((skip + index + 1).toString()).toString('base64')
      }));

      const totalCount = await Issue.countDocuments(query);

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: skip > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
          totalCount
        }
      };
    },

    myIssues: async (parent, { status, pagination }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const query = { reporter: user.id };
      if (status) query.status = status.toLowerCase();

      const limit = pagination?.first || 20;
      const skip = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0;

      const issues = await Issue.find(query)
        .populate('assignedTo', 'name email phone role')
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .skip(skip);

      const hasNextPage = issues.length > limit;
      if (hasNextPage) issues.pop();

      const edges = issues.map((issue, index) => ({
        node: issue,
        cursor: Buffer.from((skip + index + 1).toString()).toString('base64')
      }));

      const totalCount = await Issue.countDocuments(query);

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: skip > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
          totalCount
        }
      };
    },

    nearbyIssues: async (parent, { coordinates, radius, limit }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const issues = await Issue.findNearby(
        coordinates.coordinates[0],
        coordinates.coordinates[1],
        radius
      )
        .populate('reporter', 'name email phone role')
        .populate('assignedTo', 'name email phone role')
        .limit(limit)
        .sort({ createdAt: -1 });

      return issues;
    },

    trendingIssues: async (parent, { limit }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const issues = await Issue.getTrending(limit);
      
      // Populate the results
      await Issue.populate(issues, [
        { path: 'reporter', select: 'name email phone role' },
        { path: 'assignedTo', select: 'name email phone role' }
      ]);

      return issues;
    },

    issueStats: async (parent, args, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const total = await Issue.countDocuments({ isPublic: true });

      // Get counts by status
      const statusCounts = await Issue.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Get counts by category
      const categoryCounts = await Issue.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      // Get counts by priority
      const priorityCounts = await Issue.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]);

      // Calculate average resolution time
      const resolutionStats = await Issue.aggregate([
        { $match: { status: 'resolved', actualResolution: { $exists: true } } },
        {
          $addFields: {
            resolutionTime: {
              $divide: [
                { $subtract: ['$actualResolution', '$createdAt'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResolutionTime: { $avg: '$resolutionTime' },
            totalResolved: { $sum: 1 }
          }
        }
      ]);

      const avgResolutionTime = resolutionStats[0]?.avgResolutionTime || 0;
      const resolutionRate = total > 0 ? (resolutionStats[0]?.totalResolved || 0) / total : 0;

      // Get trending categories (most reported in last 7 days)
      const trendingCategories = await Issue.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            isPublic: true
          }
        },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, category: '$_id' } }
      ]);

      return {
        total,
        byStatus: statusCounts.map(item => ({
          status: item._id.toUpperCase(),
          count: item.count
        })),
        byCategory: categoryCounts.map(item => ({
          category: item._id.toUpperCase(),
          count: item.count
        })),
        byPriority: priorityCounts.map(item => ({
          priority: item._id.toUpperCase(),
          count: item.count
        })),
        avgResolutionTime,
        resolutionRate,
        trendingCategories: trendingCategories.map(item => item.category)
      };
    },

    searchIssues: async (parent, { query, limit }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const searchRegex = new RegExp(query, 'i');
      const issues = await Issue.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } }
        ],
        isPublic: true
      })
        .populate('reporter', 'name email phone role')
        .populate('assignedTo', 'name email phone role')
        .limit(limit)
        .sort({ createdAt: -1 });

      return issues;
    }
  },

  Mutation: {
    createIssue: async (parent, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      try {
        const issue = new Issue({
          ...input,
          reporter: user.id,
          category: input.category.toLowerCase(),
          priority: input.priority?.toLowerCase() || 'medium',
          language: input.language?.toLowerCase() || 'hindi'
        });

        await issue.save();

        // Update user stats
        const reporterUser = await User.findById(user.id);
        await reporterUser.updateStats('report');

        // Populate the issue before returning
        await issue.populate('reporter', 'name email phone role');

        logger.info(`New issue created: ${issue.id} by ${user.email}`);

        return issue;
      } catch (error) {
        logger.error('Issue creation error:', error);
        throw new UserInputError('Failed to create issue');
      }
    },

    updateIssue: async (parent, { id, input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const issue = await Issue.findById(id);
      if (!issue) throw new UserInputError('Issue not found');

      // Check permissions
      if (issue.reporter.toString() !== user.id && user.role !== 'admin' && user.role !== 'official') {
        throw new ForbiddenError('Access denied');
      }

      const updateData = { ...input };
      if (input.category) updateData.category = input.category.toLowerCase();
      if (input.priority) updateData.priority = input.priority.toLowerCase();

      const updatedIssue = await Issue.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('reporter', 'name email phone role')
       .populate('assignedTo', 'name email phone role');

      logger.info(`Issue updated: ${id} by ${user.email}`);

      return updatedIssue;
    },

    updateIssueStatus: async (parent, { id, status, notes }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const issue = await Issue.findById(id);
      if (!issue) throw new UserInputError('Issue not found');

      // Check permissions - only officials and admins can update status
      if (user.role !== 'admin' && user.role !== 'official') {
        throw new ForbiddenError('Only officials can update issue status');
      }

      await issue.updateStatus(status.toLowerCase(), user.id, notes);

      // If issue is resolved, update reporter stats
      if (status.toLowerCase() === 'resolved') {
        const reporter = await User.findById(issue.reporter);
        await reporter.updateStats('resolve');
      }

      await issue.populate('reporter', 'name email phone role');
      await issue.populate('assignedTo', 'name email phone role');

      logger.info(`Issue status updated: ${id} -> ${status} by ${user.email}`);

      return issue;
    },

    assignIssue: async (parent, { id, assigneeId }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Check permissions
      if (user.role !== 'admin' && user.role !== 'official') {
        throw new ForbiddenError('Only officials can assign issues');
      }

      const issue = await Issue.findById(id);
      if (!issue) throw new UserInputError('Issue not found');

      const assignee = await User.findById(assigneeId);
      if (!assignee) throw new UserInputError('Assignee not found');

      issue.assignedTo = assigneeId;
      await issue.addTimelineEntry(
        'assigned',
        `Issue assigned to ${assignee.name}`,
        user.id,
        { assigneeId, assigneeName: assignee.name }
      );

      await issue.populate('reporter', 'name email phone role');
      await issue.populate('assignedTo', 'name email phone role');

      logger.info(`Issue assigned: ${id} -> ${assignee.email} by ${user.email}`);

      return issue;
    },

    upvoteIssue: async (parent, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const issue = await Issue.findById(id);
      if (!issue) throw new UserInputError('Issue not found');

      await issue.incrementEngagement('upvotes');
      await issue.populate('reporter', 'name email phone role');
      await issue.populate('assignedTo', 'name email phone role');

      return issue;
    },

    submitFeedback: async (parent, { id, input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const issue = await Issue.findById(id);
      if (!issue) throw new UserInputError('Issue not found');

      // Check if user is the reporter or if issue is resolved
      if (issue.reporter.toString() !== user.id && issue.status !== 'resolved') {
        throw new ForbiddenError('Can only provide feedback on your own issues or resolved issues');
      }

      issue.feedback = {
        ...input,
        submittedAt: new Date()
      };

      await issue.save();

      // Update user stats for feedback
      const feedbackUser = await User.findById(user.id);
      await feedbackUser.updateStats('feedback');

      await issue.populate('reporter', 'name email phone role');
      await issue.populate('assignedTo', 'name email phone role');

      logger.info(`Feedback submitted for issue: ${id} by ${user.email}`);

      return issue;
    }
  },

  Issue: {
    reporter: async (parent) => {
      if (parent.reporter && typeof parent.reporter === 'object') {
        return parent.reporter;
      }
      return await User.findById(parent.reporter);
    },

    assignedTo: async (parent) => {
      if (!parent.assignedTo) return null;
      if (parent.assignedTo && typeof parent.assignedTo === 'object') {
        return parent.assignedTo;
      }
      return await User.findById(parent.assignedTo);
    },

    duplicateOf: async (parent) => {
      if (!parent.duplicateOf) return null;
      return await Issue.findById(parent.duplicateOf);
    },

    relatedIssues: async (parent) => {
      if (!parent.relatedIssues || parent.relatedIssues.length === 0) return [];
      return await Issue.find({ _id: { $in: parent.relatedIssues } });
    }
  }
};

module.exports = issueResolvers;