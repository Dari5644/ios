const db = require('../db');

const Activity = {
  log({ userId, type, message }) {
    const info = db.prepare('INSERT INTO activity_log (user_id, type, message) VALUES (?, ?, ?)')
      .run(userId || null, type, message);
    return db.prepare('SELECT * FROM activity_log WHERE id = ?').get(info.lastInsertRowid);
  },

  recent(limit = 30) {
    return db.prepare(`
      SELECT a.*, u.username, u.nickname, u.avatar
      FROM activity_log a LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.id DESC LIMIT ?
    `).all(limit);
  }
};

module.exports = Activity;
