import React, { useState } from 'react';
import Layout from '../components/Layout';
import Select from '../components/Select';
import { useGet, usePost, useDelete, usePut } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { STRINGS } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';
import { useNavigate, useParams } from 'react-router-dom';

const SentenceGenerator = () => {
  const { dbUser } = useAuth();
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [level, setLevel] = useState('beginner');
  const [tense, setTense] = useState('Present');
  const [generatedSentences, setGeneratedSentences] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [editingSentence, setEditingSentence] = useState(null);

  const { data: language } = useGet(ENDPOINTS.LANGUAGES.GET_BY_CODE(code));
  
  const { post: generate } = usePost();
  const { post: saveSentence } = usePost();
  const { del: deleteSentence } = useDelete();
  const { put: updateSentence } = usePut();

  const sentencesEndpoint = dbUser && language ? `${ENDPOINTS.SENTENCES.BASE(dbUser.firebaseUid)}?languageId=${language.id}` : null;
  const { data: savedSentences, refetch: refetchSaved } = useGet(sentencesEndpoint, { enabled: !!dbUser && !!language });

  const handleGenerate = async () => {
    if (!dbUser || !language) return;
    setGenerating(true);
    setGeneratedSentences([]);
    try {
      const result = await generate(ENDPOINTS.SENTENCES.GENERATE(dbUser.firebaseUid), {
        languageId: language.id,
        level,
        tense
      });
      setGeneratedSentences(result);
    } catch (error) {
      console.error("Failed to generate sentences", error);
      alert("Failed to generate sentences. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (sentence) => {
    if (!dbUser || !language) return;
    try {
      await saveSentence(ENDPOINTS.SENTENCES.BASE(dbUser.firebaseUid), {
        languageId: language.id,
        originalSentence: sentence.originalSentence,
        translatedSentence: sentence.translatedSentence,
        level,
        tense
      });
      setGeneratedSentences(prev => prev.filter(s => s.originalSentence !== sentence.originalSentence));
      refetchSaved();
    } catch (error) {
      console.error("Failed to save sentence", error);
    }
  };

  const handleDelete = async (id) => {
    if (!dbUser) return;
    if (window.confirm('Are you sure you want to delete this sentence?')) {
      try {
        await deleteSentence(`${ENDPOINTS.SENTENCES.BASE(dbUser.firebaseUid)}/${id}`);
        refetchSaved();
      } catch (error) {
        console.error("Failed to delete sentence", error);
      }
    }
  };

  const handleUpdate = async () => {
    if (!dbUser || !editingSentence) return;
    try {
      await updateSentence(`${ENDPOINTS.SENTENCES.BASE(dbUser.firebaseUid)}/${editingSentence.id}`, {
        originalSentence: editingSentence.originalSentence,
        translatedSentence: editingSentence.translatedSentence,
        level: editingSentence.level,
        tense: editingSentence.tense
      });
      setEditingSentence(null);
      refetchSaved();
    } catch (error) {
      console.error("Failed to update sentence", error);
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

        <h1 style={{ marginBottom: '20px' }}>Sentence Generator</h1>
        
        <div className="retro-card" style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0 }}>Generate New Sentences</h2>
          <p>Generate sentences based on your mastered vocabulary.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Level</label>
              <Select
                value={level}
                onChange={setLevel}
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' }
                ]}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tense</label>
              <input 
                className="retro-input" 
                value={tense}
                onChange={(e) => setTense(e.target.value)}
                placeholder="e.g. Present, Past, Future"
              />
            </div>
          </div>

          <button 
            className="retro-btn" 
            onClick={handleGenerate} 
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Sentences'}
          </button>

          {generatedSentences.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Generated Sentences</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {generatedSentences.map((s, index) => (
                  <div key={index} style={{ padding: '15px', backgroundColor: 'var(--color-cream)', border: '2px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{s.originalSentence}</p>
                      <p style={{ margin: 0, color: '#666' }}>{s.translatedSentence}</p>
                    </div>
                    <button className="retro-btn small" onClick={() => handleSave(s)}>Save</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {editingSentence && (
          <div className="retro-card" style={{ marginBottom: '30px', border: '2px dashed var(--color-orange)' }}>
            <h2 style={{ marginTop: 0 }}>Edit Sentence</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <input 
                className="retro-input" 
                value={editingSentence.originalSentence}
                onChange={(e) => setEditingSentence({...editingSentence, originalSentence: e.target.value})}
                placeholder="Original Sentence"
              />
              <input 
                className="retro-input" 
                value={editingSentence.translatedSentence}
                onChange={(e) => setEditingSentence({...editingSentence, translatedSentence: e.target.value})}
                placeholder="Translated Sentence"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <Select
                  value={editingSentence.level}
                  onChange={(val) => setEditingSentence({...editingSentence, level: val})}
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' }
                  ]}
                />
                <input 
                  className="retro-input" 
                  value={editingSentence.tense}
                  onChange={(e) => setEditingSentence({...editingSentence, tense: e.target.value})}
                  placeholder="Tense"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="retro-btn" onClick={handleUpdate}>Update</button>
                <button className="retro-btn secondary" onClick={() => setEditingSentence(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="retro-card">
          <h2 style={{ marginTop: 0 }}>Saved Sentences (Flashcards)</h2>
          {savedSentences && savedSentences.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {savedSentences.map(s => (
                <div key={s.id} style={{ padding: '15px', backgroundColor: 'var(--color-white)', border: '2px solid var(--border-color)', borderRadius: '8px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span className="retro-tag" style={{ marginRight: '10px' }}>{s.level}</span>
                    <span className="retro-tag">{s.tense}</span>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '10px' }}
                      onClick={() => setEditingSentence(s)}
                    >
                      ✏️
                    </button>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '10px' }}
                      onClick={() => handleDelete(s.id)}
                    >
                      🗑️
                    </button>
                  </div>
                  <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 10px 0', paddingRight: '100px' }}>{s.originalSentence}</p>
                  <p style={{ margin: 0, color: '#555' }}>{s.translatedSentence}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No saved sentences yet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SentenceGenerator;

