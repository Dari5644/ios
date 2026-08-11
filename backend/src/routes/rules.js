const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');

router.get('/', (req, res) => res.json(Rule.allTabsWithItems()));

module.exports = router;
