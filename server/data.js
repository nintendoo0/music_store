// Данные в памяти для хранения информации
// Записи (Recording)
const recordings = [
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
const catalog = [
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
const stores = [
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
    ]
  }
];

// Заказы на отсутствующие записи
const orders = [
  {
    id: "1",
    storeId: "1",
    recordingId: "3",
    quantity: 10,
    orderDate: "2025-04-15T10:00:00Z",
    status: "pending"
  },
  {
    id: "2",
    storeId: "1",
    recordingId: "6",
    quantity: 5,
    orderDate: "2025-04-20T14:30:00Z",
    status: "pending"
  },
  {
    id: "3",
    storeId: "2",
    recordingId: "5",
    quantity: 8,
    orderDate: "2025-04-22T09:15:00Z",
    status: "completed"
  }
];

module.exports = { recordings, catalog, stores, orders };