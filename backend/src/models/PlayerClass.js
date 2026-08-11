const db = require('../db');

const PlayerClass = {
  all() {
    return db.prepare('SELECT * FROM player_classes WHERE is_active = 1 ORDER BY sort_order ASC').all();
  },

  findById(id) {
    return db.prepare('SELECT * FROM player_classes WHERE id = ?').get(id);
  },

  create({ name, category, exclusiveGroup, description, imageUrl, sortOrder = 0 }) {
    const info = db.prepare(`
      INSERT INTO player_classes (name, category, exclusive_group, description, image_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, category, exclusiveGroup || null, description || '', imageUrl || '', sortOrder);
    return this.findById(info.lastInsertRowid);
  },

  update(id, fields) {
    const current = this.findById(id);
    if (!current) return null;
    const merged = { ...current, ...fields };
    db.prepare(`
      UPDATE player_classes SET name=?, category=?, exclusive_group=?, description=?, image_url=?, sort_order=?
      WHERE id=?
    `).run(merged.name, merged.category, merged.exclusive_group, merged.description, merged.image_url, merged.sort_order, id);
    return this.findById(id);
  },

  remove(id) {
    db.prepare('DELETE FROM player_classes WHERE id = ?').run(id);
  },

  // ===== نظام التوزيع الذكي =====
  // عند اختيار المستخدم كلاساً جديداً ينتمي لمجموعة حصرية (exclusive_group)
  // نحذف تلقائياً أي كلاس آخر من نفس المجموعة قبل إضافة الكلاس الجديد
  selectForUser(userId, classId) {
    const newClass = this.findById(classId);
    if (!newClass) throw new Error('الكلاس غير موجود');

    const userClasses = db.prepare(`
      SELECT pc.* FROM user_classes uc
      JOIN player_classes pc ON pc.id = uc.class_id
      WHERE uc.user_id = ?
    `).all(userId);

    const conflicting = newClass.exclusive_group
      ? userClasses.filter(c => c.exclusive_group === newClass.exclusive_group && c.id !== classId)
      : [];

    const tx = db.transaction(() => {
      conflicting.forEach(c => {
        db.prepare('DELETE FROM user_classes WHERE user_id = ? AND class_id = ?').run(userId, c.id);
      });
      db.prepare('INSERT OR IGNORE INTO user_classes (user_id, class_id) VALUES (?, ?)').run(userId, classId);
    });
    tx();

    return {
      selected: newClass,
      replaced: conflicting // الكلاسات التي تم استبدالها تلقائياً (لعرضها للمستخدم كتنبيه)
    };
  },

  removeForUser(userId, classId) {
    db.prepare('DELETE FROM user_classes WHERE user_id = ? AND class_id = ?').run(userId, classId);
  },

  getUserClasses(userId) {
    return db.prepare(`
      SELECT pc.* FROM user_classes uc
      JOIN player_classes pc ON pc.id = uc.class_id
      WHERE uc.user_id = ?
    `).all(userId);
  }
};

module.exports = PlayerClass;
