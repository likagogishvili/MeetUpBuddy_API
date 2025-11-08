# NestJS Redis Microservices - Calendar Events & Friend Management System

A microservices-based application built with NestJS, Redis, and TypeScript for managing customers, calendar events, notes, and friend requests.

## 🏗️ Architecture

This project consists of three microservices:

1. **Main Service** (`main/`) - Main API gateway and business logic
   - Customer management (registration, authentication)
   - Note/Calendar event management
   - Friend request system
   - Availability checking

2. **Calendar Events Microservice** (`calendar_events_microservice/`) - Handles calendar events
   - Creates and manages calendar events
   - Stores events in Redis
   - Communicates via Redis transport

3. **Email Generator Microservice** (`email-generator/`) - Handles email notifications
   - Sends welcome emails when customers register
   - Listens for customer creation events

## 🚀 Features

### Customer Management
- ✅ User registration with email and password
- ✅ User authentication (sign in)
- ✅ Password hashing with bcrypt
- ✅ Customer profile management (CRUD operations)
- ✅ Get customer with associated notes/events

### Notes & Calendar Events
- ✅ Create notes/calendar events
- ✅ View all calendar events
- ✅ Update and delete events
- ✅ Events linked to customers

### Friend Request System
- ✅ Search users by email
- ✅ Send friend requests
- ✅ Accept/reject friend requests
- ✅ View friends list
- ✅ View sent/received requests
- ✅ Mutual request auto-accept
- ✅ Prevent duplicate requests

### Calendar Availability
- ✅ Check if friend is available on specific date
- ✅ Request calendar events with friends
- ✅ View conflicting events

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Redis (running locally or via Docker)
- Docker & Docker Compose (optional)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd nestJS_redis
```

### 2. Install dependencies for each service

```bash
# Main service
cd main
npm install

# Calendar events microservice
cd ../calendar_events_microservice
npm install

# Email generator microservice
cd ../email-generator
npm install
```

### 3. Set up environment variables

Create `.env` files in each service directory (if needed):

**main/.env**
```
PORT=4001
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

**calendar_events_microservice/.env**
```
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

**email-generator/.env**
```
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## 🐳 Running with Docker

### Start Redis and all services:

```bash
# From project root
docker-compose up -d
```

This will start:
- Redis on port 6379
- Main service on port 4001
- Calendar events microservice
- Email generator microservice

## 🏃 Running Locally

### 1. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or using local Redis
redis-server
```

### 2. Start Calendar Events Microservice

```bash
cd calendar_events_microservice
npm run start:dev
```

### 3. Start Email Generator Microservice

```bash
cd email-generator
npm run start:dev
```

### 4. Start Main Service

```bash
cd main
npm run start:dev
```

The main service will be available at `http://localhost:4001`

## 📚 API Documentation

Once the main service is running, access Swagger documentation at:
```
http://localhost:4001/api
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/signin` - Sign in with email and password

### Customer Management
- `POST /customer` - Register new customer
- `GET /customer` - Get all customers
- `GET /customer/:id` - Get customer by ID
- `GET /customer/:id/notes` - Get customer with notes
- `PATCH /customer/:id` - Update customer
- `DELETE /customer/:id` - Delete customer

### Notes/Calendar Events
- `POST /note` - Create note/calendar event
- `GET /note` - Get all notes
- `GET /note/:id` - Get note by ID
- `PATCH /note/:id` - Update note
- `DELETE /note/:id` - Delete note

### Friend Requests
- `POST /friendship/search/:userId` - Search user by email
- `POST /friendship/request/:userId` - Send friend request
- `POST /friendship/respond/:userId` - Accept/reject friend request
- `GET /friendship/friends/:userId` - Get all friends
- `GET /friendship/requests/:userId/:type` - Get friend requests (sent/received)
- `POST /friendship/check-availability/:userId` - Check friend availability
- `POST /friendship/request-event/:userId` - Request calendar event with friend

## 📝 Example Requests

### Register Customer
```bash
curl -X POST http://localhost:4001/customer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "lastName": "Doe",
    "age": 25,
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:4001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Note
```bash
curl -X POST http://localhost:4001/note \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meeting",
    "description": "Team meeting",
    "date": "2024-12-25T10:00:00Z",
    "customerId": "customer-uuid"
  }'
```

### Send Friend Request
```bash
curl -X POST http://localhost:4001/friendship/request/user-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "email": "friend@example.com"
  }'
```

## 🗂️ Project Structure

```
nestJS_redis/
├── main/                          # Main API service
│   ├── src/
│   │   ├── auth/                  # Authentication module
│   │   ├── customer/              # Customer management
│   │   ├── note/                  # Notes/Calendar events
│   │   ├── friendship/           # Friend request system
│   │   └── redis/                # Redis service
│   └── package.json
│
├── calendar_events_microservice/  # Calendar events microservice
│   ├── src/
│   │   ├── calendar-event/       # Calendar event logic
│   │   └── redis/                # Redis service
│   └── package.json
│
├── email-generator/               # Email microservice
│   ├── src/
│   │   ├── send-email/            # Email sending logic
│   │   └── redis/                # Redis service
│   └── package.json
│
└── docker-compose.yml             # Docker configuration
```

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- Passwords never returned in API responses
- Email uniqueness validation
- CORS enabled for frontend integration

## 🧪 Testing

```bash
# Run tests in main service
cd main
npm test

# Run e2e tests
npm run test:e2e
```

## 🛠️ Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database/Cache**: Redis
- **Microservices**: Redis Transport
- **Authentication**: bcrypt
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker

## 📦 Key Dependencies

- `@nestjs/common` - NestJS core
- `@nestjs/microservices` - Microservices support
- `ioredis` - Redis client
- `bcrypt` - Password hashing
- `uuid` - UUID generation
- `@nestjs/swagger` - API documentation

## 🐛 Troubleshooting

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Check Redis host/port in environment variables

### Microservice Communication Issues
- Ensure all microservices are running
- Check Redis is accessible from all services
- Verify message patterns match between services

### Port Conflicts
- Change ports in `.env` files if 4001, 3000 are in use
- Update `docker-compose.yml` if using Docker

## 📄 License

This project is private and unlicensed.

## 👥 Contributing

This is a private project. For issues or questions, please contact the project maintainer.

## 📞 Support

For issues or questions, please check the Swagger documentation at `http://localhost:4001/api` or review the code comments.

