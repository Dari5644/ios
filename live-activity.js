// يعرض قائمة "النشاط الحي" ويحدّثها لحظياً عبر Socket.io داخل عنصر id="activityList"
const ACTIVITY_ICONS = { join: '🎮', level_up: '🎖️', class_change: '⚔️', new_challenge: '🏆' };

function renderActivityItem(item) {
  const icon = ACTIVITY_ICONS[item.type] || '🔹';
  return `<div class="activity-item"><span>${icon}</span><span>${item.message}</span></div>`;
}

function initLiveActivity(limit = 20) {
  const list = document.getElementById('activityList');
  if (!list) return;

  api.get(`/activity?limit=${limit}`).then(items => {
    list.innerHTML = items.length
      ? items.map(renderActivityItem).join('')
      : '<p style="color:#6b7570;font-size:14px;">لا يوجد نشاط بعد...</p>';
  });

  const socket = io(SOCKET_URL);
  socket.on('activity:new', (item) => {
    list.insertAdjacentHTML('afterbegin', renderActivityItem(item));
  });
}
