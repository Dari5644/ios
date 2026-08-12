async function loadAdminClasses() {
  const classes = await api.get('/classes');
  document.getElementById('classList').innerHTML = classes.map(c => `
    <div class="glass-panel" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;margin-bottom:8px;">
      <div>
        <strong>${c.name}</strong>
        <div style="font-size:12px;color:var(--text-soft);">${c.category}${c.exclusive_group ? ' • مجموعة: ' + c.exclusive_group : ''}</div>
      </div>
      <button class="danger" onclick="removeAdminClass(${c.id})">حذف</button>
    </div>
  `).join('');
}

async function removeAdminClass(id) {
  await api.del(`/admin/classes/${id}`);
  loadAdminClasses();
}

document.getElementById('classForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api.post('/admin/classes', {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    exclusiveGroup: document.getElementById('exclusiveGroup').value,
    description: document.getElementById('description').value
  });
  document.getElementById('classForm').reset();
  document.getElementById('category').value = 'primary_weapon';
  document.getElementById('exclusiveGroup').value = 'primary_slot';
  loadAdminClasses();
});

loadAdminClasses();
