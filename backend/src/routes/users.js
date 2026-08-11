const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PlayerClass = require('../models/PlayerClass');
const Activity = require('../models/Activity');
const { requireAuth } = require('../middleware/auth');

router.get('/me/classes', requireAuth, (req, res) => {
  res.json(PlayerClass.getUserClasses(req.user.id));
});

// اختيار كلاس - يطبّق نظام التوزيع الذكي تلقائياً عند وجود تعارض
router.post('/me/classes/:classId', requireAuth, (req, res) => {
  try {
    const result = PlayerClass.selectForUser(req.user.id, req.params.classId);
    if (result.replaced.length > 0) {
      const io = req.app.get('io');
      const activity = Activity.log({
        userId: req.user.id,
        type: 'class_change',
        message: `${req.user.nickname || req.user.username} غيّر كلاسه إلى ${result.selected.name} ⚔️`
      });
      if (io) io.emit('activity:new', activity);
    }
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/me/classes/:classId', requireAuth, (req, res) => {
  PlayerClass.removeForUser(req.user.id, req.params.classId);
  res.json({ success: true });
});

module.exports = router;
