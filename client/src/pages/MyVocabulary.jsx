import React, { useState } from 'react';
import Layout from '../components/Layout';
import Select from '../components/Select';
import ProgressBar from '../components/ProgressBar';
import { useGet } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { STRINGS } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';
import { useNavigate } from 'react-router-dom';

const MyVocabulary = () => {
  const { dbUser } = useAuth();
  const navigate = useNavigate();
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const { data: categories } = useGet(ENDPOINTS.CATEGORIES.BASE);
  const { data: languages } = useGet(ENDPOINTS.LANGUAGES.GET_ALL);
  
  // Construct query string for vocabulary
  const queryParams = new URLSearchParams();
  if (filterLanguage) queryParams.append('languageId', filterLanguage);
  if (filterCategory) queryParams.append('categoryId', filterCategory);
  if (dbUser) {
    queryParams.append('createdBy', dbUser.id);
    queryParams.append('includeProgressForUserId', dbUser.id);
  }
  
  const vocabEndpoint = dbUser ? `${ENDPOINTS.VOCABULARY.BASE}?${queryParams.toString()}` : null;

  const { data: vocabulary, loading } = useGet(vocabEndpoint, { enabled: !!dbUser });

  return (
    <Layout>
      <div className="retro-container">
        <button 
          className="retro-btn secondary" 
          onClick={() => navigate('/dashboard')}
          style={{ marginBottom: '20px' }}
        >
          {STRINGS.LANGUAGE_LEARN.BACK_DASHBOARD}
        </button>

        <h1 style={{ marginBottom: '20px' }}>My Vocabulary</h1>
        
        <div className="retro-card">
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
                            </tr>
                        )})
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>No vocabulary found.</td>
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
