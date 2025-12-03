import UserVocabulary from '../models/UserVocabulary.js';
import Vocabulary from '../models/Vocabulary.js';
import User from '../models/User.js';
import { FSRS, Rating, State } from '../utils/fsrs.js';

export const getUserVocabulary = async (req, res) => {
  const { firebaseUid } = req.params;
  const { languageId } = req.query;

  try {
    const user = await User.findOne({ where: { id:firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const whereClause = { userId: user.id };
    // If we want to filter by language, we need to include the Vocabulary model and filter there
    // But UserVocabulary doesn't directly have languageId, Vocabulary does.
    
    const userVocab = await UserVocabulary.findAll({
      where: whereClause,
      include: [
        {
          model: Vocabulary,
          where: languageId ? { languageId } : {},
        }
      ]
    });

    const createdVocab = await Vocabulary.findAll({
      where: {
        createdBy: user.id,
        ...(languageId ? { languageId } : {})
      }
    });

    const existingVocabIds = new Set(userVocab.map(uv => uv.vocabularyId));

    for (const vocab of createdVocab) {
      if (!existingVocabIds.has(vocab.id)) {
        userVocab.push({
          id: null,
          userId: user.id,
          vocabularyId: vocab.id,
          status: 'new',
          strength: 0,
          nextReviewDate: null,
          lastReviewed: null,
          Vocabulary: vocab
        });
      }
    }

    res.json(userVocab);
  } catch (error) {
    console.error('Error fetching user vocabulary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateWordProgress = async (req, res) => {
  const { firebaseUid } = req.params;
  const { vocabularyId, status, strength, rating } = req.body;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let userVocab = await UserVocabulary.findOne({
      where: {
        userId: user.id,
        vocabularyId
      }
    });

    const fsrs = new FSRS();
    const now = new Date();
    const ratingValue = rating || Rating.Good; // Default to Good

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

    if (userVocab) {
      // Use FSRS
      const card = {
        due: userVocab.nextReviewDate || now,
        stability: userVocab.stability,
        difficulty: userVocab.difficulty,
        reps: userVocab.reps,
        lapses: userVocab.lapses,
        state: statusToState(userVocab.status),
        last_review: userVocab.lastReviewed || now
      };

      const scheduling_cards = fsrs.repeat(card, now);
      const new_card = scheduling_cards[ratingValue];

      userVocab.status = stateToStatus(new_card.state);
      userVocab.strength = strength !== undefined ? strength : userVocab.strength;
      userVocab.lastReviewed = now;
      
      // Update FSRS fields
      userVocab.stability = new_card.stability;
      userVocab.difficulty = new_card.difficulty;
      userVocab.reps = new_card.reps;
      userVocab.lapses = new_card.lapses;

      // Set next review date
      userVocab.nextReviewDate = new_card.due;

      await userVocab.save();
    } else {
      // New word
      const card = {
        due: now,
        reps: 0,
        lapses: 0,
        stability: 0,
        difficulty: 0,
        state: State.New,
        last_review: now
      };
      
      const scheduling_cards = fsrs.repeat(card, now);
      const new_card = scheduling_cards[ratingValue];
      
      userVocab = await UserVocabulary.create({
        userId: user.id,
        vocabularyId,
        status: stateToStatus(new_card.state),
        strength: strength || 0,
        lastReviewed: now,
        nextReviewDate: new_card.due,
        stability: new_card.stability,
        difficulty: new_card.difficulty,
        reps: new_card.reps,
        lapses: new_card.lapses
      });
    }

    res.json(userVocab);
  } catch (error) {
    console.error('Error updating word progress:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
