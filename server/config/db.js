const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false // set to console.log to see SQL queries
  }
);

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных PostgreSQL успешно установлено');
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
  }
};

module.exports = { sequelize, testDbConnection };