import React, { useState } from 'react';
import '../styles/components.css';

/**
 * PasswordField Component
 * A password input with show/hide toggle and optional strength indicator
 * 
 * @param {string} label - Label text for the input
 * @param {string} name - Input name attribute
 * @param {string} value - Controlled input value
 * @param {function} onChange - Change handler function
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether field is required
 * @param {string} error - Error message to display
 * @param {boolean} showStrength - Whether to show password strength indicator
 * @param {object} props - Additional input props
 */
const PasswordField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  required = false,
  error = '',
  showStrength = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Calculate password strength
  const getPasswordStrength = (password) => {
    if (!password) return { label: '', strength: '' };
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) {
      return { label: 'Weak', strength: 'weak' };
    } else if (strength <= 4) {
      return { label: 'Medium', strength: 'medium' };
    } else {
      return { label: 'Strong', strength: 'strong' };
    }
  };

  const passwordStrength = showStrength ? getPasswordStrength(value) : null;

  return (
    <div className="password-field-wrapper">
      {label && (
        <label 
          htmlFor={name} 
          className={`password-field-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="password-field-container">
        <input
          id={name}
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`password-field ${error ? 'error' : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
        
        <button
          type="button"
          className="password-toggle-btn"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={0}
        >
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
      
      {error && (
        <div 
          className="password-field-error" 
          id={`${name}-error`}
          role="alert"
        >
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}
      
      {showStrength && value && !error && (
        <div className="password-strength">
          <div className={`password-strength-label ${passwordStrength.strength}`}>
            Password Strength: {passwordStrength.label}
          </div>
          <div className="password-strength-bar">
            <div className={`password-strength-fill ${passwordStrength.strength}`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordField;
