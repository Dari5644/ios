const db = require('../db');

// سجل واحد فقط (id = 1) يحتوي إعدادات البوت الحية
const BotSettings = {
  get() {
    return db.prepare('SELECT * FROM bot_settings WHERE id = 1').get();
  },

  update({ botToken, clientId, guildId, levelUpChannelId, isEnabled }) {
    const current = this.get();
    const merged = {
      bot_token: botToken !== undefined ? botToken : current.bot_token,
      client_id: clientId !== undefined ? clientId : current.client_id,
      guild_id: guildId !== undefined ? guildId : current.guild_id,
      level_up_channel_id: levelUpChannelId !== undefined ? levelUpChannelId : current.level_up_channel_id,
      is_enabled: isEnabled !== undefined ? (isEnabled ? 1 : 0) : current.is_enabled
    };
    db.prepare(`
      UPDATE bot_settings
      SET bot_token=?, client_id=?, guild_id=?, level_up_channel_id=?, is_enabled=?, updated_at=datetime('now')
      WHERE id = 1
    `).run(merged.bot_token, merged.client_id, merged.guild_id, merged.level_up_channel_id, merged.is_enabled);
    return this.get();
  }
};

module.exports = BotSettings;
