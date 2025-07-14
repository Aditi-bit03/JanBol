const { gql } = require('apollo-server-express');
const userTypeDefs = require('./userSchema');
const issueTypeDefs = require('./issueSchema');
const commentTypeDefs = require('./commentSchema');
const notificationTypeDefs = require('./notificationSchema');

const rootTypeDefs = gql`
  scalar Date
  scalar Upload

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }

  # Common types
  type PaginationInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
    totalCount: Int!
  }

  input PaginationInput {
    first: Int
    after: String
    last: Int
    before: String
  }

  type Location {
    address: String!
    locality: String
    district: String
    state: String
    pincode: String
    coordinates: Coordinates!
  }

  type Coordinates {
    type: String!
    coordinates: [Float!]!
  }

  input LocationInput {
    address: String!
    locality: String
    district: String
    state: String
    pincode: String
    coordinates: CoordinatesInput!
  }

  input CoordinatesInput {
    type: String = "Point"
    coordinates: [Float!]!
  }

  type MediaFile {
    type: String!
    url: String!
    filename: String!
    size: Int!
    uploadedAt: Date!
  }

  input MediaFileInput {
    type: String!
    url: String!
    filename: String!
    size: Int!
  }

  # Response types
  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }

  type SuccessResponse {
    success: Boolean!
    message: String!
  }

  type ErrorResponse {
    success: Boolean!
    message: String!
    code: String
  }

  # Enums
  enum UserRole {
    CITIZEN
    OFFICIAL
    ADMIN
  }

  enum IssueStatus {
    PENDING
    ACKNOWLEDGED
    IN_PROGRESS
    RESOLVED
    REJECTED
    DUPLICATE
  }

  enum IssuePriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum IssueCategory {
    ROADS
    WATER
    ELECTRICITY
    GARBAGE
    HEALTHCARE
    EDUCATION
    OTHER
  }

  enum Language {
    HINDI
    ENGLISH
    PUNJABI
    GUJARATI
    MARATHI
    TAMIL
    BENGALI
    TELUGU
    KANNADA
    MALAYALAM
  }

  enum NotificationType {
    ISSUE_UPDATE
    ISSUE_RESOLVED
    COMMENT_REPLY
    SYSTEM_ALERT
    FEEDBACK_REQUEST
    ASSIGNMENT
    URGENT_ALERT
  }

  enum NotificationChannel {
    PUSH
    SMS
    EMAIL
    VOICE
    IN_APP
  }

  enum SortOrder {
    ASC
    DESC
  }
`;

module.exports = [
  rootTypeDefs,
  userTypeDefs,
  issueTypeDefs,
  commentTypeDefs,
  notificationTypeDefs
];