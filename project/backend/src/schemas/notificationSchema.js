const { gql } = require('apollo-server-express');

const notificationTypeDefs = gql`
  extend type Query {
    # Notification queries
    notifications(
      filter: NotificationFilterInput
      pagination: PaginationInput
    ): NotificationConnection!
    unreadNotificationCount: Int!
    notification(id: ID!): Notification
  }

  extend type Mutation {
    # Notification management
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: SuccessResponse!
    deleteNotification(id: ID!): SuccessResponse!
    
    # Notification preferences
    updateNotificationSettings(input: NotificationSettingsInput!): User!
    
    # Send notifications (admin only)
    sendBulkNotification(input: BulkNotificationInput!): SuccessResponse!
  }

  extend type Subscription {
    notificationReceived(userId: ID!): Notification!
    issueUpdated(issueId: ID!): Issue!
  }

  type Notification {
    id: ID!
    recipient: User!
    sender: User
    type: NotificationType!
    title: String!
    message: String!
    data: NotificationData
    channels: [NotificationChannel!]!
    status: String!
    priority: String!
    language: Language!
    scheduledFor: Date
    sentAt: Date
    deliveredAt: Date
    readAt: Date
    isRead: Boolean!
    deliveryAttempts: Int!
    lastAttemptAt: Date
    failureReason: String
    createdAt: Date!
    updatedAt: Date!
  }

  type NotificationData {
    issueId: ID
    commentId: ID
    actionUrl: String
    metadata: String # JSON string
  }

  type NotificationConnection {
    edges: [NotificationEdge!]!
    pageInfo: PaginationInfo!
  }

  type NotificationEdge {
    node: Notification!
    cursor: String!
  }

  # Input types
  input NotificationFilterInput {
    type: [NotificationType!]
    isRead: Boolean
    priority: String
    dateRange: DateRangeInput
  }

  input NotificationSettingsInput {
    push: Boolean
    sms: Boolean
    email: Boolean
    voice: Boolean
  }

  input BulkNotificationInput {
    title: String!
    message: String!
    type: NotificationType!
    channels: [NotificationChannel!]!
    priority: String = "medium"
    recipients: [ID!]! # User IDs
    scheduledFor: Date
    data: String # JSON string
  }
`;

module.exports = notificationTypeDefs;