/**
 * Service to handle text translation using MyMemory API
 * https://mymemory.translated.net/doc/spec.php
 */

const API_BASE_URL = 'https://api.mymemory.translated.net/get';

/**
 * Translates text from source language to target language
 * @param {string} text - The text to translate
 * @param {string} from - Source language code (e.g., 'en')
 * @param {string} to - Target language code (e.g., 'es', 'fr')
 * @returns {Promise<string>} - The translated text
 */
export const translateText = async (text, from, to) => {
  if (!text) return '';
  
  try {
    const langPair = `${from}|${to}`;
    const url = `${API_BASE_URL}?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    } else {
      throw new Error(data.responseDetails || 'Translation failed');
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};
