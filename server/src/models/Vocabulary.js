import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Vocabulary = sequelize.define('Vocabulary', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  word: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  translation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pronunciation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  exampleSentence: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  exampleTranslation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  difficultyLevel: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  languageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Languages',
      key: 'id',
    },
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['word', 'languageId', 'createdBy']
    }
  ]
});

export default Vocabulary;
