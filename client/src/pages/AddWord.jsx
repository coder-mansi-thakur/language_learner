import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGet, usePost } from '../hooks/useApi';
import { STRINGS } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';

const AddWord = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  // Fetch Language Details
  const { data: language, loading: loadingLang } = useGet(ENDPOINTS.LANGUAGES.GET_BY_CODE(code));
  const { data: categories } = useGet(ENDPOINTS.CATEGORIES.BASE);
  
  // Fetch existing vocab to check for duplicates (simple client-side check for now)
  const vocabEndpoint = language ? `${ENDPOINTS.VOCABULARY.BASE}?languageId=${language.id}` : null;
  const { data: allVocab } = useGet(vocabEndpoint, { enabled: !!language });

  const { post: createVocab } = usePost();

  const [form, setForm] = useState({
    word: '',
    translation: '',
    pronunciation: '',
    exampleSentence: '',
    difficultyLevel: 'beginner',
    categoryId: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  // Set default category when loaded
  useEffect(() => {
    if (categories && categories.length > 0 && !form.categoryId) {
      setForm(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!language) return;
    if (!form.categoryId) {
        setMessage({ type: 'error', text: 'Please select a category.' });
        return;
    }

    // Check if word exists
    const exists = allVocab?.some(v => v.word.toLowerCase() === form.word.toLowerCase());
    if (exists) {
      setMessage({ type: 'error', text: STRINGS.VOCAB_CMS.VOCABULARY.WORD_EXISTS });
      return;
    }

    try {
      await createVocab(ENDPOINTS.VOCABULARY.BASE, {
        ...form,
        languageId: language.id
      });
      
      setMessage({ type: 'success', text: STRINGS.VOCAB_CMS.VOCABULARY.WORD_ADDED });
      setForm({
        word: '',
        translation: '',
        pronunciation: '',
        exampleSentence: '',
        difficultyLevel: 'beginner',
        categoryId: categories && categories.length > 0 ? categories[0].id : ''
      });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to add word.' });
    }
  };

  if (loadingLang || !language) {
    return (
      <Layout>
        <div className="retro-container" style={{ textAlign: 'center' }}>
          <p>{STRINGS.DASHBOARD.LOADING}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="retro-container" style={{ maxWidth: '600px' }}>
        <button 
          className="retro-btn secondary" 
          onClick={() => navigate(`/learn/${code}`)}
          style={{ marginBottom: '20px' }}
        >
          {STRINGS.LANGUAGE_LEARN.BACK}
        </button>

        <div className="retro-card">
          <h1 style={{ marginBottom: '10px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.ADD_WORD}</h1>
          <p style={{ marginBottom: '20px', opacity: 0.8 }}>{STRINGS.VOCAB_CMS.VOCABULARY.ADD_WORD_DESC}</p>

          {message.text && (
            <div className={`retro-alert ${message.type === 'error' ? 'error' : 'success'}`} style={{ 
              padding: '10px', 
              marginBottom: '20px', 
              backgroundColor: message.type === 'error' ? '#ffcccc' : '#ccffcc',
              border: '2px solid var(--border-color)',
              color: 'var(--text-color)'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.CATEGORY}</label>
              <select 
                className="retro-input"
                value={form.categoryId}
                onChange={e => setForm({...form, categoryId: e.target.value})}
                required
                style={{ width: '100%' }}
              >
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{STRINGS.VOCAB_CMS.VOCABULARY.FORM.WORD}</label>
              <input 
                className="retro-input" 
                value={form.word}
                onChange={e => setForm({...form, word: e.target.value})}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{STRINGS.VOCAB_CMS.VOCABULARY.FORM.TRANSLATION}</label>
              <input 
                className="retro-input" 
                value={form.translation}
                onChange={e => setForm({...form, translation: e.target.value})}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{STRINGS.VOCAB_CMS.VOCABULARY.FORM.PRONUNCIATION}</label>
              <input 
                className="retro-input" 
                value={form.pronunciation}
                onChange={e => setForm({...form, pronunciation: e.target.value})}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{STRINGS.VOCAB_CMS.VOCABULARY.FORM.EXAMPLE}</label>
              <textarea 
                className="retro-input" 
                value={form.exampleSentence}
                onChange={e => setForm({...form, exampleSentence: e.target.value})}
                style={{ width: '100%', minHeight: '80px', fontFamily: 'inherit' }}
              />
            </div>

            <button className="retro-btn" type="submit" style={{ marginTop: '10px' }}>
              {STRINGS.VOCAB_CMS.VOCABULARY.FORM.ADD_BTN}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddWord;
