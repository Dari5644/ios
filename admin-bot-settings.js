api.get('/admin/bot-settings').then(s => {
  document.getElementById('clientId').value = s.client_id || '';
  document.getElementById('guildId').value = s.guild_id || '';
  document.getElementById('levelUpChannelId').value = s.level_up_channel_id || '';
  document.getElementById('isEnabled').checked = !!s.is_enabled;
  document.getElementById('botToken').placeholder = s.bot_token || '••••••••';
}).catch(() => {
  document.getElementById('status').textContent = '⚠️ يجب تسجيل الدخول بصلاحية أدمن';
});

document.getElementById('botForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'جاري الحفظ...';
  try {
    await api.put('/admin/bot-settings', {
      botToken: document.getElementById('botToken').value || undefined,
      clientId: document.getElementById('clientId').value,
      guildId: document.getElementById('guildId').value,
      levelUpChannelId: document.getElementById('levelUpChannelId').value,
      isEnabled: document.getElementById('isEnabled').checked
    });
    statusEl.textContent = '✅ تم الحفظ، البوت سيلتقط التغييرات تلقائياً خلال ثوانٍ';
  } catch {
    statusEl.textContent = '❌ فشل الحفظ، تأكد أنك مسجّل كأدمن';
  }
});
