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
