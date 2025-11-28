import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Habit = sequelize.define('Habit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  frequency: {
    type: DataTypes.ENUM('daily', 'weekly'),
    defaultValue: 'daily',
  },
  targetCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // e.g. 1 time per day
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#4F46E5', // Default indigo
  },
}, {
  timestamps: true,
});

export default Habit;
