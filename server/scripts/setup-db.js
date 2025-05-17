const { sequelize } = require('../config/db');
const { User } = require('../models');

const setupDatabase = async () => {
  try {
    // Создание таблиц
    await User.sync({ force: true }); // force: true - удалит существующую таблицу
    console.log('Таблица users создана.');

    // Создание администратора по умолчанию
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',  // будет хешироваться хуками
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    console.log('Администратор по умолчанию создан.');

    console.log('База данных настроена успешно.');
  } catch (error) {
    console.error('Ошибка при настройке базы данных:', error);
  } finally {
    // Закрытие соединения
    await sequelize.close();
  }
};

// Запуск настройки БД
setupDatabase();