import { GoogleGenerativeAI } from "@google/generative-ai";
import { User, Sentence, UserVocabulary, Vocabulary, Language } from '../models/associations.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSentences = async (req, res) => {
  const { firebaseUid } = req.params;
  const { languageId, level, tense } = req.body;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const language = await Language.findByPk(languageId);
    if (!language) return res.status(404).json({ message: 'Language not found' });

    // Fetch mastered vocabulary
    const userVocab = await UserVocabulary.findAll({
      where: {
        userId: user.id,
        status: 'mastered' // Assuming 'mastered' is the status for mastered words
      },
      include: [
        {
          model: Vocabulary,
          where: { languageId },
          attributes: ['word', 'translation']
        }
      ]
    });

    const masteredWords = userVocab.map(uv => uv.Vocabulary.word);

    if (masteredWords.length === 0) {
      return res.status(400).json({ message: 'No mastered vocabulary found to generate sentences.' });
    }

    // Select a random subset of mastered words to include (e.g., up to 20)
    const selectedWords = masteredWords.sort(() => 0.5 - Math.random()).slice(0, 20);

    const prompt = `
      Generate 10 sentences in ${language.name} using the following words: ${selectedWords.join(', ')}.
      The sentences should be suitable for a ${level} level learner.
      The sentences should be in the ${tense} tense.
      Provide the output as a JSON array of objects, where each object has "originalSentence" (in ${language.name}) and "translatedSentence" (in English).
      Do not include any markdown formatting or code blocks, just the raw JSON string.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up potential markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let sentences;
    try {
      sentences = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from AI response:", text);
      return res.status(500).json({ message: 'Failed to generate valid sentences from AI.' });
    }

    res.json(sentences);

  } catch (error) {
    console.error('Error generating sentences:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const saveSentence = async (req, res) => {
  const { firebaseUid } = req.params;
  const { originalSentence, translatedSentence, level, tense, languageId } = req.body;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sentence = await Sentence.create({
      userId: user.id,
      languageId,
      originalSentence,
      translatedSentence,
      level,
      tense
    });

    res.status(201).json(sentence);
  } catch (error) {
    console.error('Error saving sentence:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getSentences = async (req, res) => {
  const { firebaseUid } = req.params;
  const { languageId } = req.query;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const whereClause = { userId: user.id };
    if (languageId) {
      whereClause.languageId = languageId;
    }

    const sentences = await Sentence.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json(sentences);
  } catch (error) {
    console.error('Error fetching sentences:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteSentence = async (req, res) => {
  const { firebaseUid, id } = req.params;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sentence = await Sentence.findOne({
      where: {
        id,
        userId: user.id
      }
    });

    if (!sentence) return res.status(404).json({ message: 'Sentence not found' });

    await sentence.destroy();

    res.json({ message: 'Sentence deleted' });
  } catch (error) {
    console.error('Error deleting sentence:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateSentence = async (req, res) => {
  const { firebaseUid, id } = req.params;
  const { originalSentence, translatedSentence, level, tense } = req.body;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sentence = await Sentence.findOne({
      where: {
        id,
        userId: user.id
      }
    });

    if (!sentence) return res.status(404).json({ message: 'Sentence not found' });

    sentence.originalSentence = originalSentence || sentence.originalSentence;
    sentence.translatedSentence = translatedSentence || sentence.translatedSentence;
    sentence.level = level || sentence.level;
    sentence.tense = tense || sentence.tense;

    await sentence.save();

    res.json(sentence);
  } catch (error) {
    console.error('Error updating sentence:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateSentenceProgress = async (req, res) => {
  const { firebaseUid } = req.params;
  const { sentenceId, status, strength } = req.body;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sentence = await Sentence.findOne({
      where: {
        id: sentenceId,
        userId: user.id
      }
    });

    if (!sentence) return res.status(404).json({ message: 'Sentence not found' });

    sentence.status = status || sentence.status;
    sentence.strength = strength !== undefined ? strength : sentence.strength;
    sentence.lastReviewed = new Date();

    // Calculate next review date based on strength
    // Simple SRS: 
    // 0.0 - 0.2: 1 day
    // 0.2 - 0.4: 3 days
    // 0.4 - 0.6: 7 days
    // 0.6 - 0.8: 14 days
    // 0.8 - 1.0: 30 days
    let daysToAdd = 1;
    const s = sentence.strength;
    if (s >= 0.8) daysToAdd = 30;
    else if (s >= 0.6) daysToAdd = 14;
    else if (s >= 0.4) daysToAdd = 7;
    else if (s >= 0.2) daysToAdd = 3;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    sentence.nextReviewDate = nextDate;

    await sentence.save();

    res.json(sentence);
  } catch (error) {
    console.error('Error updating sentence progress:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
