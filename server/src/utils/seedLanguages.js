import Language from '../models/Language.js';

export const seedLanguages = async () => {
  const languages = [
    { name: 'Korean', code: 'ko', flag: '🇰🇷' },
    { name: 'English', code: 'en', flag: '🇺🇸' },
    { name: 'Spanish', code: 'es', flag: '🇪🇸' },
    { name: 'Hindi', code: 'hi', flag: '🇮🇳' },
  ];

  try {
    for (const lang of languages) {
      await Language.findOrCreate({
        where: { code: lang.code },
        defaults: lang,
      });
    }
    console.log('Languages seeded successfully');
  } catch (error) {
    console.error('Error seeding languages:', error);
  }
};
