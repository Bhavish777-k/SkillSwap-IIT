import React from 'react';
import '../styles/components.css';

/**
 * AuthCard Component
 * A layout component for authentication pages
 * Provides consistent card design with header, body, and footer sections
 * 
 * @param {string} title - Main title text
 * @param {string} subtitle - Subtitle/description text
 * @param {node} children - Form content
 * @param {string} footerText - Footer question text
 * @param {string} footerLinkText - Footer link text
 * @param {string} footerLinkTo - Footer link destination
 */
const AuthCard = ({ 
  title, 
  subtitle, 
  children, 
  footerText, 
  footerLinkText, 
  footerLinkTo 
}) => {
  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <div className="auth-card-logo">🎓</div>
        <h1 className="auth-card-title">{title}</h1>
        {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
      </div>
      
      <div className="auth-card-body">
        {children}
      </div>
      
      {footerText && footerLinkText && (
        <div className="auth-card-footer">
          <p className="auth-card-footer-text">
            {footerText}{' '}
            <a href={footerLinkTo} className="auth-card-footer-link">
              {footerLinkText}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthCard;
