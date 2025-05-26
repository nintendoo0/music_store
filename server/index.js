const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const { sequelize, syncModels } = require('./config/db');
const { Recording, Catalog, Store, StoreInventory, Order, User, UserOrder, OrderItem, Group } = require('./models');
const importData = require('./migrations/importData');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/stores');
const groupRoutes = require('./routes/groups');
const { auth, adminAuth } = require('./middleware/auth');
require('dotenv').config();

// Создание экземпляра приложения
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// Папка для статических файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Создание директории uploads, если она не существует
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка хранилища для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Ограничение 5MB
  fileFilter: function (req, file, cb) {
    // Проверяем тип файла
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Допускаются только изображения форматов .jpg, .jpeg, .png и .gif!'));
  }
});

// МАРШРУТЫ API

// API для получения всех записей с возможностью фильтрации по жанру
app.get('/api/recordings', async (req, res) => {
  try {
    const [recordings] = await sequelize.query(
      `SELECT id, title, artist, "imageUrl", genre FROM recordings ORDER BY title`
    );
    res.json({ recordings });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Важно: разместите этот маршрут ПЕРЕД маршрутом, который обрабатывает /api/recordings/:id

const { Op } = require('sequelize');  // Добавьте этот импорт, если его еще нет

// Добавьте новый маршрут для получения списка уникальных жанров
// ВАЖНО: разместите этот маршрут ПЕРЕД маршрутом /api/recordings/:id
app.get('/api/genres', async (req, res) => {
  try {
    // Используем raw query для получения уникальных жанров
    const [genres] = await sequelize.query(`
      SELECT DISTINCT genre FROM recordings 
      WHERE genre IS NOT NULL AND genre != ''
      ORDER BY genre ASC
    `);
    
    res.json(genres.map(g => g.genre));
  } catch (error) {
    console.error('Ошибка при получении списка жанров:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Сначала бестселлеры!
app.get('/api/recordings/bestsellers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const results = await sequelize.query(`
      SELECT 
        r.id as "recordingId",
        r.title,
        r.artist,
        r.genre,
        COALESCE(SUM(CAST(oi.quantity AS INTEGER)), 0) as "totalSales"
      FROM recordings r
      JOIN order_items oi ON r.id = oi."recordingId"
      GROUP BY r.id, r.title, r.artist, r.genre
      ORDER BY "totalSales" DESC
      LIMIT :limit
    `, { replacements: { limit }, type: sequelize.QueryTypes.SELECT });

    res.json({ bestsellers: results });
  } catch (error) {
    console.error('Ошибка при получении бестселлеров:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Потом запись по id!
app.get('/api/recordings/:id', async (req, res) => {
  try {
    const recordingId = req.params.id;
    
    // Получаем запись с учётом возможного отсутствия
    const recording = await Recording.findByPk(recordingId);
    
    if (!recording) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    
    // Получаем данные из каталога
    const catalogItem = await Catalog.findOne({
      where: { recordingId: recordingId }
    });
    
    // Получаем информацию о наличии в магазинах
    const storeInventory = await StoreInventory.findAll({
      where: { recordingId: recordingId },
      include: [
        {
          model: Store,
          as: 'store'
        }
      ]
    });
    
    // Формируем полный объект с информацией
    const result = {
      ...recording.toJSON(),
      catalogInfo: catalogItem ? catalogItem.toJSON() : null,
      availability: storeInventory.map(item => ({
        storeId: item.storeId,
        storeName: item.store ? item.store.name : 'Неизвестный магазин',
        wholesalePrice: item.wholesalePrice,
        retailPrice: catalogItem ? catalogItem.retailPrice : null,
        inStock: item.inStock,
        salesCount: item.salesCount
      }))
    };
    
    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении записи:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при получении данных о записи', 
      error: error.message 
    });
  }
});

// API для получения данных каталога произведений
app.get('/api/catalog', async (req, res) => {
  try {
    const catalogItems = await Catalog.findAll({
      include: [{
        model: Recording,
        as: 'recording',
        attributes: ['id', 'title', 'artist', 'genre', 'releaseYear', 'publisher', 'mediaType', 'imageUrl']
      }],
      order: [
        [sequelize.literal('"recording"."title"'), 'ASC']
      ]
    });
    
    res.json(catalogItems);
  } catch (error) {
    console.error('Ошибка при получении каталога:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// 3. Сведения о магазинах
app.get('/api/stores', async (req, res) => {
  try {
    const stores = await Store.findAll();
    res.json(stores);
  } catch (error) {
    console.error('Ошибка при получении магазинов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Исправленный маршрут для получения детальной информации о магазине
app.get('/api/stores/:id', async (req, res) => {
  try {
    const storeId = req.params.id;
    const store = await Store.findByPk(storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Магазин не найден' });
    }

    // Получаем инвентарь магазина
    const storeInventory = await StoreInventory.findAll({
      where: { storeId },
      include: [
        {
          model: Recording,
          as: 'recording',
          attributes: ['id', 'title', 'artist', 'genre', 'mediaType', 'imageUrl']
        }
      ]
    });

    // Форматируем данные для клиента
    const inventory = await Promise.all(storeInventory.map(async (item) => {
      // Получаем розничную цену из каталога
      const catalogItem = await Catalog.findOne({
        where: { recordingId: item.recordingId }
      });

      // Считаем реальные продажи по order_items для этого магазина и записи
      const [result] = await sequelize.query(
        `SELECT SUM(oi.quantity) as sum
         FROM order_items oi
         JOIN user_orders uo ON oi."orderId" = uo.id
         WHERE oi."recordingId" = :recordingId AND uo."storeId" = :storeId`,
        { replacements: { recordingId: item.recordingId, storeId }, type: sequelize.QueryTypes.SELECT }
      );

      const sales = result.sum || 0;

      return {
        recordingId: item.recordingId,
        wholesalePrice: item.wholesalePrice,
        retailPrice: catalogItem ? catalogItem.retailPrice : null,
        salesCount: sales, // теперь salesCount — это реальные продажи!
        inStock: item.inStock,
        recording: item.recording
      };
    }));

    res.json({
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      inventory // Форматированный инвентарь
    });
  } catch (error) {
    console.error('Ошибка при получении магазина:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// ЗАПРОСЫ СОГЛАСНО ЗАДАНИЮ

// 1. Получение перечня всех записей заданного жанра
app.get('/api/recordings/genre/:genre', async (req, res) => {
  try {
    const genre = req.params.genre;
    const filteredRecordings = await Recording.findAll({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('genre')),
        'LIKE',
        `%${genre.toLowerCase()}%`
      )
    });

    if (filteredRecordings.length === 0) {
      return res.json({ message: `Записей жанра "${genre}" не найдено`, recordings: [] });
    }

    res.json({
      genre,
      count: filteredRecordings.length,
      recordings: filteredRecordings
    });
  } catch (error) {
    console.error('Ошибка при фильтрации по жанру:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновленный маршрут для добавления новой записи
app.post('/api/recordings', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Извлекаем данные о записи и инвентаре из запроса
    const { 
      title, artist, genre, subgenre, releaseYear, publisher, 
      mediaType, retailPrice, imageUrl, inventory 
    } = req.body;

    // 1. Создаем новую запись
    const newRecording = await Recording.create({
      title,
      genre,
      subgenre: subgenre || "",
      artist,
      releaseYear,
      publisher,
      mediaType,
      imageUrl: imageUrl || "default.jpg"
    }, { transaction });

    // 2. Добавляем запись в каталог
    const newCatalogItem = await Catalog.create({
      recordingId: newRecording.id,
      retailPrice: retailPrice || 0,
      mediaType
    }, { transaction });

    // 3. Добавляем запись в инвентарь выбранных магазинов (если указаны)
    let inventoryItems = [];
    
    if (inventory && inventory.length > 0) {
      // Используем данные из запроса
      for (const item of inventory) {
        const storeInventoryItem = await StoreInventory.create({
          storeId: item.storeId,
          recordingId: newRecording.id,
          wholesalePrice: item.wholesalePrice || retailPrice * 0.7,
          inStock: item.inStock || 0,
          salesCount: 0
        }, { transaction });
        
        inventoryItems.push(storeInventoryItem);
      }
    } else {
      // Если не указаны магазины, добавляем запись в первый магазин с нулевым количеством
      // (для обратной совместимости)
      const firstStore = await Store.findOne();
      if (firstStore) {
        const storeInventoryItem = await StoreInventory.create({
          storeId: firstStore.id,
          recordingId: newRecording.id,
          wholesalePrice: retailPrice * 0.7,
          inStock: 0,
          salesCount: 0
        }, { transaction });
        
        inventoryItems.push(storeInventoryItem);
      }
    }

    await transaction.commit();

    res.status(201).json({
      message: 'Запись успешно добавлена',
      recording: newRecording,
      catalogItem: newCatalogItem,
      inventoryItems
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Ошибка при добавлении записи:', error);
    res.status(400).json({ 
      message: 'Ошибка при добавлении записи', 
      error: error.message 
    });
  }
});

// Добавьте новый маршрут для обновления записи:

app.put('/api/recordings/:id', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const recordingId = req.params.id;
    
    // Проверяем, существует ли запись
    const recording = await Recording.findByPk(recordingId);
    if (!recording) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    
    // Извлекаем данные из запроса
    const { 
      title, artist, genre, subgenre, releaseYear, publisher, 
      mediaType, retailPrice, imageUrl, inventory 
    } = req.body;

    // 1. Обновляем запись
    await recording.update({
      title,
      genre,
      subgenre: subgenre || "",
      artist,
      releaseYear,
      publisher,
      mediaType,
      imageUrl: imageUrl || recording.imageUrl
    }, { transaction });

    // 2. Обновляем каталог
    const catalogItem = await Catalog.findOne({ where: { recordingId } });
    if (catalogItem) {
      await catalogItem.update({
        retailPrice: retailPrice || catalogItem.retailPrice,
        mediaType
      }, { transaction });
    } else {
      // Если записи в каталоге нет, создаем ее
      await Catalog.create({
        recordingId,
        retailPrice: retailPrice || 0,
        mediaType
      }, { transaction });
    }

    // 3. Обновляем инвентарь магазинов (если указан)
    if (inventory && inventory.length > 0) {
      // Получаем существующие записи инвентаря для этой записи
      const existingInventory = await StoreInventory.findAll({
        where: { recordingId }
      });
      
      // Создаем карту существующего инвентаря для быстрого поиска
      const inventoryMap = {};
      existingInventory.forEach(item => {
        inventoryMap[item.storeId] = item;
      });
      
      // Обновляем или создаем записи в инвентаре
      for (const item of inventory) {
        if (inventoryMap[item.storeId]) {
          // Обновляем существующую запись
          await inventoryMap[item.storeId].update({
            wholesalePrice: item.wholesalePrice,
            inStock: item.inStock
          }, { transaction });
        } else {
          // Создаем новую запись
          await StoreInventory.create({
            storeId: item.storeId,
            recordingId,
            wholesalePrice: item.wholesalePrice || 0,
            inStock: item.inStock || 0,
            salesCount: 0
          }, { transaction });
        }
      }
      
      // Удаляем записи, которых нет в новом списке инвентаря
      const newStoreIds = inventory.map(item => item.storeId);
      for (const existingItem of existingInventory) {
        if (!newStoreIds.includes(existingItem.storeId)) {
          await existingItem.destroy({ transaction });
        }
      }
    }

    await transaction.commit();

    res.json({
      message: 'Запись успешно обновлена',
      recording: recording.toJSON()
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Ошибка при обновлении записи:', error);
    res.status(400).json({ 
      message: 'Ошибка при обновлении записи', 
      error: error.message 
    });
  }
});

// Удаление записи
app.delete('/api/recordings/:id', async (req, res) => {
  try {
    const recordingId = req.params.id;
    const recording = await Recording.findByPk(recordingId);
    
    if (!recording) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    
    // Удаляем связанные записи из каталога
    await Catalog.destroy({
      where: { recordingId }
    });
    
    // Удаляем из инвентаря магазинов
    await StoreInventory.destroy({
      where: { recordingId }
    });
    
    // Удаляем связанные заказы
    await Order.destroy({
      where: { recordingId }
    });
    
    // Удаляем саму запись
    await recording.destroy();
    
    res.json({
      message: 'Запись успешно удалена',
      removedRecording: recording
    });
  } catch (error) {
    console.error('Ошибка при удалении записи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Маршрут для загрузки изображений
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл не был загружен!' });
  }
  res.json({ 
    success: true, 
    message: 'Файл успешно загружен!',
    fileName: req.file.filename 
  });
});

// Маршрут для создания нового магазина
app.post('/api/stores', async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    
    // Проверка обязательных полей
    if (!name || !address || !phone) {
      return res.status(400).json({ 
        message: 'Необходимо указать название, адрес и телефон магазина' 
      });
    }
    
    // Создание нового магазина
    const newStore = await Store.create({
      name,
      address,
      phone
    });
    
    res.status(201).json({
      message: 'Магазин успешно создан',
      id: newStore.id,
      ...newStore.toJSON()
    });
  } catch (error) {
    console.error('Ошибка при создании магазина:', error);
    res.status(400).json({ 
      message: 'Ошибка при создании магазина', 
      error: error.message 
    });
  }
});

// Добавьте маршруты авторизации
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/groups', groupRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.send('API магазина музыкальных записей работает!');
});

// Определение порта
const PORT = process.env.PORT || 5000;

// Функция для запуска сервера
const startServer = async () => {
  try {
    // Тестируем подключение к БД
    await sequelize.authenticate();
    
    // Синхронизируем модели с базой данных
    await syncModels();
    
    // Если в БД нет данных, импортируем их
    const recordingsCount = await Recording.count();
    if (recordingsCount === 0) {
      await importData();
    }
    
    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`Перейдите по адресу: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
  }
};

// Запуск сервера
startServer();

app.post('/api/orders', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { items, storeId } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста' });
    }
    if (!storeId) {
      return res.status(400).json({ message: 'Не выбран магазин' });
    }
    // 1. Создаём заказ пользователя
    const order = await UserOrder.create({
      userId,
      storeId, // обязательно!
      date: new Date(),
      status: 'pending',
      totalAmount: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    }, { transaction });

    // 2. Для каждой позиции создаём OrderItem и уменьшаем остаток в магазине
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        recordingId: item.recordingId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }, { transaction });

      // Уменьшаем остаток в магазине
      const inventory = await StoreInventory.findOne({
        where: { storeId, recordingId: item.recordingId }
      });
      if (inventory) {
        inventory.inStock = Math.max(0, inventory.inStock - item.quantity);
        await inventory.save({ transaction });
      }
    }

    await transaction.commit();
    res.status(201).json({ message: 'Заказ оформлен', orderId: order.id });
  } catch (error) {
    await transaction.rollback();
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/api/store-inventory', async (req, res) => {
  const { storeId, recordingIds } = req.body;
  if (!storeId || !Array.isArray(recordingIds)) {
    return res.status(400).json({ message: 'Некорректные параметры' });
  }
  const inventory = await StoreInventory.findAll({
    where: {
      storeId,
      recordingId: recordingIds
    }
  });
  res.json(
    recordingIds.map(id => {
      const found = inventory.find(i => i.recordingId === id);
      return {
        recordingId: id,
        inStock: found ? found.inStock : 0
      };
    })
  );
});

app.get('/api/my-orders', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await UserOrder.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'OrderItems', // <-- обязательно!
          include: [
            {
              model: Recording,
              attributes: ['title']
            }
          ],
          attributes: ['id', 'quantity', 'recordingId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await UserOrder.findAll({
      where: { userId: req.user.id }, // если есть авторизация
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Recording,
              attributes: ['title']
            }
          ],
          attributes: ['quantity']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Пример для Sequelize:
app.get('/api/store-inventory/:id', async (req, res) => {
  try {
    const inventory = await StoreInventory.findAll({
      where: { storeId: req.params.id },
      include: [
        {
          model: Recording,
          attributes: ['title', 'artist', 'mediaType', 'retailPrice']
        }
      ]
    });

    const inventoryWithSales = await Promise.all(
      inventory.map(async item => {
        // Считаем продажи по order_items для этого магазина и записи
        const sales = await OrderItem.sum('quantity', {
          include: [{
            model: UserOrder, // или Order, если используете другую модель
            where: { storeId: req.params.id }
          }],
          where: { recordingId: item.recordingId }
        });
        return {
          ...item.toJSON(),
          sold: sales || 0
        };
      })
    );

    res.json(inventoryWithSales);
  } catch (error) {
    console.error('Ошибка при получении инвентаря магазина:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/admin/reports/sales', auth, adminAuth, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    let dateFilter = '';
    let replacements = { dateFrom, dateTo };

    if (dateFrom && dateTo) {
      // Прибавляем 1 день к конечной дате
      const dateToPlus1 = new Date(dateTo);
      dateToPlus1.setDate(dateToPlus1.getDate() + 1);
      replacements.dateToPlus1 = dateToPlus1.toISOString().slice(0, 10);
      dateFilter = `AND uo."date" >= :dateFrom AND uo."date" < :dateToPlus1`;
    } else if (dateFrom) {
      dateFilter = `AND uo."date" >= :dateFrom`;
    } else if (dateTo) {
      const dateToPlus1 = new Date(dateTo);
      dateToPlus1.setDate(dateToPlus1.getDate() + 1);
      replacements.dateToPlus1 = dateToPlus1.toISOString().slice(0, 10);
      dateFilter = `AND uo."date" < :dateToPlus1`;
    }

    const results = await sequelize.query(`
      SELECT 
        r.id as "recordingId",
        r.title,
        r.artist,
        r.genre,
        COALESCE(SUM(CAST(oi.quantity AS INTEGER)), 0) as "totalSales",
        COALESCE(SUM(CAST(oi.quantity AS INTEGER) * CAST(oi."unitPrice" AS NUMERIC)), 0) as "totalRevenue"
      FROM recordings r
      JOIN order_items oi ON r.id = oi."recordingId"
      JOIN user_orders uo ON oi."orderId" = uo.id
      WHERE 1=1
      ${dateFilter}
      GROUP BY r.id, r.title, r.artist, r.genre
      ORDER BY "totalSales" DESC
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Общая сумма по всем записям
    const totalRevenue = results.reduce((sum, rec) => sum + Number(rec.totalRevenue), 0);

    res.json({ sales: results, totalRevenue });
  } catch (error) {
    console.error('Ошибка при получении отчёта о продажах:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/artists/bestselling', async (req, res) => {
  try {
    const results = await sequelize.query(`
      SELECT 
        r.artist,
        COALESCE(SUM(CAST(oi.quantity AS INTEGER)), 0) as "totalSales"
      FROM recordings r
      JOIN order_items oi ON r.id = oi."recordingId"
      GROUP BY r.artist
      ORDER BY "totalSales" DESC
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({ artists: results });
  } catch (error) {
    console.error('Ошибка при получении рейтинга исполнителей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Маршрут для отсутствующих записей в магазинах (только для администратора)
app.get('/api/out-of-stock', auth, adminAuth, async (req, res) => {
  try {
    const results = await sequelize.query(`
      SELECT 
        s.id as "storeId",
        s.name as "storeName",
        r.id as "recordingId",
        r.title,
        r.artist,
        si."inStock"
      FROM stores s
      JOIN store_inventory si ON s.id = si."storeId"
      JOIN recordings r ON si."recordingId" = r.id
      WHERE si."inStock" = 0
      ORDER BY s.name, r.title
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({ outOfStock: results });
  } catch (error) {
    console.error('Ошибка при получении отсутствующих записей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/analysis/max-margin', auth, adminAuth, async (req, res) => {
  try {
    // Запрос для максимальной маржи
    const [result] = await sequelize.query(`
      SELECT
        r.id as "recordingId",
        r.title,
        r.artist,
        r.genre,
        c."retailPrice",
        si."wholesalePrice",
        (c."retailPrice" - si."wholesalePrice") as margin,
        s.id as "storeId",
        s.name as "storeName"
      FROM recordings r
      JOIN catalog c ON r.id = c."recordingId"
      JOIN (
        SELECT "recordingId", MIN("wholesalePrice") as minWholesale
        FROM store_inventory
        GROUP BY "recordingId"
      ) min_si ON r.id = min_si."recordingId"
      JOIN store_inventory si ON si."recordingId" = min_si."recordingId" AND si."wholesalePrice" = min_si.minWholesale
      JOIN stores s ON si."storeId" = s.id
      WHERE c."retailPrice" IS NOT NULL AND si."wholesalePrice" IS NOT NULL
      ORDER BY margin DESC
      LIMIT 1
    `, { type: sequelize.QueryTypes.SELECT });

    // Запрос для средней маржи по всем записям
    const [avg] = await sequelize.query(`
      SELECT AVG(margin) as "avgMargin" FROM (
        SELECT 
          c."retailPrice" - si."wholesalePrice" as margin
        FROM recordings r
        JOIN catalog c ON r.id = c."recordingId"
        JOIN (
          SELECT "recordingId", MIN("wholesalePrice") as minWholesale
          FROM store_inventory
          GROUP BY "recordingId"
        ) min_si ON r.id = min_si."recordingId"
        JOIN store_inventory si ON si."recordingId" = min_si."recordingId" AND si."wholesalePrice" = min_si.minWholesale
        WHERE c."retailPrice" IS NOT NULL AND si."wholesalePrice" IS NOT NULL
      ) t
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({ maxMargin: result, avgMargin: avg.avgMargin });
  } catch (error) {
    console.error('Ошибка при анализе маржи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавить песню в группу
app.post('/api/groups/:groupId/recordings', auth, adminAuth, async (req, res) => {
  const { groupId } = req.params;
  const { recordingId } = req.body;
  try {
    await sequelize.query(
      `INSERT INTO group_recordings (group_id, recording_id) VALUES (:groupId, :recordingId) ON CONFLICT DO NOTHING`,
      { replacements: { groupId, recordingId } }
    );
    res.json({ message: 'Песня добавлена в группу' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить песню из группы
app.delete('/api/groups/:groupId/recordings/:recordingId', auth, adminAuth, async (req, res) => {
  const { groupId, recordingId } = req.params;
  try {
    await sequelize.query(
      `DELETE FROM group_recordings WHERE group_id = :groupId AND recording_id = :recordingId`,
      { replacements: { groupId, recordingId } }
    );
    res.json({ message: 'Песня удалена из группы' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание группы
app.post('/api/groups', auth, adminAuth, async (req, res) => {
  const { name, description } = req.body;
  try {
    const [group] = await sequelize.query(
      `INSERT INTO groups (name, description) VALUES (:name, :description) RETURNING *`,
      { replacements: { name, description }, type: sequelize.QueryTypes.INSERT }
    );
    res.json({ group: group[0] });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/groups', auth, adminAuth, async (req, res) => {
  try {
    const [groups] = await sequelize.query(
      `SELECT id, name, description FROM groups ORDER BY name`
    );
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить список песен в группе
app.get('/api/groups/:groupId/recordings', auth, adminAuth, async (req, res) => {
  const { groupId } = req.params;
  try {
    const [recordings] = await sequelize.query(
      `SELECT r.id, r.title, r.artist
       FROM group_recordings gr
       JOIN recordings r ON gr.recording_id = r.id
       WHERE gr.group_id = :groupId`,
      { replacements: { groupId } }
    );
    res.json({ recordings });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});