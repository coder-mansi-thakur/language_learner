import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useGet, usePost } from '../hooks/useApi';
import { STRINGS } from '../constants/strings';

const VocabCMS = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const { data: categories, refetch: refetchCategories } = useGet('/categories');
  const { data: languages } = useGet('/languages');
  
  // Construct query string for vocabulary
  const queryParams = new URLSearchParams();
  if (filterLanguage) queryParams.append('languageId', filterLanguage);
  if (filterCategory) queryParams.append('categoryId', filterCategory);
  const vocabEndpoint = `/vocabulary?${queryParams.toString()}`;

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

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: 'var(--color-cream)', border: '2px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Filter by Language:</label>
                <select 
                  className="retro-input"
                  value={filterLanguage}
                  onChange={e => setFilterLanguage(e.target.value)}
                >
                  <option value="">All Languages</option>
                  {languages?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Filter by Category:</label>
                <select 
                  className="retro-input"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="retro-window" style={{ padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '3px solid var(--border-color)', backgroundColor: 'var(--color-cream-dark)' }}>
                    <th style={{ textAlign: 'left', padding: '15px' }}>Word</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>Translation</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>Language</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>Category</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>Level</th>
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
