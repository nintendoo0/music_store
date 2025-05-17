const express = require('express');
const router = express.Router();
const { Store } = require('../models');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// Получение всех магазинов
router.get('/', async (req, res) => {
  try {
    const stores = await Store.findAll();
    res.json(stores);
  } catch (error) {
    console.error('Ошибка при получении магазинов:', error);
    res.status(500).json({ message: 'Ошибка при получении списка магазинов', error: error.message });
  }
});

// Получение одного магазина по ID
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Магазин не найден' });
    }
    res.json(store);
  } catch (error) {
    console.error('Ошибка при получении магазина:', error);
    res.status(500).json({ message: 'Ошибка при получении магазина', error: error.message });
  }
});

// Создание магазина (только для админов)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const newStore = await Store.create(req.body);
    res.status(201).json(newStore);
  } catch (error) {
    console.error('Ошибка при создании магазина:', error);
    res.status(500).json({ message: 'Ошибка при создании магазина', error: error.message });
  }
});

// Обновление магазина (только для админов)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const [updated] = await Store.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'Магазин не найден' });
    }
    
    const updatedStore = await Store.findByPk(req.params.id);
    res.json(updatedStore);
  } catch (error) {
    console.error('Ошибка при обновлении магазина:', error);
    res.status(500).json({ message: 'Ошибка при обновлении магазина', error: error.message });
  }
});

// Удаление магазина (только для админов)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const deleted = await Store.destroy({
      where: { id: req.params.id }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Магазин не найден' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Ошибка при удалении магазина:', error);
    res.status(500).json({ message: 'Ошибка при удалении магазина', error: error.message });
  }
});

module.exports = router;