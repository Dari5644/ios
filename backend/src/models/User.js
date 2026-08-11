const db = require('../db');

const User = {
  findByDiscordId(discordId) {
    return db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordId);
  },

  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  create({ discordId, username, nickname, avatar }) {
    const info = db.prepare(`
      INSERT INTO users (discord_id, username, nickname, avatar)
      VALUES (?, ?, ?, ?)
    `).run(discordId, username, nickname, avatar);
    return this.findById(info.lastInsertRowid);
  },

  updateProfile(discordId, { username, nickname, avatar }) {
    db.prepare(`
      UPDATE users SET username = ?, nickname = ?, avatar = ?, updated_at = datetime('now')
      WHERE discord_id = ?
    `).run(username, nickname, avatar, discordId);
    return this.findByDiscordId(discordId);
  },

  addXp(userId, xpAmount) {
    db.prepare(`UPDATE users SET xp = xp + ?, updated_at = datetime('now') WHERE id = ?`)
      .run(xpAmount, userId);
    return this.findById(userId);
  },

  setLevel(userId, level) {
    db.prepare(`UPDATE users SET level = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(level, userId);
  },

  incrementStat(userId, statField) {
    // statField يجب أن يكون من قائمة بيضاء لتفادي حقن SQL في اسم العمود
    const allowed = ['messages_count', 'challenges_joined', 'wins'];
    if (!allowed.includes(statField)) throw new Error('حقل إحصائي غير مسموح');
    db.prepare(`UPDATE users SET ${statField} = ${statField} + 1 WHERE id = ?`).run(userId);
  },

  leaderboard(limit = 50) {
    return db.prepare(`
      SELECT id, username, nickname, avatar, level, xp
      FROM users ORDER BY level DESC, xp DESC LIMIT ?
    `).all(limit);
  },

  setSelectedClass(userId, classId) {
    db.prepare(`UPDATE users SET selected_class_id = ? WHERE id = ?`).run(classId, userId);
  }
};

module.exports = User;
