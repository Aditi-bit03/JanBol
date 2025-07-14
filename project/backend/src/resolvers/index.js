const { DateResolver } = require('graphql-scalars');
const userResolvers = require('./userResolvers');
const issueResolvers = require('./issueResolvers');
const commentResolvers = require('./commentResolvers');
const notificationResolvers = require('./notificationResolvers');

const resolvers = {
  Date: DateResolver,
  
  Query: {
    ...userResolvers.Query,
    ...issueResolvers.Query,
    ...commentResolvers.Query,
    ...notificationResolvers.Query,
  },
  
  Mutation: {
    ...userResolvers.Mutation,
    ...issueResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...notificationResolvers.Mutation,
  },
  
  Subscription: {
    ...notificationResolvers.Subscription,
  },
  
  // Type resolvers
  User: userResolvers.User,
  Issue: issueResolvers.Issue,
  Comment: commentResolvers.Comment,
  Notification: notificationResolvers.Notification,
};

module.exports = resolvers;