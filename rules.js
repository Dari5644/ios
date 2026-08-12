let tabsData = [];
let activeTabIndex = 0;

function renderTabs() {
  document.getElementById('rulesTabs').innerHTML = tabsData.map((t, i) => `
    <button class="tab-btn ${i === activeTabIndex ? 'active' : ''}" onclick="selectTab(${i})">${t.title}</button>
  `).join('');
}

function renderTabContent() {
  const tab = tabsData[activeTabIndex];
  const items = tab?.items || [];
  document.getElementById('rulesContent').innerHTML = items.length
    ? items.map(item => `
        <div style="margin-bottom:14px;">
          <h4 style="margin:0 0 4px;">${item.title}</h4>
          <p style="margin:0;color:var(--text-soft);font-size:14px;">${item.content}</p>
        </div>`).join('')
    : '<p style="color:var(--text-soft);">لا يوجد بنود في هذا التبويب بعد.</p>';
}

function selectTab(i) { activeTabIndex = i; renderTabs(); renderTabContent(); }

api.get('/rules').then(data => { tabsData = data; renderTabs(); renderTabContent(); });
