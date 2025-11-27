import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { STRINGS } from '../constants/strings';

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/profile');
    } catch (error) {
      console.error(STRINGS.LOGIN.ERROR_FAILED, error);
      alert(STRINGS.LOGIN.ERROR_PREFIX + error.message);
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
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{STRINGS.LOGIN.WINDOW_TITLE}</span>
          </div>
          <div className="retro-window-content" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{ marginBottom: '20px' }}>{STRINGS.LOGIN.WELCOME_BACK}</h2>
            <p style={{ marginBottom: '30px' }}>{STRINGS.LOGIN.INSTRUCTION}</p>
            
            <button onClick={handleGoogleLogin} className="retro-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span>{STRINGS.LOGIN.GOOGLE_LOGIN}</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
