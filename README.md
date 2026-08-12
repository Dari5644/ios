# MW3 Arena — الفرونت إند (20 ملف، بدون مجلدات، ألوان مريحة)

فرونت إند ثابت 100% (HTML/CSS/JS خام) بدون أي build step. كل الملفات بمستوى واحد.

## ⚙️ الإعداد المطلوب (خطوة واحدة)
افتح `config.js` وغيّر رابط الباك إند:
```js
const API_URL = 'https://api.mw3arena.com/api';
const SOCKET_URL = 'https://api.mw3arena.com';
```

## 📁 الملفات العشرون
| النوع | الملفات |
|---|---|
| صفحات (8) | index.html, activity.html, rules.html, class.html, leaderboard.html, admin-bot-settings.html, admin-classes.html, admin-sections.html |
| منطق JS (10) | config.js, api.js, navbar.js, live-activity.js, rules.js, class.js, leaderboard.js, admin-bot-settings.js, admin-classes.js, admin-sections.js |
| تنسيق (1) | style.css |
| توثيق (1) | README.md |

## 🎨 الألوان
تركواز ترابي هادئ (`--teal-500: #6fa8a0`) على خلفية كريمية دافئة (`--bg: #f6f5f1`) بدل الأزرق
الجليدي اللامع — أهدأ للعين عند الاستخدام الطويل، مع إبقاء نفس روح الهوية (بطاقات زجاجية،
حواف ناعمة). كل المتغيرات في أعلى `style.css` تحت `:root` — غيّرها من مكان واحد لو حبيت تعدّل التدرج.

## 🚀 الرفع
ارفع الملفات العشرين كما هي لأي استضافة (مشتركة، Netlify، GitHub Pages، أو أي VPS مع Nginx).
لا يوجد أي أمر تثبيت أو بناء.

## 🔐 ملاحظة تسجيل الدخول
إذا الباك إند على دومين مختلف، فعّل في `.env` تبع الباك إند:
```env
CLIENT_URL=https://رابط-الفرونت-إند
CROSS_SITE_COOKIES=true
```
