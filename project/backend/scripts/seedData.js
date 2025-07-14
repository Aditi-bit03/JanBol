const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');
const Issue = require('../src/models/Issue');
const Comment = require('../src/models/Comment');
const Notification = require('../src/models/Notification');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  console.log('Seeding users...');
  
  const users = [
    {
      name: 'राज कुमार',
      email: 'raj@example.com',
      phone: '+919876543210',
      password: 'password123',
      role: 'citizen',
      location: {
        address: 'मॉल रोड, शिमला',
        locality: 'द रिज',
        district: 'शिमला',
        state: 'हिमाचल प्रदेश',
        pincode: '171001',
        coordinates: {
          type: 'Point',
          coordinates: [77.1734, 31.1048]
        }
      },
      preferences: {
        language: 'hindi'
      }
    },
    {
      name: 'प्रिया शर्मा',
      email: 'priya@example.com',
      phone: '+919876543211',
      password: 'password123',
      role: 'citizen',
      location: {
        address: 'सेक्टर 17, चंडीगढ़',
        locality: 'सेक्टर 17',
        district: 'चंडीगढ़',
        state: 'चंडीगढ़',
        pincode: '160017',
        coordinates: {
          type: 'Point',
          coordinates: [76.7794, 30.7333]
        }
      },
      preferences: {
        language: 'hindi'
      }
    },
    {
      name: 'अमित सिंह',
      email: 'amit@example.com',
      phone: '+919876543212',
      password: 'password123',
      role: 'official',
      location: {
        address: 'सिविल लाइन्स, बिलासपुर',
        locality: 'सिविल लाइन्स',
        district: 'बिलासपुर',
        state: 'हिमाचल प्रदेश',
        pincode: '174001',
        coordinates: {
          type: 'Point',
          coordinates: [76.7553, 31.3260]
        }
      },
      preferences: {
        language: 'hindi'
      }
    },
    {
      name: 'Admin User',
      email: 'admin@janbol.com',
      phone: '+919876543213',
      password: 'admin123',
      role: 'admin',
      location: {
        address: 'JanBol HQ, Delhi',
        locality: 'Connaught Place',
        district: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        coordinates: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        }
      },
      preferences: {
        language: 'english'
      }
    }
  ];

  // Hash passwords
  for (let user of users) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`${createdUsers.length} users created`);
  
  return createdUsers;
};

const seedIssues = async (users) => {
  console.log('Seeding issues...');
  
  const issues = [
    {
      title: 'सड़क पर बड़े गड्ढे',
      description: 'मॉल रोड पर बहुत बड़े गड्ढे हैं जिससे वाहन चलाने में परेशानी हो रही है। बारिश के बाद स्थिति और भी खराब हो गई है।',
      category: 'roads',
      subcategory: 'potholes',
      priority: 'high',
      status: 'pending',
      reporter: users[0]._id,
      location: {
        address: 'मॉल रोड, शिमला',
        locality: 'द रिज',
        district: 'शिमला',
        state: 'हिमाचल प्रदेश',
        pincode: '171001',
        coordinates: {
          type: 'Point',
          coordinates: [77.1734, 31.1048]
        }
      },
      aiAnalysis: {
        sentiment: 'negative',
        urgencyScore: 75,
        keywords: ['सड़क', 'गड्ढे', 'परेशानी'],
        suggestedCategory: 'roads',
        confidence: 0.89,
        processedAt: new Date()
      },
      language: 'hindi',
      tags: ['infrastructure', 'roads', 'urgent']
    },
    {
      title: 'पानी की कमी',
      description: 'हमारे इलाके में पिछले एक हफ्ते से पानी की आपूर्ति नहीं हो रही है। नल से पानी नहीं आ रहा है।',
      category: 'water',
      subcategory: 'shortage',
      priority: 'critical',
      status: 'acknowledged',
      reporter: users[1]._id,
      assignedTo: users[2]._id,
      location: {
        address: 'सेक्टर 17, चंडीगढ़',
        locality: 'सेक्टर 17',
        district: 'चंडीगढ़',
        state: 'चंडीगढ़',
        pincode: '160017',
        coordinates: {
          type: 'Point',
          coordinates: [76.7794, 30.7333]
        }
      },
      aiAnalysis: {
        sentiment: 'negative',
        urgencyScore: 90,
        keywords: ['पानी', 'कमी', 'आपूर्ति'],
        suggestedCategory: 'water',
        confidence: 0.95,
        processedAt: new Date()
      },
      language: 'hindi',
      tags: ['water', 'shortage', 'critical'],
      isUrgent: true
    },
    {
      title: 'बिजली की समस्या',
      description: 'दिन में कई बार बिजली कट जाती है। काम में बहुत परेशानी हो रही है।',
      category: 'electricity',
      subcategory: 'outage',
      priority: 'medium',
      status: 'in-progress',
      reporter: users[0]._id,
      assignedTo: users[2]._id,
      location: {
        address: 'सिविल लाइन्स, बिलासपुर',
        locality: 'सिविल लाइन्स',
        district: 'बिलासपुर',
        state: 'हिमाचल प्रदेश',
        pincode: '174001',
        coordinates: {
          type: 'Point',
          coordinates: [76.7553, 31.3260]
        }
      },
      aiAnalysis: {
        sentiment: 'negative',
        urgencyScore: 60,
        keywords: ['बिजली', 'कटौती', 'परेशानी'],
        suggestedCategory: 'electricity',
        confidence: 0.82,
        processedAt: new Date()
      },
      language: 'hindi',
      tags: ['electricity', 'outage']
    },
    {
      title: 'कचरा संग्रह की समस्या',
      description: 'हमारे इलाके में कचरा संग्रह नियमित नहीं हो रहा है। गंदगी फैल रही है।',
      category: 'garbage',
      subcategory: 'collection',
      priority: 'medium',
      status: 'resolved',
      reporter: users[1]._id,
      assignedTo: users[2]._id,
      location: {
        address: 'मॉल रोड, शिमला',
        locality: 'द रिज',
        district: 'शिमला',
        state: 'हिमाचल प्रदेश',
        pincode: '171001',
        coordinates: {
          type: 'Point',
          coordinates: [77.1734, 31.1048]
        }
      },
      aiAnalysis: {
        sentiment: 'negative',
        urgencyScore: 55,
        keywords: ['कचरा', 'संग्रह', 'गंदगी'],
        suggestedCategory: 'garbage',
        confidence: 0.78,
        processedAt: new Date()
      },
      language: 'hindi',
      tags: ['garbage', 'collection'],
      actualResolution: new Date(),
      feedback: {
        rating: 4,
        comment: 'समस्या का अच्छा समाधान हुआ',
        submittedAt: new Date(),
        helpful: true
      }
    }
  ];

  await Issue.deleteMany({});
  const createdIssues = await Issue.insertMany(issues);
  console.log(`${createdIssues.length} issues created`);
  
  return createdIssues;
};

const seedComments = async (users, issues) => {
  console.log('Seeding comments...');
  
  const comments = [
    {
      content: 'यह समस्या वाकई गंभीर है। मैंने भी यही देखा है।',
      author: users[1]._id,
      issue: issues[0]._id,
      language: 'hindi'
    },
    {
      content: 'हमारी टीम इस पर काम कर रही है। जल्द ही समाधान होगा।',
      author: users[2]._id,
      issue: issues[0]._id,
      language: 'hindi',
      isOfficial: true
    },
    {
      content: 'पानी की समस्या के लिए तत्काल कार्रवाई की जरूरत है।',
      author: users[0]._id,
      issue: issues[1]._id,
      language: 'hindi'
    },
    {
      content: 'समस्या का समाधान हो गया है। धन्यवाद!',
      author: users[1]._id,
      issue: issues[3]._id,
      language: 'hindi'
    }
  ];

  await Comment.deleteMany({});
  const createdComments = await Comment.insertMany(comments);
  console.log(`${createdComments.length} comments created`);
  
  return createdComments;
};

const seedNotifications = async (users, issues) => {
  console.log('Seeding notifications...');
  
  const notifications = [
    {
      recipient: users[0]._id,
      sender: users[2]._id,
      type: 'issue_update',
      title: 'आपकी रिपोर्ट को अपडेट मिला',
      message: 'सड़क पर गड्ढे की समस्या - कार्य प्रगति में है',
      data: {
        issueId: issues[0]._id
      },
      channels: ['push', 'sms'],
      priority: 'medium',
      language: 'hindi'
    },
    {
      recipient: users[1]._id,
      sender: users[2]._id,
      type: 'issue_resolved',
      title: 'समस्या हल हो गई',
      message: 'कचरा संग्रह की समस्या का समाधान हो गया है',
      data: {
        issueId: issues[3]._id
      },
      channels: ['push', 'sms'],
      priority: 'high',
      language: 'hindi',
      isRead: true,
      readAt: new Date()
    },
    {
      recipient: users[0]._id,
      type: 'system_alert',
      title: 'सिस्टम अपडेट',
      message: 'JanBol ऐप में नए फीचर्स जोड़े गए हैं',
      channels: ['push'],
      priority: 'low',
      language: 'hindi'
    }
  ];

  await Notification.deleteMany({});
  const createdNotifications = await Notification.insertMany(notifications);
  console.log(`${createdNotifications.length} notifications created`);
  
  return createdNotifications;
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    const users = await seedUsers();
    const issues = await seedIssues(users);
    const comments = await seedComments(users, issues);
    const notifications = await seedNotifications(users, issues);
    
    console.log('Database seeding completed successfully!');
    console.log('Sample credentials:');
    console.log('Citizen: raj@example.com / password123');
    console.log('Official: amit@example.com / password123');
    console.log('Admin: admin@janbol.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };