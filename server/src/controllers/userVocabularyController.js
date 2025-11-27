import UserVocabulary from '../models/UserVocabulary.js';
import Vocabulary from '../models/Vocabulary.js';
import User from '../models/User.js';

export const getUserVocabulary = async (req, res) => {
  const { firebaseUid } = req.params;
  const { languageId } = req.query;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
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

    res.json(userVocab);
  } catch (error) {
    console.error('Error fetching user vocabulary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateWordProgress = async (req, res) => {
  const { firebaseUid } = req.params;
  const { vocabularyId, status, strength } = req.body;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let userVocab = await UserVocabulary.findOne({
      where: {
        userId: user.id,
        vocabularyId
      }
    });

    if (userVocab) {
      userVocab.status = status || userVocab.status;
      userVocab.strength = strength !== undefined ? strength : userVocab.strength;
      userVocab.lastReviewed = new Date();
      
      // Calculate next review date based on strength
      // Simple SRS: 
      // 0.0 - 0.2: 1 day
      // 0.2 - 0.4: 3 days
      // 0.4 - 0.6: 7 days
      // 0.6 - 0.8: 14 days
      // 0.8 - 1.0: 30 days
      let daysToAdd = 1;
      const s = userVocab.strength;
      if (s >= 0.8) daysToAdd = 30;
      else if (s >= 0.6) daysToAdd = 14;
      else if (s >= 0.4) daysToAdd = 7;
      else if (s >= 0.2) daysToAdd = 3;
      
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      userVocab.nextReviewDate = nextDate;

      await userVocab.save();
    } else {
      // New word
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1); // Review tomorrow

      userVocab = await UserVocabulary.create({
        userId: user.id,
        vocabularyId,
        status: status || 'learning',
        strength: strength || 0,
        lastReviewed: new Date(),
        nextReviewDate: nextDate
      });
    }

    res.json(userVocab);
  } catch (error) {
    console.error('Error updating word progress:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
