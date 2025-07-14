const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const createContext = async ({ req }) => {
  let user = null;
  
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      if (token) {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        user = await User.findById(decoded.userId).select('-password');
        
        if (!user || !user.isActive) {
          logger.warn(`Invalid or inactive user attempted access: ${decoded.userId}`);
          user = null;
        }
      }
    }
  } catch (error) {
    logger.warn('Token verification failed:', error.message);
    user = null;
  }
  
  return {
    user,
    req
  };
};

const requireAuth = (resolver) => {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new Error('Authentication required');
    }
    return resolver(parent, args, context, info);
  };
};

const requireRole = (roles) => {
  return (resolver) => {
    return (parent, args, context, info) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      if (!roles.includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }
      
      return resolver(parent, args, context, info);
    };
  };
};

const requireOwnership = (getResourceOwnerId) => {
  return (resolver) => {
    return async (parent, args, context, info) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      const resourceOwnerId = await getResourceOwnerId(args, context);
      
      if (context.user.id !== resourceOwnerId && 
          context.user.role !== 'admin') {
        throw new Error('Access denied');
      }
      
      return resolver(parent, args, context, info);
    };
  };
};

module.exports = {
  createContext,
  requireAuth,
  requireRole,
  requireOwnership
};