const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Recording = require('./Recording');
const { Store } = require('./Store');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false, // или true, если разрешаете NULL
    references: {
      model: 'stores',
      key: 'id'
    }
  },
  recordingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Recording,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  tableName: 'orders',
  timestamps: true
});

Order.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
Order.belongsTo(Recording, { foreignKey: 'recordingId', as: 'recording' });

module.exports = Order;