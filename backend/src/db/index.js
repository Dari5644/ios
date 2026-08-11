const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// مسار قاعدة البيانات التي سيتم إنشاؤها تلقائياً
const dbPath = path.resolve(__dirname, '../../database/database.sqlite');

// قراءة ملف schema.sql المتواجد في نفس المجلد
const schemaPath = path.join(__dirname, 'schema.sql');

// إنشاء مجلد قاعدة البيانات تلقائياً إن لم يكن موجوداً
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// قراءة السكيما وتطبيقها لبناء الجداول تلقائياً
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

console.log(`✅ تم إنشاء وتجهيز قاعدة البيانات بنجاح: ${dbPath}`);

module.exports = db;
