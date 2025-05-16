const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { generateToken } = require('../config/jwt');
const { auth } = require('../middleware/auth');
const sequelize = require('sequelize');

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Проверка на уникальность email и имени пользователя
    const existingUser = await User.findOne({
      where: {
        [sequelize.Op.or]: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: 'Пользователь с таким email или именем уже существует'
      });
    }
    
    // Создание нового пользователя
    const user = await User.create({
      username,
      email,
      password, // пароль будет зашифрован через хук beforeCreate
      firstName,
      lastName,
      role: 'user' // по умолчанию
    });
    
    // Генерация JWT токена
    const token = generateToken(user.id, user.role);
    
    // Отправка токена в куки
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 день
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    
    // Ответ без пароля
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
    
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(400).json({
      message: 'Ошибка при регистрации',
      error: error.message
    });
  }
});

// Авторизация пользователя
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Поиск пользователя по имени пользователя или email
    const user = await User.findOne({
      where: {
        [sequelize.Op.or]: [
          { username },
          { email: username }
        ]
      }
    });
    
    if (!user) {
      return res.status(401).json({
        message: 'Пользователь не найден'
      });
    }
    
    // Проверка пароля
    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Неверный пароль'
      });
    }
    
    // Генерация JWT токена
    const token = generateToken(user.id, user.role);
    
    // Отправка токена в куки
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 день
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    
    // Ответ без пароля
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
    
    res.status(200).json({
      message: 'Авторизация успешна',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(401).json({
      message: 'Ошибка авторизации',
      error: error.message
    });
  }
});

// Выход из системы (удаление токена)
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    message: 'Выход выполнен успешно'
  });
});

// Получение данных текущего пользователя
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден'
      });
    }
    
    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({
      message: 'Ошибка при получении данных пользователя',
      error: error.message
    });
  }
});

module.exports = router;