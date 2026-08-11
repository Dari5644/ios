// تشغيل الباك إند كخدمة دائمة (تعيد التشغيل تلقائياً عند الأعطال أو إعادة إقلاع السيرفر)
// الاستخدام: pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [
    {
      name: 'mw3-arena-backend',
      script: 'src/server.js',
      cwd: __dirname,
      instances: 1,         // اتركها 1 لأن better-sqlite3 غير آمن للاستخدام من عدة عمليات (processes) متزامنة على نفس الملف بدون تنسيق
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
