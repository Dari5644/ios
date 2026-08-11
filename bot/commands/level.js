const db = require('../utils/db');
const { xpRequiredForLevel } = require('../utils/leveling');

// أمر سلاش /level - يعرض لفل المستخدم الحالي
module.exports = {
  name: 'level',
  description: 'عرض المستوى الحالي ونقاط الخبرة',
  async execute(interaction) {
    const user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(interaction.user.id);
    if (!user) {
      return interaction.reply({ content: 'لا يوجد سجل لك بعد، تفاعل أكثر في السيرفر أو سجّل دخولك في الموقع أولاً!', ephemeral: true });
    }
    const nextLevelXp = xpRequiredForLevel(user.level + 1);
    await interaction.reply(
      `📊 **${user.nickname || user.username}**\nالمستوى: **${user.level}**\nنقاط الخبرة: **${user.xp} / ${nextLevelXp}**`
    );
  }
};
