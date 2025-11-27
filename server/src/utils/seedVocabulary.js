import Category from '../models/Category.js';
import Vocabulary from '../models/Vocabulary.js';
import Language from '../models/Language.js';

const categoriesData = [
  { name: 'Greetings', slug: 'greetings', description: 'Common ways to say hello and goodbye' },
  { name: 'Numbers', slug: 'numbers', description: 'Basic counting numbers 1-10' },
  { name: 'Common Phrases', slug: 'common-phrases', description: 'Everyday useful phrases' },
];

const vocabData = {
  ko: {
    greetings: [
      { word: '안녕하세요', translation: 'Hello', pronunciation: 'Annyeonghaseyo', difficultyLevel: 'beginner' },
      { word: '안녕히 가세요', translation: 'Goodbye (to person leaving)', pronunciation: 'Annyeonghi gaseyo', difficultyLevel: 'beginner' },
      { word: '반갑습니다', translation: 'Nice to meet you', pronunciation: 'Bangapseumnida', difficultyLevel: 'beginner' },
    ],
    numbers: [
      { word: '하나', translation: 'One', pronunciation: 'Hana', difficultyLevel: 'beginner' },
      { word: '둘', translation: 'Two', pronunciation: 'Dul', difficultyLevel: 'beginner' },
      { word: '셋', translation: 'Three', pronunciation: 'Set', difficultyLevel: 'beginner' },
    ],
    'common-phrases': [
      { word: '감사합니다', translation: 'Thank you', pronunciation: 'Gamsahamnida', difficultyLevel: 'beginner' },
      { word: '죄송합니다', translation: 'I am sorry', pronunciation: 'Joesonghamnida', difficultyLevel: 'beginner' },
      { word: '네', translation: 'Yes', pronunciation: 'Ne', difficultyLevel: 'beginner' },
      { word: '아니요', translation: 'No', pronunciation: 'Aniyo', difficultyLevel: 'beginner' },
    ]
  },
  es: {
    greetings: [
      { word: 'Hola', translation: 'Hello', pronunciation: 'Oh-la', difficultyLevel: 'beginner' },
      { word: 'Adiós', translation: 'Goodbye', pronunciation: 'Ah-dyos', difficultyLevel: 'beginner' },
      { word: 'Mucho gusto', translation: 'Nice to meet you', pronunciation: 'Moo-cho goos-to', difficultyLevel: 'beginner' },
    ],
    numbers: [
      { word: 'Uno', translation: 'One', pronunciation: 'Oo-no', difficultyLevel: 'beginner' },
      { word: 'Dos', translation: 'Two', pronunciation: 'Dos', difficultyLevel: 'beginner' },
      { word: 'Tres', translation: 'Three', pronunciation: 'Trehs', difficultyLevel: 'beginner' },
    ],
    'common-phrases': [
      { word: 'Gracias', translation: 'Thank you', pronunciation: 'Grah-syas', difficultyLevel: 'beginner' },
      { word: 'Lo siento', translation: 'I am sorry', pronunciation: 'Lo syen-to', difficultyLevel: 'beginner' },
      { word: 'Sí', translation: 'Yes', pronunciation: 'See', difficultyLevel: 'beginner' },
      { word: 'No', translation: 'No', pronunciation: 'No', difficultyLevel: 'beginner' },
    ]
  },
  hi: {
    greetings: [
      { word: 'नमस्ते', translation: 'Hello', pronunciation: 'Namaste', difficultyLevel: 'beginner' },
      { word: 'अलविदा', translation: 'Goodbye', pronunciation: 'Alvida', difficultyLevel: 'beginner' },
      { word: 'आपसे मिलकर खुशी हुई', translation: 'Nice to meet you', pronunciation: 'Aapse milkar khushi hui', difficultyLevel: 'beginner' },
    ],
    numbers: [
      { word: 'एक', translation: 'One', pronunciation: 'Ek', difficultyLevel: 'beginner' },
      { word: 'दो', translation: 'Two', pronunciation: 'Do', difficultyLevel: 'beginner' },
      { word: 'तीन', translation: 'Three', pronunciation: 'Teen', difficultyLevel: 'beginner' },
    ],
    'common-phrases': [
      { word: 'धन्यवाद', translation: 'Thank you', pronunciation: 'Dhanyavaad', difficultyLevel: 'beginner' },
      { word: 'माफ़ कीजिये', translation: 'I am sorry', pronunciation: 'Maaf kijiye', difficultyLevel: 'beginner' },
      { word: 'हाँ', translation: 'Yes', pronunciation: 'Haan', difficultyLevel: 'beginner' },
      { word: 'नहीं', translation: 'No', pronunciation: 'Nahi', difficultyLevel: 'beginner' },
    ]
  },
  en: {
    greetings: [
      { word: 'Hello', translation: 'Hello', pronunciation: 'Heh-loh', difficultyLevel: 'beginner' },
      { word: 'Goodbye', translation: 'Goodbye', pronunciation: 'Good-bye', difficultyLevel: 'beginner' },
    ],
    numbers: [
      { word: 'One', translation: 'One', pronunciation: 'Wun', difficultyLevel: 'beginner' },
      { word: 'Two', translation: 'Two', pronunciation: 'Too', difficultyLevel: 'beginner' },
      { word: 'Three', translation: 'Three', pronunciation: 'Three', difficultyLevel: 'beginner' },
    ],
    'common-phrases': [
      { word: 'Thank you', translation: 'Thank you', pronunciation: 'Thangk yoo', difficultyLevel: 'beginner' },
      { word: 'Sorry', translation: 'Sorry', pronunciation: 'Sor-ree', difficultyLevel: 'beginner' },
    ]
  }
};

export const seedVocabulary = async () => {
  try {
    // 1. Seed Categories
    const categoryMap = {};
    for (const cat of categoriesData) {
      const [category] = await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat
      });
      categoryMap[cat.slug] = category.id;
    }
    console.log('Categories seeded.');

    // 2. Seed Vocabulary for each language
    for (const [langCode, categories] of Object.entries(vocabData)) {
      const language = await Language.findOne({ where: { code: langCode } });
      if (!language) {
        console.warn(`Language ${langCode} not found, skipping vocabulary seed.`);
        continue;
      }

      for (const [catSlug, words] of Object.entries(categories)) {
        const categoryId = categoryMap[catSlug];
        if (!categoryId) continue;

        for (const wordData of words) {
          await Vocabulary.findOrCreate({
            where: { 
              word: wordData.word,
              languageId: language.id,
              categoryId: categoryId
            },
            defaults: {
              ...wordData,
              languageId: language.id,
              categoryId: categoryId
            }
          });
        }
      }
    }
    console.log('Vocabulary seeded successfully.');
  } catch (error) {
    console.error('Error seeding vocabulary:', error);
  }
};
