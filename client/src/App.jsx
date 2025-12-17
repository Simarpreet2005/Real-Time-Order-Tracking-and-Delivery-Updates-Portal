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

function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // alert('Added to cart!'); // Removed alert for smoother UX
  };

  return (
    <Router>
      <Layout cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}>
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/menu" element={<MenuPage cart={cart} addToCart={addToCart} />} />
          <Route path="/review" element={<OrderReviewPage cart={cart} />} />

          <Route path="/track/:trackingId" element={<TrackingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
