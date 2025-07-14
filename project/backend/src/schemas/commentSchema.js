const { gql } = require('apollo-server-express');

const commentTypeDefs = gql`
  extend type Query {
    # Comment queries
    comment(id: ID!): Comment
    issueComments(
      issueId: ID!
      pagination: PaginationInput
    ): CommentConnection!
    userComments(
      userId: ID!
      pagination: PaginationInput
    ): CommentConnection!
  }

  extend type Mutation {
    # Comment management
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: ID!, content: String!): Comment!
    deleteComment(id: ID!): SuccessResponse!
    
    # Comment engagement
    likeComment(id: ID!): Comment!
    unlikeComment(id: ID!): Comment!
    
    # Moderation
    hideComment(id: ID!, reason: String!): Comment!
    unhideComment(id: ID!): Comment!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    issue: Issue!
    parentComment: Comment
    replies: [Comment!]!
    likes: [CommentLike!]!
    likeCount: Int!
    replyCount: Int!
    isOfficial: Boolean!
    isEdited: Boolean!
    editedAt: Date
    language: Language!
    sentiment: String
    isHidden: Boolean!
    hiddenReason: String
    moderatedBy: User
    createdAt: Date!
    updatedAt: Date!
  }

  type CommentLike {
    user: User!
    likedAt: Date!
  }

  type CommentConnection {
    edges: [CommentEdge!]!
    pageInfo: PaginationInfo!
  }

  type CommentEdge {
    node: Comment!
    cursor: String!
  }

  # Input types
  input CreateCommentInput {
    content: String!
    issueId: ID!
    parentCommentId: ID
    language: Language = HINDI
  }
`;

module.exports = commentTypeDefs;