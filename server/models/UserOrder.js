const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const UserOrder = sequelize.define('UserOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('pending', 'completed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
  tableName: 'user_orders',
  timestamps: true
});

module.exports = UserOrder;