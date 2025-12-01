# 🚖 Ola Clone - Full-Stack Ride Sharing Application

A complete ride-sharing platform similar to Ola/Uber, built with modern web technologies. This project demonstrates real-time booking, driver assignment, payment processing, and location-based services.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Testing Guide](#testing-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

This is a **full-stack ride-sharing application** that replicates core features of Ola/Uber:

- **For Passengers**: Book rides, track drivers, make payments
- **For Drivers**: Go online/offline, accept rides, manage trips
- **Real-time**: Location tracking, driver assignment, booking updates
- **Payment Integration**: Multiple payment methods (Cash, UPI, Card, Wallet)

**Live Demo URLs:**
- Frontend: `http://localhost:5174`
- Backend API: `http://localhost:5000`

---

## ✨ Features

### 🧑 Passenger Features
- ✅ User registration & authentication
- ✅ Real-time location fetching (GPS)
- ✅ Manual address entry
- ✅ Destination autocomplete with suggestions
- ✅ Multiple ride options (Car, Auto, Bike)
- ✅ Real-time fare calculation
- ✅ Booking history
- ✅ Multiple payment methods
- ✅ Cancel booking

### 🚗 Driver Features
- ✅ Driver registration with vehicle details
- ✅ Go online/offline toggle
- ✅ Location updates
- ✅ View nearby ride requests
- ✅ Accept/decline rides
- ✅ Start/complete trips
- ✅ Real-time earnings tracking

### 🔧 System Features
- ✅ JWT-based authentication
- ✅ MongoDB geospatial queries for nearby drivers
- ✅ Automatic driver assignment
- ✅ Scheduled booking support
- ✅ Background workers for automation
- ✅ RESTful API architecture
- ✅ Responsive UI design

---

## 🛠 Tech Stack

### **Frontend**
- **Framework**: React 19 with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v6
- **Styling**: TailwindCSS v4
- **Maps**: Leaflet + OpenStreetMap
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Icons**: Lucide React

### **Backend**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Scheduling**: node-cron
- **CORS**: Enabled for frontend communication

### **Development Tools**
- **Backend Dev Server**: Nodemon + ts-node
- **Frontend Dev Server**: Vite HMR
- **TypeScript**: Full type safety
- **Environment**: dotenv for config

---

## 📁 Project Structure

```
OlaClone/
├── backend/                  # Node.js Backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── workers/         # Background jobs
│   │   ├── middleware/      # Auth, validation
│   │   ├── utils/           # Helper functions
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
├── ola-frontend/            # React Frontend
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── redux/           # State management
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   └── package.json
│
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (running locally or cloud instance)
- Git

### Installation (5 minutes)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd OlaClone

# 2. Setup Backend
cd backend
npm install
cp .env.example .env  # Configure your MongoDB URI
npm run dev           # Starts on http://localhost:5000

# 3. Setup Frontend (new terminal)
cd ../ola-frontend
npm install
npm run dev           # Starts on http://localhost:5174

# 4. Open browser
# Navigate to http://localhost:5174
```

---

## 📖 Detailed Setup

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   Create `.env` file in `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/rideApp
   JWT_SECRET=your_super_secret_key_here_change_in_production
   ```

3. **Start MongoDB**
   ```bash
   # Windows (if installed as service)
   net start MongoDB

   # Mac/Linux
   mongod --dbpath /path/to/data/db
   ```

4. **Run Backend**
   ```bash
   npm run dev  # Development with hot reload
   # OR
   npm run build && npm start  # Production build
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd ola-frontend
   npm install
   ```

2. **Configure API Endpoint** (Optional)
   Check `src/api/axiosClient.ts`:
   ```typescript
   const axiosClient = axios.create({
     baseURL: "http://localhost:5000",  // Backend URL
   });
   ```

3. **Run Frontend**
   ```bash
   npm run dev  # Development with HMR
   # OR
   npm run build && npm run preview  # Production build
   ```

---

## 🔌 API Documentation

### Base URL: `http://localhost:5000`

### Authentication APIs

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "ok": true,
  "user": { "id": "...", "name": "John Doe", "email": "..." }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Driver APIs (Requires Auth)

#### Register as Driver
```http
POST /driver/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Driver Name",
  "phone": "+1234567890",
  "vehicleType": "car"
}
```

#### Update Location
```http
PATCH /driver/update-location
Content-Type: application/json

{
  "driverId": "...",
  "coords": { "lat": 19.0760, "lng": 72.8777 }
}
```

#### Get Nearby Requests
```http
GET /driver/nearby?lat=19.0760&lng=72.8777&vehicleType=car
```

### Booking APIs (Requires Auth)

#### Create Booking
```http
POST /booking/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickup": {
    "address": "Pickup Location",
    "coords": { "lat": 19.0760, "lng": 72.8777 }
  },
  "drop": {
    "address": "Drop Location",
    "coords": { "lat": 19.1760, "lng": 72.9777 }
  },
  "rideType": "car",
  "paymentMethod": "cash"
}
```

#### Get Booking History
```http
GET /booking
Authorization: Bearer <token>
```

📚 **Full API documentation**: See `/backend/README.md`

---

## 🏗 Architecture

### System Flow

```
User/Driver → Frontend (React) → API (Express) → Database (MongoDB)
                ↓                      ↓
         Redux State           Background Workers
```

### Key Components

1. **Authentication Flow**
   - JWT tokens stored in Redux + localStorage
   - Axios interceptors add token to headers
   - Protected routes check authentication

2. **Location Services**
   - Browser Geolocation API
   - OpenStreetMap Nominatim for geocoding
   - Leaflet for map rendering
   - MongoDB geospatial indexes for nearby queries

3. **Booking Flow**
   - User creates booking → Backend assigns driver
   - Driver accepts → Status: "accepted"
   - Driver starts → Status: "running"
   - Driver completes → Status: "completed" → Payment

4. **Background Workers**
   - **Scheduler**: Processes scheduled bookings
   - **Assignment**: Frees stale driver assignments

---

## 🧪 Testing Guide

### Manual Testing Flow

#### Test as Passenger:
1. Navigate to `http://localhost:5174/register`
2. Select "Passenger", enter details, register
3. Login with credentials
4. Click "Fetch Current Location" (allow browser permission)
5. Enter destination (e.g., "Mumbai Airport")
6. Select ride type, book
7. Check console for booking ID

#### Test as Driver (Incognito Window):
1. Open incognito: `http://localhost:5174/register`
2. Select "Driver", enter details + phone + vehicle type
3. Login
4. Click "Go Online"
5. Wait for requests (from passenger booking)
6. Accept request
7. Start ride → Complete ride

### Debug Mode

**Frontend Console Logs:**
- All pages have `[PAGE_NAME]` prefixed logs
- Open Browser DevTools (F12) → Console
- Filter by: `[LOGIN]`, `[HOME]`, `[CREATE_BOOKING]`, `[DRIVER_DASHBOARD]`, etc.

**Backend Logs:**
- Check terminal running `npm run dev`
- Look for: MongoDB queries, API requests, worker logs

### Test Checklist
- [ ] User registration works
- [ ] Login returns JWT token
- [ ] Driver registration creates driver profile
- [ ] Location fetch works
- [ ] Destination autocomplete shows suggestions
- [ ] Booking creation assigns driver (if online)
- [ ] Driver can go online/offline
- [ ] Driver sees nearby requests
- [ ] Accept/Start/Complete ride flow works
- [ ] Payment page shows all options
- [ ] UPI/Card validation works

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend not starting
**Error**: `MongooseServerSelectionError`
**Solution**: 
- Check if MongoDB is running: `mongod --version`
- Verify `MONGO_URI` in `.env`
- Try: `mongodb://127.0.0.1:27017/rideApp` instead of `localhost`

#### 2. Frontend can't connect to backend
**Error**: `Network Error` or `CORS error`
**Solution**:
- Verify backend is running on port 5000
- Check `src/api/axiosClient.ts` baseURL
- Ensure CORS is enabled in backend

#### 3. Location fetch not working
**Error**: "Location permission denied"
**Solution**:
- Allow location in browser settings
- Use manual location entry instead
- Try HTTPS in production (required for geolocation)

#### 4. Redux errors
**Error**: "could not find react-redux context"
**Solution**:
- Check `src/main.tsx` wraps App with `<Provider store={store}>`

#### 5. Booking fails
**Check**:
- Browser console for `[CREATE_BOOKING]` logs
- Backend terminal for error logs
- Ensure pickup/drop coordinates are valid

---

## 📚 Learn More

### Frontend Documentation
- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Leaflet Maps](https://leafletjs.com)
- [TailwindCSS](https://tailwindcss.com)

### Backend Documentation
- [Express.js](https://expressjs.com)
- [MongoDB](https://www.mongodb.com/docs)
- [Mongoose](https://mongoosejs.com)
- [JWT](https://jwt.io)

### Additional Resources
- OpenStreetMap Nominatim API: https://nominatim.org/release-docs/develop/api/Overview/
- MongoDB Geospatial Queries: https://www.mongodb.com/docs/manual/geospatial-queries/

---

## 🤝 Contributing

This is an assignment/learning project. For improvements:
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit pull request

---

## 📝 License

This project is for educational purposes.

---

## 👨‍💻 Author

Created as part of an academic assignment demonstrating full-stack development skills.

**Key Technologies Demonstrated:**
- React with TypeScript
- Redux state management
- RESTful API design
- MongoDB database design
- Real-time location services
- JWT authentication
- Background job processing

---

## 🎓 Assignment Notes

This project demonstrates:
- ✅ Full-stack development (MEAN stack variant)
- ✅ Real-time location-based services
- ✅ Authentication & authorization
- ✅ Database design with relationships
- ✅ RESTful API development
- ✅ Modern frontend architecture
- ✅ Responsive UI/UX
- ✅ Error handling & validation
- ✅ Code organization & best practices

**Total Lines of Code**: ~5000+  
**Development Time**: Full-featured with optimizations  
**Features**: Production-ready core functionality

---

**For detailed component/API documentation, see:**
- [Backend README](./backend/README.md)
- [Frontend README](./ola-frontend/README.md)






































Project overview (build completely):
Build a small, production-style Ola/ride-hailing clone with the following constraints and technologies:

Frontend: React + TypeScript (Vite preferred). Use Tailwind for styling (or CSS if asked). Must be TypeScript.

Backend: Node.js + TypeScript (Express). Use ts-node/nodemon for dev.

Database: MongoDB (use mongoose).

Map/Routing: Mapbox Directions API (or Google Maps if you prefer) — but make token read from env and guarded so app still runs without token.

Auth: Email + password (no OTP). Use JWT for protected endpoints.

SMS / Payment: Mocked (no real provider). Payment flow should be simulated: create “payment intent” and then verify it.

Ports: Frontend runs on default Vite (e.g. 5173). Backend runs on port 5000.

Goal / user journeys:

User sign up & login (email + password). JWT issued on login.

User creates a booking: selects current location (or enters lat/lng), destination (lat/lng), selects “Now” (immediate) or scheduled. UI shows left: interactive map with route (if token given) and right: available vehicle types with computed fare/time. Vehicles: bike, auto, car. Fare calculation uses constants per vehicle type and per-km/time basis.

User selects vehicle type and clicks Book → backend creates a booking; if booking is immediate, backend tries to assign a free driver of that vehicle type using assignment logic described below. Booking returns bookingId. User can see booking status & booking details.

Driver sign up & login (email+password). Driver dashboard: list of available ride requests (only matching driver's vehicleType), ability to accept/decline. Accepting sets booking.driverId = driverId and changes booking.status -> assigned. Declining frees driver and booking becomes pending_assignment.

Driver can start ride, complete ride — status updates and driver becomes available again; earnings calculated as fareBreakdown.total. Dashboard shows total rides & earnings.

Functional requirements & details (must implement):

User model: { _id, name, email (unique), passwordHash, role: "user"|"driver", createdAt }.

Driver model: a separate collection or same user model with driver fields. Implement as Driver model:

{
  _id,
  userId: ObjectId,    // link to User (optional)
  name,
  email,
  phone,
  vehicleType: 'bike'|'auto'|'car',
  location: { type: 'Point', coordinates: [lng, lat] }, // for geospatial
  status: 'available'|'busy'|'accepted'|'offline',
  assignedBookingId: ObjectId | null,
  totalEarnings: Number,
  totalRides: Number,
  lastAssignedAt: Date | null,
  createdAt
}


Booking model:

{
  _id,
  userId,
  driverId (nullable),
  pickup: { address, coords: { lat, lng } },
  drop:   { address, coords: { lat, lng } },
  rideType: 'bike'|'auto'|'car',
  distanceKm: Number,
  durationText: String,
  fareBreakdown: { base: number, perKm: number, perMin: number, total: number },
  payment: { method: 'cash'|'card'|'mock', status: 'pending'|'paid' },
  status: 'pending_assignment'|'assigned'|'accepted'|'running'|'completed'|'cancelled'|'scheduled',
  scheduledFor: Date | null,
  logs: [{ts, text}],
  createdAt
}


Fare constants (simple deterministic table). Example (store in constants.ts):

const FARES = {
  bike:  { base: 10, perKm: 6, perMin: 0.25 },
  auto:  { base: 20, perKm: 8, perMin: 0.35 },
  car:   { base: 30, perKm: 12, perMin: 0.5 }
}


Fare calculation:

distance via Haversine formula (implement helper utils/geo.ts).

durationMin = Math.max(1, Math.round((distKm / averageSpeedKmH) * 60)) where averageSpeed depends on vehicleType: bike=40, auto=30, car=25.

total = base + perKmdistanceKm + perMindurationMin.

Driver assignment logic (assignment.service):

When a booking is created (status pending_assignment) with pickup.coords and rideType:

Query drivers with status == "available" AND vehicleType == booking.rideType AND location within X km (use geospatial query with $near or compute haversine). Use a configurable ASSIGN_RADIUS_KM (e.g. 5 km).

Rank drivers by distance ascending. Try to allocate the nearest driver:

Update driver atomically: set status = 'accepted' temporarily? Better: assignedBookingId = bookingId and status = 'assigned' and lastAssignedAt = new Date() (use findOneAndUpdate with condition status == 'available' to avoid race).

Update booking: driverId = driver._id, status = 'assigned', push log.

If no driver found in radius, return null (frontend will show "No driver found now").

Implement a background worker (cron every minute) to free stale assignments: if driver.assignedBookingId exists but lastAssignedAt older than 90 seconds and booking still pending_assignment or assigned, free the driver (set assignedBookingId=null,status='available') and try reassign. Also a scheduler to move scheduled bookings into pending_assignment 5 minutes before scheduledFor.

Driver accept/decline:

Driver calls /driver/accept with driverId & bookingId: check driver.assignedBookingId==bookingId and change driver.status='busy' and booking.status='accepted' and push log.

Decline: set driver.available and booking back to pending_assignment and call assignment.tryAssignDriver for booking again (async background).

Update destination during ride:

Endpoint /booking/update-destination/:bookingId that only allows assigned|accepted|running. Recalculate distance/fare and update booking.fareBreakdown and logs. Driver/booking validations apply.

Payment flow:

Mock payment: endpoint /payment/create-intent returns a mock providerId and amount. /payment/verify accepts providerId & bookingId and marks payment.status='paid' if provider returns success (simulate success).

Auth:

Public: /auth/register, /auth/login.

Protected: other routes require Authorization: Bearer <token>. JWT secret via env JWT_SECRET. Token payload: { userId, role }.

Middleware must set req.user = { userId, role }.

APIs to implement (exact):

POST /auth/register body { name, email, password, role? } → returns user (no token).

POST /auth/login body { email, password } → returns { token, user: { id, name, email, role } }.

POST /booking/create body { pickup, drop, rideType, scheduleFor? } — server computes fare & distance and returns booking. If immediate, backend tries to assign driver and returns assignedDriver or null.

GET /booking/:bookingId → booking details.

GET /booking → user's booking history (use JWT userId).

PATCH /booking/update-destination/:bookingId body { newDrop: { address, coords } }.

PATCH /booking/complete/:bookingId — driver or system marks complete; frees driver and adds earnings.

PATCH /booking/cancel/:bookingId.

POST /driver/create body { name, email, phone, vehicleType } → create a driver record (and optionally a linked user record).

POST /driver/update-location body { driverId, coords: { lat, lng } } — updates driver.location (geospatial).

GET /driver/nearby?lat=&lng=&vehicleType= — returns list of nearby drivers (for diagnostics).

POST /driver/accept body { driverId, bookingId }.

POST /driver/decline body { driverId, bookingId }.

POST /driver/start body { driverId, bookingId }.

POST /driver/complete body { driverId, bookingId }.

GET /driver/current-booking?driverId= — returns current booking for driver.

POST /payment/create-intent body { bookingId } → returns { providerId, amount }.

POST /payment/verify body { providerId, bookingId } → marks booking.payment.status='paid'.

Front end features & pages (must implement):

Auth pages: Register, Login.

User flow:

Booking page: form for pickup & drop (lat/lng fields or detect current location). Buttons: “Now” or schedule datetime.

Results pane: left: map with route (if Mapbox token provided), right: list of vehicle options (bike/auto/car) with estimated fare & time. Each vehicle shows fare breakdown (base + perKm*km). Implement constants at frontend but ultimately backend is source of truth — frontend uses same constants for instant estimation.

After selecting vehicle, click Proceed to Payment → create booking (POST /booking/create) → show bookingId with status. Payment page: call create-intent then simulate verification (mock) and mark payment as paid.

Driver flow:

Driver dashboard shows: available ride requests (filtered by vehicleType), accept/decline buttons, current booking, start/complete ride, total rides & earnings (aggregate from driver model).

Shared UI:

Booking history (user) and booking details with map.

Provide sample UI behavior / components code skeleton in React + TS; but if generator can produce full UI complete, ensure pages are typed and resilient to missing map token.

Folder structure (exact skeleton to produce):

project-root/
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ workers/
│  │  ├─ middleware/
│  │  ├─ utils/
│  │  ├─ app.ts
│  │  └─ server.ts
│  ├─ package.json
│  └─ tsconfig.json
└─ frontend/
   ├─ src/
   │  ├─ pages/
   │  ├─ components/
   │  ├─ api/
   │  ├─ types/
   │  └─ main.tsx
   ├─ package.json
   └─ tsconfig.json


Env variables (backend .env):

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rideApp
JWT_SECRET=replace_me_with_strong_secret
MAPBOX_TOKEN=OPTIONAL_MAPBOX_TOKEN
ASSIGN_RADIUS_KM=5


Detailed acceptance criteria (do not finish unless all pass):

Backend compiles and runs with npm run dev (ts-node/nodemon) — listen on port 5000 and connects to MongoDB.

Frontend compiles and runs with npm run dev, authenticates with /auth endpoints, stores token in localStorage and attaches Authorization header.

Booking create flow: front sends pickup & drop coords and rideType; backend computes distance/fare and returns booking and assignedDriver (if available).

Driver assignment: when driver created & location set within radius, creating booking triggers immediate assignment; driver shows this booking in available list filtered for vehicleType.

Driver accept/decline works; accept marks booking.assigned and driver.busy; decline frees driver and booking gets re-queued.

Update destination during ride allowed for statuses assigned|accepted|running and recalculates fare.

Payment endpoints create-intent & verify set booking.payment.status to paid, and booking is finalized; backend should update driver earnings when booking completed.

Background worker runs every minute to:

move scheduled bookings into pending_assignment 5 minutes before scheduledFor,

free stale drivers and attempt reassignments.

Provide seed endpoints to create sample drivers and users (for demonstration).

Provide Postman collection (JSON) listing all endpoints and sample bodies for testing.

Testing & run commands to include in repo readme:

Backend:

cd backend
npm install
npx tsc --init
npm run dev  # should run nodemon ts-node src/server.ts


Frontend:

cd frontend
npm install
npm run dev


MongoDB: if MongoDB not installed locally, instruct to use MongoDB Atlas and set MONGO_URI.

Edge cases & defensive coding (must be implemented):

Unique email indexes handle duplicate signup gracefully.

Reject booking creation with invalid coords or malformed body.

Use findOneAndUpdate atomic updates to avoid race when assigning drivers.

For geospatial queries, create 2dsphere index on Driver.location.

Validation for booking status transitions (e.g., cannot accept completed booking).

Extras (bonus, but include):

Provide a single Postman collection file and clear sample bodies for each API.

Add README with run steps, env examples, and how to run seeds.

Add simple UI for driver earnings & total rides.

Add a /dev/seed route to create sample drivers with different vehicleTypes and coordinates near a target center for quick testing.

Important constraints for code generator:

Use TypeScript everywhere (backend & frontend). No JS allowed.

Keep modules small and clear.

Include helpful console.log or log() outputs for workers and assignment steps.

Avoid real external paid services — mock payment & SMS only.

Make the map optional: app must work even if MAPBOX_TOKEN is not provided.

Deliverables (single commit / archive):

Full backend code (TypeScript), with src folder as described, README, sample .env.example.

Full frontend code (React + TypeScript + Vite), working pages (Register, Login, Booking, Booking details, Driver Dashboard).

Postman collection JSON for all endpoints (importable).

README contains explicit API list, bodies, example responses, and manual test steps.

Manual test script to include in README (exact steps for verification):

Start backend and MongoDB.

Seed sample drivers (call /dev/seed).

Register two users: one user and one driver (or create driver via seed).

Login as driver, update driver location to location A and confirm driver is available.

Login as user, create booking with pickup/drop within ASSIGN_RADIUS_KM for driver vehicleType.

Confirm booking returned with assignedDriver (or shows pending if none).

Login as driver and accept booking → booking status becomes accepted and driver busy.

Driver starts ride and completes ride → driver becomes available, totalEarnings increased.

Test update-destination during running and confirm fare recalculation.

Test payment flow (create intent + verify) and confirm booking payment.status updated to paid.

If anything is unclear or a choice must be made (e.g., Mapbox vs Google Maps), default to Mapbox and make it optional via env var.

Finish only when:

Backend runs with no TypeScript compile errors.

Frontend runs and can call backend endpoints.

Postman collection imports and sample calls succeed.

Build this as a complete repo ready for local demo. Provide code only (no extra commentary) and ensure tests pass
