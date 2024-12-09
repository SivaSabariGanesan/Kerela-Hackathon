import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login from './assets/Components/Login';
import Dashboard from './assets/Components/Dashboard';
import Checkout from './assets/Components/Checkout';
import Header from './assets/Components/Header';
import Profile from './assets/Components/Profile';
import MyOrders from './assets/Components/MyOrders';
import CancelOrder from './assets/Components/CancelOrder';
import OrderTracking from './assets/Components/TrackingSystem'; // Import OrderTracking component
import AdminDashboard from './assets/Components/AdminDashboard'; // Import AdminDashboard component

export default function App() {
  const [user, setUser] = useState(null); // No localStorage, just session-based state
  const [order, setOrder] = useState([]);

  const handleCheckout = (navigate) => {
    console.log('Proceeding to checkout');
    navigate('/checkout');
  };

  const handleViewHistory = () => {
    console.log('Viewing order history');
  };

  const handleLogin = (newUser) => {
    setUser(newUser); // Set the user directly to state
  };

  const isAdmin = user && user.email === "admin@example.com"; // Check if the logged-in user is an admin

  return (
    <GoogleOAuthProvider clientId="179047694565-gjv2b779lt37ofj82ntni43dco5ppgb8.apps.googleusercontent.com">
      <Router>
        <div className="min-h-screen bg-gray-100">
          {user && (
            <Header
              order={order}
              onCheckout={handleCheckout}
              onViewHistory={handleViewHistory}
              user={user}
              setUser={setUser}
            />
          )}
          <Routes>
            <Route path="/" element={<Login setUser={handleLogin} />} />
            <Route
              path="/dashboard"
              element={<Dashboard user={user} setOrder={setOrder} />}
            />
            <Route
              path="/checkout"
              element={<Checkout order={order} />}
            />
            <Route
              path="/profile"
              element={<Profile user={user} />}
            />
            <Route
              path="/my-orders"
              element={<MyOrders user={user} />}
            />
            <Route
              path="/cancel-order/:orderId"
              element={<CancelOrder />}
            />
            <Route
              path="/orders/:orderId" // Add route for order tracking
              element={<OrderTracking />}
            />
            {/* Admin Dashboard Route */}
            {isAdmin && (
              <Route
                path="/admin-dashboard"
                element={<AdminDashboard />}
              />
            )}
            {/* Redirect to login if not logged in */}
            {!user && <Route path="*" element={<Navigate to="/" />} />}
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}
