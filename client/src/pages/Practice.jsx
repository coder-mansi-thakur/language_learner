import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { useGet, usePost, usePut, useDelete } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { STRINGS } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';

const Practice = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode') || 'vocab'; // 'vocab' or 'sentences'

  const { currentUser, dbUser } = useAuth();
  
  // 1. Fetch Language Details
  const { data: language } = useGet(ENDPOINTS.LANGUAGES.GET_BY_CODE(code));
  
  // 2. Fetch User's Progress (which includes Vocabulary details)
  const userVocabEndpoint = currentUser && language ? `${ENDPOINTS.USER_VOCABULARY.GET_BY_USER(dbUser.id)}?languageId=${language.id}` : null;
  const { data: userProgress, loading: loadingUserProgress, refetch: refetchProgress } = useGet(userVocabEndpoint, { enabled: !!currentUser && !!language && mode === 'vocab' });

  // 3. Fetch Sentences
  const sentencesEndpoint = currentUser && language ? `${ENDPOINTS.SENTENCES.BASE(currentUser.uid)}?languageId=${language.id}` : null;
  const { data: sentences, loading: loadingSentences, refetch: refetchSentences } = useGet(sentencesEndpoint, { enabled: !!currentUser && !!language && mode === 'sentences' });

  const { post: updateProgress } = usePost();
  const { put: updateCard } = usePut();
  const { del: deleteCard } = useDelete();

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isDoneForToday, setIsDoneForToday] = useState(false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState({});

  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [newWordsCount, setNewWordsCount] = useState(5);

  const { reviewItems, mastered, combined, newItems } = useMemo(() => {
    if ((mode === 'vocab' && !userProgress) || (mode === 'sentences' && !sentences)) {
      return { reviewItems: [], mastered: [], combined: [], newItems: [] };
    }
    
    let allItems = [];

    if (mode === 'vocab' && userProgress) {
      allItems = userProgress.map(up => ({
        ...up.Vocabulary,
        userProgress: up,
        type: 'vocab'
      }));
    } else if (mode === 'sentences' && sentences) {
      allItems = sentences.map(s => ({
        ...s,
        userProgress: {
          status: s.status,
          strength: s.strength,
          nextReviewDate: s.nextReviewDate
        },
        type: 'sentence'
      }));
    }

    // reviewItems: items that need review (status learning/review AND due date passed)
    const reviewItems = allItems.filter(w => {
        const status = w.userProgress?.status;
        const nextReview = w.userProgress?.nextReviewDate;
        
        let isDue = !nextReview;
        if (nextReview) {
            const reviewDate = new Date(nextReview);
            const today = new Date();
            // Compare dates only (ignore time)
            reviewDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            isDue = reviewDate <= today;
        }
        
        return (status === 'learning' || status === 'review') && isDue;
    });

    // newItems: items that are new (status 'new' or no status)
    const newItems = allItems.filter(w => w.userProgress?.status === 'new' || !w.userProgress?.status);
    
    const mastered = allItems.filter(w => w.userProgress?.status === 'mastered');
    
    return { reviewItems, mastered, combined: allItems, newItems };
  }, [userProgress, sentences, mode]);
  console.log("🚀 ~ Practice ~ reviewItems, mastered, combined, newItems:", reviewItems, mastered, combined, newItems)


  useEffect(() => {
    if (newItems.length > 0 && newWordsCount > newItems.length) {
      setNewWordsCount(newItems.length);
    }
  }, [newItems.length]);

  // Prepare the queue when data is ready
  useEffect(() => {
    if (!isSetupComplete) return;

    // Prevent reshuffling if queue is already populated with correct type
    if (queue.length > 0) {
      const currentType = mode === 'vocab' ? 'vocab' : 'sentence';
      if (queue[0].type === currentType) {
        return;
      }
    }

    if ((mode === 'vocab' && userProgress) || (mode === 'sentences' && sentences)) {
      if (reviewItems.length === 0 && newItems.length === 0 && mastered.length > 0) {
        setIsDoneForToday(true);
        return;
      }

      const shuffle = (array) => array.sort(() => Math.random() - 0.5);

      const selectedNewItems = shuffle(newItems).slice(0, newWordsCount);
      const selectedReviewItems = shuffle(reviewItems);

      const sessionQueue = [
        ...selectedReviewItems,
        ...selectedNewItems
      ];

      // If queue is empty (e.g. no words), just show all shuffled
      if (sessionQueue.length === 0 && combined.length > 0) {
         if (mastered.length > 0) {
             setIsDoneForToday(true);
         } else {
             setQueue(shuffle(combined));
         }
      } else {
        setQueue(sessionQueue);
      }
    }
  }, [isSetupComplete, userProgress, sentences, reviewItems, mastered, combined, mode, queue, newItems, newWordsCount]);

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

  const handleDeleteCard = async (e) => {
    e.stopPropagation();
    if (!window.confirm(STRINGS.PRACTICE.CONFIRM_DELETE)) return;

    try {
      if (currentCard.type === 'vocab') {
        await deleteCard(ENDPOINTS.VOCABULARY.DELETE(currentCard.id));
      } else {
        await deleteCard(ENDPOINTS.SENTENCES.DELETE(currentUser.uid, currentCard.id));
      }

      // Remove from queue
      const newQueue = queue.filter((_, index) => index !== currentIndex);
      setQueue(newQueue);
      
      // If we deleted the last card, or the queue is now empty
      if (newQueue.length === 0) {
        setSessionComplete(true);
      } else if (currentIndex >= newQueue.length) {
        // If we were at the end, go to the new end
        setCurrentIndex(newQueue.length - 1);
        setIsFlipped(false);
      } else {
        // Stay at current index (which is now the next card)
        setIsFlipped(false);
      }
      
      // Refetch to keep data in sync
      if (mode === 'vocab') refetchProgress();
      if (mode === 'sentences') refetchSentences();

    } catch (error) {
      console.error("Error deleting card:", error);
      alert("Failed to delete card");
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setEditingData({ ...currentCard });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (currentCard.type === 'vocab') {
        await updateCard(ENDPOINTS.VOCABULARY.UPDATE(currentCard.id), {
          word: editingData.word,
          translation: editingData.translation,
          pronunciation: editingData.pronunciation,
          exampleSentence: editingData.exampleSentence,
          exampleTranslation: editingData.exampleTranslation
        });
      } else {
        await updateCard(ENDPOINTS.SENTENCES.UPDATE(currentUser.uid, currentCard.id), {
          originalSentence: editingData.originalSentence,
          translatedSentence: editingData.translatedSentence,
          // Add other fields if necessary
        });
      }

      // Update queue
      const newQueue = [...queue];
      newQueue[currentIndex] = { ...newQueue[currentIndex], ...editingData };
      setQueue(newQueue);
      
      setEditModalOpen(false);
      
      // Refetch
      if (mode === 'vocab') refetchProgress();
      if (mode === 'sentences') refetchSentences();

    } catch (error) {
      console.error("Error updating card:", error);
      alert("Failed to update card");
    }
  };

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
      if (currentCard.type === 'vocab') {
        await updateProgress(ENDPOINTS.USER_VOCABULARY.UPDATE_PROGRESS(currentUser.uid), {
          vocabularyId: currentCard.id,
          status: newStatus,
          strength: newStrength
        });
      } else {
        await updateProgress(ENDPOINTS.SENTENCES.UPDATE_PROGRESS(currentUser.uid), {
          sentenceId: currentCard.id,
          status: newStatus,
          strength: newStrength
        });
      }

      // Move to next card
      if (currentIndex < queue.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
      } else {
        setSessionComplete(true);
        if (mode === 'vocab') refetchProgress(); // Sync for next time
        if (mode === 'sentences') refetchSentences();
      }
    } catch (error) {
      console.error(STRINGS.PRACTICE.ERROR_UPDATE_PROGRESS, error);
    }
  };

  if ((mode === 'vocab' && loadingUserProgress) || (mode === 'sentences' && loadingSentences) || !language) {
    return (
      <Layout>
        <div className="retro-container" style={{ textAlign: 'center' }}>
          <p>{STRINGS.DASHBOARD.LOADING}</p>
        </div>
      </Layout>
    );
  }

  if (!isSetupComplete) {
    return (
      <Layout>
        <div className="retro-container" style={{ textAlign: 'center' }}>
          <div className="retro-card">
            <h1>{STRINGS.PRACTICE.SETUP.TITLE}</h1>
            
            <div style={{ margin: '20px 0', textAlign: 'left' }}>
              <p><>{STRINGS.PRACTICE.SETUP.REVIEW_WORDS_COUNT}:</> {reviewItems.length}</p>
              <p><>{STRINGS.PRACTICE.SETUP.NEW_WORDS_COUNT}:</> {newItems.length}</p>
            </div>

            {newItems.length > 0 ? (
              <div style={{ marginBottom: '20px', textAlign: 'left', display: 'flex', flexDirection: 'row' }}>
                <label style={{ display: 'flex', marginBottom: '10px', alignItems: 'center' }}>
                  {STRINGS.PRACTICE.SETUP.NEW_WORDS_COUNT}
                </label>
                <Input 
                  type="number" 
                  min="0" 
                  max={newItems.length} 
                  value={newWordsCount} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isNaN(val)) setNewWordsCount(0);
                    else if (val > newItems.length) setNewWordsCount(newItems.length);
                    else if (val < 0) setNewWordsCount(0);
                    else setNewWordsCount(val);
                  }}
                  style={{ width: '200px', marginLeft: '10px' }}
                />
              </div>
            ) : (
              <p style={{ marginBottom: '20px', fontStyle: 'italic' }}>{STRINGS.PRACTICE.SETUP.NO_NEW_WORDS}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button className="retro-btn" onClick={() => setIsSetupComplete(true)}>
                {STRINGS.PRACTICE.SETUP.START_BUTTON}
              </button>
              <button className="retro-btn secondary" onClick={() => navigate('/dashboard')}>
                {STRINGS.PRACTICE.BACK_DASHBOARD}
              </button>
            </div>
          </div>
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
            marginBottom: '30px',
            position: 'relative'
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }} onClick={(e) => e.stopPropagation()}>
             <button 
                className="retro-btn secondary" 
                style={{ padding: '4px 8px', fontSize: '12px', minWidth: 'auto' }}
                onClick={handleEditClick}
                title={STRINGS.PRACTICE.EDIT_CARD}
             >
               ✏️
             </button>
             <button 
                className="retro-btn secondary" 
                style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#ff6b6b', color: 'white', minWidth: 'auto' }}
                onClick={handleDeleteCard}
                title={STRINGS.PRACTICE.DELETE_CARD}
             >
               🗑️
             </button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '48px', margin: '20px 0' }}>
              {isFlipped 
                ? (currentCard.type === 'vocab' ? currentCard.word : currentCard.originalSentence) 
                : (currentCard.type === 'vocab' ? currentCard.translation : currentCard.translatedSentence)
              }
            </h2>
            {isFlipped && currentCard.type === 'vocab' && currentCard.pronunciation && (
              <p style={{ fontSize: '18px', opacity: 0.8, fontStyle: 'italic' }}>
                /{currentCard.pronunciation}/
              </p>
            )}
            {isFlipped && currentCard.type === 'vocab' && currentCard.exampleSentence && (
              <div style={{ marginTop: '20px', fontSize: '16px', opacity: 0.8 }}>
                <p>"{currentCard.exampleSentence}"</p>
                <p style={{ fontStyle: 'italic' }}>{currentCard.exampleTranslation}</p>
              </div>
            )}
            {isFlipped && currentCard.type === 'sentence' && (
               <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.6 }}>
                 <span style={{ marginRight: '10px', padding: '2px 6px', border: '1px solid currentColor', borderRadius: '4px' }}>{currentCard.level}</span>
                 {currentCard.tense && <span style={{ padding: '2px 6px', border: '1px solid currentColor', borderRadius: '4px' }}>{currentCard.tense}</span>}
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
        
        {editModalOpen && (
          <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
            <div style={{ padding: '20px' }}>
              <h2>{STRINGS.PRACTICE.EDIT_CARD}</h2>
              {currentCard.type === 'vocab' ? (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    <label>{STRINGS.PRACTICE.WORD}</label>
                    <Input 
                      type="text" 
                      value={editingData.word} 
                      onChange={(e) => setEditingData({ ...editingData, word: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label>{STRINGS.PRACTICE.TRANSLATION}</label>
                    <Input 
                      type="text" 
                      value={editingData.translation} 
                      onChange={(e) => setEditingData({ ...editingData, translation: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label>{STRINGS.PRACTICE.PRONUNCIATION}</label>
                    <Input 
                      type="text" 
                      value={editingData.pronunciation} 
                      onChange={(e) => setEditingData({ ...editingData, pronunciation: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label>{STRINGS.PRACTICE.EXAMPLE_SENTENCE}</label>
                    <Input 
                      type="text" 
                      value={editingData.exampleSentence} 
                      onChange={(e) => setEditingData({ ...editingData, exampleSentence: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label>{STRINGS.PRACTICE.EXAMPLE_TRANSLATION}</label>
                    <Input 
                      type="text" 
                      value={editingData.exampleTranslation} 
                      onChange={(e) => setEditingData({ ...editingData, exampleTranslation: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    <label>{STRINGS.PRACTICE.ORIGINAL_SENTENCE}</label>
                    <Input 
                      type="text" 
                      value={editingData.originalSentence} 
                      onChange={(e) => setEditingData({ ...editingData, originalSentence: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label>{STRINGS.PRACTICE.TRANSLATED_SENTENCE}</label>
                    <Input 
                      type="text" 
                      value={editingData.translatedSentence} 
                      onChange={(e) => setEditingData({ ...editingData, translatedSentence: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  {/* Add other fields for sentences if necessary */}
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="retro-btn secondary" onClick={() => setEditModalOpen(false)} style={{ marginRight: '10px' }}>
                  {STRINGS.PRACTICE.CANCEL}
                </button>
                <button className="retro-btn" onClick={handleSaveEdit}>
                  {STRINGS.PRACTICE.SAVE}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default Practice;
