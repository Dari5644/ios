require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

require('./db'); // يهيّئ ملف database.sqlite ويطبّق المخطط عند أول تشغيل

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL, credentials: true } });

// إتاحة io لباقي الراوتات لبث "النشاط الحي" لحظياً عبر Socket.io
app.set('io', io);

// يدعم أكثر من نطاق مفصول بفاصلة في CLIENT_URL (مثال: https://mw3arena.com,https://www.mw3arena.com)
const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('غير مسموح بهذا النطاق (CORS)'));
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// الراوتات
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/rules', require('./routes/rules'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/admin', require('./routes/admin'));

io.on('connection', (socket) => {
  console.log('عميل متصل بالبث اللحظي:', socket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ السيرفر يعمل على المنفذ ${PORT} (قاعدة بيانات محلية SQLite)`));
