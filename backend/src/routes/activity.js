const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// يغذي قسم "النشاط الحي" - يمكن استدعاؤه مبدئياً ثم الاستماع لـ socket.io لتحديثات لحظية
router.get('/', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  res.json(Activity.recent(limit));
});

module.exports = router;
