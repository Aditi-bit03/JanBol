const { gql } = require('apollo-server-express');

const userTypeDefs = gql`
  extend type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(
      filter: UserFilterInput
      sort: UserSortInput
      pagination: PaginationInput
    ): UserConnection!
    searchUsers(query: String!, limit: Int = 10): [User!]!
  }

  extend type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(refreshToken: String!): AuthPayload!
    logout: SuccessResponse!
    
    # Profile management
    updateProfile(input: UpdateProfileInput!): User!
    updatePreferences(input: UpdatePreferencesInput!): User!
    updateLocation(input: LocationInput!): User!
    changePassword(input: ChangePasswordInput!): SuccessResponse!
    
    # Account management
    verifyEmail(token: String!): SuccessResponse!
    verifyPhone(code: String!): SuccessResponse!
    requestPasswordReset(email: String!): SuccessResponse!
    resetPassword(input: ResetPasswordInput!): SuccessResponse!
    
    # Device management
    registerDevice(input: DeviceInput!): SuccessResponse!
    unregisterDevice(deviceId: String!): SuccessResponse!
    
    # Admin operations
    updateUserRole(userId: ID!, role: UserRole!): User!
    deactivateUser(userId: ID!): SuccessResponse!
    activateUser(userId: ID!): SuccessResponse!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    phone: String!
    role: UserRole!
    profile: UserProfile!
    location: Location
    preferences: UserPreferences!
    stats: UserStats!
    verification: UserVerification!
    isActive: Boolean!
    lastLogin: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type UserProfile {
    avatar: String
    dateOfBirth: Date
    gender: String
    occupation: String
    education: String
  }

  type UserPreferences {
    language: Language!
    notifications: NotificationPreferences!
    privacy: PrivacyPreferences!
  }

  type NotificationPreferences {
    push: Boolean!
    sms: Boolean!
    email: Boolean!
    voice: Boolean!
  }

  type PrivacyPreferences {
    shareLocation: Boolean!
    publicProfile: Boolean!
  }

  type UserStats {
    reportsSubmitted: Int!
    issuesResolved: Int!
    points: Int!
    badge: String!
    lastActive: Date!
  }

  type UserVerification {
    isEmailVerified: Boolean!
    isPhoneVerified: Boolean!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PaginationInfo!
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  # Input types
  input RegisterInput {
    name: String!
    email: String!
    phone: String!
    password: String!
    location: LocationInput
    language: Language = HINDI
  }

  input LoginInput {
    identifier: String! # email or phone
    password: String!
    deviceInfo: DeviceInput
  }

  input UpdateProfileInput {
    name: String
    avatar: String
    dateOfBirth: Date
    gender: String
    occupation: String
    education: String
  }

  input UpdatePreferencesInput {
    language: Language
    notifications: NotificationPreferencesInput
    privacy: PrivacyPreferencesInput
  }

  input NotificationPreferencesInput {
    push: Boolean
    sms: Boolean
    email: Boolean
    voice: Boolean
  }

  input PrivacyPreferencesInput {
    shareLocation: Boolean
    publicProfile: Boolean
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input ResetPasswordInput {
    token: String!
    newPassword: String!
  }

  input DeviceInput {
    deviceId: String!
    deviceType: String!
    fcmToken: String
  }

  input UserFilterInput {
    role: UserRole
    isActive: Boolean
    location: LocationFilterInput
    dateRange: DateRangeInput
  }

  input LocationFilterInput {
    district: String
    state: String
    radius: Float # in kilometers
    coordinates: CoordinatesInput
  }

  input DateRangeInput {
    from: Date
    to: Date
  }

  input UserSortInput {
    field: UserSortField!
    order: SortOrder = DESC
  }

  enum UserSortField {
    CREATED_AT
    LAST_LOGIN
    POINTS
    REPORTS_SUBMITTED
    NAME
  }
`;

module.exports = userTypeDefs;