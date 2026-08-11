const express = require('express');
const router = express.Router();
const PlayerClass = require('../models/PlayerClass');

// عام - لعرض الكلاسات في صفحة "الكلاّس"
router.get('/', (req, res) => res.json(PlayerClass.all()));

module.exports = router;
