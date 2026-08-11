const db = require('./db');

function xpRequiredForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

function calculateLevelFromXp(totalXp) {
  let level = 1;
  while (totalXp >= xpRequiredForLevel(level + 1)) level++;
  return level;
}

const XP_RULES = { message: 5, voice_minute: 2, daily_activity: 10 };

/**
 * يضيف XP لمستخدم بناءً على discordId (يُنشئ سجلاً إن لم يكن موجوداً بعد -
 * يحدث مثلاً لو تفاعل المستخدم في ديسكورد قبل تسجيل الدخول في الموقع)
 */
function grantXpByDiscordId(discordId, username, eventType, client = null) {
  const amount = XP_RULES[eventType] || 0;
  if (!amount) return;

  let user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordId);
  if (!user) {
    const info = db.prepare('INSERT INTO users (discord_id, username) VALUES (?, ?)').run(discordId, username);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  }

  db.prepare('UPDATE users SET xp = xp + ?, messages_count = messages_count + 1 WHERE id = ?')
    .run(amount, user.id);

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  const newLevel = calculateLevelFromXp(updated.xp);

  if (newLevel > user.level) {
    db.prepare('UPDATE users SET level = ? WHERE id = ?').run(newLevel, user.id);
    db.prepare('INSERT INTO activity_log (user_id, type, message) VALUES (?, ?, ?)')
      .run(user.id, 'level_up', `${user.nickname || user.username} ترقّى إلى المستوى ${newLevel} 🎖️`);

    // إرسال إشعار في قناة السيرفر إن كانت محددة في الإعدادات
    const settings = db.prepare('SELECT * FROM bot_settings WHERE id = 1').get();
    if (client && settings?.level_up_channel_id) {
      const channel = client.channels.cache.get(settings.level_up_channel_id);
      if (channel) channel.send(`🎉 مبروك <@${discordId}>! وصلت إلى المستوى **${newLevel}**`);
    }
  }
}

module.exports = { grantXpByDiscordId, calculateLevelFromXp, xpRequiredForLevel };
