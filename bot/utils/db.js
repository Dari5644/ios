require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, process.env.DB_PATH || '../../database/database.sqlite');

// نفتح نفس ملف قاعدة البيانات الذي يستخدمه الباك إند (وضع WAL يسمح بقراءة/كتابة متزامنة آمنة)
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

module.exports = db;
