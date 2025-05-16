const { sequelize } = require('../config/db');
const { Recording, Catalog, Store, StoreInventory, Order } = require('../models');

// Импортируем данные из текущего сервера
const { recordings, catalog, stores, orders } = require('../data');

const importData = async () => {
  try {
    console.log('🔄 Начало импорта данных...');
    
    // Синхронизация моделей с базой данных (создание таблиц)
    await sequelize.sync({ force: true }); // force: true удалит существующие таблицы
    console.log('✅ Таблицы созданы');
    
    // Импорт записей
    const createdRecordings = await Recording.bulkCreate(
      recordings.map(r => ({
        title: r.title,
        genre: r.genre,
        subgenre: r.subgenre || '',
        artist: r.artist,
        releaseYear: r.releaseYear,
        publisher: r.publisher,
        mediaType: r.mediaType,
        imageUrl: r.imageUrl || 'default.jpg'
      }))
    );
    console.log(`✅ Импортировано ${createdRecordings.length} записей`);
    
    // Создаем соответствие старых и новых ID
    const recordingIdMap = {};
    createdRecordings.forEach((record, index) => {
      recordingIdMap[recordings[index].id] = record.id;
    });
    
    // Импорт каталога
    const catalogItems = await Catalog.bulkCreate(
      catalog.map(c => ({
        recordingId: recordingIdMap[c.recordingId],
        retailPrice: c.retailPrice,
        mediaType: c.mediaType
      }))
    );
    console.log(`✅ Импортировано ${catalogItems.length} записей каталога`);
    
    // Импорт магазинов
    const createdStores = await Store.bulkCreate(
      stores.map(s => ({
        name: s.name,
        address: s.address,
        phone: s.phone
      }))
    );
    console.log(`✅ Импортировано ${createdStores.length} магазинов`);
    
    // Создаем соответствие старых и новых ID для магазинов
    const storeIdMap = {};
    createdStores.forEach((store, index) => {
      storeIdMap[stores[index].id] = store.id;
    });
    
    // Импорт инвентаря магазинов
    const inventoryItems = [];
    stores.forEach(store => {
      store.inventory.forEach(item => {
        inventoryItems.push({
          storeId: storeIdMap[store.id],
          recordingId: recordingIdMap[item.recordingId],
          wholesalePrice: item.wholesalePrice,
          salesCount: item.salesCount,
          inStock: item.inStock
        });
      });
    });
    
    await StoreInventory.bulkCreate(inventoryItems);
    console.log(`✅ Импортировано ${inventoryItems.length} единиц инвентаря`);
    
    // Импорт заказов
    const createdOrders = await Order.bulkCreate(
      orders.map(o => ({
        storeId: storeIdMap[o.storeId],
        recordingId: recordingIdMap[o.recordingId],
        quantity: o.quantity,
        orderDate: new Date(o.orderDate),
        status: o.status
      }))
    );
    console.log(`✅ Импортировано ${createdOrders.length} заказов`);
    
    console.log('✅ Все данные успешно импортированы в базу данных!');
    
  } catch (error) {
    console.error('❌ Ошибка при импорте данных:', error);
  }
};

module.exports = importData;