import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { STRINGS } from '../constants/strings';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error(STRINGS.PROFILE.LOGOUT_ERROR, error);
    }
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="retro-container">
          <p>{STRINGS.PROFILE.LOGIN_PROMPT}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="retro-container">
        <div className="retro-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
            {currentUser.photoURL && !imgError ? (
              <img 
                src={currentUser.photoURL} 
                alt={STRINGS.PROFILE.ALT_PROFILE} 
                onError={() => setImgError(true)}
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  border: '3px solid var(--color-dark-brown)',
                  boxShadow: '4px 4px 0px var(--color-dark-brown)',
                  objectFit: 'cover'
                }} 
              />
            ) : (
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                border: '3px solid var(--color-dark-brown)',
                boxShadow: '4px 4px 0px var(--color-dark-brown)',
                backgroundColor: 'var(--color-yellow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'var(--color-dark-brown)'
              }}>
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <h1 style={{ margin: 0 }}>{currentUser.displayName || STRINGS.PROFILE.DEFAULT_USER}</h1>
              <p style={{ margin: '5px 0', color: 'var(--color-dark-brown)', opacity: 0.8 }}>{currentUser.email}</p>
            </div>
          </div>

          <div className="retro-window" style={{ marginBottom: '30px' }}>
            <div className="retro-window-header">
              <span style={{ fontWeight: 'bold' }}>{STRINGS.PROFILE.STATS_TITLE}</span>
            </div>
            <div className="retro-window-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>0</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>{STRINGS.PROFILE.DAY_STREAK}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>0</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>{STRINGS.PROFILE.XP_EARNED}</p>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="retro-btn secondary" style={{ width: '100%' }}>
            {STRINGS.PROFILE.LOGOUT_BUTTON}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
