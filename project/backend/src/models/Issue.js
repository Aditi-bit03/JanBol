const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['roads', 'water', 'electricity', 'garbage', 'healthcare', 'education', 'other']
  },
  subcategory: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'in-progress', 'resolved', 'rejected', 'duplicate'],
    default: 'pending'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
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
        required: true,
        index: '2dsphere'
      }
    }
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document']
    },
    url: String,
    filename: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  voiceData: {
    originalAudio: String,
    transcription: String,
    language: String,
    confidence: Number,
    duration: Number
  },
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    urgencyScore: {
      type: Number,
      min: 0,
      max: 100
    },
    keywords: [String],
    suggestedCategory: String,
    confidence: Number,
    processedAt: Date
  },
  timeline: [{
    action: {
      type: String,
      enum: ['created', 'acknowledged', 'assigned', 'updated', 'resolved', 'rejected', 'reopened']
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date,
    helpful: { type: Boolean, default: false }
  },
  engagement: {
    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  },
  relatedIssues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  estimatedResolution: Date,
  actualResolution: Date,
  resolutionNotes: String,
  isPublic: { type: Boolean, default: true },
  isUrgent: { type: Boolean, default: false },
  language: {
    type: String,
    enum: ['hindi', 'english', 'punjabi', 'gujarati', 'marathi', 'tamil', 'bengali', 'telugu', 'kannada', 'malayalam'],
    default: 'hindi'
  },
  tags: [String],
  department: String,
  contactInfo: {
    name: String,
    phone: String,
    email: String,
    preferredContact: {
      type: String,
      enum: ['phone', 'email', 'sms', 'app']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
issueSchema.index({ 'location.coordinates': '2dsphere' });
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ priority: -1, createdAt: -1 });
issueSchema.index({ reporter: 1, createdAt: -1 });
issueSchema.index({ assignedTo: 1, status: 1 });
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ tags: 1 });
issueSchema.index({ 'aiAnalysis.urgencyScore': -1 });

// Virtual for age of issue
issueSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for resolution time
issueSchema.virtual('resolutionTimeInDays').get(function() {
  if (this.actualResolution) {
    return Math.floor((this.actualResolution - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for engagement score
issueSchema.virtual('engagementScore').get(function() {
  const { views, upvotes, downvotes, shares, comments } = this.engagement;
  return (upvotes * 2) + shares + comments - downvotes + Math.floor(views / 10);
});

// Pre-save middleware
issueSchema.pre('save', function(next) {
  // Auto-set urgency based on priority and AI analysis
  if (this.priority === 'critical' || (this.aiAnalysis && this.aiAnalysis.urgencyScore > 80)) {
    this.isUrgent = true;
  }
  
  // Add creation timeline entry for new issues
  if (this.isNew) {
    this.timeline.push({
      action: 'created',
      description: 'Issue reported',
      performedBy: this.reporter,
      timestamp: new Date()
    });
  }
  
  next();
});

// Method to add timeline entry
issueSchema.methods.addTimelineEntry = function(action, description, performedBy, metadata = {}) {
  this.timeline.push({
    action,
    description,
    performedBy,
    timestamp: new Date(),
    metadata
  });
  return this.save();
};

// Method to update status
issueSchema.methods.updateStatus = function(newStatus, performedBy, notes = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  const statusDescriptions = {
    acknowledged: 'Issue acknowledged by authorities',
    'in-progress': 'Work started on the issue',
    resolved: 'Issue has been resolved',
    rejected: 'Issue was rejected',
    duplicate: 'Issue marked as duplicate'
  };
  
  this.addTimelineEntry(
    newStatus,
    statusDescriptions[newStatus] || `Status changed to ${newStatus}`,
    performedBy,
    { oldStatus, notes }
  );
  
  if (newStatus === 'resolved') {
    this.actualResolution = new Date();
  }
  
  return this.save();
};

// Method to increment engagement
issueSchema.methods.incrementEngagement = function(type) {
  if (this.engagement[type] !== undefined) {
    this.engagement[type]++;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get issues by location
issueSchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Static method to get trending issues
issueSchema.statics.getTrending = function(limit = 10) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }
    },
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $multiply: ['$engagement.upvotes', 2] },
            '$engagement.shares',
            '$engagement.comments',
            { $subtract: [0, '$engagement.downvotes'] },
            { $divide: ['$engagement.views', 10] }
          ]
        }
      }
    },
    { $sort: { engagementScore: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Issue', issueSchema);