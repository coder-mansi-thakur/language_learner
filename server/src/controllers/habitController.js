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
  const { date } = req.body; // Expect YYYY-MM-DD

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
      await existingLog.destroy();
      res.json({ message: 'Habit uncompleted', completed: false });
    } else {
      await HabitLog.create({
        habitId: habit.id,
        date: date,
        completed: true
      });
      res.json({ message: 'Habit completed', completed: true });
    }
  } catch (error) {
    console.error('Error toggling habit log:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
