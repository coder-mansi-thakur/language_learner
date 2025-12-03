import React from 'react';

const Input = ({ className = '', ...props }) => {
  return (
    <input 
      className={`retro-input ${className}`} 
      {...props} 
    />
  );
};

export default Input;
