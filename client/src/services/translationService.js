/**
 * Service to handle text translation using Google Translate API
 */

const API_BASE_URL = 'https://translate.googleapis.com/translate_a/single';

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
    const url = `${API_BASE_URL}?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    } else {
      throw new Error('Translation failed');
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};
