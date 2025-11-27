import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useGet, usePost } from '../hooks/useApi';
import { STRINGS } from '../constants/strings';

const VocabCMS = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const { data: categories, refetch: refetchCategories } = useGet('/categories');
  const { data: languages } = useGet('/languages');
  const { data: vocabulary, refetch: refetchVocab } = useGet('/vocabulary');
  
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
      await createCategory('/categories', catForm);
      setCatForm({ name: '', slug: '', description: '' });
      refetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleVocabSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVocab('/vocabulary', vocabForm);
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
        <h1 style={{ marginBottom: '20px' }}>Vocab CMS</h1>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            className={`retro-btn ${activeTab === 'categories' ? '' : 'secondary'}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button 
            className={`retro-btn ${activeTab === 'vocabulary' ? '' : 'secondary'}`}
            onClick={() => setActiveTab('vocabulary')}
          >
            Vocabulary
          </button>
        </div>

        {activeTab === 'categories' && (
          <div className="retro-card">
            <h2>Manage Categories</h2>
            <form onSubmit={handleCategorySubmit} style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
              <input 
                className="retro-input" 
                placeholder="Category Name" 
                value={catForm.name}
                onChange={e => setCatForm({...catForm, name: e.target.value})}
                required
              />
              <input 
                className="retro-input" 
                placeholder="Slug (e.g. food-drink)" 
                value={catForm.slug}
                onChange={e => setCatForm({...catForm, slug: e.target.value})}
                required
              />
              <input 
                className="retro-input" 
                placeholder="Description" 
                value={catForm.description}
                onChange={e => setCatForm({...catForm, description: e.target.value})}
              />
              <button className="retro-btn" type="submit">Add Category</button>
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
            <h2>Manage Vocabulary</h2>
            <form onSubmit={handleVocabSubmit} style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <select 
                  className="retro-input"
                  value={vocabForm.languageId}
                  onChange={e => setVocabForm({...vocabForm, languageId: e.target.value})}
                  required
                >
                  <option value="">Select Language</option>
                  {languages?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <select 
                  className="retro-input"
                  value={vocabForm.categoryId}
                  onChange={e => setVocabForm({...vocabForm, categoryId: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <input 
                className="retro-input" 
                placeholder="Word (Original)" 
                value={vocabForm.word}
                onChange={e => setVocabForm({...vocabForm, word: e.target.value})}
                required
              />
              <input 
                className="retro-input" 
                placeholder="Translation" 
                value={vocabForm.translation}
                onChange={e => setVocabForm({...vocabForm, translation: e.target.value})}
                required
              />
              <select 
                className="retro-input"
                value={vocabForm.difficultyLevel}
                onChange={e => setVocabForm({...vocabForm, difficultyLevel: e.target.value})}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <button className="retro-btn" type="submit">Add Word</button>
            </form>

            <div style={{ display: 'grid', gap: '10px' }}>
              {vocabulary?.map(vocab => (
                <div key={vocab.id} className="retro-window" style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{vocab.word}</strong> - {vocab.translation}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    {vocab.Language?.name} | {vocab.Category?.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VocabCMS;
