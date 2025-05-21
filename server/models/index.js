const Recording = require('./Recording');
const Catalog = require('./Catalog');
const { Store, StoreInventory } = require('./Store');
const Order = require('./Order'); // старый Order для магазинов
const User = require('./User');
const UserOrder = require('./UserOrder'); // новый
const OrderItem = require('./OrderItem'); // новый

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