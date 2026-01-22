import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import Button from '../components/Button';
import '../styles/auth.css';

/**
 * Login Page Component
 * Handles user authentication UI with email and password
 * Includes remember me, forgot password, and loading states
 */
const Login = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Simulate loading state
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('Login form data:', formData);
      alert(`Welcome back! You would be logged in with:\n\nEmail: ${formData.email}\nRemember Me: ${formData.rememberMe}`);
      
      // In a real app, navigate to dashboard after successful login
      // navigate('/dashboard');
    }, 1500);
  };

  // Handle forgot password
  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Forgot password functionality would open a password reset flow.');
  };

  return (
    <div className="auth-page">
      <div className="auth-page-container">
        <AuthCard
          title="Welcome Back"
          subtitle="Sign in to continue your skill journey"
          footerText="Don't have an account?"
          footerLinkText="Sign up"
          footerLinkTo="/signup"
        >
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@iit.ac.in"
              required
              error={errors.email}
              autoComplete="email"
            />
            
            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              error={errors.password}
              autoComplete="current-password"
            />
            
            <div className="login-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="remember-me-checkbox"
                />
                <label htmlFor="rememberMe" className="remember-me-label">
                  Remember me
                </label>
              </div>
              
              <a 
                href="#" 
                className="forgot-password-link"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </a>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </AuthCard>
      </div>
    </div>
  );
};

export default Login;
