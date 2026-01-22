import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import SkillTagInput from '../components/SkillTagInput';
import Button from '../components/Button';
import '../styles/auth.css';

/**
 * Signup Page Component
 * Handles new user registration with comprehensive form validation
 * Includes skill tags input for offered and needed skills
 */
const Signup = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    skillsOffered: [],
    skillsNeeded: []
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle skills offered changes
  const handleSkillsOfferedChange = (newTags) => {
    setFormData(prev => ({
      ...prev,
      skillsOffered: newTags
    }));
    
    if (errors.skillsOffered) {
      setErrors(prev => ({
        ...prev,
        skillsOffered: ''
      }));
    }
  };

  // Handle skills needed changes
  const handleSkillsNeededChange = (newTags) => {
    setFormData(prev => ({
      ...prev,
      skillsNeeded: newTags
    }));
    
    if (errors.skillsNeeded) {
      setErrors(prev => ({
        ...prev,
        skillsNeeded: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Full name should only contain letters and spaces';
    }
    
    // Email validation (IIT domain check)
    if (!formData.email.trim()) {
      newErrors.email = 'College email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!formData.email.toLowerCase().includes('iit')) {
      newErrors.email = 'Please use your IIT college email';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Skills offered validation
    if (formData.skillsOffered.length === 0) {
      newErrors.skillsOffered = 'Please add at least one skill you can offer';
    }
    
    // Skills needed validation
    if (formData.skillsNeeded.length === 0) {
      newErrors.skillsNeeded = 'Please add at least one skill you want to learn';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    // Simulate loading state
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('Signup form data:', formData);
      
      const message = `Account created successfully!\n\nName: ${formData.fullName}\nEmail: ${formData.email}\nSkills Offered: ${formData.skillsOffered.join(', ')}\nSkills Needed: ${formData.skillsNeeded.join(', ')}`;
      alert(message);
      
      // In a real app, navigate to login or dashboard after successful signup
      // navigate('/login');
    }, 2000);
  };

  return (
    <div className="auth-page">
      <div className="auth-page-container">
        <AuthCard
          title="Join SkillSwap IIT"
          subtitle="Start exchanging skills with fellow students"
          footerText="Already have an account?"
          footerLinkText="Sign in"
          footerLinkTo="/login"
        >
          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            {/* Personal Information Section */}
            <InputField
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
              error={errors.fullName}
              autoComplete="name"
            />
            
            <InputField
              label="College Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.name@iit.ac.in"
              required
              error={errors.email}
              autoComplete="email"
            />
            
            {/* Password Section */}
            <div className="form-row">
              <PasswordField
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                error={errors.password}
                showStrength={true}
                autoComplete="new-password"
              />
              
              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
            </div>
            
            {/* Skills Section */}
            <h3 className="form-section-title">Your Skills</h3>
            
            <SkillTagInput
              label="Skills You Can Offer"
              name="skillsOffered"
              tags={formData.skillsOffered}
              onChange={handleSkillsOfferedChange}
              placeholder="e.g., Web Development, Data Analysis"
              required
              error={errors.skillsOffered}
              maxTags={10}
            />
            
            <SkillTagInput
              label="Skills You Want to Learn"
              name="skillsNeeded"
              tags={formData.skillsNeeded}
              onChange={handleSkillsNeededChange}
              placeholder="e.g., Machine Learning, Public Speaking"
              required
              error={errors.skillsNeeded}
              maxTags={10}
            />
            
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </AuthCard>
      </div>
    </div>
  );
};

export default Signup;
