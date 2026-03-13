import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './styles/variables.css';

/**
 * AnimatedRoutes Component
 * Wraps routes with location-based key to trigger animations on route change
 */
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.pathname}>
      {/* Redirect root to login page */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Authentication routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/**
 * Main App Component
 * Sets up routing for the authentication pages
 */
function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
