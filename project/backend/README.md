# JanBol Backend API

A comprehensive Node.js + Express + GraphQL backend for the JanBol civic engagement platform, designed to handle complex civic issue reporting, AI-powered analysis, and real-time notifications.

## 🚀 Features

- **GraphQL API** with Apollo Server for flexible queries
- **MongoDB** with Mongoose for data persistence
- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (Citizen, Official, Admin)
- **File Upload** support for issue attachments
- **Real-time Subscriptions** for notifications
- **Comprehensive Validation** and error handling
- **Logging** with Winston
- **Security** with Helmet, rate limiting, and CORS
- **Scalable Architecture** with modular design

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User model with auth
│   │   ├── Issue.js             # Civic issue model
│   │   ├── Comment.js           # Comments on issues
│   │   └── Notification.js      # Notification system
│   ├── schemas/
│   │   ├── index.js             # Combined GraphQL schemas
│   │   ├── userSchema.js        # User type definitions
│   │   ├── issueSchema.js       # Issue type definitions
│   │   ├── commentSchema.js     # Comment type definitions
│   │   └── notificationSchema.js # Notification type definitions
│   ├── resolvers/
│   │   ├── index.js             # Combined resolvers
│   │   ├── userResolvers.js     # User CRUD operations
│   │   ├── issueResolvers.js    # Issue management
│   │   ├── commentResolvers.js  # Comment system
│   │   └── notificationResolvers.js # Notification handling
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Global error handling
│   ├── utils/
│   │   ├── auth.js              # Auth utilities
│   │   ├── validation.js        # Input validation
│   │   └── logger.js            # Winston logger
│   └── routes/
│       └── index.js             # REST endpoints for uploads
├── scripts/
│   └── seedData.js              # Database seeding
├── logs/                        # Log files
├── uploads/                     # File uploads
├── server.js                    # Entry point
├── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB 4.4+
- npm or yarn

### 1. Clone and Install
```bash
git clone <repository-url>
cd backend
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/janbol

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret

# External APIs
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
FIREBASE_SERVER_KEY=your_firebase_server_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### 3. Start MongoDB
```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Database (Optional)
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:4000`

## 📊 GraphQL Playground

Visit `http://localhost:4000/graphql` to access the GraphQL Playground for testing queries and mutations.

### Sample Queries

#### Register a new user:
```graphql
mutation RegisterUser {
  register(input: {
    name: "राज कुमार"
    email: "raj@example.com"
    phone: "+919876543210"
    password: "password123"
    language: HINDI
    location: {
      address: "मॉल रोड, शिमला"
      locality: "द रिज"
      district: "शिमला"
      state: "हिमाचल प्रदेश"
      pincode: "171001"
      coordinates: {
        coordinates: [77.1734, 31.1048]
      }
    }
  }) {
    token
    refreshToken
    user {
      id
      name
      email
      role
    }
  }
}
```

#### Login:
```graphql
mutation LoginUser {
  login(input: {
    identifier: "raj@example.com"
    password: "password123"
  }) {
    token
    refreshToken
    user {
      id
      name
      email
      role
    }
  }
}
```

#### Create an issue:
```graphql
mutation CreateIssue {
  createIssue(input: {
    title: "सड़क पर गड्ढे"
    description: "मॉल रोड पर बहुत बड़े गड्ढे हैं"
    category: ROADS
    subcategory: "potholes"
    priority: HIGH
    location: {
      address: "मॉल रोड, शिमला"
      coordinates: {
        coordinates: [77.1734, 31.1048]
      }
    }
    language: HINDI
    tags: ["infrastructure", "urgent"]
  }) {
    id
    title
    status
    priority
    reporter {
      name
    }
  }
}
```

#### Get issues with filters:
```graphql
query GetIssues {
  issues(
    filter: {
      status: [PENDING, IN_PROGRESS]
      category: [ROADS, WATER]
      priority: [HIGH, CRITICAL]
    }
    sort: {
      field: CREATED_AT
      order: DESC
    }
    pagination: {
      first: 10
    }
  ) {
    edges {
      node {
        id
        title
        category
        priority
        status
        reporter {
          name
        }
        location {
          address
        }
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      totalCount
    }
  }
}
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles:
- **citizen**: Can create and view issues, comment
- **official**: Can manage assigned issues, update status
- **admin**: Full access to all operations

## 📁 File Uploads

Use the REST endpoint for file uploads:

```bash
curl -X POST \
  http://localhost:4000/api/upload \
  -H 'Authorization: Bearer <token>' \
  -F 'files=@image.jpg' \
  -F 'files=@document.pdf'
```

## 🔄 Real-time Subscriptions

Subscribe to real-time updates:

```graphql
subscription NotificationReceived {
  notificationReceived(userId: "user-id") {
    id
    title
    message
    type
    createdAt
  }
}
```

## 🧪 Testing

### Sample Credentials (after seeding):
- **Citizen**: `raj@example.com` / `password123`
- **Official**: `amit@example.com` / `password123`
- **Admin**: `admin@janbol.com` / `admin123`

### Health Checks:
- Server: `GET /health`
- Storage: `GET /api/health/storage`

## 📈 Monitoring & Logging

Logs are stored in the `logs/` directory:
- `combined.log`: All logs
- `error.log`: Error logs only

Log levels: `error`, `warn`, `info`, `http`, `debug`

## 🚀 Deployment

### Using Docker:
```bash
# Build image
docker build -t janbol-backend .

# Run container
docker run -d \
  -p 4000:4000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/janbol \
  -e JWT_SECRET=your-secret \
  janbol-backend
```

### Using PM2:
```bash
npm install -g pm2
pm2 start server.js --name janbol-backend
pm2 startup
pm2 save
```

### Environment Variables for Production:
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/janbol
JWT_SECRET=super-secure-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔧 API Endpoints

### GraphQL:
- `POST /graphql` - Main GraphQL endpoint
- `GET /graphql` - GraphQL Playground (dev only)

### REST:
- `POST /api/upload` - File upload
- `GET /api/files/:filename` - Serve files
- `DELETE /api/files/:filename` - Delete files
- `POST /api/webhook/:service` - Webhook handlers
- `GET /health` - Health check
- `GET /api/health/storage` - Storage health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the logs in `logs/` directory
- Verify environment variables
- Ensure MongoDB is running

## 🔄 Database Schema

### Users
- Authentication with bcrypt
- Role-based permissions
- Location tracking
- Notification preferences
- Activity statistics

### Issues
- Geospatial indexing
- AI analysis integration
- Status tracking with timeline
- Media attachments
- Engagement metrics

### Comments
- Threaded conversations
- Like system
- Moderation capabilities
- Language support

### Notifications
- Multi-channel delivery
- Real-time subscriptions
- Delivery tracking
- Bulk operations

This backend provides a solid foundation for the JanBol civic engagement platform with enterprise-grade features and scalability.