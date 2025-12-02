import { Habit, HabitLog, User } from '../models/associations.js';
import { Op } from 'sequelize';

export const getHabits = async (req, res) => {
  const { firebaseUid } = req.params;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const habits = await Habit.findAll({
      where: { userId: user.id },
      include: [{
        model: HabitLog,
        required: false,
        // Limit logs if necessary, e.g., last 30 days
        // where: { date: { [Op.gte]: thirtyDaysAgo } }
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createHabit = async (req, res) => {
  const { firebaseUid } = req.params;
  const { name, description, frequency, targetCount, color } = req.body;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const habit = await Habit.create({
      userId: user.id,
      name,
      description,
      frequency,
      targetCount,
      color
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateHabit = async (req, res) => {
  const { firebaseUid, habitId } = req.params;
  const { name, description, frequency, targetCount, color } = req.body;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const habit = await Habit.findOne({ where: { id: habitId, userId: user.id } });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    habit.name = name || habit.name;
    habit.description = description !== undefined ? description : habit.description;
    habit.frequency = frequency || habit.frequency;
    habit.targetCount = targetCount || habit.targetCount;
    habit.color = color || habit.color;

    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteHabit = async (req, res) => {
  const { firebaseUid, habitId } = req.params;

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const habit = await Habit.findOne({ where: { id: habitId, userId: user.id } });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    await habit.destroy();
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const toggleHabitLog = async (req, res) => {
  const { firebaseUid, habitId } = req.params;
  const { date, imageUrl } = req.body; // Expect YYYY-MM-DD

  try {
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const habit = await Habit.findOne({ where: { id: habitId, userId: user.id } });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const existingLog = await HabitLog.findOne({
      where: {
        habitId: habit.id,
        date: date
      }
    });

    if (existingLog) {
      // If imageUrl is provided, update the log instead of destroying it
      if (imageUrl) {
        existingLog.imageUrl = imageUrl;
        await existingLog.save();
        res.json({ message: 'Habit updated', completed: true, log: existingLog });
      } else {
        await existingLog.destroy();
        res.json({ message: 'Habit uncompleted', completed: false });
      }
    } else {
      const newLog = await HabitLog.create({
        habitId: habit.id,
        date: date,
        completed: true,
        imageUrl: imageUrl || null
      });
      res.json({ message: 'Habit completed', completed: true, log: newLog });
    }
  } catch (error) {
    console.error('Error toggling habit log:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
