import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGet, usePost } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { STRINGS } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';

const Practice = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { currentUser, dbUser } = useAuth();
  
  // 1. Fetch Language Details
  const { data: language } = useGet(ENDPOINTS.LANGUAGES.GET_BY_CODE(code));
  
  // 2. Fetch User's Progress (which includes Vocabulary details)
  const userVocabEndpoint = currentUser && language ? `${ENDPOINTS.USER_VOCABULARY.GET_BY_USER(dbUser.id)}?languageId=${language.id}` : null;
  const { data: userProgress, loading: loadingUserProgress, refetch: refetchProgress } = useGet(userVocabEndpoint, { enabled: !!currentUser && !!language });

  const { post: updateProgress } = usePost();

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isDoneForToday, setIsDoneForToday] = useState(false);

  const { due, mastered, combined } = useMemo(() => {
    if (!userProgress) return { due: [], mastered: [], combined: [] };
    
    const combined = userProgress.map(up => ({
      ...up.Vocabulary,
      userProgress: up
    }));

    const due = combined.filter(w => w.userProgress?.status === 'learning' || w.userProgress?.status === 'review' || w.userProgress?.nextReviewDate === null || new Date(w.userProgress?.nextReviewDate) <= new Date()|| w.userProgress?.status === 'new');
    const mastered = combined.filter(w => w.userProgress?.status === 'mastered');
    
    return { due, mastered, combined };
  }, [userProgress]);

  // Prepare the queue when data is ready
  useEffect(() => {
    if (userProgress) {
      if (due.length === 0 && mastered.length > 0) {
        setIsDoneForToday(true);
        return;
      }

      // Create a session queue: 10 due + 5 mastered
      // Shuffle helper
      const shuffle = (array) => array.sort(() => Math.random() - 0.5);

      const sessionQueue = [
        ...shuffle(due),
        ...shuffle(mastered)
      ];

      // If queue is empty (e.g. no words), just show all shuffled
      if (sessionQueue.length === 0 && combined.length > 0) {
        setQueue(shuffle(combined));
      } else {
        setQueue(sessionQueue);
      }
    }
  }, [userProgress, due, mastered, combined]);

  const handlePracticeRest = () => {
    const shuffle = (array) => array.sort(() => Math.random() - 0.5);
    // Practice rest of the cards (mastered ones)
    // Let's take up to 20 mastered cards
    const restQueue = shuffle(mastered).slice(0, 20);
    
    if (restQueue.length > 0) {
      setQueue(restQueue);
      setIsDoneForToday(false);
      setSessionComplete(false);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const currentCard = queue[currentIndex];

  const handleRate = async (rating) => {
    if (!currentCard) return;

    // Calculate new status/strength based on rating
    // Rating: 'again' (1), 'hard' (2), 'good' (3), 'easy' (4)
    
    let newStatus = 'learning';
    let newStrength = currentCard.userProgress?.strength || 0;

    switch (rating) {
      case 'again':
        newStrength = Math.max(0, newStrength - 0.2);
        newStatus = 'learning';
        break;
      case 'hard':
        newStrength = Math.min(1, newStrength + 0.1);
        newStatus = 'learning';
        break;
      case 'good':
        newStrength = Math.min(1, newStrength + 0.2);
        newStatus = newStrength > 0.8 ? 'mastered' : 'review';
        break;
      case 'easy':
        newStrength = Math.min(1, newStrength + 0.3);
        newStatus = 'mastered';
        break;
      default:
        break;
    }

    try {
      await updateProgress(ENDPOINTS.USER_VOCABULARY.UPDATE_PROGRESS(currentUser.uid), {
        vocabularyId: currentCard.id,
        status: newStatus,
        strength: newStrength
      });

      // Move to next card
      if (currentIndex < queue.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
      } else {
        setSessionComplete(true);
        refetchProgress(); // Sync for next time
      }
    } catch (error) {
      console.error(STRINGS.PRACTICE.ERROR_UPDATE_PROGRESS, error);
    }
  };

  if (loadingUserProgress || !language) {
    return (
      <Layout>
        <div className="retro-container" style={{ textAlign: 'center' }}>
          <p>{STRINGS.DASHBOARD.LOADING}</p>
        </div>
      </Layout>
    );
  }

  if (isDoneForToday) {
    return (
      <Layout>
        <div className="retro-container" style={{ textAlign: 'center' }}>
          <div className="retro-card">
            <h1>{STRINGS.PRACTICE.ALL_MASTERED}</h1>
            <p>{STRINGS.PRACTICE.ALL_MASTERED_DESC}</p>
            <button className="retro-btn" onClick={() => navigate('/dashboard')}>{STRINGS.PRACTICE.BACK_DASHBOARD}</button>
            <button className="retro-btn secondary" onClick={handlePracticeRest} style={{ marginLeft: '10px' }}>{STRINGS.PRACTICE.PRACTICE_REST}</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (sessionComplete) {
    return (
      <Layout>
        <div className="retro-container" style={{ textAlign: 'center' }}>
          <div className="retro-card">
            <h1>{STRINGS.PRACTICE.SESSION_COMPLETE}</h1>
            <p>{STRINGS.PRACTICE.REVIEWED_COUNT(queue.length)}</p>
            <button className="retro-btn" onClick={() => navigate('/dashboard')}>{STRINGS.PRACTICE.BACK_DASHBOARD}</button>
            <button className="retro-btn secondary" onClick={() => window.location.reload()} style={{ marginLeft: '10px' }}>{STRINGS.PRACTICE.PRACTICE_AGAIN}</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (queue.length === 0) {
    return (
      <Layout>
        <div className="retro-container" style={{ textAlign: 'center' }}>
          <p>{STRINGS.PRACTICE.NO_VOCAB}</p>
          <button className="retro-btn" onClick={() => navigate('/dashboard')}>{STRINGS.PRACTICE.BACK_DASHBOARD}</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="retro-container" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button className="retro-btn secondary" onClick={() => navigate(`/learn/${code}`)}>{STRINGS.PRACTICE.EXIT}</button>
          <span>{currentIndex + 1} / {queue.length}</span>
        </div>

        <div 
          className="retro-card" 
          style={{ 
            minHeight: '300px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            cursor: 'pointer',
            perspective: '1000px',
            marginBottom: '30px'
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '48px', margin: '20px 0' }}>
              {isFlipped ? currentCard.word : currentCard.translation}
            </h2>
            {isFlipped && currentCard.pronunciation && (
              <p style={{ fontSize: '18px', opacity: 0.8, fontStyle: 'italic' }}>
                /{currentCard.pronunciation}/
              </p>
            )}
            {isFlipped && currentCard.exampleSentence && (
              <div style={{ marginTop: '20px', fontSize: '16px', opacity: 0.8 }}>
                <p>"{currentCard.exampleSentence}"</p>
                <p style={{ fontStyle: 'italic' }}>{currentCard.exampleTranslation}</p>
              </div>
            )}
          </div>
          <p style={{ marginTop: 'auto', fontSize: '12px', opacity: 0.5 }}>{STRINGS.PRACTICE.CLICK_FLIP}</p>
        </div>

        {isFlipped ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
            <button 
              className="retro-btn" 
              style={{ backgroundColor: '#E76F51', borderColor: '#4A3B32' }}
              onClick={() => handleRate('again')}
            >
              {STRINGS.PRACTICE.RATING.AGAIN}
            </button>
            <button 
              className="retro-btn" 
              style={{ backgroundColor: '#F4A261', borderColor: '#4A3B32' }}
              onClick={() => handleRate('hard')}
            >
              {STRINGS.PRACTICE.RATING.HARD}
            </button>
            <button 
              className="retro-btn" 
              style={{ backgroundColor: '#E9C46A', borderColor: '#4A3B32' }}
              onClick={() => handleRate('good')}
            >
              {STRINGS.PRACTICE.RATING.GOOD}
            </button>
            <button 
              className="retro-btn" 
              style={{ backgroundColor: '#A8C69F', borderColor: '#4A3B32' }}
              onClick={() => handleRate('easy')}
            >
              {STRINGS.PRACTICE.RATING.EASY}
            </button>
          </div>
        ) : (
          <button 
            className="retro-btn" 
            style={{ width: '100%' }}
            onClick={() => setIsFlipped(true)}
          >
            {STRINGS.PRACTICE.SHOW_ANSWER}
          </button>
        )}
      </div>
    </Layout>
  );
};

export default Practice;
