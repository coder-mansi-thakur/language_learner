import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="retro-container">
          <p>Please log in to view your profile.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="retro-container">
        <div className="retro-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
            {currentUser.photoURL && (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  border: '3px solid var(--color-dark-brown)',
                  boxShadow: '4px 4px 0px var(--color-dark-brown)'
                }} 
              />
            )}
            <div>
              <h1 style={{ margin: 0 }}>{currentUser.displayName}</h1>
              <p style={{ margin: '5px 0', color: 'var(--color-dark-brown)', opacity: 0.8 }}>{currentUser.email}</p>
            </div>
          </div>

          <div className="retro-window" style={{ marginBottom: '30px' }}>
            <div className="retro-window-header">
              <span style={{ fontWeight: 'bold' }}>stats.txt</span>
            </div>
            <div className="retro-window-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>0</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>Day Streak</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>0</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>XP Earned</p>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="retro-btn secondary" style={{ width: '100%' }}>
            Log Out
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
