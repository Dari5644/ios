const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// تحديد المسار بالنسبة لمجلد backend/src/db (الصعود مستويين يوصلك لـ /app)
const dbPath = path.resolve(__dirname, process.env.DB_PATH || '../../database/database.sqlite');
const schemaPath = path.resolve(__dirname, '../../database/schema.sql');

// إنشاء مجلد قاعدة البيانات إن لم يكن موجوداً
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// تطبيق المخطط عند أول تشغيل
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

console.log(`✅ قاعدة بيانات SQLite جاهزة: ${dbPath}`);

module.exports = db;
