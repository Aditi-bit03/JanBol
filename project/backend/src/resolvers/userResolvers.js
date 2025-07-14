const User = require('../models/User');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/auth');
const { validateEmail, validatePhone, validatePassword } = require('../utils/validation');
const logger = require('../utils/logger');

const userResolvers = {
  Query: {
    me: async (parent, args, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return await User.findById(user.id);
    },

    user: async (parent, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const targetUser = await User.findById(id);
      if (!targetUser) throw new UserInputError('User not found');
      
      // Privacy check - only return public info for non-admin users
      if (user.role !== 'admin' && user.id !== id && !targetUser.preferences.privacy.publicProfile) {
        throw new ForbiddenError('User profile is private');
      }
      
      return targetUser;
    },

    users: async (parent, { filter, sort, pagination }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new ForbiddenError('Admin access required');
      }

      const query = {};
      
      // Apply filters
      if (filter) {
        if (filter.role) query.role = filter.role.toLowerCase();
        if (filter.isActive !== undefined) query.isActive = filter.isActive;
        if (filter.location) {
          if (filter.location.district) query['location.district'] = filter.location.district;
          if (filter.location.state) query['location.state'] = filter.location.state;
        }
        if (filter.dateRange) {
          query.createdAt = {};
          if (filter.dateRange.from) query.createdAt.$gte = filter.dateRange.from;
          if (filter.dateRange.to) query.createdAt.$lte = filter.dateRange.to;
        }
      }

      // Apply sorting
      const sortOptions = {};
      if (sort) {
        const field = sort.field.toLowerCase().replace('_', '.');
        sortOptions[field] = sort.order === 'ASC' ? 1 : -1;
      } else {
        sortOptions.createdAt = -1;
      }

      // Apply pagination
      const limit = pagination?.first || 20;
      const skip = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0;

      const users = await User.find(query)
        .sort(sortOptions)
        .limit(limit + 1)
        .skip(skip);

      const hasNextPage = users.length > limit;
      if (hasNextPage) users.pop();

      const edges = users.map((user, index) => ({
        node: user,
        cursor: Buffer.from((skip + index + 1).toString()).toString('base64')
      }));

      const totalCount = await User.countDocuments(query);

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

    searchUsers: async (parent, { query, limit }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const searchRegex = new RegExp(query, 'i');
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ],
        isActive: true,
        'preferences.privacy.publicProfile': true
      }).limit(limit);

      return users;
    }
  },

  Mutation: {
    register: async (parent, { input }) => {
      // Validate input
      if (!validateEmail(input.email)) {
        throw new UserInputError('Invalid email format');
      }
      if (!validatePhone(input.phone)) {
        throw new UserInputError('Invalid phone number format');
      }
      if (!validatePassword(input.password)) {
        throw new UserInputError('Password must be at least 6 characters long');
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: input.email }, { phone: input.phone }]
      });

      if (existingUser) {
        throw new UserInputError('User with this email or phone already exists');
      }

      try {
        // Create user
        const user = new User({
          name: input.name,
          email: input.email,
          phone: input.phone,
          password: input.password,
          location: input.location,
          preferences: {
            language: input.language || 'hindi'
          }
        });

        await user.save();

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        logger.info(`New user registered: ${user.email}`);

        return {
          token,
          refreshToken,
          user
        };
      } catch (error) {
        logger.error('Registration error:', error);
        throw new UserInputError('Registration failed');
      }
    },

    login: async (parent, { input }) => {
      const { identifier, password, deviceInfo } = input;

      // Find user by email or phone
      const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
        isActive: true
      }).select('+password');

      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new AuthenticationError('Account is temporarily locked due to too many failed login attempts');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        await user.incLoginAttempts();
        throw new AuthenticationError('Invalid credentials');
      }

      // Reset login attempts on successful login
      if (user.security.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login and device info
      user.lastLogin = new Date();
      if (deviceInfo) {
        const existingDevice = user.deviceInfo.find(d => d.deviceId === deviceInfo.deviceId);
        if (existingDevice) {
          existingDevice.lastUsed = new Date();
          if (deviceInfo.fcmToken) existingDevice.fcmToken = deviceInfo.fcmToken;
        } else {
          user.deviceInfo.push({
            ...deviceInfo,
            lastUsed: new Date()
          });
        }
      }
      await user.save();

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      logger.info(`User logged in: ${user.email}`);

      return {
        token,
        refreshToken,
        user
      };
    },

    refreshToken: async (parent, { refreshToken }) => {
      try {
        const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
          throw new AuthenticationError('Invalid refresh token');
        }

        const token = generateToken(user);
        const newRefreshToken = generateRefreshToken(user);

        return {
          token,
          refreshToken: newRefreshToken,
          user
        };
      } catch (error) {
        throw new AuthenticationError('Invalid refresh token');
      }
    },

    logout: async (parent, args, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      // In a real implementation, you might want to blacklist the token
      // or remove device info
      
      logger.info(`User logged out: ${user.email}`);
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    },

    updateProfile: async (parent, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const updateData = {};
      Object.keys(input).forEach(key => {
        if (input[key] !== undefined) {
          updateData[`profile.${key}`] = input[key];
        }
      });

      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      logger.info(`Profile updated for user: ${user.email}`);

      return updatedUser;
    },

    updatePreferences: async (parent, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const updateData = {};
      Object.keys(input).forEach(key => {
        if (input[key] !== undefined) {
          if (typeof input[key] === 'object') {
            Object.keys(input[key]).forEach(subKey => {
              if (input[key][subKey] !== undefined) {
                updateData[`preferences.${key}.${subKey}`] = input[key][subKey];
              }
            });
          } else {
            updateData[`preferences.${key}`] = input[key];
          }
        }
      });

      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return updatedUser;
    },

    updateLocation: async (parent, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $set: { location: input } },
        { new: true, runValidators: true }
      );

      return updatedUser;
    },

    changePassword: async (parent, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const currentUser = await User.findById(user.id).select('+password');
      
      // Verify current password
      const isValidPassword = await currentUser.comparePassword(input.currentPassword);
      if (!isValidPassword) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Validate new password
      if (!validatePassword(input.newPassword)) {
        throw new UserInputError('New password must be at least 6 characters long');
      }

      // Update password
      currentUser.password = input.newPassword;
      await currentUser.save();

      logger.info(`Password changed for user: ${user.email}`);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    },

    registerDevice: async (parent, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const currentUser = await User.findById(user.id);
      
      const existingDevice = currentUser.deviceInfo.find(d => d.deviceId === input.deviceId);
      if (existingDevice) {
        existingDevice.deviceType = input.deviceType;
        if (input.fcmToken) existingDevice.fcmToken = input.fcmToken;
        existingDevice.lastUsed = new Date();
      } else {
        currentUser.deviceInfo.push({
          ...input,
          lastUsed: new Date()
        });
      }

      await currentUser.save();

      return {
        success: true,
        message: 'Device registered successfully'
      };
    },

    updateUserRole: async (parent, { userId, role }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new ForbiddenError('Admin access required');
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role: role.toLowerCase() },
        { new: true }
      );

      if (!updatedUser) {
        throw new UserInputError('User not found');
      }

      logger.info(`User role updated: ${updatedUser.email} -> ${role}`);

      return updatedUser;
    }
  },

  User: {
    // Resolve nested fields if needed
    stats: (parent) => parent.stats,
    preferences: (parent) => parent.preferences,
    verification: (parent) => parent.verification,
    profile: (parent) => parent.profile,
    location: (parent) => parent.location
  }
};

module.exports = userResolvers;