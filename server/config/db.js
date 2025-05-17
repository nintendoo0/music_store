const { Sequelize } = require('sequelize');
require('dotenv').config(); // Для работы с переменными окружения

// Настройка подключения к PostgreSQL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '12345678', // Замените на реальный пароль
  database: process.env.DB_NAME || 'music_store',
  logging: false, // Отключаем вывод SQL-запросов в консоль
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false // Для работы с Heroku или другими облачными провайдерами
    } : false
  }
});

// Функция для синхронизации моделей с базой данных
const syncModels = async () => {
  try {
    // Проверка соединения с базой данных
    await sequelize.authenticate();
    console.log('Подключение к базе данных PostgreSQL установлено успешно.');
    
    // Синхронизация моделей с БД (создание таблиц)
    await sequelize.sync({ alter: true });
    console.log('Синхронизация моделей с базой данных выполнена.');
  } catch (error) {
    console.error('Ошибка при синхронизации с базой данных:', error);
    throw error; // Необходимо для обработки ошибки в вызывающем коде
  }
};

// Добавьте функцию testDbConnection, если она нужна
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Подключение к базе данных установлено успешно.');
    return true;
  } catch (error) {
    console.error('Ошибка при подключении к базе данных:', error);
    throw error;
  }
};

// И экспортируйте её
module.exports = {
  sequelize,
  syncModels,
  testDbConnection // добавьте эту функцию в экспорт
};