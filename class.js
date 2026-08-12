let allClasses = [];
let myClasses = [];

async function loadClassesPage() {
  allClasses = await api.get('/classes');
  try { myClasses = await api.get('/users/me/classes'); } catch { myClasses = []; }
  renderClassGrid();
}

function isClassSelected(id) { return myClasses.some(c => c.id === id); }

function renderClassGrid() {
  document.getElementById('classGrid').innerHTML = allClasses.map(c => `
    <div class="glass-panel class-card ${isClassSelected(c.id) ? 'selected' : ''}" onclick="selectClass(${c.id})">
      <h4 style="margin:0 0 4px;">${c.name}</h4>
      <small>${c.category}${c.exclusive_group ? ' • ' + c.exclusive_group : ''}</small>
      <p style="font-size:14px;margin-top:8px;">${c.description || ''}</p>
    </div>
  `).join('');
}

async function selectClass(classId) {
  try {
    const result = await api.post(`/users/me/classes/${classId}`);
    const noticeEl = document.getElementById('notice');
    noticeEl.innerHTML = (result.replaced && result.replaced.length > 0)
      ? `<div class="notice">تم استبدال: ${result.replaced.map(c => c.name).join('، ')} بسبب التعارض ✔️</div>`
      : '';
    loadClassesPage();
  } catch {
    document.getElementById('notice').innerHTML = '<div class="notice">يجب تسجيل الدخول أولاً</div>';
  }
}

loadClassesPage();
