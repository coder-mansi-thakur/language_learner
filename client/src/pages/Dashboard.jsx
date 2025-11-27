import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { STRINGS } from '../constants/strings';
import { useNavigate } from 'react-router-dom';
import { useGet, usePost } from '../hooks/useApi';
import Modal from '../components/Modal';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: userData, loading, error, refetch } = useGet(
    currentUser ? `/users/${currentUser.uid}` : null,
    { enabled: !!currentUser }
  );

  const { data: languages } = useGet('/languages');
  const { post: startLearning } = usePost();

  const handleStartLearning = async (languageId) => {
    try {
      await startLearning(`/users/${currentUser.uid}/languages`, { languageId });
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Error starting language:", error);
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

  return (
    <Layout>
      <div className="retro-container">
        {learningLanguages.length > 0 && (
          <div className="retro-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0 }}>{STRINGS.DASHBOARD.LEARNING_COUNT}</h2>
                <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '10px 0' }}>
                  {learningLanguages.length}
                </p>
              </div>
              <div style={{ fontSize: '64px' }}>
                📚
              </div>
            </div>
          </div>
        )}

        {learningLanguages.length === 0 && (
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
