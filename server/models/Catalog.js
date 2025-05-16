const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Recording = require('./Recording');

const Catalog = sequelize.define('Catalog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recordingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Recording,
      key: 'id'
    }
  },
  retailPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  mediaType: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'catalog',
  timestamps: true
});

Catalog.belongsTo(Recording, { foreignKey: 'recordingId', as: 'recording' });

module.exports = Catalog;