import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import Layout from '../components/Layout';
import { translateText } from '../services/translationService';
import { STRINGS } from '../constants/strings';

const ImageTextExtractor = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [translation, setTranslation] = useState('');
  const [translating, setTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState('kor');

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
      setText('');
      setWords([]);
      setSelectedWord(null);
      setTranslation('');
    }
  };

  const extractText = () => {
    if (!image) return;

    setLoading(true);
    setProgress(0);

    Tesseract.recognize(
      image,
      sourceLang,
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(parseInt(m.progress * 100));
          }
        },
      }
    )
      .then(({ data: { text } }) => {
        setText(text);
        // Simple tokenization: split by whitespace and remove punctuation
        const foundWords = text
          .split(/\s+/)
          .map(w => w.replace(/[^\w\s\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\u0900-\u097F]|_/g, "").trim())
          .filter(w => w.length > 0);
        console.log("🚀 ~ extractText ~ foundWords:", foundWords, text)
        
        // Remove duplicates
        setWords([...new Set(foundWords)]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleWordClick = async (word) => {
    setSelectedWord(word);
    setTranslation('');
    setTranslating(true);
    try {
      // Map Tesseract lang to Translation API lang
      let sourceCode = 'en';
      let targetCode = 'es';

      if (sourceLang === 'kor') {
        sourceCode = 'ko';
        targetCode = 'en';
      } else if (sourceLang === 'hin') {
        sourceCode = 'hi';
        targetCode = 'en';
      }
      
      const result = await translateText(word, sourceCode, targetCode); 
      setTranslation(result);
    } catch (error) {
      setTranslation(STRINGS.IMAGE_EXTRACTOR.ERROR_TRANSLATING);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Layout>
      <div className="retro-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="retro-title">{STRINGS.IMAGE_EXTRACTOR.TITLE}</h1>
        
        <div className="retro-card">
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <select 
              value={sourceLang} 
              onChange={(e) => setSourceLang(e.target.value)}
              className="retro-input"
              style={{ width: 'auto' }}
            >
              <option value="eng">{STRINGS.IMAGE_EXTRACTOR.LANGUAGES.ENGLISH}</option>
              <option value="kor">{STRINGS.IMAGE_EXTRACTOR.LANGUAGES.KOREAN}</option>
              <option value="hin">{STRINGS.IMAGE_EXTRACTOR.LANGUAGES.HINDI}</option>
            </select>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="retro-input"
            />
          </div>

          {image && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <img 
                src={image} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '300px', border: '2px solid var(--border-color)' }} 
              />
            </div>
          )}

          <button 
            onClick={extractText} 
            disabled={!image || loading}
            className="retro-btn primary"
            style={{ width: '100%' }}
          >
            {loading ? `${STRINGS.IMAGE_EXTRACTOR.EXTRACTING} ${progress}%` : STRINGS.IMAGE_EXTRACTOR.EXTRACT_BTN}
          </button>
        </div>

        {text && (
          <div className="retro-card" style={{ marginTop: '20px' }}>
            <h2 className="retro-subtitle">{STRINGS.IMAGE_EXTRACTOR.EXTRACTED_TITLE}</h2>
            <p style={{ whiteSpace: 'pre-wrap', marginBottom: '20px' }}>{text}</p>
            
            <h3 className="retro-subtitle">{STRINGS.IMAGE_EXTRACTOR.FOUND_WORDS_TITLE}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {words.map((word, index) => (
                <span 
                  key={index} 
                  onClick={() => handleWordClick(word)}
                  style={{ 
                    cursor: 'pointer', 
                    padding: '5px 10px', 
                    backgroundColor: selectedWord === word ? 'var(--color-orange)' : 'var(--color-white)',
                    color: selectedWord === word ? 'var(--color-white)' : 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px'
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedWord && (
          <div className="retro-card" style={{ marginTop: '20px', border: '2px solid var(--color-orange)' }}>
            <h3 className="retro-subtitle">{STRINGS.IMAGE_EXTRACTOR.TRANSLATION_TITLE}</h3>
            <p><strong>{STRINGS.IMAGE_EXTRACTOR.WORD_LABEL}</strong> {selectedWord}</p>
            <p>
              <strong>{STRINGS.IMAGE_EXTRACTOR.TRANSLATION_LABEL}</strong> 
              {translating ? ` ${STRINGS.IMAGE_EXTRACTOR.LOADING}` : ` ${translation}`}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ImageTextExtractor;
