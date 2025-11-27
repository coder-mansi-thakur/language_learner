import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const UserVocabulary = sequelize.define('UserVocabulary', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM('new', 'learning', 'review', 'mastered'),
    defaultValue: 'new',
  },
  strength: {
    type: DataTypes.FLOAT, // 0.0 to 1.0 representing memory strength
    defaultValue: 0.0,
  },
  nextReviewDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastReviewed: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default UserVocabulary;
