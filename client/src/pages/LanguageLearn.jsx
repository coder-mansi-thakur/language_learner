import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGet } from '../hooks/useApi';
import { STRINGS } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';

const LanguageLearn = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { data: language, loading, error } = useGet(ENDPOINTS.LANGUAGES.GET_BY_CODE(code));

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
          <p>{STRINGS.LANGUAGE_LEARN.ERROR_LOADING}</p>
          <button className="retro-btn" onClick={() => navigate('/dashboard')}>
            {STRINGS.LANGUAGE_LEARN.BACK_DASHBOARD}
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
          {STRINGS.LANGUAGE_LEARN.BACK}
        </button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', gap: '10px' }}>
            <button 
                className="retro-btn secondary" 
                onClick={() => navigate(`/image-extractor/${code}`)}
            >
                Image to Text
            </button>
            <button 
                className="retro-btn secondary" 
                onClick={() => navigate(`/import-anki/${code}`)}
            >
                Import Anki
            </button>
            <button 
                className="retro-btn secondary" 
                onClick={() => navigate(`/my-vocab/${code}`)}
            >
                My Vocabulary
            </button>
        </div>

        <div className="retro-card" style={{ textAlign: 'center', padding: '40px' }}>
          <span style={{ fontSize: '80px', display: 'block', marginBottom: '20px' }}>
            {language.flag}
          </span>
          <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>{language.name}</h1>
          <p style={{ fontSize: '18px', opacity: 0.8 }}>
            {STRINGS.LANGUAGE_LEARN.READY_MESSAGE}
          </p>
          
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button 
              className="retro-btn" 
              style={{ fontSize: '18px', padding: '15px 30px' }}
              onClick={() => navigate(`/add-word/${code}`)}
            >
              {STRINGS.VOCAB_CMS.VOCABULARY.ADD_WORD}
            </button>
            <button 
              className="retro-btn secondary" 
              style={{ fontSize: '18px', padding: '15px 30px' }}
              onClick={() => navigate(`/practice/${code}`)}
            >
              {STRINGS.LANGUAGE_LEARN.PRACTICE}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LanguageLearn;
