// Platforma sozlamalari. Platforma nomini faqat shu yerda o‘zgartiring
// (yoki ishga tushirishda PLATFORM_NAME muhit o‘zgaruvchisini bering).
// Nom yuqori panel, <title>, footer va barcha sahifa sarlavhalarida shu qiymatdan olinadi.
'use strict';
const path = require('node:path');

module.exports = {
  platformName: process.env.PLATFORM_NAME || 'Loyihalar reestri',
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '127.0.0.1',
  dataDir: process.env.DATA_DIR || path.join(__dirname, 'data'),
  // HTTPS orqasida ishlaganda COOKIE_SECURE=1 bering.
  cookieSecure: process.env.COOKIE_SECURE === '1',
  sessionDays: 30,
  maxImageBytes: 3 * 1024 * 1024,
};
