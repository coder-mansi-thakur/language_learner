import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Select from '../components/Select';
import { useGet, usePost } from '../hooks/useApi';
import { STRINGS } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';
import { translateText } from '../services/translationService';

const AddWord = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  // Fetch Language Details
  const { data: language, loading: loadingLang } = useGet(ENDPOINTS.LANGUAGES.GET_BY_CODE(code));
  const { data: categories, refetch: refetchCategories } = useGet(ENDPOINTS.CATEGORIES.BASE);
  
  // Fetch existing vocab to check for duplicates (simple client-side check for now)
  const vocabEndpoint = language ? `${ENDPOINTS.VOCABULARY.BASE}?languageId=${language.id}` : null;
  const { data: allVocab } = useGet(vocabEndpoint, { enabled: !!language });

  const { post: createVocab } = usePost();
  const { post: createCategory } = usePost();

  const [form, setForm] = useState({
    word: '',
    translation: '',
    pronunciation: '',
    exampleSentence: '',
    difficultyLevel: 'beginner',
    categoryId: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [isTranslating, setIsTranslating] = useState(false);

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

  const handleAddNewCategory = async (newCategoryName) => {
    const slug = newCategoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    try {
      const newCategory = await createCategory(ENDPOINTS.CATEGORIES.BASE, {
        name: newCategoryName,
        slug: slug,
        description: 'Created on the fly'
      });
      await refetchCategories();
      if (newCategory && newCategory.id) {
        setForm(prev => ({ ...prev, categoryId: newCategory.id }));
      }
    } catch (error) {
      console.error("Failed to create category on the fly", error);
    }
  };

  const handleAutoTranslate = async () => {
    if (!form.word || !language) return;
    
    setIsTranslating(true);
    try {
      // Assuming source is English ('en') and target is the language code
      const translated = await translateText(form.word, 'en', language.code);
      if (translated) {
        setForm(prev => ({ ...prev, translation: translated }));
      }
    } catch (error) {
      console.error("Translation failed", error);
      setMessage({ type: 'error', text: 'Translation failed. Please try again.' });
    } finally {
      setIsTranslating(false);
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
            <Select
              label={STRINGS.VOCAB_CMS.VOCABULARY.TABLE.CATEGORY}
              value={form.categoryId}
              onChange={(val) => setForm({...form, categoryId: val})}
              options={categories?.map(c => ({ value: c.id, label: c.name })) || []}
              required
              placeholder={STRINGS.VOCAB_CMS.VOCABULARY.SELECT_CATEGORY}
              allowAdd={true}
              onAdd={handleAddNewCategory}
            />

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
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  className="retro-input" 
                  value={form.translation}
                  onChange={e => setForm({...form, translation: e.target.value})}
                  required
                  style={{ width: '100%', flex: 1 }}
                />
                <button 
                  type="button" 
                  className="retro-btn secondary" 
                  onClick={handleAutoTranslate}
                  disabled={isTranslating || !form.word}
                  style={{ padding: '0 15px', fontSize: '0.9em' }}
                >
                  {isTranslating ? '...' : 'Translate'}
                </button>
              </div>
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
