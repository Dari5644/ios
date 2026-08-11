const express = require('express');
const router = express.Router();

const { requireAuth, requireAdmin } = require('../middleware/auth');
const PlayerClass = require('../models/PlayerClass');
const Rule = require('../models/Rule');
const Section = require('../models/Section');
const BotSettings = require('../models/BotSettings');

router.use(requireAuth, requireAdmin);

// ===== إدارة الكلاسات =====
router.post('/classes', (req, res) => {
  const created = PlayerClass.create(req.body);
  res.json(created);
});
router.put('/classes/:id', (req, res) => {
  const updated = PlayerClass.update(req.params.id, req.body);
  res.json(updated);
});
router.delete('/classes/:id', (req, res) => {
  PlayerClass.remove(req.params.id);
  res.json({ success: true });
});

// ===== إدارة القوانين =====
router.post('/rules/tabs', (req, res) => res.json(Rule.createTab(req.body)));
router.put('/rules/tabs/:id', (req, res) => { Rule.updateTab(req.params.id, req.body); res.json({ success: true }); });
router.delete('/rules/tabs/:id', (req, res) => { Rule.deleteTab(req.params.id); res.json({ success: true }); });

router.post('/rules/items', (req, res) => res.json(Rule.addItem(req.body)));
router.put('/rules/items/:id', (req, res) => { Rule.updateItem(req.params.id, req.body); res.json({ success: true }); });
router.delete('/rules/items/:id', (req, res) => { Rule.deleteItem(req.params.id); res.json({ success: true }); });

// ===== إدارة الأقسام الديناميكية (محرر السحب والإفلات) =====
router.post('/sections', (req, res) => res.json(Section.create(req.body)));
router.put('/sections/:id', (req, res) => { Section.update(req.params.id, req.body); res.json({ success: true }); });
router.delete('/sections/:id', (req, res) => { Section.remove(req.params.id); res.json({ success: true }); });

// يستقبل الترتيب/المحتوى الكامل للبلوكات بعد كل عملية سحب وإفلات في الواجهة
// body: { blocks: [{ type, content }, ...] } — الترتيب في المصفوفة = ترتيب العرض
router.put('/sections/:id/blocks', (req, res) => {
  const updated = Section.replaceBlocks(req.params.id, req.body.blocks || []);
  res.json(updated);
});

// ===== إعدادات البوت (Token / Client ID / Guild ID) =====
// هذه البيانات تُخزَّن مباشرة في database.sqlite ويقرأها البوت حياً بدون إعادة تشغيل
router.get('/bot-settings', (req, res) => {
  const settings = BotSettings.get();
  // لا نُرجع التوكن كاملاً في الواجهة لأسباب أمنية، فقط نؤكد وجوده
  res.json({ ...settings, bot_token: settings.bot_token ? '••••••••' + settings.bot_token.slice(-4) : null });
});

router.put('/bot-settings', (req, res) => {
  const updated = BotSettings.update(req.body);
  res.json({ ...updated, bot_token: 'تم الحفظ ✅' });
});

module.exports = router;
