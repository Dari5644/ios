const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  res.json(User.leaderboard(limit));
});

module.exports = router;
