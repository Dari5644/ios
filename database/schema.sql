-- ============================================
-- MW3 Arena - قاعدة بيانات محلية (SQLite)
-- ملف واحد يشترك فيه الباك إند وبوت الديسكورد
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id    TEXT UNIQUE NOT NULL,
  username      TEXT NOT NULL,
  nickname      TEXT,               -- اللقب داخل السيرفر المعتمد
  avatar        TEXT,
  level         INTEGER DEFAULT 1,
  xp            INTEGER DEFAULT 0,
  role          TEXT DEFAULT 'member', -- member | moderator | admin
  selected_class_id INTEGER,
  messages_count INTEGER DEFAULT 0,
  challenges_joined INTEGER DEFAULT 0,
  wins          INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (selected_class_id) REFERENCES player_classes(id)
);

-- كلاسات MW3 (أسلحة / بيركات / معدات) مع دعم "التوزيع الذكي" عبر exclusive_group
CREATE TABLE IF NOT EXISTS player_classes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,      -- primary_weapon, secondary, perk, equipment...
  exclusive_group TEXT,               -- الكلاسات بنفس المجموعة تتعارض ولا يمكن اختيار أكثر من واحدة
  description     TEXT,
  image_url       TEXT,
  is_active       INTEGER DEFAULT 1,
  sort_order      INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- ربط المستخدمين بالكلاسات المختارة (many-to-many مع احترام exclusive_group)
CREATE TABLE IF NOT EXISTS user_classes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER NOT NULL,
  class_id  INTEGER NOT NULL,
  UNIQUE(user_id, class_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES player_classes(id) ON DELETE CASCADE
);

-- القوانين مقسّمة لتبويبات
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

-- الأقسام الديناميكية (Drag & Drop Page Builder)
CREATE TABLE IF NOT EXISTS sections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  is_in_nav   INTEGER DEFAULT 1,
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- عناصر داخل كل قسم (بلوكات قابلة للسحب والإفلات: نص، صورة، بطاقة، إلخ)
CREATE TABLE IF NOT EXISTS section_blocks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id  INTEGER NOT NULL,
  block_type  TEXT NOT NULL,        -- text | image | card | button | grid ...
  content     TEXT NOT NULL,        -- JSON نصي يحتوي بيانات البلوك
  sort_order  INTEGER DEFAULT 0,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- إعدادات البوت (Token / Client ID / Guild ID) — تُدار بالكامل من لوحة التحكم
CREATE TABLE IF NOT EXISTS bot_settings (
  id           INTEGER PRIMARY KEY CHECK (id = 1), -- سجل واحد فقط دائماً
  bot_token    TEXT,
  client_id    TEXT,
  guild_id     TEXT,
  level_up_channel_id TEXT,
  is_enabled   INTEGER DEFAULT 0,
  updated_at   TEXT DEFAULT (datetime('now'))
);

-- سجل النشاط الحي (انضمام، ترقية لفل، تحدي جديد...)
CREATE TABLE IF NOT EXISTS activity_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER,
  type        TEXT NOT NULL,   -- join | level_up | new_challenge | class_change
  message     TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO bot_settings (id, is_enabled) VALUES (1, 0);
