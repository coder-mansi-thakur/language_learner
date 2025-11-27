import React from 'react';

const ProgressBar = ({ value, max = 100, color = 'var(--color-green)' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div style={{
      height: '24px',
      width: '100%',
      backgroundColor: 'var(--color-white)',
      border: '3px solid var(--border-color)',
      borderRadius: '12px',
      position: 'relative',
      boxShadow: '2px 2px 0px var(--border-color)',
      overflow: 'hidden'
    }}>
      <div style={{
        height: '100%',
        width: `${percentage}%`,
        backgroundColor: color,
        borderRight: percentage > 0 && percentage < 100 ? '3px solid var(--border-color)' : 'none',
        transition: 'width 0.3s ease-in-out'
      }} />
    </div>
  );
};

export default ProgressBar;
