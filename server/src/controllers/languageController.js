import Language from '../models/Language.js';

export const getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.findAll();
    res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getLanguageByCode = async (req, res) => {
  const { code } = req.params;
  try {
    const language = await Language.findOne({ where: { code } });
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    res.json(language);
  } catch (error) {
    console.error('Error fetching language:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
