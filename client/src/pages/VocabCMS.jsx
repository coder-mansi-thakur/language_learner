import React, { useState } from 'react';
import Layout from '../components/Layout';
import Select from '../components/Select';
import { useGet, usePost } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { STRINGS } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';

const VocabCMS = () => {
  const { dbUser } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const { data: categories, refetch: refetchCategories } = useGet(ENDPOINTS.CATEGORIES.BASE);
  const { data: languages } = useGet(ENDPOINTS.LANGUAGES.GET_ALL);
  
  // Construct query string for vocabulary
  const queryParams = new URLSearchParams();
  if (filterLanguage) queryParams.append('languageId', filterLanguage);
  if (filterCategory) queryParams.append('categoryId', filterCategory);
  const vocabEndpoint = `${ENDPOINTS.VOCABULARY.BASE}?${queryParams.toString()}`;

  const { data: vocabulary, refetch: refetchVocab } = useGet(vocabEndpoint);
  
  const { post: createCategory } = usePost();
  const { post: createVocab } = usePost();

  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '' });
  const [vocabForm, setVocabForm] = useState({ 
    word: '', 
    translation: '', 
    languageId: '', 
    categoryId: '',
    difficultyLevel: 'beginner'
  });

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory(ENDPOINTS.CATEGORIES.BASE, catForm);
      setCatForm({ name: '', slug: '', description: '' });
      refetchCategories();
    } catch (error) {
      console.error(error);
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
        setVocabForm(prev => ({ ...prev, categoryId: newCategory.id }));
      }
    } catch (error) {
      console.error("Failed to create category on the fly", error);
    }
  };

  const handleVocabSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVocab(ENDPOINTS.VOCABULARY.BASE, {
        ...vocabForm,
        createdBy: dbUser?.id
      });
      setVocabForm({ 
        word: '', 
        translation: '', 
        languageId: '', 
        categoryId: '',
        difficultyLevel: 'beginner'
      });
      refetchVocab();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="retro-container">
        <h1 style={{ marginBottom: '20px' }}>{STRINGS.VOCAB_CMS.TITLE}</h1>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            className={`retro-btn ${activeTab === 'categories' ? '' : 'secondary'}`}
            onClick={() => setActiveTab('categories')}
          >
            {STRINGS.VOCAB_CMS.TABS.CATEGORIES}
          </button>
          <button 
            className={`retro-btn ${activeTab === 'vocabulary' ? '' : 'secondary'}`}
            onClick={() => setActiveTab('vocabulary')}
          >
            {STRINGS.VOCAB_CMS.TABS.VOCABULARY}
          </button>
        </div>

        {activeTab === 'categories' && (
          <div className="retro-card">
            <h2>{STRINGS.VOCAB_CMS.CATEGORIES.MANAGE_TITLE}</h2>
            <form onSubmit={handleCategorySubmit} style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
              <input 
                className="retro-input" 
                placeholder={STRINGS.VOCAB_CMS.CATEGORIES.PLACEHOLDER_NAME}
                value={catForm.name}
                onChange={e => setCatForm({...catForm, name: e.target.value})}
                required
              />
              <input 
                className="retro-input" 
                placeholder={STRINGS.VOCAB_CMS.CATEGORIES.PLACEHOLDER_SLUG}
                value={catForm.slug}
                onChange={e => setCatForm({...catForm, slug: e.target.value})}
                required
              />
              <input 
                className="retro-input" 
                placeholder={STRINGS.VOCAB_CMS.CATEGORIES.PLACEHOLDER_DESC}
                value={catForm.description}
                onChange={e => setCatForm({...catForm, description: e.target.value})}
              />
              <button className="retro-btn" type="submit">{STRINGS.VOCAB_CMS.CATEGORIES.ADD_BUTTON}</button>
            </form>

            <div style={{ display: 'grid', gap: '10px' }}>
              {categories?.map(cat => (
                <div key={cat.id} className="retro-window" style={{ padding: '10px' }}>
                  <strong>{cat.name}</strong> ({cat.slug})
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vocabulary' && (
          <div className="retro-card">
            <h2>{STRINGS.VOCAB_CMS.VOCABULARY.MANAGE_TITLE}</h2>
            <form onSubmit={handleVocabSubmit} style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Select
                  value={vocabForm.languageId}
                  onChange={(val) => setVocabForm({...vocabForm, languageId: val})}
                  options={languages?.map(l => ({ value: l.id, label: l.name })) || []}
                  required
                  placeholder={STRINGS.VOCAB_CMS.VOCABULARY.SELECT_LANGUAGE}
                />
                <Select
                  value={vocabForm.categoryId}
                  onChange={(val) => setVocabForm({...vocabForm, categoryId: val})}
                  options={categories?.map(c => ({ value: c.id, label: c.name })) || []}
                  required
                  placeholder={STRINGS.VOCAB_CMS.VOCABULARY.SELECT_CATEGORY}
                  allowAdd={true}
                  onAdd={handleAddNewCategory}
                />
              </div>
              
              <input 
                className="retro-input" 
                placeholder={STRINGS.VOCAB_CMS.VOCABULARY.PLACEHOLDER_WORD}
                value={vocabForm.word}
                onChange={e => setVocabForm({...vocabForm, word: e.target.value})}
                required
              />
              <input 
                className="retro-input" 
                placeholder={STRINGS.VOCAB_CMS.VOCABULARY.PLACEHOLDER_TRANS}
                value={vocabForm.translation}
                onChange={e => setVocabForm({...vocabForm, translation: e.target.value})}
                required
              />
              <Select
                value={vocabForm.difficultyLevel}
                onChange={(val) => setVocabForm({...vocabForm, difficultyLevel: val})}
                options={[
                  { value: 'beginner', label: STRINGS.VOCAB_CMS.VOCABULARY.LEVELS.BEGINNER },
                  { value: 'intermediate', label: STRINGS.VOCAB_CMS.VOCABULARY.LEVELS.INTERMEDIATE },
                  { value: 'advanced', label: STRINGS.VOCAB_CMS.VOCABULARY.LEVELS.ADVANCED }
                ]}
                placeholder="Select Level"
              />

              <button className="retro-btn" type="submit">{STRINGS.VOCAB_CMS.VOCABULARY.ADD_BUTTON}</button>
            </form>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: 'var(--color-cream)', border: '2px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{STRINGS.VOCAB_CMS.VOCABULARY.FILTERS.LANGUAGE}</label>
                <Select
                  value={filterLanguage}
                  onChange={(val) => setFilterLanguage(val)}
                  options={[
                    { value: '', label: STRINGS.VOCAB_CMS.VOCABULARY.FILTERS.ALL_LANGUAGES },
                    ...(languages?.map(l => ({ value: l.id, label: l.name })) || [])
                  ]}
                  placeholder={STRINGS.VOCAB_CMS.VOCABULARY.FILTERS.ALL_LANGUAGES}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{STRINGS.VOCAB_CMS.VOCABULARY.FILTERS.CATEGORY}</label>
                <Select
                  value={filterCategory}
                  onChange={(val) => setFilterCategory(val)}
                  options={[
                    { value: '', label: STRINGS.VOCAB_CMS.VOCABULARY.FILTERS.ALL_CATEGORIES },
                    ...(categories?.map(c => ({ value: c.id, label: c.name })) || [])
                  ]}
                  placeholder={STRINGS.VOCAB_CMS.VOCABULARY.FILTERS.ALL_CATEGORIES}
                />
              </div>
            </div>

            <div className="retro-window" style={{ padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '3px solid var(--border-color)', backgroundColor: 'var(--color-cream-dark)' }}>
                    <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.WORD}</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.TRANSLATION}</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.LANGUAGE}</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.CATEGORY}</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.LEVEL}</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.CREATED_BY}</th>
                  </tr>
                </thead>
                <tbody>
                  {vocabulary?.map(vocab => (
                    <tr key={vocab.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{vocab.word}</td>
                      <td style={{ padding: '15px' }}>{vocab.translation}</td>
                      <td style={{ padding: '15px' }}>{vocab.Language?.name}</td>
                      <td style={{ padding: '15px' }}>{vocab.Category?.name}</td>
                      <td style={{ padding: '15px' }}>
                        <span className="retro-tag" style={{ textTransform: 'capitalize' }}>
                          {vocab.difficultyLevel}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>{vocab.creator?.displayName || 'Unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VocabCMS;
