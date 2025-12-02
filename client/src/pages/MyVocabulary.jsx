import React, { useState } from 'react';
import Layout from '../components/Layout';
import Select from '../components/Select';
import ProgressBar from '../components/ProgressBar';
import { useGet, usePut, useDelete, usePost } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { STRINGS } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';
import { useNavigate, useParams } from 'react-router-dom';

const MyVocabulary = () => {
  const { dbUser } = useAuth();
  const { code } = useParams();
  const navigate = useNavigate();
  const [filterCategory, setFilterCategory] = useState('');
  const [editingVocabId, setEditingVocabId] = useState(null);
  const [vocabForm, setVocabForm] = useState({ 
    word: '', 
    translation: '', 
    languageId: '', 
    categoryId: '',
    difficultyLevel: 'beginner'
  });

  const { data: categories, refetch: refetchCategories } = useGet(ENDPOINTS.CATEGORIES.BASE);
  const { data: languages } = useGet(ENDPOINTS.LANGUAGES.GET_ALL);
  const { data: language } = useGet(ENDPOINTS.LANGUAGES.GET_BY_CODE(code));
  
  // Construct query string for vocabulary
  const queryParams = new URLSearchParams();
  if (language) queryParams.append('languageId', language.id);
  if (filterCategory) queryParams.append('categoryId', filterCategory);
  if (dbUser) {
    queryParams.append('createdBy', dbUser.id);
    queryParams.append('includeProgressForUserId', dbUser.id);
  }
  
  const vocabEndpoint = dbUser && language ? `${ENDPOINTS.VOCABULARY.BASE}?${queryParams.toString()}` : null;

  const { data: vocabulary, loading, refetch: refetchVocab } = useGet(vocabEndpoint, { enabled: !!dbUser && !!language });
  const { put: updateVocab } = usePut();
  const { del: deleteVocab } = useDelete();
  const { post: createCategory } = usePost();

  const handleEdit = (vocab) => {
    setEditingVocabId(vocab.id);
    setVocabForm({
      word: vocab.word,
      translation: vocab.translation,
      languageId: vocab.languageId,
      categoryId: vocab.categoryId,
      difficultyLevel: vocab.difficultyLevel
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingVocabId(null);
    setVocabForm({ 
      word: '', 
      translation: '', 
      languageId: '', 
      categoryId: '',
      difficultyLevel: 'beginner'
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVocabId) {
        await updateVocab(`${ENDPOINTS.VOCABULARY.BASE}/${editingVocabId}`, {
          ...vocabForm
        });
        setEditingVocabId(null);
        setVocabForm({ 
            word: '', 
            translation: '', 
            languageId: '', 
            categoryId: '',
            difficultyLevel: 'beginner'
        });
        refetchVocab();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this word?')) {
      try {
        await deleteVocab(`${ENDPOINTS.VOCABULARY.BASE}/${id}`);
        refetchVocab();
      } catch (error) {
        console.error("Failed to delete vocabulary", error);
      }
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

  return (
    <Layout>
      <div className="retro-container">
        <button 
          className="retro-btn secondary" 
          onClick={() => navigate(`/learn/${code}`)}
          style={{ marginBottom: '20px' }}
        >
          {STRINGS.LANGUAGE_LEARN.BACK}
        </button>

        <h1 style={{ marginBottom: '20px' }}>My Vocabulary</h1>
        
        <div className="retro-card">
            {editingVocabId && (
                <div style={{ marginBottom: '30px', padding: '20px', border: '2px dashed var(--color-orange)', borderRadius: '8px' }}>
                    <h2 style={{ marginTop: 0 }}>{STRINGS.VOCAB_CMS.VOCABULARY.ACTIONS.UPDATE}</h2>
                    <form onSubmit={handleUpdateSubmit} style={{ display: 'grid', gap: '15px' }}>
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

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="retro-btn" type="submit">
                            {STRINGS.VOCAB_CMS.VOCABULARY.FORM.UPDATE_BTN}
                            </button>
                            <button className="retro-btn secondary" type="button" onClick={handleCancelEdit}>
                            {STRINGS.VOCAB_CMS.VOCABULARY.ACTIONS.CANCEL}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: 'var(--color-cream)', border: '2px solid var(--border-color)', borderRadius: '8px' }}>
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

            {loading ? (
                <p>{STRINGS.DASHBOARD.LOADING}</p>
            ) : (
                <div className="retro-window" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ borderBottom: '3px solid var(--border-color)', backgroundColor: 'var(--color-cream-dark)' }}>
                        <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.WORD}</th>
                        <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.TRANSLATION}</th>
                        <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.LANGUAGE}</th>
                        <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.CATEGORY}</th>
                        <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.LEVEL}</th>
                        <th style={{ textAlign: 'left', padding: '15px' }}>Mastery</th>
                        <th style={{ textAlign: 'left', padding: '15px' }}>Next Review</th>
                        <th style={{ textAlign: 'left', padding: '15px' }}>{STRINGS.VOCAB_CMS.VOCABULARY.TABLE.ACTIONS}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {vocabulary?.length > 0 ? (
                        vocabulary.map(vocab => {
                            const progress = vocab.UserVocabularies?.[0]?.strength || 0;
                            const nextReview = vocab.UserVocabularies?.[0]?.nextReviewDate;
                            return (
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
                            <td style={{ padding: '15px', width: '150px' }}>
                                <ProgressBar value={progress * 100} max={100} />
                            </td>
                            <td style={{ padding: '15px' }}>
                                {nextReview ? new Date(nextReview).toLocaleDateString() : '-'}
                            </td>
                            <td style={{ padding: '15px' }}>
                                <button 
                                  className="retro-btn secondary" 
                                  style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}
                                  onClick={() => handleEdit(vocab)}
                                >
                                  {STRINGS.VOCAB_CMS.VOCABULARY.ACTIONS.EDIT}
                                </button>
                                <button 
                                  className="retro-btn secondary" 
                                  style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#E76F51', color: 'white' }}
                                  onClick={() => handleDelete(vocab.id)}
                                >
                                  {STRINGS.VOCAB_CMS.VOCABULARY.ACTIONS.DELETE}
                                </button>
                            </td>
                            </tr>
                        )})
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ padding: '20px', textAlign: 'center' }}>No vocabulary found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default MyVocabulary;
