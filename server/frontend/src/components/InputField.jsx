import React from 'react';
import '../styles/components.css';

/**
 * InputField Component
 * A reusable input field with label, error handling, and validation states
 * 
 * @param {string} label - Label text for the input
 * @param {string} type - Input type (text, email, etc.)
 * @param {string} name - Input name attribute
 * @param {string} value - Controlled input value
 * @param {function} onChange - Change handler function
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether field is required
 * @param {string} error - Error message to display
 * @param {object} props - Additional input props
 */
const InputField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  required = false,
  error = '',
  ...props 
}) => {
  return (
    <div className="input-field-wrapper">
      {label && (
        <label 
          htmlFor={name} 
          className={`input-field-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="input-field-container">
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field ${error ? 'error' : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
      </div>
      
      {error && (
        <div 
          className="input-field-error" 
          id={`${name}-error`}
          role="alert"
        >
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default InputField;
