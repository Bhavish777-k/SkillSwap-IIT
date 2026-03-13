import React, { useState } from 'react';
import '../styles/components.css';

/**
 * SkillTagInput Component
 * An input that allows users to add/remove skill tags dynamically
 * 
 * @param {string} label - Label text for the input
 * @param {string} name - Input name attribute
 * @param {array} tags - Array of current tags
 * @param {function} onChange - Handler for when tags change
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether field is required
 * @param {string} error - Error message to display
 * @param {number} maxTags - Maximum number of tags allowed
 */
const SkillTagInput = ({ 
  label, 
  name, 
  tags = [], 
  onChange, 
  placeholder = 'Type a skill and press Enter', 
  required = false,
  error = '',
  maxTags = 10
}) => {
  const [inputValue, setInputValue] = useState('');

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle key press (Enter or comma to add tag)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      removeTag(tags.length - 1);
    }
  };

  // Add a new tag
  const addTag = () => {
    const trimmedValue = inputValue.trim();
    
    // Validation checks
    if (!trimmedValue) return;
    if (tags.length >= maxTags) {
      alert(`Maximum ${maxTags} skills allowed`);
      return;
    }
    if (tags.includes(trimmedValue)) {
      alert('This skill is already added');
      setInputValue('');
      return;
    }
    
    // Add tag and reset input
    onChange([...tags, trimmedValue]);
    setInputValue('');
  };

  // Remove a tag by index
  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="skill-tag-wrapper">
      {label && (
        <label 
          htmlFor={name} 
          className={`skill-tag-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div 
        className={`skill-tag-container ${error ? 'error' : ''}`}
        onClick={() => document.getElementById(name)?.focus()}
      >
        {tags.map((tag, index) => (
          <div key={index} className="skill-tag">
            <span>{tag}</span>
            <button
              type="button"
              className="skill-tag-remove"
              onClick={() => removeTag(index)}
              aria-label={`Remove ${tag}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))}
        
        <input
          id={name}
          type="text"
          className="skill-tag-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : `${name}-hint`}
        />
      </div>
      
      {error && (
        <div 
          className="skill-tag-error" 
          id={`${name}-error`}
          role="alert"
        >
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}
      
      {!error && (
        <div className="skill-tag-hint" id={`${name}-hint`}>
          Press Enter or comma to add a skill • {tags.length}/{maxTags} skills
        </div>
      )}
    </div>
  );
};

export default SkillTagInput;
