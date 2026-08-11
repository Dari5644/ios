const { grantXpByDiscordId } = require('../utils/leveling');

module.exports = {
  name: 'messageCreate',
  execute(message, client) {
    if (message.author.bot) return;
    // كل رسالة داخل السيرفر تُحسب كتفاعل يرفع الـ XP (يمكن إضافة تبريد/cooldown هنا لاحقاً)
    grantXpByDiscordId(message.author.id, message.author.username, 'message', client);
  }
};
