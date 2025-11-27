import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { STRINGS } from '../constants/strings';

const Home = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <Layout>
      <div className="retro-container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>{STRINGS.HOME.WELCOME}</h1>
        <p>{STRINGS.HOME.SUBTITLE}</p>
        <div style={{ marginTop: '30px' }}>
          <button onClick={handleStart} className="retro-btn">{STRINGS.HOME.START_BUTTON}</button>
        </div>
        {/* <div style={{ marginTop: '30px' }}>
          <a href="/ui-components" className="retro-btn">View Design System</a>
        </div> */}
      </div>
    </Layout>
  );
};

export default Home;
