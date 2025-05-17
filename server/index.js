const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const { sequelize, syncModels } = require('./config/db');
const { Recording, Catalog, Store, StoreInventory, Order, User } = require('./models');
const importData = require('./migrations/importData');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/stores');
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

// 1. Сведения о записях
app.get('/api/recordings', async (req, res) => {
  try {
    const recordings = await Recording.findAll();
    res.json(recordings);
  } catch (error) {
    console.error('Ошибка при получении записей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Исправленный маршрут для получения деталей о записи
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

// 2. Сведения о произведениях (каталог)
app.get('/api/catalog', async (req, res) => {
  try {
    const catalogItems = await Catalog.findAll({
      include: [{
        model: Recording,
        as: 'recording'
      }]
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

      return {
        recordingId: item.recordingId,
        wholesalePrice: item.wholesalePrice,
        retailPrice: catalogItem ? catalogItem.retailPrice : null,
        salesCount: item.salesCount,
        inStock: item.inStock,
        recording: item.recording // Добавляем данные о записи
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

// 2. Получение списка самых продаваемых записей
app.get('/api/recordings/bestsellers', async (req, res) => {
  try {
    // Используем SQL запрос для агрегации данных о продажах
    const [results] = await sequelize.query(`
      SELECT 
        r.id as "recordingId",
        r.title,
        r.artist,
        r.genre,
        SUM(si."salesCount") as "totalSales"
      FROM store_inventory si
      JOIN recordings r ON si."recordingId" = r.id
      GROUP BY r.id, r.title, r.artist, r.genre
      ORDER BY "totalSales" DESC
    `);

    res.json({
      bestsellers: results
    });
  } catch (error) {
    console.error('Ошибка при получении бестселлеров:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// 3. Исполнитель самых продаваемых произведений
app.get('/api/artists/bestselling', async (req, res) => {
  try {
    // Используем SQL запрос для агрегации данных о продажах по артистам
    const [artistSales] = await sequelize.query(`
      SELECT 
        r.artist,
        SUM(si."salesCount") as "totalSales"
      FROM store_inventory si
      JOIN recordings r ON si."recordingId" = r.id
      GROUP BY r.artist
      ORDER BY "totalSales" DESC
    `);

    const bestArtist = artistSales.length > 0 ? artistSales[0] : null;

    if (bestArtist) {
      // Получаем все записи лучшего артиста
      const artistRecordings = await Recording.findAll({
        where: { artist: bestArtist.artist }
      });

      bestArtist.recordings = artistRecordings;
    }

    res.json({
      bestsellingArtist: bestArtist,
      allArtistsBySales: artistSales
    });
  } catch (error) {
    console.error('Ошибка при получении лучшего исполнителя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// 4. Перечень отсутствующих в магазине записей
app.get('/api/stores/:storeId/out-of-stock', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const store = await Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({ message: 'Магазин не найден' });
    }

    // Находим записи с нулевым наличием
    const outOfStockItems = await StoreInventory.findAll({
      where: {
        storeId: storeId,
        inStock: 0
      },
      include: [{
        model: Recording,
        as: 'recording'
      }]
    });

    // Форматируем результат
    const formattedOutOfStock = outOfStockItems.map(item => ({
      recordingId: item.recordingId,
      title: item.recording.title,
      artist: item.recording.artist,
      genre: item.recording.genre,
      salesCount: item.salesCount
    }));

    // Находим записи, которых вообще нет в инвентаре этого магазина
    const storeInventoryIds = await StoreInventory.findAll({
      attributes: ['recordingId'],
      where: { storeId: storeId }
    }).then(items => items.map(item => item.recordingId));

    const missingRecordings = await Recording.findAll({
      where: {
        id: {
          [sequelize.Op.notIn]: storeInventoryIds
        }
      }
    });

    const formattedMissing = missingRecordings.map(recording => ({
      recordingId: recording.id,
      title: recording.title,
      artist: recording.artist,
      genre: recording.genre,
      status: 'missing'
    }));

    res.json({
      storeId,
      storeName: store.name,
      outOfStock: formattedOutOfStock,
      missingCompletely: formattedMissing,
      allUnavailable: [...formattedOutOfStock, ...formattedMissing]
    });
  } catch (error) {
    console.error('Ошибка при получении отсутствующих записей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// 5. Стоимость всех проданных записей
app.get('/api/stores/:storeId/total-sales', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const store = await Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({ message: 'Магазин не найден' });
    }

    // Получаем инвентарь с деталями записей
    const inventory = await StoreInventory.findAll({
      where: { storeId },
      include: [{
        model: Recording,
        as: 'recording'
      }]
    });

    let totalRetailSales = 0;
    let totalWholesaleSales = 0;
    let totalProfit = 0;
    
    // Получаем детали продаж
    const salesDetails = await Promise.all(inventory.map(async (item) => {
      const catalogItem = await Catalog.findOne({
        where: { recordingId: item.recordingId }
      });
      
      const retailPrice = catalogItem ? catalogItem.retailPrice : 0;
      const retailSales = item.salesCount * retailPrice;
      const wholesaleSales = item.salesCount * item.wholesalePrice;
      const profit = retailSales - wholesaleSales;
      
      totalRetailSales += retailSales;
      totalWholesaleSales += wholesaleSales;
      totalProfit += profit;
      
      return {
        recordingId: item.recordingId,
        title: item.recording.title,
        artist: item.recording.artist,
        salesCount: item.salesCount,
        retailPrice,
        wholesalePrice: item.wholesalePrice,
        retailSales,
        wholesaleSales,
        profit
      };
    }));
    
    res.json({
      storeId,
      storeName: store.name,
      totalRetailSales,
      totalWholesaleSales,
      totalProfit,
      salesDetails
    });
  } catch (error) {
    console.error('Ошибка при подсчете стоимости продаж:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// 6. Запись с максимальной разницей между розничной и оптовой ценой
app.get('/api/recordings/max-margin', async (req, res) => {
  try {
    // Получаем все записи инвентаря с информацией о ценах из каталога
    const [recordingsWithMargins] = await sequelize.query(`
      SELECT 
        r.id as "recordingId",
        r.title,
        r.artist,
        c."retailPrice",
        si."wholesalePrice",
        (c."retailPrice" - si."wholesalePrice") as margin,
        ((c."retailPrice" - si."wholesalePrice") / si."wholesalePrice" * 100) as "marginPercentage",
        si."storeId",
        s.name as "storeName"
      FROM store_inventory si
      JOIN recordings r ON si."recordingId" = r.id
      JOIN catalog c ON r.id = c."recordingId"
      JOIN stores s ON si."storeId" = s.id
      ORDER BY margin DESC
    `);
    
    const maxMarginRecording = recordingsWithMargins.length > 0 ? recordingsWithMargins[0] : null;
    
    res.json({
      maxMarginRecording,
      allRecordingsWithMargins: recordingsWithMargins
    });
  } catch (error) {
    console.error('Ошибка при расчете максимальной маржи:', error);
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