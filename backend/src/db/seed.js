// بيانات تجريبية أولية - شغّلها بـ: npm run seed
require('dotenv').config();
const db = require('./index');

const insertClass = db.prepare(`
  INSERT INTO player_classes (name, category, exclusive_group, description, sort_order)
  VALUES (?, ?, ?, ?, ?)
`);

const classes = [
  ['MCW - الرشاش الأساسي', 'primary_weapon', 'primary_slot', 'كلاس هجومي متوازن للمسافات المتوسطة', 1],
  ['SVA 545 - الرشاش الأساسي', 'primary_weapon', 'primary_slot', 'معدل نيران عالٍ للاشتباكات القريبة', 2],
  ['حقيبة ذخيرة إضافية', 'equipment', 'equipment_slot', 'زيادة الذخيرة الاحتياطية', 3],
  ['درع إضافي', 'equipment', 'equipment_slot', 'حماية إضافية عند الهبوط', 4],
];

const tx = db.transaction(() => {
  classes.forEach(c => insertClass.run(...c));

  const tab = db.prepare('INSERT INTO rule_tabs (title, slug, sort_order) VALUES (?, ?, ?)')
    .run('القوانين العامة', 'general', 1);
  db.prepare('INSERT INTO rule_items (tab_id, title, content, sort_order) VALUES (?, ?, ?, ?)')
    .run(tab.lastInsertRowid, 'الاحترام المتبادل', 'يُمنع السب أو التنمر تجاه أي لاعب داخل السيرفر أو المنصة.', 1);

  db.prepare('INSERT INTO sections (title, slug, sort_order) VALUES (?, ?, ?)').run('نبذة عن البطولة', 'about', 1);
});

tx();
console.log('✅ تم زرع بيانات تجريبية بنجاح');
