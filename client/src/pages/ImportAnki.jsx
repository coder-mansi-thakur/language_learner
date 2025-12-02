import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Select from '../components/Select';
import { useGet, usePost } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { STRINGS } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';

const ImportAnki = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { dbUser } = useAuth();

  const { data: language, loading: loadingLang } = useGet(ENDPOINTS.LANGUAGES.GET_BY_CODE(code));
  const { data: categories, refetch: refetchCategories } = useGet(ENDPOINTS.CATEGORIES.BASE);
  const { post: bulkCreateVocab } = usePost();
  const { post: createCategory } = usePost();

  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({
    word: '',
    translation: '',
    pronunciation: '',
    exampleSentence: ''
  });
  const [categoryId, setCategoryId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (categories && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Detect delimiter (tab or comma)
      const firstLine = text.split('\n')[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';
      
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const data = lines.map(line => {
        // Handle quotes in CSV if simple split isn't enough, but for now simple split
        // For robust CSV parsing, a library like PapaParse is recommended.
        // Here we assume simple TSV/CSV from Anki.
        return line.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''));
      });

      if (data.length > 0) {
        setParsedData(data);
        setPreviewData(data.slice(0, 5));
        // Generate column options (Column 1, Column 2, etc.)
        const maxCols = Math.max(...data.map(row => row.length));
        const cols = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`);
        setColumns(cols);
        
        // Auto-guess mapping
        if (cols.length >= 2) {
          setMapping(prev => ({
            ...prev,
            word: 'Column 1',
            translation: 'Column 2'
          }));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleAddNewCategory = async (newCategoryName) => {
    const slug = newCategoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    try {
      const newCategory = await createCategory(ENDPOINTS.CATEGORIES.BASE, {
        name: newCategoryName,
        slug: slug,
        description: STRINGS.VOCAB_CMS.VOCABULARY.HELPER.CREATED_ON_FLY
      });
      await refetchCategories();
      if (newCategory && newCategory.id) {
        setCategoryId(newCategory.id);
      }
    } catch (error) {
      console.error("Failed to create category on the fly", error);
    }
  };

  const handleImport = async () => {
    if (!language || !categoryId || parsedData.length === 0) return;
    if (!mapping.word || !mapping.translation) {
      setMessage({ type: 'error', text: 'Please map at least Word and Translation columns.' });
      return;
    }

    const vocabList = parsedData.map(row => {
      const getColIndex = (colName) => parseInt(colName.replace('Column ', '')) - 1;
      
      return {
        word: row[getColIndex(mapping.word)] || '',
        translation: row[getColIndex(mapping.translation)] || '',
        pronunciation: mapping.pronunciation ? (row[getColIndex(mapping.pronunciation)] || '') : '',
        exampleSentence: mapping.exampleSentence ? (row[getColIndex(mapping.exampleSentence)] || '') : '',
        difficultyLevel: 'beginner',
        languageId: language.id,
        categoryId: categoryId,
        createdBy: dbUser?.id
      };
    }).filter(item => item.word && item.translation); // Filter out invalid rows

    try {
      const result = await bulkCreateVocab(ENDPOINTS.VOCABULARY.BULK_CREATE, { vocabList });
      setMessage({ type: 'success', text: result.message || STRINGS.IMPORT_ANKI.SUCCESS });
      setParsedData([]);
      setFile(null);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: STRINGS.IMPORT_ANKI.ERROR });
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
      <div className="retro-container" style={{ maxWidth: '800px' }}>
        <button
          className="retro-btn secondary"
          onClick={() => navigate(`/learn/${code}`)}
          style={{ marginBottom: '20px' }}
        >
          {STRINGS.LANGUAGE_LEARN.BACK}
        </button>

        <div className="retro-card">
          <h1 style={{ marginBottom: '10px' }}>{STRINGS.IMPORT_ANKI.TITLE}</h1>
          <p style={{ marginBottom: '20px', opacity: 0.8 }}>{STRINGS.IMPORT_ANKI.DESC}</p>

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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{STRINGS.IMPORT_ANKI.FILE_LABEL}</label>
            <input type="file" accept=".csv,.txt,.tsv" onChange={handleFileChange} className="retro-input" />
          </div>

          {parsedData.length > 0 && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <Select
                  label={STRINGS.VOCAB_CMS.VOCABULARY.TABLE.CATEGORY}
                  value={categoryId}
                  onChange={(val) => setCategoryId(val)}
                  options={categories?.map(c => ({ value: c.id, label: c.name })) || []}
                  required
                  placeholder={STRINGS.VOCAB_CMS.VOCABULARY.SELECT_CATEGORY}
                  allowAdd={true}
                  onAdd={handleAddNewCategory}
                />
              </div>

              <h3 style={{ marginBottom: '10px' }}>{STRINGS.IMPORT_ANKI.MAPPING_TITLE}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label>{STRINGS.IMPORT_ANKI.COLUMNS.WORD} *</label>
                  <select 
                    className="retro-input" 
                    value={mapping.word} 
                    onChange={(e) => setMapping({...mapping, word: e.target.value})}
                    style={{ width: '100%' }}
                  >
                    <option value="">Select Column</option>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div>
                  <label>{STRINGS.IMPORT_ANKI.COLUMNS.TRANSLATION} *</label>
                  <select 
                    className="retro-input" 
                    value={mapping.translation} 
                    onChange={(e) => setMapping({...mapping, translation: e.target.value})}
                    style={{ width: '100%' }}
                  >
                    <option value="">Select Column</option>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div>
                  <label>{STRINGS.IMPORT_ANKI.COLUMNS.PRONUNCIATION}</label>
                  <select 
                    className="retro-input" 
                    value={mapping.pronunciation} 
                    onChange={(e) => setMapping({...mapping, pronunciation: e.target.value})}
                    style={{ width: '100%' }}
                  >
                    <option value="">Select Column</option>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div>
                  <label>{STRINGS.IMPORT_ANKI.COLUMNS.EXAMPLE}</label>
                  <select 
                    className="retro-input" 
                    value={mapping.exampleSentence} 
                    onChange={(e) => setMapping({...mapping, exampleSentence: e.target.value})}
                    style={{ width: '100%' }}
                  >
                    <option value="">Select Column</option>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </div>

              <h3 style={{ marginBottom: '10px' }}>{STRINGS.IMPORT_ANKI.PREVIEW}</h3>
              <div style={{ overflowX: 'auto', marginBottom: '20px', border: '2px solid var(--border-color)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--secondary-color)', color: 'white' }}>
                      {columns.map(col => <th key={col} style={{ padding: '8px', border: '1px solid var(--border-color)' }}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} style={{ padding: '8px', border: '1px solid var(--border-color)' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="retro-btn" onClick={handleImport}>
                {STRINGS.IMPORT_ANKI.IMPORT_BTN}
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ImportAnki;
