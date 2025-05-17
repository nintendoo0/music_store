const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const { generateToken } = require('../config/jwt'); // Добавьте этот импорт

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  try {
    console.log('Получены данные для регистрации:', req.body);
    
    const { username, email, password, firstName, lastName } = req.body;
    
    // Проверка обязательных полей
    if (!username || !email || !password) {
      console.log('Отсутствуют обязательные поля');
      return res.status(400).json({
        message: 'Необходимо заполнить обязательные поля: username, email, password'
      });
    }
    
    // Проверка на уникальность
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      console.log('Пользователь уже существует');
      return res.status(400).json({
        message: 'Пользователь с таким email или именем уже существует'
      });
    }
    
    // Создание пользователя
    const user = await User.create({
      username,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      role: 'user'
    });
    
    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '24h' }
    );
    
    // Отправка ответа
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({
      message: 'Ошибка при регистрации пользователя',
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
        [Op.or]: [
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
    
    // Генерация JWT токена с использованием импортированной функции
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