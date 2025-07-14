const Notification = require('../models/Notification');
const User = require('../models/User');
const Issue = require('../models/Issue');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { PubSub, withFilter } = require('graphql-subscriptions');
const logger = require('../utils/logger');

const pubsub = new PubSub();

const notificationResolvers = {
  Query: {
    notifications: async (parent, { filter, pagination }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const query = { recipient: user.id };

      // Apply filters
      if (filter) {
        if (filter.type) query.type = { $in: filter.type.map(t => t.toLowerCase()) };
        if (filter.isRead !== undefined) query.isRead = filter.isRead;
        if (filter.priority) query.priority = filter.priority;
        if (filter.dateRange) {
          query.createdAt = {};
          if (filter.dateRange.from) query.createdAt.$gte = filter.dateRange.from;
          if (filter.dateRange.to) query.createdAt.$lte = filter.dateRange.to;
        }
      }

      const limit = pagination?.first || 20;
      const skip = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0;

      const notifications = await Notification.find(query)
        .populate('sender', 'name email phone role')
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .skip(skip);

      const hasNextPage = notifications.length > limit;
      if (hasNextPage) notifications.pop();

      const edges = notifications.map((notification, index) => ({
        node: notification,
        cursor: Buffer.from((skip + index + 1).toString()).toString('base64')
      }));

      const totalCount = await Notification.countDocuments(query);

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

    unreadNotificationCount: async (parent, args, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return await Notification.getUnreadCount(user.id);
    },

    notification: async (parent, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const notification = await Notification.findById(id)
        .populate('sender', 'name email phone role');

      if (!notification) throw new UserInputError('Notification not found');

      // Check if user owns this notification
      if (notification.recipient.toString() !== user.id && user.role !== 'admin') {
        throw new ForbiddenError('Access denied');
      }

      return notification;
    }
  },

  Mutation: {
    markNotificationAsRead: async (parent, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const notification = await Notification.findById(id);
      if (!notification) throw new UserInputError('Notification not found');

      // Check if user owns this notification
      if (notification.recipient.toString() !== user.id) {
        throw new ForbiddenError('Access denied');
      }

      await notification.markAsRead();
      await notification.populate('sender', 'name email phone role');

      return notification;
    },

    markAllNotificationsAsRead: async (parent, args, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      await Notification.updateMany(
        { recipient: user.id, isRead: false },
        { 
          isRead: true, 
          readAt: new Date(),
          status: 'read'
        }
      );

      logger.info(`All notifications marked as read for user: ${user.email}`);

      return {
        success: true,
        message: 'All notifications marked as read'
      };
    },

    deleteNotification: async (parent, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const notification = await Notification.findById(id);
      if (!notification) throw new UserInputError('Notification not found');

      // Check if user owns this notification
      if (notification.recipient.toString() !== user.id) {
        throw new ForbiddenError('Access denied');
      }

      await Notification.findByIdAndDelete(id);

      logger.info(`Notification deleted: ${id} by ${user.email}`);

      return {
        success: true,
        message: 'Notification deleted successfully'
      };
    },

    updateNotificationSettings: async (parent, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const updateData = {};
      Object.keys(input).forEach(key => {
        if (input[key] !== undefined) {
          updateData[`preferences.notifications.${key}`] = input[key];
        }
      });

      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      logger.info(`Notification settings updated for user: ${user.email}`);

      return updatedUser;
    },

    sendBulkNotification: async (parent, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Only admins can send bulk notifications
      if (user.role !== 'admin') {
        throw new ForbiddenError('Admin access required');
      }

      const notifications = input.recipients.map(recipientId => ({
        recipient: recipientId,
        sender: user.id,
        type: input.type.toLowerCase(),
        title: input.title,
        message: input.message,
        channels: input.channels.map(c => c.toLowerCase()),
        priority: input.priority,
        scheduledFor: input.scheduledFor,
        data: input.data ? JSON.parse(input.data) : {},
        language: 'hindi' // Default language
      }));

      await Notification.insertMany(notifications);

      // Publish to subscriptions for real-time notifications
      notifications.forEach(notification => {
        pubsub.publish('NOTIFICATION_RECEIVED', {
          notificationReceived: notification,
          userId: notification.recipient
        });
      });

      logger.info(`Bulk notification sent to ${input.recipients.length} users by ${user.email}`);

      return {
        success: true,
        message: `Notification sent to ${input.recipients.length} users`
      };
    }
  },

  Subscription: {
    notificationReceived: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['NOTIFICATION_RECEIVED']),
        (payload, variables) => {
          return payload.userId === variables.userId;
        }
      )
    },

    issueUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['ISSUE_UPDATED']),
        (payload, variables) => {
          return payload.issueId === variables.issueId;
        }
      )
    }
  },

  Notification: {
    recipient: async (parent) => {
      if (parent.recipient && typeof parent.recipient === 'object') {
        return parent.recipient;
      }
      return await User.findById(parent.recipient);
    },

    sender: async (parent) => {
      if (!parent.sender) return null;
      if (parent.sender && typeof parent.sender === 'object') {
        return parent.sender;
      }
      return await User.findById(parent.sender);
    },

    data: (parent) => {
      if (!parent.data) return null;
      
      return {
        issueId: parent.data.issueId,
        commentId: parent.data.commentId,
        actionUrl: parent.data.actionUrl,
        metadata: parent.data.metadata ? JSON.stringify(parent.data.metadata) : null
      };
    }
  }
};

// Helper function to create and send notification
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();

    // Publish to subscription
    pubsub.publish('NOTIFICATION_RECEIVED', {
      notificationReceived: notification,
      userId: notification.recipient
    });

    return notification;
  } catch (error) {
    logger.error('Failed to create notification:', error);
    throw error;
  }
};

// Export helper function for use in other resolvers
notificationResolvers.createNotification = createNotification;

module.exports = notificationResolvers;