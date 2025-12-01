# 🔧 Backend - Ola Clone API

Node.js + Express + MongoDB backend for the Ola Clone ride-sharing application.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Services](#services)
- [Workers](#workers)
- [Middleware](#middleware)
- [Utils](#utils)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🎯 Overview

This backend provides RESTful APIs for:
- User & Driver authentication
- Booking management
- Driver assignment algorithms
- Payment processing
- Real-time location services
- Background job processing

**Base URL**: `http://localhost:5000`

---

## 🛠 Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js v5
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Job Scheduling**: node-cron
- **Development**: Nodemon + ts-node
- **Language**: TypeScript

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # HTTP request handlers
│   │   ├── auth.controller.ts      # User auth logic
│   │   ├── booking.controller.ts   # Booking CRUD
│   │   ├── driver.controller.ts    # Driver operations
│   │   └── payment.controller.ts   # Payment handling
│   │
│   ├── models/               # Mongoose schemas
│   │   ├── User.ts                 # User model
│   │   ├── Driver.ts               # Driver model
│   │   └── Booking.ts              # Booking model
│   │
│   ├── routes/               # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── driver.routes.ts
│   │   └── payment.routes.ts
│   │
│   ├── services/             # Business logic
│   │   ├── assignment.service.ts   # Driver assignment algorithm
│   │   ├── fare.service.ts         # Fare calculation
│   │   ├── driverLocation.service.ts  # Location tracking
│   │   └── scheduler.service.ts    # Scheduled bookings
│   │
│   ├── workers/              # Background jobs
│   │   ├── scheduler.worker.ts     # Scheduled booking processor
│   │   └── assignment.worker.ts    # Stale assignment cleanup
│   │
│   ├── middleware/           # Express middleware
│   │   └── auth.middleware.ts      # JWT verification
│   │
│   ├── utils/                # Helper functions
│   │   ├── logger.ts               # Logging utility
│   │   └── geo.ts                  # Geospatial calculations
│   │
│   ├── app.ts                # Express app configuration
│   └── server.ts             # Entry point
│
├── .env                      # Environment config
├── package.json
├── tsconfig.json
└── README.md (this file)
```

---

## 🚀 Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup MongoDB
```bash
# Install MongoDB (if not installed)
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/data/db
```

### 3. Configure Environment
Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rideApp
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

### 4. Run Development Server
```bash
npm run dev
```

Server starts on `http://localhost:5000`

---

## 🔐 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | No |
| `MONGO_URI` | MongoDB connection string | mongodb://127.0.0.1:27017/rideApp | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |

**Production Note**: Always use strong secrets and environment-specific values

---

## 🛣 API Routes

### Authentication Routes (`/auth`)

#### POST `/auth/register`
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "ok": true,
  "user": {
    "_id": "6547abc123...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/auth/login`
Login and receive JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6547abc123...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Driver Routes (`/driver`)

All driver routes require authentication header: `Authorization: Bearer <token>`

#### POST `/driver/create`
Register as a driver (requires authenticated user).

**Request:**
```json
{
  "name": "Driver Name",
  "phone": "+1234567890",
  "vehicleType": "car"
}
```

**Vehicle Types**: `car`, `bike`, `auto`, `mini`

**Response:**
```json
{
  "ok": true,
  "driver": {
    "_id": "6547driver123...",
    "name": "Driver Name",
    "phone": "+1234567890",
    "vehicleType": "car",
    "status": "available",
    "location": { "type": "Point", "coordinates": [0, 0] }
  }
}
```

#### PATCH `/driver/update-location`
Update driver's current location.

**Request:**
```json
{
  "driverId": "6547driver123...",
  "coords": {
    "lat": 19.0760,
    "lng": 72.8777
  }
}
```

#### GET `/driver/nearby`
Get nearby drivers for a specific location and vehicle type.

**Query Params:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `vehicleType` (required): Vehicle type

**Example:**
```
GET /driver/nearby?lat=19.0760&lng=72.8777&vehicleType=car
```

#### POST `/driver/accept`
Accept a ride assignment.

**Request:**
```json
{
  "driverId": "6547driver123...",
  "bookingId": "6547booking456..."
}
```

#### POST `/driver/start`
Start an accepted ride.

**Request:**
```json
{
  "driverId": "6547driver123...",
  "bookingId": "6547booking456..."
}
```

#### POST `/driver/complete`
Complete a running ride.

**Request:**
```json
{
  "driverId": "6547driver123...",
  "bookingId": "6547booking456..."
}
```

#### GET `/driver/current-booking`
Get driver's current active booking.

**Query Params:**
- `driverId` (required)

---

### Booking Routes (`/booking`)

All booking routes require authentication.

#### POST `/booking/create`
Create a new booking.

**Request:**
```json
{
  "pickup": {
    "address": "Andheri East, Mumbai",
    "coords": { "lat": 19.1197, "lng": 72.8464 }
  },
  "drop": {
    "address": "Bandra West, Mumbai",
    "coords": { "lat": 19.0596, "lng": 72.8295 }
  },
  "rideType": "car",
  "paymentMethod": "cash",
  "scheduleFor": null  // Optional: ISO date for future booking
}
```

**Response:**
```json
{
  "ok": true,
  "booking": {
    "_id": "6547booking456...",
    "userId": "6547abc123...",
    "pickup": { ... },
    "drop": { ... },
    "distanceKm": 8.5,
    "durationText": "17 mins",
    "rideType": "car",
    "fareBreakdown": {
      "baseFare": 50,
      "perKmFare": 102,
      "taxPercent": 5,
      "tax": 7.6,
      "total": 159.6
    },
    "payment": {
      "method": "cash",
      "status": "pending"
    },
    "status": "pending_assignment",  // or "assigned" if driver found
    "logs": [...]
  },
  "assignedDriver": { ... }  // If driver assigned immediately
}
```

#### GET `/booking/:bookingId`
Get booking details by ID.

#### GET `/booking`
Get user's booking history (sorted by latest first).

#### PATCH `/booking/update-destination/:bookingId`
Update destination during ride.

**Request:**
```json
{
  "newDrop": {
    "address": "New destination",
    "coords": { "lat": 19.1, "lng": 72.9 }
  }
}
```

#### PATCH `/booking/complete/:bookingId`
Mark booking as completed.

#### PATCH `/booking/cancel/:bookingId`
Cancel a booking.

---

### Payment Routes (`/payment`)

#### POST `/payment/init`
Initialize a payment.

**Request:**
```json
{
  "bookingId": "6547booking456...",
  "method": "upi",  // or "card", "wallet", "cash"
  "amount": 159.6
}
```

#### POST `/payment/verify`
Verify payment completion.

**Request:**
```json
{
  "transactionId": "txn_abc123...",
  "bookingId": "6547booking456..."
}
```

---

## 💾 Database Schema

### User Model
```typescript
{
  name: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  createdAt: Date
}
```

### Driver Model
```typescript
{
  name: String (required)
  phone: String (required)
  vehicleType: String (enum: car, bike, auto, mini)
  userId: ObjectId (ref: User)
  status: String (enum: available, busy, offline)
  assignedBookingId: ObjectId (ref: Booking, nullable)
  lastAssignedAt: Date
  location: {
    type: "Point",
    coordinates: [lng, lat]  // GeoJSON format
  }
  createdAt: Date
}
```

**Indexes:**
- `location`: 2dsphere (for geospatial queries)
- `userId`: 1 (for user lookup)

### Booking Model
```typescript
{
  userId: ObjectId (ref: User)
  driverId: ObjectId (ref: Driver, nullable)
  
  pickup: {
    address: String
    coords: { lat: Number, lng: Number }
  }
  drop: {
    address: String
    coords: { lat: Number, lng: Number }
  }
  
  distanceKm: Number
  durationText: String
  rideType: String (enum: car, bike, auto, mini)
  
  fareBreakdown: {
    baseFare: Number
    perKmFare: Number
    taxPercent: Number
    tax: Number
    total: Number
  }
  
  payment: {
    method: String (enum: cash, upi, card, wallet)
    status: String (enum: pending, completed, failed)
  }
  
  status: String (enum: scheduled, pending_assignment, assigned, 
                       accepted, running, completed, cancelled)
  
  scheduledFor: Date (optional)
  lastDropUpdateAt: Date
  
  logs: [{
    ts: Date
    text: String
  }]
  
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔧 Services

### Fare Service (`fare.service.ts`)
Calculates fare based on distance, duration, and ride type.

**Logic:**
- Base fare: ₹50
- Per km rates vary by vehicle type:
  - Car: ₹12/km
  - Auto: ₹10/km
  - Bike: ₹8/km
  - Mini: ₹9/km
- Tax: 5% of total

### Assignment Service (`assignment.service.ts`)
Handles driver assignment for bookings.

**Algorithm:**
1. Find available drivers within 5km radius
2. Filter by matching vehicle type
3. Exclude drivers assigned < 2 minutes ago
4. Select nearest driver
5. Assign booking and update statuses

**Methods:**
- `tryAssignDriver()` - Attempt to assign a driver
- `freeStaleAssignedDrivers()` - Free drivers who didn't accept within timeout

### Driver Location Service (`driverLocation.service.ts`)
Manages driver location updates.

**Features:**
- Updates driver coordinates in MongoDB
- Uses GeoJSON Point format
- Supports geospatial queries

### Scheduler Service (`scheduler.service.ts`)
Handles scheduled (future) bookings.

---

## ⚙️ Workers

### Scheduler Worker (`scheduler.worker.ts`)
**Schedule**: Every 1 minute  
**Purpose**: Process scheduled bookings when their time arrives

**Logic:**
1. Find bookings with `status: "scheduled"`
2. Check if `scheduledFor` time is within next 6 minutes
3. Move to `pending_assignment` status
4. Attempt driver assignment

**Optimized Logging**: Only logs when bookings are found

### Assignment Worker (`assignment.worker.ts`)
**Schedule**: Every 1 minute  
**Purpose**: Free stale driver assignments

**Logic:**
1. Find drivers with `status: "assigned"`
2. Check if assigned > 2 minutes ago without acceptance
3. Free driver (set to "available")
4. Unassign booking (back to "pending_assignment")

**Optimized Logging**: Only logs when drivers are freed

---

## 🛡️ Middleware

### Auth Middleware (`auth.middleware.ts`)
Verifies JWT tokens and extracts user ID.

**Usage:**
```typescript
import { authenticateJWT } from './middleware/auth.middleware';

router.post('/booking/create', authenticateJWT, bookingController.createBooking);
```

**Functionality:**
- Extracts token from `Authorization: Bearer <token>` header
- Verifies JWT signature
- Attaches `userId` to request object
- Returns 401 if invalid/missing token

---

## 🧰 Utils

### Logger (`logger.ts`)
Simple logging utility with timestamps.

```typescript
import { log } from './utils/logger';

log("Server started");  // [2024-01-30T12:00:00.000Z] Server started
```

### Geo Utils (`geo.ts`)
Haversine distance calculation between two coordinates.

```typescript
import { haversineDistanceKm } from './utils/geo';

const distance = haversineDistanceKm(lat1, lng1, lat2, lng2);
// Returns distance in kilometers
```

---

## 🧪 Testing

### Manual API Testing

**Using cURL:**
```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Create Booking (with token)
curl -X POST http://localhost:5000/booking/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{...booking data...}'
```

**Using Postman:**
1. Import endpoints or create collection
2. Set `Authorization` header for protected routes
3. Test all CRUD operations

### Debugging

**Enable detailed logs:**
- Check MongoDB connections: Look for "MongoDB Connected ✔️"
- Check worker startup: Look for "✓ Background workers started"
- Check API requests: All endpoints log their operations

**Common Debug Points:**
- `controllers/`: Add `console.log()` in request handlers
- `services/`: Log business logic decisions
- `workers/`: Monitor cron job executions

---

## 📦 Scripts

```json
{
  "dev": "nodemon src/server.ts",          // Development with hot reload
  "build": "tsc",                          // Compile TypeScript
  "start": "node dist/server.js",          // Run production build
  "dev:worker": "nodemon --exec ts-node src/workers/scheduler.worker.ts"  // Run worker separately
}
```

---

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Use production MongoDB URI (e.g., MongoDB Atlas)
   - Generate strong JWT_SECRET (32+ characters)
   - Set NODE_ENV=production

2. **Build**
   ```bash
   npm run build
   npm start
   ```

3. **Database**
   - Create indexes: `db.drivers.createIndex({ location: "2dsphere" })`
   - Backup strategy
   - Connection pooling

4. **Security**
   - Enable HTTPS
   - Rate limiting
   - Input validation
   - Helmet.js for headers

5. **Monitoring**
   - Error logging (e.g., Winston, Sentry)
   - Performance monitoring
   - Database query optimization

### Deployment Options
- **Heroku**: Easy deployment with MongoDB add-on
- **AWS**: EC2 + MongoDB Atlas
- **DigitalOcean**: Droplet + managed database
- **Vercel/Railway**: Serverless options

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: MongooseServerSelectionError
```
**Solution:**
- Check MongoDB is running: `mongod --version`
- Verify MONGO_URI in `.env`
- Try `127.0.0.1` instead of `localhost`

### JWT Errors
```
Error: jwt malformed
```
**Solution:**
- Ensure JWT_SECRET is set in `.env`
- Check token format in Authorization header
- Verify token hasn't expired

### Port Already in Use
```
Error: EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

## 📚 Learn More

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT.io](https://jwt.io/introduction)
- [Node-cron](https://github.com/node-cron/node-cron)

---

## 🎓 Code Quality

- **TypeScript**: Full type safety
- **Error Handling**: Try-catch blocks in all async operations
- **Logging**: Consistent logging for debugging
- **Validation**: Input validation on all endpoints
- **Security**: Password hashing, JWT authentication
- **Architecture**: MVC pattern with services layer

---

## 📝 License

Educational/Assignment Project

---

**Developed with ❤️ for full-stack learning**
