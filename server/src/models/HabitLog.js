import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const HabitLog = sequelize.define('HabitLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  habitId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Habits',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['habitId', 'date'],
    },
  ],
});

export default HabitLog;
