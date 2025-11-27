import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Language = sequelize.define('Language', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  flag: {
    type: DataTypes.STRING, // Emoji or URL
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default Language;
