import User from '../models/User.js';

export const syncUser = async (req, res) => {
  const { email, firebaseUid, displayName, photoURL } = req.body;

  try {
    let user = await User.findOne({ where: { email } });

    if (user) {
      // Update existing user with firebaseUid if not present
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
      return res.json(user);
    }

    // Create new user
    user = await User.create({
      email,
      firebaseUid,
      username: displayName || email.split('@')[0], // Fallback username
      // photoURL could be added to model if needed
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
