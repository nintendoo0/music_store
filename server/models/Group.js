const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Group = sequelize.define('Group', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
});

module.exports = Group;