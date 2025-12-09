# Notes Backend API

A RESTful API backend for notes management built with Express.js and MongoDB. This server provides a complete CRUD interface for managing notes with features like pagination, search, archiving, and comprehensive error handling.

## 🚀 Features

- ✅ **CRUD Operations** - Create, Read, Update, Delete notes
- 🔍 **Full-text Search** - Search through note titles and content
- 📄 **Pagination** - Efficient data loading with pagination support
- 🗂️ **Archiving** - Archive and unarchive notes
- 🏷️ **Tagging** - Add tags to organize notes
- 🔒 **Security** - Helmet.js, CORS, input validation and sanitization
- 📊 **Request Logging** - Comprehensive request/response logging
- 🛡️ **Error Handling** - Centralized error handling with proper HTTP status codes
- ✅ **Input Validation** - Express-validator for request validation
- 📈 **Health Check** - Server health monitoring endpoint

## 📁 Project Structure

```
src/
├── config/
│   ├── constants.js          # Application constants and configuration
│   ├── db.js                 # MongoDB connection and management
│   └── environment.js        # Environment variable validation
├── controllers/
│   └── notesController.js    # Request handlers and business logic
├── middleware/
│   ├── errorHandler.js       # Global error handling middleware
│   ├── logger.js             # Request logging middleware
│   └── validation.js         # Input validation middleware
├── models/
│   └── Note.js              # Mongoose schema and model
├── routes/
│   └── notes.js             # API route definitions
└── index.js                 # Application entry point and server setup
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm or yarn

### Environment Setup

1. **Clone and Navigate to Project**
   ```bash
   cd notes-app/backend_notes
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/notes_db
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Frontend (for CORS)
   URL_Front=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Linux with systemd
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the Application**
   
   **Development Mode:**
   ```bash
   npm run dev
   # or
   npm run server
   ```
   
   **Production Mode:**
   ```bash
   npm start
   ```

## 🔌 API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Notes Management

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| **GET** | `/api/notes` | Get all notes | `page`, `limit`, `sortBy`, `sortOrder`, `archived`, `search` |
| **GET** | `/api/notes/search` | Search notes | `q` (query), `limit` |
| **GET** | `/api/notes/:id` | Get note by ID | - |
| **POST** | `/api/notes` | Create new note | - |
| **PUT** | `/api/notes/:id` | Update note | - |
| **PATCH** | `/api/notes/:id/archive` | Toggle archive status | - |
| **DELETE** | `/api/notes/:id` | Delete note | - |

### Request/Response Examples

#### Create Note
```bash
POST /api/notes
Content-Type: application/json

{
  "title": "My First Note",
  "content": "This is the content of my note",
  "tags": ["personal", "important"]
}
```

Response:
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "id": "607f1f77bcf86cd799439011",
    "title": "My First Note",
    "content": "This is the content of my note",
    "tags": ["personal", "important"],
    "isArchived": false,
    "createdAt": "2023-12-01T10:30:00.000Z",
    "updatedAt": "2023-12-01T10:30:00.000Z"
  }
}
```

#### Get Notes with Pagination
```bash
GET /api/notes?page=1&limit=10&sortBy=createdAt&sortOrder=desc&archived=false
```

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 47,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

#### Search Notes
```bash
GET /api/notes/search?q=javascript&limit=5
```

## 🐳 Docker Setup

### Using Docker Compose

1. **Build and Start Services**
   ```bash
   docker-compose up --build
   ```

2. **Environment Variables**
   The `compose.yaml` includes environment configuration:
   ```yaml
   environment:
     - MONGO_URI=mongodb://mongo:27017/notes_db
     - PORT=5000
     - NODE_ENV=production
   ```

### Standalone Docker

1. **Build Image**
   ```bash
   docker build -t notes-backend .
   ```

2. **Run Container**
   ```bash
   docker run -p 5000:5000 \
     -e MONGO_URI=mongodb://host.docker.internal:27017/notes_db \
     notes-backend
   ```

## 🧪 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run server` - Alias for development server
- `npm run lint` - Run linting (placeholder)
- `npm test` - Run tests (placeholder)

### Code Style

- **ES6+ Modules** - Using import/export syntax
- **Async/Await** - Promise handling with async/await
- **JSDoc Comments** - Function documentation
- **Error Handling** - Comprehensive try-catch with next()
- **Input Validation** - express-validator for all inputs
- **Security First** - Helmet, CORS, sanitization

### Logging

The application includes comprehensive logging:
- **Development**: Detailed request/response logs with colors
- **Production**: Minimal structured logging
- **Error Tracking**: Full error stack traces in development

## 📊 Monitoring

### Health Check Endpoint

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:30:00.000Z",
  "environment": "development",
  "uptime": 3600
}
```

### Application Metrics

Monitor the following in production:
- Response times
- Error rates
- Database connection status
- Memory usage
- Request volume

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGO_URI` | MongoDB connection string | - | ✅ |
| `PORT` | Server port | 5000 | ❌ |
| `NODE_ENV` | Environment mode | development | ❌ |
| `URL_Front` | Frontend URL for CORS | http://localhost:3000 | ❌ |

### Database Configuration

MongoDB configuration includes:
- Connection pooling (max 10 connections)
- 5-second server selection timeout
- 45-second socket timeout
- Automatic reconnection handling

## 🚨 Error Handling

The application provides detailed error responses:

```json
{
  "success": false,
  "message": "Validation error occurred",
  "errors": [
    {
      "field": "title",
      "message": "Title is required",
      "value": ""
    }
  ]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error
- `503` - Service Unavailable (database issues)

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add JSDoc comments for new functions
3. Include proper error handling
4. Validate all inputs
5. Add appropriate logging
6. Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License.
