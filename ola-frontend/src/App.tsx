import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateBooking from './pages/CreateBooking';
import DriverDashboard from './pages/DriverDashboard';
import PaymentPage from './pages/PaymentPage';
import { useSelector } from 'react-redux';
import type { RootState } from './redux/store';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { token } = useSelector((state: RootState) => state.user);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route path="booking" element={
            <ProtectedRoute>
              <CreateBooking />
            </ProtectedRoute>
          } />

          <Route path="driver" element={
            <ProtectedRoute>
              <DriverDashboard />
            </ProtectedRoute>
          } />

          <Route path="payment" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
