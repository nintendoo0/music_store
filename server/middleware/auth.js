const { verifyToken } = require('../config/jwt');
const { User } = require('../models');

// Middleware для проверки авторизации пользователя
const auth = async (req, res, next) => {
  try {
    // Получение токена из заголовка или куки
    let token = req.headers.authorization?.split(' ')[1];
    
    if (!token && req.cookies) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Не предоставлен токен авторизации' });
    }
    
    // Проверка токена
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Недействительный токен' });
    }
    
    // Получение пользователя
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    // Добавление пользователя в объект запроса
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(401).json({ message: 'Ошибка аутентификации' });
  }
};

// Middleware для проверки роли администратора
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
  }
};

module.exports = { auth, adminAuth };