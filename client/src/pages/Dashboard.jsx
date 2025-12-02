import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { STRINGS } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';
import { useNavigate } from 'react-router-dom';
import { useGet, usePost } from '../hooks/useApi';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: userData, loading, error, refetch } = useGet(
    currentUser ? ENDPOINTS.USERS.GET_PROFILE(currentUser.uid) : null,
    { enabled: !!currentUser }
  );

  const { data: languages } = useGet(ENDPOINTS.LANGUAGES.GET_ALL);
  const { post: startLearning } = usePost();

  const handleStartLearning = async (languageId) => {
    try {
      await startLearning(ENDPOINTS.USERS.START_LEARNING(currentUser.uid), { languageId });
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error(STRINGS.DASHBOARD.ERROR_STARTING, error);
    }
  };

  if (error) {
    console.error(STRINGS.DASHBOARD.ERROR_FETCHING_DATA, error);
  }

  if (loading) {
    return (
      <Layout>
        <div className="retro-container" style={{ textAlign: 'center' }}>
          <p>{STRINGS.DASHBOARD.LOADING}</p>
        </div>
      </Layout>
    );
  }

  const learningLanguages = userData?.Languages?.filter(l => l.UserLanguage.status === 'learning') || [];
  const otherLanguages = languages?.filter(lang => !learningLanguages.some(l => l.id === lang.id)) || [];

  return (
    <Layout>
      <div className="retro-container">
        {learningLanguages.length > 0 && (
          <>
            <h2 style={{ marginBottom: '20px' }}>{STRINGS.DASHBOARD.MY_LANGUAGES}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              {learningLanguages.map(lang => (
                <div key={lang.id} className="retro-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <span style={{ fontSize: '40px' }}>{lang.flag}</span>
                    <span className="retro-tag" style={{ textTransform: 'capitalize' }}>{lang.UserLanguage.proficiency}</span>
                  </div>
                  <h3 style={{ margin: '0 0 10px 0' }}>{lang.name}</h3>
                  <button 
                    className="retro-btn" 
                    style={{ width: '100%' }}
                    onClick={() => navigate(`/learn/${lang.code}`)}
                  >
                    {STRINGS.DASHBOARD.CONTINUE}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {otherLanguages.length > 0 && (
          <>
            <h2 style={{ marginBottom: '20px' }}>{STRINGS.DASHBOARD.EXPLORE}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {otherLanguages.map(lang => (
                <div key={lang.id} className="retro-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <span style={{ fontSize: '40px' }}>{lang.flag}</span>
                  </div>
                  <h3 style={{ margin: '0 0 15px 0' }}>{lang.name}</h3>
                  <button 
                    className="retro-btn secondary" 
                    style={{ width: '100%' }}
                    onClick={() => handleStartLearning(lang.id)}
                  >
                    {STRINGS.DASHBOARD.START}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {learningLanguages.length === 0 && otherLanguages.length === 0 && (
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <p>{STRINGS.DASHBOARD.NO_LANGUAGES}</p>
            <button onClick={() => setIsModalOpen(true)} className="retro-btn" style={{ marginTop: '10px' }}>{STRINGS.DASHBOARD.START_LEARNING}</button>
          </div>
        )}

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={STRINGS.DASHBOARD.SELECT_LANGUAGE}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {languages?.map(lang => (
              <button 
                key={lang.id} 
                className="retro-btn secondary" 
                onClick={() => handleStartLearning(lang.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px' }}
              >
                <span style={{ fontSize: '24px' }}>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Dashboard;
