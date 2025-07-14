const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['citizen', 'official', 'admin'],
    default: 'citizen'
  },
  profile: {
    avatar: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    occupation: String,
    education: String
  },
  location: {
    address: String,
    locality: String,
    district: String,
    state: String,
    pincode: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  preferences: {
    language: {
      type: String,
      enum: ['hindi', 'english', 'punjabi', 'gujarati', 'marathi', 'tamil', 'bengali', 'telugu', 'kannada', 'malayalam'],
      default: 'hindi'
    },
    notifications: {
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      voice: { type: Boolean, default: false }
    },
    privacy: {
      shareLocation: { type: Boolean, default: true },
      publicProfile: { type: Boolean, default: false }
    }
  },
  stats: {
    reportsSubmitted: { type: Number, default: 0 },
    issuesResolved: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    badge: { type: String, default: 'नया सदस्य' },
    lastActive: { type: Date, default: Date.now }
  },
  verification: {
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    phoneVerificationCode: String,
    verificationExpires: Date
  },
  security: {
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  deviceInfo: [{
    deviceId: String,
    deviceType: String,
    fcmToken: String,
    lastUsed: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ 'stats.points': -1 });
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 'security.loginAttempts': 1, 'security.lockUntil': 1 }
  });
};

// Method to update user stats
userSchema.methods.updateStats = function(type, increment = 1) {
  const updates = {};
  
  switch (type) {
    case 'report':
      updates['stats.reportsSubmitted'] = this.stats.reportsSubmitted + increment;
      updates['stats.points'] = this.stats.points + (increment * 10);
      break;
    case 'resolve':
      updates['stats.issuesResolved'] = this.stats.issuesResolved + increment;
      updates['stats.points'] = this.stats.points + (increment * 50);
      break;
    case 'feedback':
      updates['stats.points'] = this.stats.points + (increment * 5);
      break;
  }
  
  // Update badge based on points
  if (updates['stats.points'] >= 1000) {
    updates['stats.badge'] = 'सुपर नागरिक';
  } else if (updates['stats.points'] >= 500) {
    updates['stats.badge'] = 'सक्रिय नागरिक';
  } else if (updates['stats.points'] >= 100) {
    updates['stats.badge'] = 'योगदानकर्ता';
  }
  
  updates['stats.lastActive'] = new Date();
  
  return this.updateOne({ $set: updates });
};

module.exports = mongoose.model('User', userSchema);