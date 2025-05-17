const express = require('express');
const router = express.Router();
const { User, Recording, Store, Order } = require('../models');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// Все маршруты в этом файле будут защищены middleware auth и adminAuth
// Это значит, что доступ к ним будет только у авторизованных администраторов

// Получение списка всех пользователей (только для админов)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // Исключаем пароли из ответа
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Изменение роли пользователя (повышение до админа/понижение до обычного пользователя)
router.put('/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Некорректная роль. Допустимые значения: user, admin' });
    }
    
    // Запрет на изменение собственной роли (опционально)
    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: 'Вы не можете изменить свою собственную роль' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    user.role = role;
    await user.save();
    
    res.status(200).json({
      message: 'Роль пользователя успешно обновлена',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка при изменении роли пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Удаление пользователя (только для админов)
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Запрет на удаление самого себя
    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: 'Вы не можете удалить свою учетную запись через этот интерфейс' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    await user.destroy();
    res.status(200).json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Статистика магазина
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    // Количество пользователей
    const userCount = await User.count();
    
    // Количество записей
    const recordingCount = await Recording.count();
    
    // Количество магазинов
    const storeCount = await Store.count();
    
    // Количество заказов
    const orderCount = await Order.count();
    
    res.status(200).json({
      users: userCount,
      recordings: recordingCount,
      stores: storeCount,
      orders: orderCount
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

module.exports = router;