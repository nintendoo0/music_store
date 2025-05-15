const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Создание экземпляра приложения
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Папка для статических файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Данные в памяти для хранения информации
// Записи (Recording)
let recordings = [
  {
    id: "1",
    title: "Thriller",
    genre: "Pop",
    subgenre: "Dance-pop",
    artist: "Michael Jackson",
    releaseYear: 1982,
    publisher: "Epic Records",
    mediaType: "CD"
  },
  {
    id: "2",
    title: "Back in Black",
    genre: "Rock",
    subgenre: "Hard Rock",
    artist: "AC/DC",
    releaseYear: 1980,
    publisher: "Atlantic Records",
    mediaType: "Vinyl"
  },
  {
    id: "3",
    title: "The Dark Side of the Moon",
    genre: "Rock",
    subgenre: "Progressive Rock",
    artist: "Pink Floyd",
    releaseYear: 1973,
    publisher: "Harvest Records",
    mediaType: "CD"
  },
  {
    id: "4",
    title: "Abbey Road",
    genre: "Rock",
    subgenre: "Pop Rock",
    artist: "The Beatles",
    releaseYear: 1969,
    publisher: "Apple Records",
    mediaType: "Vinyl"
  },
  {
    id: "5",
    title: "Kind of Blue",
    genre: "Jazz",
    subgenre: "Modal Jazz",
    artist: "Miles Davis",
    releaseYear: 1959,
    publisher: "Columbia Records",
    mediaType: "CD"
  },
  {
    id: "6",
    title: "Nevermind",
    genre: "Rock",
    subgenre: "Grunge",
    artist: "Nirvana",
    releaseYear: 1991,
    publisher: "DGC Records",
    mediaType: "CD"
  },
  {
    id: "7",
    title: "Highway to Hell",
    genre: "Rock",
    subgenre: "Hard Rock",
    artist: "AC/DC",
    releaseYear: 1979,
    publisher: "Atlantic Records",
    mediaType: "Flash Drive"
  }
];

// Каталог (Catalog)
let catalog = [
  {
    id: "1",
    recordingId: "1",
    retailPrice: 1200,
    mediaType: "CD"
  },
  {
    id: "2",
    recordingId: "2",
    retailPrice: 1500,
    mediaType: "Vinyl"
  },
  {
    id: "3",
    recordingId: "3",
    retailPrice: 1300,
    mediaType: "CD"
  },
  {
    id: "4",
    recordingId: "4",
    retailPrice: 1800,
    mediaType: "Vinyl"
  },
  {
    id: "5",
    recordingId: "5",
    retailPrice: 1100,
    mediaType: "CD"
  },
  {
    id: "6",
    recordingId: "6",
    retailPrice: 1400,
    mediaType: "CD"
  },
  {
    id: "7",
    recordingId: "7",
    retailPrice: 900,
    mediaType: "Flash Drive"
  }
];

// Магазины (Store)
let stores = [
  {
    id: "1",
    name: "Центральный музыкальный магазин",
    address: "ул. Главная, 1",
    phone: "+7 (123) 456-78-90",
    inventory: [
      {
        recordingId: "1",
        wholesalePrice: 800,
        salesCount: 120,
        inStock: 25
      },
      {
        recordingId: "2",
        wholesalePrice: 1100,
        salesCount: 85,
        inStock: 15
      },
      {
        recordingId: "3",
        wholesalePrice: 900,
        salesCount: 95,
        inStock: 0
      },
      {
        recordingId: "4",
        wholesalePrice: 1300,
        salesCount: 70,
        inStock: 10
      },
      {
        recordingId: "5",
        wholesalePrice: 750,
        salesCount: 50,
        inStock: 5
      },
      {
        recordingId: "6",
        wholesalePrice: 1000,
        salesCount: 110,
        inStock: 0
      }
      // Запись 7 отсутствует в этом магазине
    ]
  },
  {
    id: "2",
    name: "Музыкальный мир",
    address: "пр. Ленина, 42",
    phone: "+7 (987) 654-32-10",
    inventory: [
      {
        recordingId: "1",
        wholesalePrice: 820,
        salesCount: 100,
        inStock: 20
      },
      {
        recordingId: "3",
        wholesalePrice: 920,
        salesCount: 85,
        inStock: 5
      },
      {
        recordingId: "5",
        wholesalePrice: 780,
        salesCount: 60,
        inStock: 0
      },
      {
        recordingId: "7",
        wholesalePrice: 600,
        salesCount: 45,
        inStock: 12
      }
      // Записи 2, 4 и 6 отсутствуют в этом магазине
    ]
  }
];

// Заказы на отсутствующие записи
let orders = [
  {
    id: "1",
    storeId: "1",
    recordingId: "3", // Thriller CD
    quantity: 10,
    orderDate: "2025-04-15T10:00:00Z",
    status: "pending" // pending, completed, cancelled
  },
  {
    id: "2",
    storeId: "1",
    recordingId: "6", // Nevermind CD
    quantity: 5,
    orderDate: "2025-04-20T14:30:00Z",
    status: "pending"
  },
  {
    id: "3",
    storeId: "2",
    recordingId: "5", // Kind of Blue CD
    quantity: 8,
    orderDate: "2025-04-22T09:15:00Z",
    status: "completed"
  }
];

// Создать папку uploads, если её нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка хранилища для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    // Сохраняем оригинальное имя файла
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
app.get('/api/recordings', (req, res) => {
  res.json(recordings);
});

app.get('/api/recordings/:id', (req, res) => {
  const recording = recordings.find(r => r.id === req.params.id);
  if (!recording) {
    return res.status(404).json({ message: 'Запись не найдена' });
  }
  res.json(recording);
});

// 2. Сведения о произведениях (каталог)
app.get('/api/catalog', (req, res) => {
  const catalogWithDetails = catalog.map(item => {
    const recording = recordings.find(r => r.id === item.recordingId);
    return {
      ...item,
      recordingDetails: recording
    };
  });
  res.json(catalogWithDetails);
});

// 3. Сведения о магазинах
app.get('/api/stores', (req, res) => {
  res.json(stores);
});

app.get('/api/stores/:id', (req, res) => {
  const store = stores.find(s => s.id === req.params.id);
  if (!store) {
    return res.status(404).json({ message: 'Магазин не найден' });
  }
  
  // Добавляем детали записей к инвентарю
  const inventoryWithDetails = store.inventory.map(item => {
    const recording = recordings.find(r => r.id === item.recordingId);
    const catalogItem = catalog.find(c => c.recordingId === item.recordingId);
    return {
      ...item,
      recordingDetails: recording,
      retailPrice: catalogItem ? catalogItem.retailPrice : null
    };
  });
  
  res.json({
    ...store,
    inventory: inventoryWithDetails
  });
});

// ЗАПРОСЫ СОГЛАСНО ЗАДАНИЮ

// 1. Получение перечня всех записей заданного жанра
app.get('/api/recordings/genre/:genre', (req, res) => {
  const genre = req.params.genre;
  const filteredRecordings = recordings.filter(r => 
    r.genre.toLowerCase() === genre.toLowerCase() || 
    r.subgenre.toLowerCase() === genre.toLowerCase()
  );
  
  if (filteredRecordings.length === 0) {
    return res.json({ message: `Записей жанра "${genre}" не найдено`, recordings: [] });
  }
  
  res.json({
    genre,
    count: filteredRecordings.length,
    recordings: filteredRecordings
  });
});

// 2. Получение списка самых продаваемых записей
app.get('/api/recordings/bestsellers', (req, res) => {
  // Создаем сводные данные о продажах по всем магазинам
  const salesData = {};
  
  stores.forEach(store => {
    store.inventory.forEach(item => {
      if (!salesData[item.recordingId]) {
        salesData[item.recordingId] = 0;
      }
      salesData[item.recordingId] += item.salesCount;
    });
  });
  
  // Преобразуем в массив и сортируем
  const sortedSales = Object.entries(salesData)
    .map(([recordingId, totalSales]) => {
      const recording = recordings.find(r => r.id === recordingId);
      return {
        recordingId,
        title: recording.title,
        artist: recording.artist,
        genre: recording.genre,
        totalSales
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);
  
  res.json({
    bestsellers: sortedSales
  });
});

// 3. Исполнитель самых продаваемых произведений
app.get('/api/artists/bestselling', (req, res) => {
  // Создаем сводные данные о продажах по артистам
  const artistSales = {};
  
  stores.forEach(store => {
    store.inventory.forEach(item => {
      const recording = recordings.find(r => r.id === item.recordingId);
      if (recording) {
        if (!artistSales[recording.artist]) {
          artistSales[recording.artist] = 0;
        }
        artistSales[recording.artist] += item.salesCount;
      }
    });
  });
  
  // Преобразуем в массив и сортируем
  const sortedArtists = Object.entries(artistSales)
    .map(([artist, totalSales]) => ({ artist, totalSales }))
    .sort((a, b) => b.totalSales - a.totalSales);
  
  const bestArtist = sortedArtists.length > 0 ? sortedArtists[0] : null;
  
  // Находим все произведения лучшего артиста
  if (bestArtist) {
    const artistRecordings = recordings.filter(r => r.artist === bestArtist.artist);
    bestArtist.recordings = artistRecordings;
  }
  
  res.json({
    bestsellingArtist: bestArtist,
    allArtistsBySales: sortedArtists
  });
});

// 4. Перечень отсутствующих в магазине записей
app.get('/api/stores/:storeId/out-of-stock', (req, res) => {
  const storeId = req.params.storeId;
  const store = stores.find(s => s.id === storeId);
  
  if (!store) {
    return res.status(404).json({ message: 'Магазин не найден' });
  }
  
  // Находим записи с нулевым наличием
  const outOfStockItems = store.inventory
    .filter(item => item.inStock === 0)
    .map(item => {
      const recording = recordings.find(r => r.id === item.recordingId);
      return {
        recordingId: item.recordingId,
        title: recording.title,
        artist: recording.artist,
        genre: recording.genre,
        salesCount: item.salesCount
      };
    });
  
  // Находим записи, которых вообще нет в инвентаре
  const storeRecordingIds = store.inventory.map(item => item.recordingId);
  const missingRecordings = recordings
    .filter(recording => !storeRecordingIds.includes(recording.id))
    .map(recording => ({
      recordingId: recording.id,
      title: recording.title,
      artist: recording.artist,
      genre: recording.genre,
      status: 'missing'
    }));
  
  res.json({
    storeId,
    storeName: store.name,
    outOfStock: outOfStockItems,
    missingCompletely: missingRecordings,
    allUnavailable: [...outOfStockItems, ...missingRecordings]
  });
});

// 5. Стоимость всех проданных записей
app.get('/api/stores/:storeId/total-sales', (req, res) => {
  const storeId = req.params.storeId;
  const store = stores.find(s => s.id === storeId);
  
  if (!store) {
    return res.status(404).json({ message: 'Магазин не найден' });
  }
  
  let totalRetailSales = 0;
  let totalWholesaleSales = 0;
  let totalProfit = 0;
  
  const salesDetails = store.inventory.map(item => {
    const recording = recordings.find(r => r.id === item.recordingId);
    const catalogItem = catalog.find(c => c.recordingId === item.recordingId);
    
    const retailPrice = catalogItem ? catalogItem.retailPrice : 0;
    const retailSales = item.salesCount * retailPrice;
    const wholesaleSales = item.salesCount * item.wholesalePrice;
    const profit = retailSales - wholesaleSales;
    
    totalRetailSales += retailSales;
    totalWholesaleSales += wholesaleSales;
    totalProfit += profit;
    
    return {
      recordingId: item.recordingId,
      title: recording.title,
      artist: recording.artist,
      salesCount: item.salesCount,
      retailPrice,
      wholesalePrice: item.wholesalePrice,
      retailSales,
      wholesaleSales,
      profit
    };
  });
  
  res.json({
    storeId,
    storeName: store.name,
    totalRetailSales,
    totalWholesaleSales,
    totalProfit,
    salesDetails
  });
});

// 6. Запись с максимальной разницей между розничной и оптовой ценой
app.get('/api/recordings/max-margin', (req, res) => {
  const recordingsWithMargins = [];
  
  stores.forEach(store => {
    store.inventory.forEach(item => {
      const catalogItem = catalog.find(c => c.recordingId === item.recordingId);
      if (catalogItem) {
        const recording = recordings.find(r => r.id === item.recordingId);
        const margin = catalogItem.retailPrice - item.wholesalePrice;
        const marginPercentage = (margin / item.wholesalePrice) * 100;
        
        recordingsWithMargins.push({
          recordingId: item.recordingId,
          title: recording.title,
          artist: recording.artist,
          retailPrice: catalogItem.retailPrice,
          wholesalePrice: item.wholesalePrice,
          margin,
          marginPercentage,
          storeId: store.id,
          storeName: store.name
        });
      }
    });
  });
  
  // Сортируем по марже в убывающем порядке
  recordingsWithMargins.sort((a, b) => b.margin - a.margin);
  
  const maxMarginRecording = recordingsWithMargins.length > 0 ? 
    recordingsWithMargins[0] : null;
  
  res.json({
    maxMarginRecording,
    allRecordingsWithMargins: recordingsWithMargins
  });
});

// Дополнительные методы для редактирования данных
// Добавление песни в группу (альбом)
app.post('/api/recordings', (req, res) => {
  const newRecording = {
    id: (recordings.length + 1).toString(),
    title: req.body.title,
    genre: req.body.genre,
    subgenre: req.body.subgenre || "",
    artist: req.body.artist,
    releaseYear: req.body.releaseYear,
    publisher: req.body.publisher,
    mediaType: req.body.mediaType
  };
  
  recordings.push(newRecording);
  
  // Также добавляем в каталог
  const newCatalogItem = {
    id: (catalog.length + 1).toString(),
    recordingId: newRecording.id,
    retailPrice: req.body.retailPrice || 0,
    mediaType: newRecording.mediaType
  };
  
  catalog.push(newCatalogItem);
  
  res.status(201).json({
    message: 'Запись успешно добавлена',
    recording: newRecording,
    catalogItem: newCatalogItem
  });
});

// Удаление записи
app.delete('/api/recordings/:id', (req, res) => {
  const recordingId = req.params.id;
  const recordingIndex = recordings.findIndex(r => r.id === recordingId);
  
  if (recordingIndex === -1) {
    return res.status(404).json({ message: 'Запись не найдена' });
  }
  
  // Удаляем запись
  const removedRecording = recordings.splice(recordingIndex, 1)[0];
  
  // Удаляем из каталога
  const catalogIndex = catalog.findIndex(c => c.recordingId === recordingId);
  if (catalogIndex !== -1) {
    catalog.splice(catalogIndex, 1);
  }
  
  // Удаляем из инвентаря магазинов
  stores.forEach(store => {
    const inventoryIndex = store.inventory.findIndex(i => i.recordingId === recordingId);
    if (inventoryIndex !== -1) {
      store.inventory.splice(inventoryIndex, 1);
    }
  });
  
  res.json({
    message: 'Запись успешно удалена',
    removedRecording
  });
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

// Базовый маршрут
app.get('/', (req, res) => {
  res.send('API магазина музыкальных записей работает!');
});

// Определение порта
const PORT = process.env.PORT || 5000;

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Перейдите по адресу: http://localhost:${PORT}`);
});