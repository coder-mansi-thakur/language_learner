import React, { useState, useRef, useEffect } from 'react';

const Select = ({ label, value, onChange, options, placeholder = "Select...", required = false, style = {}, allowAdd = false, onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Update search term when value changes externally or on mount
  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    } else {
      setSearchTerm('');
    }
  }, [value, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // Revert search term to selected option label on close
        if (selectedOption) {
            setSearchTerm(selectedOption.label);
        } else {
            setSearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedOption]);

  const handleSelect = (optionValue, optionLabel) => {
    onChange(optionValue);
    setSearchTerm(optionLabel);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const shouldFilter = !selectedOption || searchTerm !== selectedOption.label;
  
  const filteredOptions = shouldFilter 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div style={{ position: 'relative', ...style }} ref={containerRef}>
      {label && (
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          {label} {required && <span style={{ color: 'var(--color-red)' }}>*</span>}
        </label>
      )}
      <div 
        className="retro-input" 
        style={{ 
          cursor: 'text', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'var(--color-white)',
          padding: '0'
        }}
        onClick={() => inputRef.current.focus()}
      >
        <input
            ref={inputRef}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => {
              setIsOpen(true);
              setSearchTerm('');
            }}
            placeholder={placeholder}
            style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                padding: 'var(--spacing-sm)',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                background: 'transparent'
            }}
        />
        <span style={{ fontSize: '12px', marginRight: '10px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', pointerEvents: 'none' }}>
          ▼
        </span>
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-white)',
          border: 'var(--border-width) solid var(--border-color)',
          borderRadius: 'var(--border-radius-sm)',
          marginTop: '4px',
          zIndex: 100,
          boxShadow: 'var(--box-shadow)',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {filteredOptions.map(option => (
            <div 
              key={option.value}
              onClick={() => handleSelect(option.value, option.label)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: option.value === value ? 'var(--color-cream-dark)' : 'transparent',
                borderBottom: '1px solid var(--color-cream-dark)',
                transition: 'background-color 0.1s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-cream)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = option.value === value ? 'var(--color-cream-dark)' : 'transparent'}
            >
              {option.label}
            </div>
          ))}
          {allowAdd && searchTerm && !options.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase()) && (
             <div 
              onClick={() => {
                  onAdd(searchTerm);
                  setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                color: 'var(--color-primary)',
                borderTop: '1px dashed var(--border-color)',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-cream)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              + Add "{searchTerm}"
            </div>
          )}
          {filteredOptions.length === 0 && (!allowAdd || !searchTerm) && (
             <div style={{ padding: '8px 12px', opacity: 0.6, fontStyle: 'italic' }}>No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
