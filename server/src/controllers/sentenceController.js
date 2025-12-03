import { GoogleGenerativeAI } from "@google/generative-ai";
import { User, Sentence, UserVocabulary, Vocabulary, Language } from '../models/associations.js';
import { Op } from 'sequelize';
import { FSRS, Rating, State } from '../utils/fsrs.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSentences = async (req, res) => {
  const { firebaseUid } = req.params;
  const { languageId, level, customPrompt } = req.body;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const language = await Language.findByPk(languageId);
    if (!language) return res.status(404).json({ message: 'Language not found' });

    // Fetch vocabulary based on strength
    const userVocab = await UserVocabulary.findAll({
      where: {
        userId: user.id,
        strength: {
          [Op.gt]: 0.6 // Only consider words with strength greater than 0.6
        }
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
      return res.status(400).json({ message: 'No vocabulary with sufficient strength found to generate sentences.' });
    }

    // Select a random subset of mastered words to include (e.g., up to 20)
    const selectedWords = masteredWords.sort(() => 0.5 - Math.random()).slice(0, 20);

    const prompt = `
      Generate 10 sentences in ${language.name} using the following words: ${selectedWords.join(', ')}.
      The sentences should be suitable for a ${level} level learner.
      ${customPrompt ? `Additional instructions: ${customPrompt}` : ''}
      Provide the output as a JSON array of objects, where each object has "originalSentence" (in ${language.name}) and "translatedSentence" (in English).
      Do not include any markdown formatting or code blocks, just the raw JSON string.
      And ensure the sentences vary in structure and vocabulary usage.
      And make sure the sentences are relevant to everyday situations.
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
  const { originalSentence, translatedSentence, level, languageId } = req.body;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sentence = await Sentence.create({
      userId: user.id,
      languageId,
      originalSentence,
      translatedSentence,
      level
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
  const { originalSentence, translatedSentence, level } = req.body;

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

    await sentence.save();

    res.json(sentence);
  } catch (error) {
    console.error('Error updating sentence:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateSentenceProgress = async (req, res) => {
  const { firebaseUid } = req.params;
  const { sentenceId, status, strength, rating } = req.body;

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

    const fsrs = new FSRS();
    const now = new Date();
    const ratingValue = rating || Rating.Good;

    // Map status to State
    const statusToState = (status) => {
        switch (status) {
            case 'new': return State.New;
            case 'learning': return State.Learning;
            case 'review': return State.Review;
            case 'mastered': return State.Review;
            default: return State.New;
        }
    };

    const stateToStatus = (state) => {
        switch (state) {
            case State.New: return 'new';
            case State.Learning: return 'learning';
            case State.Relearning: return 'learning'; // Map Relearning to learning
            case State.Review: return 'review';
            default: return 'learning';
        }
    };

    const card = {
      due: sentence.nextReviewDate || now,
      stability: sentence.stability,
      difficulty: sentence.difficulty,
      reps: sentence.reps,
      lapses: sentence.lapses,
      state: statusToState(sentence.status),
      last_review: sentence.lastReviewed || now
    };

    const scheduling_cards = fsrs.repeat(card, now);
    const new_card = scheduling_cards[ratingValue];

    sentence.status = stateToStatus(new_card.state);
    sentence.strength = strength !== undefined ? strength : sentence.strength;
    sentence.lastReviewed = now;

    // Update FSRS fields
    sentence.stability = new_card.stability;
    sentence.difficulty = new_card.difficulty;
    sentence.reps = new_card.reps;
    sentence.lapses = new_card.lapses;

    // Set next review date
    sentence.nextReviewDate = new_card.due;

    await sentence.save();

    res.json(sentence);
  } catch (error) {
    console.error('Error updating sentence progress:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
