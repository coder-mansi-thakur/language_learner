import User from '../models/User.js';
import Language from '../models/Language.js';
import UserLanguage from '../models/UserLanguage.js';

export const syncUser = async (req, res) => {
  const { email, firebaseUid, displayName, photoURL } = req.body;

  try {
    let user = await User.findOne({ where: { firebaseUid } });

    if (user) {
      user.email = email;
      user.displayName = displayName;
      user.photoURL = photoURL;
      await user.save();
      return res.json(user);
    }

    user = await User.create({
      email,
      firebaseUid,
      displayName,
      photoURL,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getUserProfile = async (req, res) => {
  const { firebaseUid } = req.params;

  try {
    const user = await User.findOne({
      where: { firebaseUid },
      include: [
        {
          model: Language,
          through: {
            attributes: ['status', 'proficiency', 'xp'],
          },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const startLearning = async (req, res) => {
  const { firebaseUid } = req.params;
  const { languageId } = req.body;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [userLanguage, created] = await UserLanguage.findOrCreate({
      where: {
        userId: user.id,
        languageId: languageId
      },
      defaults: {
        status: 'learning',
        proficiency: 'beginner',
        xp: 0
      }
    });

    if (!created) {
        userLanguage.status = 'learning';
        await userLanguage.save();
    }

    res.json(userLanguage);
  } catch (error) {
    console.error('Error starting learning:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
