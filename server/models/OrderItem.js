const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const UserOrder = require('./UserOrder');
const Recording = require('./Recording');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false, references: { model: UserOrder, key: 'id' } },
  recordingId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Recording, key: 'id' } },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
  tableName: 'order_items',
  timestamps: true
});

module.exports = OrderItem;