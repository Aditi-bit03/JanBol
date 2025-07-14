const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const logger = require('../utils/logger');

const commentResolvers = {
  Query: {
    comment: async (parent, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const comment = await Comment.findById(id)
        .populate('author', 'name email phone role')
        .populate('issue', 'title isPublic')
        .populate('parentComment');

      if (!comment) throw new UserInputError('Comment not found');

      // Check if user can view this comment (based on issue visibility)
      if (!comment.issue.isPublic && user.role !== 'admin' && user.role !== 'official') {
        throw new ForbiddenError('Access denied');
      }

      return comment;
    },

    issueComments: async (parent, { issueId, pagination }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Check if user can view the issue
      const issue = await Issue.findById(issueId);
      if (!issue) throw new UserInputError('Issue not found');

      if (!issue.isPublic && issue.reporter.toString() !== user.id && user.role !== 'admin' && user.role !== 'official') {
        throw new ForbiddenError('Access denied');
      }

      const query = { 
        issue: issueId, 
        parentComment: null, // Only top-level comments
        isHidden: false 
      };

      const limit = pagination?.first || 20;
      const skip = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0;

      const comments = await Comment.find(query)
        .populate('author', 'name email phone role')
        .populate('replies')
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .skip(skip);

      const hasNextPage = comments.length > limit;
      if (hasNextPage) comments.pop();

      const edges = comments.map((comment, index) => ({
        node: comment,
        cursor: Buffer.from((skip + index + 1).toString()).toString('base64')
      }));

      const totalCount = await Comment.countDocuments(query);

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

    userComments: async (parent, { userId, pagination }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Users can only view their own comments unless they're admin
      if (user.id !== userId && user.role !== 'admin') {
        throw new ForbiddenError('Access denied');
      }

      const query = { 
        author: userId,
        isHidden: false 
      };

      const limit = pagination?.first || 20;
      const skip = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0;

      const comments = await Comment.find(query)
        .populate('issue', 'title category status')
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .skip(skip);

      const hasNextPage = comments.length > limit;
      if (hasNextPage) comments.pop();

      const edges = comments.map((comment, index) => ({
        node: comment,
        cursor: Buffer.from((skip + index + 1).toString()).toString('base64')
      }));

      const totalCount = await Comment.countDocuments(query);

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
    }
  },

  Mutation: {
    createComment: async (parent, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Check if issue exists and user can comment
      const issue = await Issue.findById(input.issueId);
      if (!issue) throw new UserInputError('Issue not found');

      if (!issue.isPublic && issue.reporter.toString() !== user.id && user.role !== 'admin' && user.role !== 'official') {
        throw new ForbiddenError('Cannot comment on private issue');
      }

      // If it's a reply, check if parent comment exists
      if (input.parentCommentId) {
        const parentComment = await Comment.findById(input.parentCommentId);
        if (!parentComment) throw new UserInputError('Parent comment not found');
        if (parentComment.issue.toString() !== input.issueId) {
          throw new UserInputError('Parent comment does not belong to this issue');
        }
      }

      try {
        const comment = new Comment({
          content: input.content,
          author: user.id,
          issue: input.issueId,
          parentComment: input.parentCommentId || null,
          language: input.language?.toLowerCase() || 'hindi',
          isOfficial: user.role === 'official' || user.role === 'admin'
        });

        await comment.save();

        // If it's a reply, add to parent's replies array
        if (input.parentCommentId) {
          await Comment.findByIdAndUpdate(
            input.parentCommentId,
            { $push: { replies: comment._id } }
          );
        }

        // Increment comment count on issue
        await Issue.findByIdAndUpdate(
          input.issueId,
          { $inc: { 'engagement.comments': 1 } }
        );

        // Populate the comment before returning
        await comment.populate('author', 'name email phone role');
        await comment.populate('issue', 'title category status');

        logger.info(`New comment created on issue ${input.issueId} by ${user.email}`);

        return comment;
      } catch (error) {
        logger.error('Comment creation error:', error);
        throw new UserInputError('Failed to create comment');
      }
    },

    updateComment: async (parent, { id, content }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const comment = await Comment.findById(id);
      if (!comment) throw new UserInputError('Comment not found');

      // Check if user owns the comment or is admin
      if (comment.author.toString() !== user.id && user.role !== 'admin') {
        throw new ForbiddenError('Can only edit your own comments');
      }

      // Check if comment is not too old (e.g., 24 hours)
      const hoursSinceCreation = (Date.now() - comment.createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation > 24 && user.role !== 'admin') {
        throw new ForbiddenError('Cannot edit comments older than 24 hours');
      }

      comment.content = content;
      comment.isEdited = true;
      comment.editedAt = new Date();

      await comment.save();

      await comment.populate('author', 'name email phone role');
      await comment.populate('issue', 'title category status');

      logger.info(`Comment updated: ${id} by ${user.email}`);

      return comment;
    },

    deleteComment: async (parent, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const comment = await Comment.findById(id);
      if (!comment) throw new UserInputError('Comment not found');

      // Check if user owns the comment or is admin
      if (comment.author.toString() !== user.id && user.role !== 'admin') {
        throw new ForbiddenError('Can only delete your own comments');
      }

      // Remove from parent's replies if it's a reply
      if (comment.parentComment) {
        await Comment.findByIdAndUpdate(
          comment.parentComment,
          { $pull: { replies: comment._id } }
        );
      }

      // Delete all replies to this comment
      await Comment.deleteMany({ parentComment: comment._id });

      // Delete the comment
      await Comment.findByIdAndDelete(id);

      // Decrement comment count on issue
      await Issue.findByIdAndUpdate(
        comment.issue,
        { $inc: { 'engagement.comments': -1 } }
      );

      logger.info(`Comment deleted: ${id} by ${user.email}`);

      return {
        success: true,
        message: 'Comment deleted successfully'
      };
    },

    likeComment: async (parent, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const comment = await Comment.findById(id);
      if (!comment) throw new UserInputError('Comment not found');

      await comment.addLike(user.id);
      await comment.populate('author', 'name email phone role');
      await comment.populate('issue', 'title category status');

      return comment;
    },

    unlikeComment: async (parent, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const comment = await Comment.findById(id);
      if (!comment) throw new UserInputError('Comment not found');

      await comment.removeLike(user.id);
      await comment.populate('author', 'name email phone role');
      await comment.populate('issue', 'title category status');

      return comment;
    },

    hideComment: async (parent, { id, reason }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Only admins and officials can hide comments
      if (user.role !== 'admin' && user.role !== 'official') {
        throw new ForbiddenError('Insufficient permissions');
      }

      const comment = await Comment.findByIdAndUpdate(
        id,
        {
          isHidden: true,
          hiddenReason: reason,
          moderatedBy: user.id
        },
        { new: true }
      );

      if (!comment) throw new UserInputError('Comment not found');

      await comment.populate('author', 'name email phone role');
      await comment.populate('issue', 'title category status');

      logger.info(`Comment hidden: ${id} by ${user.email} - Reason: ${reason}`);

      return comment;
    },

    unhideComment: async (parent, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Only admins can unhide comments
      if (user.role !== 'admin') {
        throw new ForbiddenError('Admin access required');
      }

      const comment = await Comment.findByIdAndUpdate(
        id,
        {
          isHidden: false,
          $unset: { hiddenReason: 1, moderatedBy: 1 }
        },
        { new: true }
      );

      if (!comment) throw new UserInputError('Comment not found');

      await comment.populate('author', 'name email phone role');
      await comment.populate('issue', 'title category status');

      logger.info(`Comment unhidden: ${id} by ${user.email}`);

      return comment;
    }
  },

  Comment: {
    author: async (parent) => {
      if (parent.author && typeof parent.author === 'object') {
        return parent.author;
      }
      return await User.findById(parent.author);
    },

    issue: async (parent) => {
      if (parent.issue && typeof parent.issue === 'object') {
        return parent.issue;
      }
      return await Issue.findById(parent.issue);
    },

    parentComment: async (parent) => {
      if (!parent.parentComment) return null;
      if (parent.parentComment && typeof parent.parentComment === 'object') {
        return parent.parentComment;
      }
      return await Comment.findById(parent.parentComment);
    },

    replies: async (parent) => {
      if (!parent.replies || parent.replies.length === 0) return [];
      
      // If replies are already populated
      if (parent.replies[0] && typeof parent.replies[0] === 'object') {
        return parent.replies;
      }
      
      // Fetch replies
      return await Comment.find({ 
        _id: { $in: parent.replies },
        isHidden: false 
      })
        .populate('author', 'name email phone role')
        .sort({ createdAt: 1 });
    },

    moderatedBy: async (parent) => {
      if (!parent.moderatedBy) return null;
      return await User.findById(parent.moderatedBy);
    }
  }
};

module.exports = commentResolvers;