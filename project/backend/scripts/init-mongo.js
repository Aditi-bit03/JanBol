// MongoDB initialization script for Docker
db = db.getSiblingDB('janbol');

// Create collections with indexes
db.createCollection('users');
db.createCollection('issues');
db.createCollection('comments');
db.createCollection('notifications');

// Create indexes for users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { unique: true });
db.users.createIndex({ 'location.coordinates': '2dsphere' });
db.users.createIndex({ 'stats.points': -1 });
db.users.createIndex({ createdAt: -1 });

// Create indexes for issues
db.issues.createIndex({ 'location.coordinates': '2dsphere' });
db.issues.createIndex({ category: 1, status: 1 });
db.issues.createIndex({ priority: -1, createdAt: -1 });
db.issues.createIndex({ reporter: 1, createdAt: -1 });
db.issues.createIndex({ assignedTo: 1, status: 1 });
db.issues.createIndex({ status: 1, createdAt: -1 });
db.issues.createIndex({ tags: 1 });
db.issues.createIndex({ 'aiAnalysis.urgencyScore': -1 });

// Create indexes for comments
db.comments.createIndex({ issue: 1, createdAt: -1 });
db.comments.createIndex({ author: 1, createdAt: -1 });
db.comments.createIndex({ parentComment: 1 });

// Create indexes for notifications
db.notifications.createIndex({ recipient: 1, createdAt: -1 });
db.notifications.createIndex({ status: 1, scheduledFor: 1 });
db.notifications.createIndex({ type: 1, priority: -1 });
db.notifications.createIndex({ isRead: 1, recipient: 1 });

print('JanBol database initialized with indexes');