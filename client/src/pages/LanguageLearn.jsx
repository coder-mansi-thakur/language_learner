import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGet } from '../hooks/useApi';
import { STRINGS } from '../constants/strings';

const LanguageLearn = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { data: language, loading, error } = useGet(`/languages/${code}`);

  if (loading) {
    return (
      <Layout>
        <div className="retro-container" style={{ textAlign: 'center' }}>
          <p>{STRINGS.DASHBOARD.LOADING}</p>
        </div>
      </Layout>
    );
  }

  if (error || !language) {
    return (
      <Layout>
        <div className="retro-container" style={{ textAlign: 'center' }}>
          <p>Error loading language.</p>
          <button className="retro-btn" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="retro-container">
        <button 
          className="retro-btn secondary" 
          onClick={() => navigate('/dashboard')}
          style={{ marginBottom: '20px' }}
        >
          ← Back
        </button>

        <div className="retro-card" style={{ textAlign: 'center', padding: '40px' }}>
          <span style={{ fontSize: '80px', display: 'block', marginBottom: '20px' }}>
            {language.flag}
          </span>
          <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>{language.name}</h1>
          <p style={{ fontSize: '18px', opacity: 0.8 }}>
            Ready to continue your learning journey?
          </p>
          
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button className="retro-btn" style={{ fontSize: '18px', padding: '15px 30px' }}>
              Start Lesson
            </button>
            <button className="retro-btn secondary" style={{ fontSize: '18px', padding: '15px 30px' }}>
              Practice
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LanguageLearn;
