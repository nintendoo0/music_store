const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Recording = require('./Recording');
const Catalog = require('./Catalog');
const { Store, StoreInventory } = require('./Store');
const User = require('./User');
const UserOrder = require('./UserOrder');
const Group = require('./Group');

// Ассоциация: Order -> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Ассоциация: UserOrder -> OrderItem
UserOrder.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
OrderItem.belongsTo(UserOrder, { foreignKey: 'orderId' });

// Ассоциация: OrderItem -> Recording
OrderItem.belongsTo(Recording, { foreignKey: 'recordingId' });
Recording.hasMany(OrderItem, { foreignKey: 'recordingId' });

// Ассоциация: Group <-> Recording (многие-ко-многим через group_recordings)
Group.belongsToMany(Recording, {
  through: 'group_recordings',
  foreignKey: 'group_id',
  otherKey: 'recording_id',
  as: 'recordings'
});
Recording.belongsToMany(Group, {
  through: 'group_recordings',
  foreignKey: 'recording_id',
  otherKey: 'group_id',
  as: 'groups'
});

module.exports = {
  Recording,
  Catalog,
  Store,
  StoreInventory,
  Order,
  User,
  UserOrder,
  OrderItem,
  Group
};