api.get('/leaderboard').then(players => {
  document.getElementById('leaderboardBody').innerHTML = players.map((p, i) => `
    <tr>
      <td><strong>${i + 1}</strong></td>
      <td><img src="${p.avatar}"> ${p.nickname || p.username}</td>
      <td>Lv. ${p.level}</td>
      <td>${p.xp} XP</td>
    </tr>
  `).join('');
});
