import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import TrackingPage from './pages/TrackingPage';
import AdminPage from './pages/AdminPage';
import About from './pages/About';
import Contact from './pages/Contact';
import MenuPage from './pages/MenuPage';
import OrderReviewPage from './pages/OrderReviewPage';

import ProtectedRoute from './components/ProtectedRoute';
import RiderDashboard from './pages/RiderDashboard';

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/auth';
  };

  return (
    <Router>
      <Layout cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} user={user} onLogout={logout}>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth onLogin={(u) => setUser(u)} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* User Routes */}
          {/* User Routes */}
          <Route path="/" element={
            <ProtectedRoute user={user} role="customer">
              <Home addToCart={addToCart} />
            </ProtectedRoute>
          } />
          <Route path="/menu" element={
            <ProtectedRoute user={user} role="customer">
              <MenuPage cart={cart} addToCart={addToCart} />
            </ProtectedRoute>
          } />
          <Route path="/review" element={
            <ProtectedRoute user={user} role="customer">
              <OrderReviewPage cart={cart} />
            </ProtectedRoute>
          } />
          <Route path="/track/:trackingId" element={
            <ProtectedRoute user={user} role="customer">
              <TrackingPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute user={user} role="admin">
              <AdminPage onLogout={logout} />
            </ProtectedRoute>
          } />

          {/* Rider Routes */}
          <Route path="/rider" element={
            <ProtectedRoute user={user} role="rider">
              <RiderDashboard onLogout={logout} />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
