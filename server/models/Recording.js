const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Recording = sequelize.define('Recording', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subgenre: {
    type: DataTypes.STRING,
    allowNull: true
  },
  artist: {
    type: DataTypes.STRING,
    allowNull: false
  },
  releaseYear: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  publisher: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mediaType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    defaultValue: 'default.jpg'
  }
}, {
  tableName: 'recordings',
  timestamps: true
});

module.exports = Recording;