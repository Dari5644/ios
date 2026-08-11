const jwt = require('jsonwebtoken');
const User = require('../models/User');

// يتحقق من كوكي JWT ويرفق بيانات المستخدم في req.user
function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'يجب تسجيل الدخول' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = User.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'المستخدم غير موجود' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة غير صالحة، الرجاء تسجيل الدخول مجدداً' });
  }
}

// يسمح فقط للأدمن بالمرور (يُستخدم على راوتات لوحة التحكم)
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'صلاحيات الأدمن مطلوبة' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
