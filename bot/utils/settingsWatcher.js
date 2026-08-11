const db = require('./db');

/**
 * يقرأ إعدادات البوت (Token / Client ID / Guild ID) من قاعدة البيانات كل بضع ثوانٍ
 * هذا يسمح لك بتحديث بيانات البوت من لوحة التحكم دون الحاجة لإعادة تشغيل عملية البوت يدوياً:
 * - عند تغيير guild_id أو level_up_channel_id: تُطبَّق فوراً في next poll.
 * - عند تغيير bot_token: نحتاج فعلياً لإعادة تسجيل دخول العميل (login) لأن discord.js
 *   يربط الاتصال بالتوكن عند أول login. لذلك عند تغيّر التوكن نعيد net login تلقائياً بدون
 *   الحاجة لإيقاف/تشغيل العملية يدوياً من الطرفية.
 */
function watchSettings(client, { intervalMs = 5000 } = {}) {
  let lastToken = null;

  setInterval(async () => {
    const settings = db.prepare('SELECT * FROM bot_settings WHERE id = 1').get();
    if (!settings || !settings.is_enabled || !settings.bot_token) return;

    if (settings.bot_token !== lastToken) {
      lastToken = settings.bot_token;
      try {
        if (client.isReady()) await client.destroy();
        await client.login(settings.bot_token);
        console.log('🔄 تم تحديث توكن البوت وإعادة الاتصال بنجاح (بدون إعادة تشغيل يدوي)');
      } catch (err) {
        console.error('❌ فشل تسجيل الدخول بالتوكن الجديد المُدخل من لوحة التحكم:', err.message);
      }
    }
  }, intervalMs);
}

function getCurrentSettings() {
  return db.prepare('SELECT * FROM bot_settings WHERE id = 1').get();
}

module.exports = { watchSettings, getCurrentSettings };
