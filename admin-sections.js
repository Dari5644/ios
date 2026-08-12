let sections = [];
let activeSection = null;
let blocks = [];
let dragFromIndex = null;

async function loadSections() {
  sections = await api.get('/sections');
  document.getElementById('sectionsList').innerHTML = sections.map(s => `
    <button class="section-item ${activeSection?.slug === s.slug ? 'active' : ''}" onclick="openSection('${s.slug}')">
      ${s.title} <small style="opacity:.7;">/${s.slug}</small>
    </button>
  `).join('');
}

function openSection(slug) {
  activeSection = sections.find(s => s.slug === slug);
  blocks = activeSection.blocks.map((b, i) => ({ tempId: `${slug}-${i}-${Date.now()}`, type: b.block_type || b.type, content: b.content }));
  document.getElementById('editorEmpty').style.display = 'none';
  document.getElementById('editorArea').style.display = 'block';
  loadSections();
  renderBlocks();
}

function addBlock(type) {
  blocks.push({ tempId: `new-${Date.now()}`, type, content: { text: '' } });
  renderBlocks();
}

function deleteBlock(tempId) {
  blocks = blocks.filter(b => b.tempId !== tempId);
  renderBlocks();
}

function updateBlockText(tempId, value) {
  const b = blocks.find(x => x.tempId === tempId);
  if (b) b.content.text = value;
}

function handleDragStart(index) { dragFromIndex = index; }
function handleDragOver(e) { e.preventDefault(); }
function handleDrop(index) {
  if (dragFromIndex === null || dragFromIndex === index) return;
  const [moved] = blocks.splice(dragFromIndex, 1);
  blocks.splice(index, 0, moved);
  dragFromIndex = null;
  renderBlocks();
}

function renderBlocks() {
  document.getElementById('blocksList').innerHTML = blocks.map((b, i) => `
    <div class="glass-panel block-item"
         draggable="true"
         ondragstart="handleDragStart(${i})"
         ondragover="handleDragOver(event)"
         ondrop="handleDrop(${i})">
      <div style="flex:1;">
        <span class="block-type-tag">${b.type}</span>
        <input value="${(b.content.text || '').replace(/"/g, '&quot;')}"
               oninput="updateBlockText('${b.tempId}', this.value)"
               placeholder="محتوى البلوك..."
               style="margin:6px 0 0;border:none;border-bottom:1px solid var(--teal-300);border-radius:0;">
      </div>
      <button class="danger" onclick="deleteBlock('${b.tempId}')">حذف</button>
    </div>
  `).join('');
}

async function saveBlocks() {
  await api.put(`/admin/sections/${activeSection.id}/blocks`, {
    blocks: blocks.map(b => ({ type: b.type, content: b.content }))
  });
  alert('تم الحفظ ✅ — التعديلات ظاهرة الآن في الموقع مباشرة');
  loadSections();
}

document.getElementById('newSectionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api.post('/admin/sections', {
    title: document.getElementById('newTitle').value,
    slug: document.getElementById('newSlug').value
  });
  document.getElementById('newSectionForm').reset();
  loadSections();
});

loadSections();
