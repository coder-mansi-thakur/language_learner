import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        className="retro-window" 
        style={{ maxWidth: '500px', width: '90%', margin: '0' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="retro-window-header orange">
          <div className="window-controls">
            <div className="control-dot" onClick={onClose} style={{ cursor: 'pointer' }}></div>
            <div className="control-dot"></div>
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{title}</span>
        </div>
        <div className="retro-window-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
