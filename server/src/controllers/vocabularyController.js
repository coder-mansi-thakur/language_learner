import Vocabulary from '../models/Vocabulary.js';
import Category from '../models/Category.js';
import Language from '../models/Language.js';
import User from '../models/User.js';

export const getAllVocabulary = async (req, res) => {
  const { languageId, categoryId, createdBy } = req.query;
  const where = {};
  if (languageId) where.languageId = languageId;
  if (categoryId) where.categoryId = categoryId;
  if (createdBy) where.createdBy = createdBy;

  try {
    const vocabulary = await Vocabulary.findAll({
      where,
      include: [
        { model: Category, attributes: ['name', 'slug'] },
        { model: Language, attributes: ['name', 'code'] },
        { model: User, as: 'creator', attributes: ['displayName', 'email'] }
      ]
    });
    res.json(vocabulary);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createVocabulary = async (req, res) => {
  const { word, translation, pronunciation, exampleSentence, exampleTranslation, difficultyLevel, languageId, categoryId, createdBy } = req.body;
  try {
    const vocabulary = await Vocabulary.create({
      word,
      translation,
      pronunciation,
      exampleSentence,
      exampleTranslation,
      difficultyLevel,
      languageId,
      categoryId,
      createdBy
    });
    res.status(201).json(vocabulary);
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateVocabulary = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const vocabulary = await Vocabulary.findByPk(id);
    if (!vocabulary) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }
    await vocabulary.update(updates);
    res.json(vocabulary);
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteVocabulary = async (req, res) => {
  const { id } = req.params;
  try {
    const vocabulary = await Vocabulary.findByPk(id);
    if (!vocabulary) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }
    await vocabulary.destroy();
    res.json({ message: 'Vocabulary deleted' });
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
