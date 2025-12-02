import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Sentence = sequelize.define('Sentence', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  originalSentence: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  translatedSentence: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
  },
  tense: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  languageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

export default Sentence;
