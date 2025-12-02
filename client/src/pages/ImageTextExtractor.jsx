import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Layout from '../components/Layout';
import { translateText } from '../services/translationService';
import { STRINGS } from '../constants/strings';
import { useAuth } from '../contexts/AuthContext';
import { useGet, usePost } from '../hooks/useApi';
import { ENDPOINTS } from '../constants/endpoints';

const ImageTextExtractor = () => {
  const { code } = useParams();
  const { dbUser } = useAuth();
  const { post: createVocab } = usePost();
  const { data: languages } = useGet(ENDPOINTS.LANGUAGES.GET_ALL);
  const { data: userVocab, refetch: refetchUserVocab } = useGet(
    dbUser ? ENDPOINTS.USER_VOCABULARY.GET_BY_USER(dbUser.id) : null,
    { enabled: !!dbUser }
  );

  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [translation, setTranslation] = useState('');
  const [translating, setTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState('kor');
  const [ocrMethod, setOcrMethod] = useState('tesseract');
  const [onlyNewWords, setOnlyNewWords] = useState(false);
  const [addingToVocab, setAddingToVocab] = useState(false);
  const [addMessage, setAddMessage] = useState('');

  useEffect(() => {
    if (code) {
      // Map URL code to Tesseract/App code
      // App codes: 'ko', 'hi', 'en' (assumed based on previous context)
      // Tesseract codes: 'kor', 'hin', 'eng'
      if (code === 'ko') setSourceLang('kor');
      else if (code === 'hi') setSourceLang('hin');
      else if (code === 'en') setSourceLang('eng');
      // Add more mappings as needed
    }
  }, [code]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
      setText('');
      setWords([]);
      setSelectedWord(null);
      setTranslation('');
    }
  };

  const extractTextWithGoogleAI = async () => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
      if (!apiKey) {
        alert("Google AI API Key is missing. Please add VITE_GOOGLE_AI_API_KEY to your .env file.");
        setLoading(false);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Use gemini-1.5-flash which is the current standard for multimodal
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const response = await fetch(image);
      const blob = await response.blob();
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result);
      });

      const base64Image = base64Data.split(',')[1];
      const mimeType = base64Data.split(';')[0].split(':')[1];

      const prompt = `Extract all text from this image. The language is likely ${sourceLang}.
       Return a JSON object with two keys: "text" containing the full extracted text, and "words" containing an array of objects with "word" (original word) and "translation" (English translation).
        Return only the JSON string, no markdown formatting.
        And return in ${sourceLang} language words only. Just the vocab words without any grammar or punctuation.
        `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        }
      ]);

      const responseText = result.response.text();

      try {
        // Clean up potential markdown code blocks if the model adds them
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanJson);

        setText(data.text);
        setWords(data.words);
        setLoading(false);
      } catch (e) {
        console.warn("Failed to parse Google AI response as JSON, falling back to text processing", e);
        processExtractedText(responseText);
      }
    } catch (error) {
      console.error("Google AI Error:", error);
      setLoading(false);
    }
  };

  const processExtractedText = async (text) => {
    setText(text);
    // Simple tokenization: split by whitespace and remove punctuation
    const foundWords = text
      .split(/\s+/)
      .map(w => w.replace(/[^\w\s\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\u0900-\u097F]|_/g, "").trim())
      .filter(w => w.length > 0);

    // Remove duplicates
    const uniqueWords = [...new Set(foundWords)].map(w => ({ word: w, translation: '', translating: true }));
    setWords(uniqueWords);
    setLoading(false);

    if (uniqueWords.length === 0) return;

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

      // Bulk translate
      const textToTranslate = uniqueWords.map(w => w.word).join('\n');
      const translatedText = await translateText(textToTranslate, sourceCode, targetCode);
      
      const translations = translatedText.split('\n');
      
      const updatedWords = uniqueWords.map((w, i) => ({
        ...w,
        translation: translations[i] ? translations[i].trim() : '',
        translating: false
      }));

      setWords(updatedWords);
    } catch (error) {
      console.error("Bulk translation failed", error);
      // Fallback: mark all as not translating
      setWords(uniqueWords.map(w => ({ ...w, translating: false })));
    }
  };

  const extractTextWithOCRSpace = async () => {
    try {
      const apiKey = import.meta.env.VITE_OCR_SPACE_API_KEY;
      if (!apiKey) {
        alert("OCR.space API Key is missing. Please add VITE_OCR_SPACE_API_KEY to your .env file.");
        setLoading(false);
        return;
      }

      const formData = new FormData();

      // Convert blob URL to File object
      const response = await fetch(image);
      const blob = await response.blob();
      formData.append('file', blob, 'image.png');
      formData.append('apikey', apiKey);
      formData.append('language', sourceLang === 'kor' ? 'kor' : sourceLang === 'hin' ? 'hin' : 'eng');
      formData.append('isOverlayRequired', 'false');

      const apiResponse = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      const data = await apiResponse.json();

      if (data.IsErroredOnProcessing) {
        console.error("OCR.space Error:", data.ErrorMessage);
        setLoading(false);
        return;
      }

      if (data.ParsedResults && data.ParsedResults.length > 0) {
        const text = data.ParsedResults[0].ParsedText;
        processExtractedText(text);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("OCR.space Error:", error);
      setLoading(false);
    }
  };

  const extractText = () => {
    if (!image) return;

    setLoading(true);
    setProgress(0);

    if (ocrMethod === 'google') {
      extractTextWithGoogleAI();
      return;
    } else if (ocrMethod === 'ocr_space') {
      extractTextWithOCRSpace();
      return;
    }

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
        processExtractedText(text);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleTranslateWord = async (index, word) => {
    const newWords = [...words];
    newWords[index].translating = true;
    setWords(newWords);

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
      newWords[index].translation = result;
    } catch (error) {
      console.error("Translation error", error);
    } finally {
      newWords[index].translating = false;
      setWords([...newWords]);
    }
  };

  const handleAddToVocab = async (wordObj, index) => {
    if (!dbUser) {
      alert(STRINGS.IMAGE_EXTRACTOR.LOGIN_REQUIRED);
      return;
    }

    const newWords = [...words];
    newWords[index].adding = true;
    setWords(newWords);

    try {
      // Find language ID
      let langCodeToFind = 'en';
      if (sourceLang === 'kor') langCodeToFind = 'ko';
      if (sourceLang === 'hin') langCodeToFind = 'hi';

      const language = languages?.find(l => l.code === langCodeToFind);

      if (!language) {
        alert(STRINGS.IMAGE_EXTRACTOR.LANGUAGE_NOT_FOUND);
        newWords[index].adding = false;
        setWords(newWords);
        return;
      }

      await createVocab(ENDPOINTS.VOCABULARY.BASE, {
        word: wordObj.word,
        translation: wordObj.translation,
        difficultyLevel: 'beginner',
        categoryId: null,
        languageId: language.id,
        createdBy: dbUser.id
      });

      newWords[index].added = true;
      setWords(newWords);
      refetchUserVocab();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        alert(STRINGS.IMAGE_EXTRACTOR.ERROR_EXISTS);
      } else {
        alert(STRINGS.IMAGE_EXTRACTOR.ERROR_ADDING);
      }
      newWords[index].adding = false;
      setWords(newWords);
    }
  };

  const displayedWords = React.useMemo(() => {
    if (!onlyNewWords || !userVocab) return words;
    
    const clean = (w) => w.replace(/[^\w\s\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\u0900-\u097F]|_/g, "").toLowerCase().trim();

    const userWordSet = new Set(
      userVocab
        .filter(v => v.Vocabulary && v.Vocabulary.word)
        .map(v => clean(v.Vocabulary.word))
    );
    
    return words.filter(w => !userWordSet.has(clean(w.word)));
  }, [words, onlyNewWords, userVocab]);

  return (
    <Layout>
      <div className="retro-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="retro-title">{STRINGS.IMAGE_EXTRACTOR.TITLE}</h1>

        <div className="retro-card">
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold' }}>{STRINGS.IMAGE_EXTRACTOR.OCR_METHOD}</label>
              <select
                value={ocrMethod}
                onChange={(e) => setOcrMethod(e.target.value)}
                className="retro-input"
                style={{ width: 'auto' }}
              >
                <option value="tesseract">{STRINGS.IMAGE_EXTRACTOR.METHODS.TESSERACT}</option>
                <option value="google">{STRINGS.IMAGE_EXTRACTOR.METHODS.GOOGLE_AI}</option>
                <option value="ocr_space">{STRINGS.IMAGE_EXTRACTOR.METHODS.OCR_SPACE}</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {!code && (
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
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="retro-input"
              />
            </div>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 className="retro-subtitle" style={{ margin: 0 }}>{STRINGS.IMAGE_EXTRACTOR.FOUND_WORDS_TITLE}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  id="onlyNewWords"
                  checked={onlyNewWords}
                  onChange={(e) => setOnlyNewWords(e.target.checked)}
                  disabled={!dbUser}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="onlyNewWords" style={{ cursor: 'pointer', opacity: !dbUser ? 0.5 : 1, fontSize: '0.9rem' }}>
                  {STRINGS.IMAGE_EXTRACTOR.ONLY_NEW_WORDS}
                </label>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="retro-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid var(--border-color)' }}>{STRINGS.IMAGE_EXTRACTOR.WORD_LABEL}</th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid var(--border-color)' }}>{STRINGS.IMAGE_EXTRACTOR.TRANSLATION_LABEL}</th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid var(--border-color)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedWords.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px' }}>{item.word}</td>
                      <td style={{ padding: '10px' }}>
                        {item.translation ? (
                          item.translation
                        ) : (
                          <button
                            className="retro-btn secondary small"
                            onClick={() => handleTranslateWord(index, item.word)}
                            disabled={item.translating}
                          >
                            {item.translating ? STRINGS.IMAGE_EXTRACTOR.LOADING : 'Translate'}
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button
                          className="retro-btn primary small"
                          onClick={() => handleAddToVocab(item, index)}
                          disabled={item.adding || item.added || !item.translation}
                          style={{ opacity: item.added ? 0.5 : 1 }}
                        >
                          {item.adding ? 'Adding...' : item.added ? 'Added' : 'Add'}
                        </button>
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

export default ImageTextExtractor;
