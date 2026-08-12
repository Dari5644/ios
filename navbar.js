// نافبار موحّد يُحقن داخل <div id="navbar"></div> - كل الملفات بمستوى واحد فلا حاجة لمسارات نسبية معقّدة
function renderNavbar() {
  const el = document.getElementById('navbar');
  el.innerHTML = `
    <nav class="navbar glass-panel">
      <a href="index.html" class="brand">MW3 <span>ARENA</span></a>
      <ul class="nav-links">
        <li><a href="index.html">الرئيسية</a></li>
        <li><a href="activity.html">النشاط الحي</a></li>
        <li><a href="rules.html">القوانين</a></li>
        <li><a href="class.html">الكلاّس</a></li>
        <li><a href="leaderboard.html">المتصدرين</a></li>
      </ul>
      <div id="authArea"></div>
    </nav>
  `;

  api.get('/auth/me')
    .then(({ user }) => {
      document.getElementById('authArea').innerHTML = `
        <a href="#" class="user-chip">
          <img src="${user.avatar}" alt="avatar">
          <span>${user.nickname || user.username}</span>
          <span class="level-badge">Lv.${user.level}</span>
        </a>`;
    })
    .catch(() => {
      document.getElementById('authArea').innerHTML =
        `<a href="${API_URL}/auth/discord" class="btn-primary">تسجيل الدخول عبر ديسكورد</a>`;
    });
}
document.addEventListener('DOMContentLoaded', renderNavbar);
