const express = require('express');
const router = express.Router();
const Section = require('../models/Section');

router.get('/', (req, res) => res.json(Section.allWithBlocks()));
router.get('/:slug', (req, res) => {
  const section = Section.findBySlug(req.params.slug);
  if (!section) return res.status(404).json({ error: 'القسم غير موجود' });
  res.json(section);
});

module.exports = router;
