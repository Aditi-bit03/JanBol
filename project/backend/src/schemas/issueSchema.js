const { gql } = require('apollo-server-express');

const issueTypeDefs = gql`
  extend type Query {
    # Issue queries
    issue(id: ID!): Issue
    issues(
      filter: IssueFilterInput
      sort: IssueSortInput
      pagination: PaginationInput
    ): IssueConnection!
    myIssues(
      status: IssueStatus
      pagination: PaginationInput
    ): IssueConnection!
    nearbyIssues(
      coordinates: CoordinatesInput!
      radius: Float = 5000
      limit: Int = 20
    ): [Issue!]!
    trendingIssues(limit: Int = 10): [Issue!]!
    issueStats: IssueStats!
    searchIssues(query: String!, limit: Int = 20): [Issue!]!
  }

  extend type Mutation {
    # Issue management
    createIssue(input: CreateIssueInput!): Issue!
    updateIssue(id: ID!, input: UpdateIssueInput!): Issue!
    deleteIssue(id: ID!): SuccessResponse!
    
    # Status management
    updateIssueStatus(id: ID!, status: IssueStatus!, notes: String): Issue!
    assignIssue(id: ID!, assigneeId: ID!): Issue!
    unassignIssue(id: ID!): Issue!
    
    # Engagement
    upvoteIssue(id: ID!): Issue!
    downvoteIssue(id: ID!): Issue!
    shareIssue(id: ID!): Issue!
    
    # Feedback
    submitFeedback(id: ID!, input: FeedbackInput!): Issue!
    
    # Media
    uploadIssueMedia(issueId: ID!, files: [Upload!]!): [MediaFile!]!
    deleteIssueMedia(issueId: ID!, mediaId: ID!): SuccessResponse!
  }

  type Issue {
    id: ID!
    title: String!
    description: String!
    category: IssueCategory!
    subcategory: String!
    priority: IssuePriority!
    status: IssueStatus!
    reporter: User!
    assignedTo: User
    location: Location!
    media: [MediaFile!]!
    voiceData: VoiceData
    aiAnalysis: AIAnalysis
    timeline: [TimelineEntry!]!
    feedback: Feedback
    engagement: Engagement!
    duplicateOf: Issue
    relatedIssues: [Issue!]!
    estimatedResolution: Date
    actualResolution: Date
    resolutionNotes: String
    isPublic: Boolean!
    isUrgent: Boolean!
    language: Language!
    tags: [String!]!
    department: String
    contactInfo: ContactInfo
    ageInDays: Int!
    resolutionTimeInDays: Int
    engagementScore: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  type VoiceData {
    originalAudio: String!
    transcription: String!
    language: String!
    confidence: Float!
    duration: Float!
  }

  type AIAnalysis {
    sentiment: String!
    urgencyScore: Int!
    keywords: [String!]!
    suggestedCategory: String!
    confidence: Float!
    processedAt: Date!
  }

  type TimelineEntry {
    action: String!
    description: String!
    performedBy: User!
    timestamp: Date!
    metadata: String # JSON string
  }

  type Feedback {
    rating: Int!
    comment: String
    submittedAt: Date!
    helpful: Boolean!
  }

  type Engagement {
    views: Int!
    upvotes: Int!
    downvotes: Int!
    shares: Int!
    comments: Int!
  }

  type ContactInfo {
    name: String
    phone: String
    email: String
    preferredContact: String
  }

  type IssueConnection {
    edges: [IssueEdge!]!
    pageInfo: PaginationInfo!
  }

  type IssueEdge {
    node: Issue!
    cursor: String!
  }

  type IssueStats {
    total: Int!
    byStatus: [StatusCount!]!
    byCategory: [CategoryCount!]!
    byPriority: [PriorityCount!]!
    avgResolutionTime: Float!
    resolutionRate: Float!
    trendingCategories: [String!]!
  }

  type StatusCount {
    status: IssueStatus!
    count: Int!
  }

  type CategoryCount {
    category: IssueCategory!
    count: Int!
  }

  type PriorityCount {
    priority: IssuePriority!
    count: Int!
  }

  # Input types
  input CreateIssueInput {
    title: String!
    description: String!
    category: IssueCategory!
    subcategory: String!
    location: LocationInput!
    media: [MediaFileInput!]
    voiceData: VoiceDataInput
    priority: IssuePriority = MEDIUM
    isPublic: Boolean = true
    language: Language = HINDI
    tags: [String!]
    contactInfo: ContactInfoInput
  }

  input UpdateIssueInput {
    title: String
    description: String
    category: IssueCategory
    subcategory: String
    priority: IssuePriority
    tags: [String!]
    department: String
    estimatedResolution: Date
    contactInfo: ContactInfoInput
  }

  input VoiceDataInput {
    originalAudio: String!
    transcription: String!
    language: String!
    confidence: Float!
    duration: Float!
  }

  input ContactInfoInput {
    name: String
    phone: String
    email: String
    preferredContact: String
  }

  input FeedbackInput {
    rating: Int!
    comment: String
    helpful: Boolean = false
  }

  input IssueFilterInput {
    status: [IssueStatus!]
    category: [IssueCategory!]
    priority: [IssuePriority!]
    assignedTo: ID
    reporter: ID
    location: LocationFilterInput
    dateRange: DateRangeInput
    isUrgent: Boolean
    isPublic: Boolean
    tags: [String!]
    department: String
  }

  input IssueSortInput {
    field: IssueSortField!
    order: SortOrder = DESC
  }

  enum IssueSortField {
    CREATED_AT
    UPDATED_AT
    PRIORITY
    URGENCY_SCORE
    ENGAGEMENT_SCORE
    RESOLUTION_TIME
  }
`;

module.exports = issueTypeDefs;