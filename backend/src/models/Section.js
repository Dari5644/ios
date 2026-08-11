const db = require('../db');

const Section = {
  allWithBlocks() {
    const sections = db.prepare('SELECT * FROM sections ORDER BY sort_order ASC').all();
    const blocksStmt = db.prepare('SELECT * FROM section_blocks WHERE section_id = ? ORDER BY sort_order ASC');
    return sections.map(s => ({
      ...s,
      blocks: blocksStmt.all(s.id).map(b => ({ ...b, content: JSON.parse(b.content) }))
    }));
  },

  findBySlug(slug) {
    const section = db.prepare('SELECT * FROM sections WHERE slug = ?').get(slug);
    if (!section) return null;
    const blocks = db.prepare('SELECT * FROM section_blocks WHERE section_id = ? ORDER BY sort_order ASC')
      .all(section.id).map(b => ({ ...b, content: JSON.parse(b.content) }));
    return { ...section, blocks };
  },

  create({ title, slug, isInNav = 1, sortOrder = 0 }) {
    const info = db.prepare('INSERT INTO sections (title, slug, is_in_nav, sort_order) VALUES (?, ?, ?, ?)')
      .run(title, slug, isInNav, sortOrder);
    return db.prepare('SELECT * FROM sections WHERE id = ?').get(info.lastInsertRowid);
  },

  update(id, { title, slug, isInNav, sortOrder }) {
    db.prepare('UPDATE sections SET title=?, slug=?, is_in_nav=?, sort_order=? WHERE id=?')
      .run(title, slug, isInNav, sortOrder, id);
  },

  remove(id) {
    db.prepare('DELETE FROM sections WHERE id = ?').run(id);
  },

  // استبدال كامل بلوكات القسم دفعة واحدة (مناسب لمحرر السحب والإفلات الذي يرسل الترتيب الكامل بعد كل تعديل)
  replaceBlocks(sectionId, blocks) {
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM section_blocks WHERE section_id = ?').run(sectionId);
      const insert = db.prepare(`
        INSERT INTO section_blocks (section_id, block_type, content, sort_order) VALUES (?, ?, ?, ?)
      `);
      blocks.forEach((b, idx) => {
        insert.run(sectionId, b.type, JSON.stringify(b.content || {}), idx);
      });
    });
    tx();
    return this.findBySlug(db.prepare('SELECT slug FROM sections WHERE id = ?').get(sectionId).slug);
  }
};

module.exports = Section;
