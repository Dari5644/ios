const db = require('../db');

const Rule = {
  allTabsWithItems() {
    const tabs = db.prepare('SELECT * FROM rule_tabs ORDER BY sort_order ASC').all();
    const itemsStmt = db.prepare('SELECT * FROM rule_items WHERE tab_id = ? ORDER BY sort_order ASC');
    return tabs.map(tab => ({ ...tab, items: itemsStmt.all(tab.id) }));
  },

  createTab({ title, slug, sortOrder = 0 }) {
    const info = db.prepare('INSERT INTO rule_tabs (title, slug, sort_order) VALUES (?, ?, ?)').run(title, slug, sortOrder);
    return db.prepare('SELECT * FROM rule_tabs WHERE id = ?').get(info.lastInsertRowid);
  },

  updateTab(id, { title, slug, sortOrder }) {
    db.prepare('UPDATE rule_tabs SET title=?, slug=?, sort_order=? WHERE id=?').run(title, slug, sortOrder, id);
  },

  deleteTab(id) {
    db.prepare('DELETE FROM rule_tabs WHERE id = ?').run(id); // rule_items تُحذف تلقائياً (CASCADE)
  },

  addItem({ tabId, title, content, sortOrder = 0 }) {
    const info = db.prepare('INSERT INTO rule_items (tab_id, title, content, sort_order) VALUES (?, ?, ?, ?)')
      .run(tabId, title, content, sortOrder);
    return db.prepare('SELECT * FROM rule_items WHERE id = ?').get(info.lastInsertRowid);
  },

  updateItem(id, { title, content, sortOrder }) {
    db.prepare('UPDATE rule_items SET title=?, content=?, sort_order=? WHERE id=?').run(title, content, sortOrder, id);
  },

  deleteItem(id) {
    db.prepare('DELETE FROM rule_items WHERE id = ?').run(id);
  }
};

module.exports = Rule;
