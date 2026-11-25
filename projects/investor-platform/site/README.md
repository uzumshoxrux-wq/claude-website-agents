# Investor platformasi — v1

Node 22.13+ kerak. Tashqi npm bog‘liqliklari yo‘q (`node:http` + o‘rnatilgan `node:sqlite`).

```bash
cd projects/investor-platform/site
npm start                # http://127.0.0.1:3000
PORT=8080 npm start      # boshqa port
HOST=0.0.0.0 npm start   # telefondan lokal tarmoq orqali ochish uchun
npm run seed:demo        # ixtiyoriy: 2 ta sinov akkaunti (parol: sinov12345)
npm run test:api         # API oqimi sinovi (vaqtinchalik bazada)
```

- **Platforma nomi:** `config.js` → `platformName` (yoki `PLATFORM_NAME` muhit o‘zgaruvchisi).
- **Ma’lumotlar bazasi:** `data/platform.db` (SQLite), yuklangan rasmlar: `data/uploads/`.
  Boshqa joy uchun `DATA_DIR=/yo‘l npm start`.
- **Namuna e’lonlar:** bo‘sh bazada avtomatik qo‘shiladi (`server/samples.js`), "NAMUNA" belgili.
  Ularsiz boshlash: yangi bazada `NO_SAMPLES=1 npm start`.
- HTTPS orqasida ishlatilganda `COOKIE_SECURE=1` bering.

Tuzilma: `server/` (API, baza, sinov), `public/` (ilova qobig‘i, `assets/app.js`, `assets/app.css`, `fonts/` — IBM Plex, OFL).
