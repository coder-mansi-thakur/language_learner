import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const UserLanguage = sequelize.define('UserLanguage', {
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
  languageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Languages',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('learning', 'interested'),
    defaultValue: 'learning',
  },
  proficiency: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
});

export default UserLanguage;
