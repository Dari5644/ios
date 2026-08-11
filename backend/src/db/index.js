const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// تحديد مسار قاعدة البيانات داخل مجلد /app/database
const dbPath = path.resolve(__dirname, '../../database/database.sqlite');

// إنشاء المجلد تلقائياً
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// سكيما MW3 Arena كاملة ومضمونة داخل الكود مباشرة
const schema = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id    TEXT UNIQUE NOT NULL,
  username      TEXT NOT NULL,
  nickname      TEXT,
  avatar        TEXT,
  level         INTEGER DEFAULT 1,
  xp            INTEGER DEFAULT 0,
  role          TEXT DEFAULT 'member',
  selected_class_id INTEGER,
  messages_count INTEGER DEFAULT 0,
  challenges_joined INTEGER DEFAULT 0,
  wins          INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (selected_class_id) REFERENCES player_classes(id)
);

CREATE TABLE IF NOT EXISTS player_classes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  exclusive_group TEXT,
  description     TEXT,
  image_url       TEXT,
  is_active       INTEGER DEFAULT 1,
  sort_order      INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_classes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER NOT NULL,
  class_id  INTEGER NOT NULL,
  UNIQUE(user_id, class_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES player_classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rule_tabs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rule_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tab_id      INTEGER NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  FOREIGN KEY (tab_id) REFERENCES rule_tabs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  is_in_nav   INTEGER DEFAULT 1,
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS section_blocks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id  INTEGER NOT NULL,
  block_type  TEXT NOT NULL,
  content     TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bot_settings (
  id                  INTEGER PRIMARY KEY CHECK (id = 1),
  bot_token           TEXT,
  client_id           TEXT,
  guild_id            TEXT,
  level_up_channel_id TEXT,
  is_enabled          INTEGER DEFAULT 0,
  updated_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER,
  type        TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO bot_settings (id, is_enabled) VALUES (1, 0);
`;

// تطبيق الجداول على قاعدة البيانات عند الإقلاع
db.exec(schema);

console.log(`✅ تم تجهيز قاعدة البيانات والجداول بنجاح: ${dbPath}`);

module.exports = db;
