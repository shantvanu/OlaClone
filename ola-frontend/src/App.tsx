import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateBooking from './pages/CreateBooking';
import DriverDashboard from './pages/DriverDashboard';
import BookingStatus from './pages/BookingStatus';
import { useSelector } from 'react-redux';
import type { RootState } from './redux/store';

// Protected Route for authenticated users only (non-drivers)
const UserRoute = ({ children }: { children: React.ReactElement }) => {
  const { token, user } = useSelector((state: RootState) => state.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'driver') {
    return <Navigate to="/driver" replace />;
  }

  return children;
};

// Protected Route for drivers only
const DriverRoute = ({ children }: { children: React.ReactElement }) => {
  const { token, user } = useSelector((state: RootState) => state.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'driver') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public routes (login/register) - redirect if already authenticated
const PublicOnlyRoute = ({ children }: { children: React.ReactElement }) => {
  const { token, user } = useSelector((state: RootState) => state.user);

  if (token && user) {
    // Redirect based on role
    if (user.role === 'driver') {
      return <Navigate to="/driver" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Home - protected for users only */}
          <Route index element={
            <UserRoute>
              <Home />
            </UserRoute>
          } />

          {/* Public routes */}
          <Route path="login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />
          <Route path="register" element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          } />

          {/* User-only routes */}
          <Route path="booking" element={
            <UserRoute>
              <CreateBooking />
            </UserRoute>
          } />

          <Route path="bookings" element={
            <UserRoute>
              <BookingStatus />
            </UserRoute>
          } />

          {/* Driver-only routes */}
          <Route path="driver" element={
            <DriverRoute>
              <DriverDashboard />
            </DriverRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
