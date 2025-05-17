const express = require('express');
const router = express.Router();
const { Recording } = require('../models');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// Получение всех записей (доступно всем)
router.get('/', async (req, res) => {
  try {
    const recordings = await Recording.findAll();
    res.json(recordings);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ message: 'Ошибка при получении записей', error: error.message });
  }
});

// Получение одной записи по ID (доступно всем)
router.get('/:id', async (req, res) => {
  try {
    const recording = await Recording.findByPk(req.params.id);
    if (!recording) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    res.json(recording);
  } catch (error) {
    console.error('Error fetching recording:', error);
    res.status(500).json({ message: 'Ошибка при получении записи', error: error.message });
  }
});

// Создание новой записи (только для админов)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const newRecording = await Recording.create(req.body);
    res.status(201).json(newRecording);
  } catch (error) {
    console.error('Error creating recording:', error);
    res.status(500).json({ message: 'Ошибка при создании записи', error: error.message });
  }
});

// Обновление записи (только для админов)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const [updated] = await Recording.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    
    const updatedRecording = await Recording.findByPk(req.params.id);
    res.json(updatedRecording);
  } catch (error) {
    console.error('Error updating recording:', error);
    res.status(500).json({ message: 'Ошибка при обновлении записи', error: error.message });
  }
});

// Удаление записи (только для админов)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const deleted = await Recording.destroy({
      where: { id: req.params.id }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ message: 'Ошибка при удалении записи', error: error.message });
  }
});

module.exports = router;