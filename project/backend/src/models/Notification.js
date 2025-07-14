const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['issue_update', 'issue_resolved', 'comment_reply', 'system_alert', 'feedback_request', 'assignment', 'urgent_alert'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  data: {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue'
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    actionUrl: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  channels: [{
    type: String,
    enum: ['push', 'sms', 'email', 'voice', 'in_app']
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  language: {
    type: String,
    enum: ['hindi', 'english', 'punjabi', 'gujarati', 'marathi', 'tamil', 'bengali', 'telugu', 'kannada', 'malayalam'],
    default: 'hindi'
  },
  scheduledFor: Date,
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  isRead: { type: Boolean, default: false },
  deliveryAttempts: { type: Number, default: 0 },
  lastAttemptAt: Date,
  failureReason: String
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ type: 1, priority: -1 });
notificationSchema.index({ isRead: 1, recipient: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  this.status = 'read';
  return this.save();
};

// Method to mark as sent
notificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

// Method to mark as delivered
notificationSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

// Method to mark as failed
notificationSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.deliveryAttempts++;
  this.lastAttemptAt = new Date();
  return this.save();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);