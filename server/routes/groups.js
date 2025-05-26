const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Recording = require('../models/Recording');

// Создать группу
router.post('/', async (req, res) => {
  try {
    const group = await Group.create({ name: req.body.name });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});

// Получить все группы
router.get('/', async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});

// Добавить песню в группу
router.post('/:groupId/recordings', async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Группа не найдена' });

    const recording = await Recording.findByPk(req.body.recordingId);
    if (!recording) return res.status(404).json({ message: 'Песня не найдена' });

    await group.addRecording(recording); // <-- важно!
    res.json({ message: 'Песня добавлена в группу' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});

module.exports = router;