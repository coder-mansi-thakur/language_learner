import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/profile');
    } catch (error) {
      console.error("Failed to log in", error);
      alert("Failed to log in: " + error.message);
    }
  };

  return (
    <Layout>
      <div className="retro-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="retro-window" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="retro-window-header orange">
            <div className="window-controls">
              <div className="control-dot"></div>
              <div className="control-dot"></div>
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>login.exe</span>
          </div>
          <div className="retro-window-content" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Welcome Back!</h2>
            <p style={{ marginBottom: '30px' }}>Please log in to access your profile and continue learning.</p>
            
            <button onClick={handleGoogleLogin} className="retro-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span>Login with Google</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
