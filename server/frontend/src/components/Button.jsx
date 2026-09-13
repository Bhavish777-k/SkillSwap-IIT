import React from 'react';
import '../styles/components.css';

/**
 * Button Component
 * A flexible button with loading state and multiple variants
 * 
 * @param {string} children - Button text/content
 * @param {string} variant - Button style variant (primary, secondary)
 * @param {string} size - Button size (normal, large)
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {boolean} loading - Whether button is in loading state
 * @param {boolean} disabled - Whether button is disabled
 * @param {function} onClick - Click handler function
 * @param {string} type - Button type (button, submit, reset)
 * @param {object} props - Additional button props
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'normal',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    size === 'large' ? 'btn-large' : '',
    fullWidth ? 'btn-full' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="btn-loading" aria-label="Loading"></span>
      )}
      {children}
    </button>
  );
};

export default Button;
