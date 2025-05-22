const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Recording = require('./Recording');
const Catalog = require('./Catalog');
const { Store, StoreInventory } = require('./Store');
const User = require('./User');
const UserOrder = require('./UserOrder');

// Ассоциация: Order -> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Ассоциация: UserOrder -> OrderItem
UserOrder.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
OrderItem.belongsTo(UserOrder, { foreignKey: 'orderId' });

// Ассоциация: OrderItem -> Recording
OrderItem.belongsTo(Recording, { foreignKey: 'recordingId' });
Recording.hasMany(OrderItem, { foreignKey: 'recordingId' });

module.exports = {
  Recording,
  Catalog,
  Store,
  StoreInventory,
  Order,
  User,
  UserOrder,
  OrderItem
};