const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Recording = require('./Recording');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'stores',
  timestamps: true
});

// Изменяем определение модели StoreInventory для правильных связей
const StoreInventory = sequelize.define('StoreInventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Store,
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
  wholesalePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  salesCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  inStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'store_inventory',
  timestamps: true
});

// Добавляем прямые ассоциации для StoreInventory
StoreInventory.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
StoreInventory.belongsTo(Recording, { foreignKey: 'recordingId', as: 'recording' });

// Связи для Store и Recording оставляем как есть
Store.belongsToMany(Recording, { 
  through: StoreInventory, 
  foreignKey: 'storeId', 
  otherKey: 'recordingId', 
  as: 'inventory' 
});

Recording.belongsToMany(Store, { 
  through: StoreInventory, 
  foreignKey: 'recordingId', 
  otherKey: 'storeId', 
  as: 'stores' 
});

module.exports = { Store, StoreInventory };