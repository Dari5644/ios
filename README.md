# MW3 Arena 🧊

منصة تحديات ومنافسات رويال حصرية للعبة Call of Duty: Modern Warfare 3، بهوية بصرية جليدية
(أزرق فاتح جليدي + أبيض نقي + لمسات فضية/زجاجية)، تسجيل دخول حصري عبر Discord، نظام لفل تلقائي،
لوحة تحكم كاملة، وبوت ديسكورد متكامل. **قاعدة البيانات محلية بالكامل (ملف SQLite واحد)** بدون أي
سيرفر خارجي.

## 🗂️ هيكل المشروع

```
mw3-arena/
├── database/
│   ├── schema.sql          # مخطط قاعدة البيانات (يُطبَّق تلقائياً عند أول تشغيل)
│   └── database.sqlite     # يُنشأ تلقائياً عند أول تشغيل (ملف واحد يشترك فيه الباك إند + البوت)
│
├── backend/                # Node.js + Express + SQLite
│   ├── src/
│   │   ├── server.js
│   │   ├── db/             # اتصال SQLite + seed.js (بيانات تجريبية)
│   │   ├── models/         # User, PlayerClass, Rule, Section, BotSettings, Activity
│   │   ├── routes/         # auth, users, classes, rules, sections, leaderboard, activity, admin
│   │   ├── middleware/     # auth.js (JWT)
│   │   └── utils/          # leveling.js (نظام اللفل)
│   └── .env.example
│
├── bot/                    # Discord Bot (discord.js) - يقرأ إعداداته من نفس ملف SQLite
│   ├── index.js
│   ├── events/              # messageCreate, guildMemberAdd
│   ├── commands/             # /level
│   ├── utils/                # db.js, settingsWatcher.js (يراقب تغييرات لوحة التحكم لحظياً), leveling.js
│   └── .env.example
│
└── frontend/                # Next.js 14 + Tailwind (ثيمة الجليد/الفضة)
    └── src/
        ├── app/              # /, /activity, /rules, /class, /leaderboard, /admin/*
        ├── components/       # Navbar, LiveActivity, LeaderboardTable
        └── lib/api.js
```

## ⚙️ كيف تعمل القطع الثلاث معاً

- **قاعدة بيانات واحدة** (`database/database.sqlite`) بوضع WAL، تُقرأ وتُكتب بأمان من الباك إند
  والبوت في نفس اللحظة.
- **الباك إند** هو الوحيد الذي يتحدث مع الفرونت إند (REST API + Socket.io للبث اللحظي).
- **البوت** يقرأ إعداداته (Token / Client ID / Guild ID) مباشرة من جدول `bot_settings` كل 5 ثوانٍ.
  عند حفظ توكن جديد من لوحة التحكم، يعيد البوت تسجيل الدخول تلقائياً بدون أي تدخل يدوي في الطرفية.
- **تسجيل الدخول**: تدفق Discord OAuth2 يدوي (بدون Passport) ينتهي بإصدار JWT في كوكي httpOnly،
  مناسب تماماً لتخزين بدون سيرفر جلسات خارجي.

## 🚀 التثبيت والتشغيل

### 1) إعداد تطبيق Discord (مرة واحدة)
1. اذهب إلى https://discord.com/developers/applications وأنشئ تطبيقاً جديداً.
2. من تبويب **OAuth2** انسخ `Client ID` و`Client Secret`، وأضف Redirect URL:
   `http://localhost:5000/api/auth/discord/callback`
3. من تبويب **Bot** فعّل **Message Content Intent** و**Server Members Intent**، وانسخ الـ **Bot Token**
   (هذا التوكن يُدخل لاحقاً من لوحة التحكم، وليس في أي ملف env).
4. ادعُ البوت لسيرفرك عبر رابط `oauth2/authorize?...&scope=bot%20applications.commands`.

### 2) الباك إند
```bash
cd backend
cp .env.example .env      # عدّل DISCORD_CLIENT_ID / SECRET / JWT_SECRET
npm install
npm run seed               # (اختياري) بيانات تجريبية أولية
npm run dev                 # يعمل على http://localhost:5000
```
عند أول تشغيل يُنشأ ملف `database/database.sqlite` تلقائياً من `schema.sql`.

### 3) البوت
```bash
cd bot
cp .env.example .env
npm install
npm run dev
```
سيطبع البوت رسالة أنه **متوقف** حتى تُدخل التوكن من لوحة التحكم — هذا سلوك متوقع وآمن.

### 4) الفرونت إند
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # يعمل على http://localhost:3000
```

### 5) ربط البوت من لوحة التحكم
1. سجّل دخولك في الموقع عبر ديسكورد (أول مستخدم يمكن ترقيته لـ `admin` يدوياً في قاعدة البيانات:
   `UPDATE users SET role='admin' WHERE discord_id='...';`).
2. افتح `http://localhost:3000/admin/bot-settings`.
3. أدخل Bot Token و Client ID و Guild ID، فعّل الخيار، احفظ.
4. البوت سيلتقط الإعدادات تلقائياً خلال ثوانٍ ويسجل دخوله ويسجل أوامر السلاش على سيرفرك.

## 🌐 نشر الباك إند على سيرفر منفصل وربطه برابط

هذا السيناريو شائع: الباك إند على VPS (مثل Hetzner/DigitalOcean/AWS)، والفرونت إند على Vercel
أو سيرفر آخر. الخطوات:

### 1) على السيرفر (VPS)
```bash
# انسخ مجلدي backend/ و database/ فقط إلى السيرفر (مثلاً عبر git أو scp)
cd backend
npm install --omit=dev
cp .env.example .env
```
عدّل `.env` على السيرفر:
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://mw3arena.com          # رابط الفرونت إند الفعلي (بدون سلاش في النهاية)
CROSS_SITE_COOKIES=true                    # مهم جداً لأن الباك إند على دومين مختلف
DISCORD_CALLBACK_URL=https://api.mw3arena.com/api/auth/discord/callback
JWT_SECRET=سر_عشوائي_طويل_وقوي
```
> غيّر أيضاً Redirect URL في إعدادات تطبيق Discord (OAuth2) ليطابق `DISCORD_CALLBACK_URL` الجديد بالضبط.

### 2) تشغيله كخدمة دائمة (PM2)
```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup     # يجعل PM2 يعمل تلقائياً بعد إعادة إقلاع السيرفر
```

### 3) ربطه برابط (دومين + SSL)
وجّه سجل DNS من نوع **A** لدومين فرعي مثل `api.mw3arena.com` إلى IP السيرفر، ثم:
```bash
sudo apt install nginx certbot python3-certbot-nginx
sudo cp nginx.example.conf /etc/nginx/sites-available/mw3-arena-api
sudo ln -s /etc/nginx/sites-available/mw3-arena-api /etc/nginx/sites-enabled/
sudo certbot --nginx -d api.mw3arena.com   # يصدر شهادة SSL مجانية ويفعّل https تلقائياً
sudo systemctl reload nginx
```
الآن الباك إند متاح على: `https://api.mw3arena.com/api/...`

### 4) تحديث الفرونت إند ليشير للرابط الجديد
في `frontend/.env.local` (أو متغيرات البيئة على Vercel):
```env
NEXT_PUBLIC_API_URL=https://api.mw3arena.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.mw3arena.com
```
أعد بناء/نشر الفرونت إند بعد التعديل.

### 5) (بديل) نشر بالحاويات عبر Docker
```bash
cd backend
docker build -t mw3-arena-backend .
docker run -d --name mw3-backend \
  -p 5000:5000 \
  -v $(pwd)/../database:/app/../database \
  --env-file .env \
  mw3-arena-backend
```
ربط `-v` بمجلد `database/` خارج الحاوية **ضروري** حتى لا تُفقد بيانات SQLite عند إعادة بناء الصورة.

### ⚠️ ملاحظات مهمة عن SQLite على سيرفر منفصل
- شغّل **نسخة واحدة فقط** (`instances: 1` في PM2) من الباك إند على نفس ملف القاعدة، لأن
  `better-sqlite3` لا يدعم كتابة متزامنة آمنة من عدة عمليات منفصلة على نفس الملف في آن واحد
  (وضع WAL يسمح بقراءة/كتابة متزامنة من عملية واحدة + قارئين، وليس من عدة كاتبين).
- إذا كان البوت يعمل على نفس السيرفر: تأكد أن `DB_PATH` في `bot/.env` يشير لنفس مسار
  `database/database.sqlite` المستخدم في الباك إند.
- خذ نسخة احتياطية دورية بسيطة: `cp database/database.sqlite backups/db-$(date +%F).sqlite`.

## 🎨 نظام الألوان (مطابق للشعار)
معرّف في `frontend/tailwind.config.js` تحت `ice` (الأزرق الجليدي) و`silver` (الفضي) — كل مكوّن
في المشروع يستخدم هذه الألوان فقط، بالإضافة لتأثير `.glass-panel` للزجاج المعالج.

## 🧩 أهم الصفحات
| المسار | الوصف |
|---|---|
| `/` | الرئيسية + النشاط الحي |
| `/activity` | صفحة النشاط الحي الكاملة (بث لحظي عبر Socket.io) |
| `/rules` | القوانين مقسّمة لتبويبات |
| `/class` | اختيار كلاس MW3 مع التوزيع الذكي عند التعارض |
| `/leaderboard` | ترتيب اللاعبين حسب اللفل |
| `/admin/bot-settings` | ربط بيانات البوت |
| `/admin/classes` | إدارة الكلاسات |
| `/admin/sections` | محرر السحب والإفلات للأقسام الديناميكية |

## 📌 ملاحظات مهمة
- **الأمان**: التوكن لا يُعرض كاملاً في الواجهة بعد الحفظ (Masking)، وكل راوتات `/api/admin/*`
  محمية بـ JWT + دور `admin`.
- **التوسعة**: أضف صفحة `/admin/rules` بنفس نمط `/admin/classes` لإدارة تبويبات القوانين من الواجهة
  (الراوتات الخلفية جاهزة بالكامل في `backend/src/routes/admin.js`).
- تم تنفيذ **صفحة "البحث عن لاعبين" بالحذف الكامل** كما طُلب — لا وجود لها في أي راوت أو صفحة.
