// Raund 3: namunasiz (haqiqiy) e'lon qatori balandligi. Bitta tadbirkor 2 ta e'lon joylaydi, so'ng mobil qatorlar o'lchanadi.
const { chromium } = require('playwright'); const path = require('path');
const BASE = 'http://127.0.0.1:3100';
(async () => {
  const b = await chromium.launch(); const c = await b.newContext(); const p = await c.newPage();
  await p.goto(BASE + '/');
  const res = await p.evaluate(async () => {
    const H = { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' };
    const r0 = await fetch('/api/auth/register', { method: 'POST', headers: H, body: JSON.stringify({ role: 'tadbirkor', name: 'R8 T', email: `r8-${Date.now()}@sinov.uz`, password: 'parol12345' }) });
    const base = { summary: 'Mahalla uchun tandir non va patir pishiradi, do‘konlarga yetkazadi.', description: 'Batafsil tavsif.', use_of_funds: 'Yangi tandir va xamir qorish mashinasi.', terms: 'Investorga 20% ulush taklif qilinadi.', action: 'publish' };
    const out = [r0.status];
    for (const d of [
      { name: 'Non sexi Chilonzor', sector: 'oziq-ovqat', region: 'toshkent-sh', stage: 'ishlayotgan', amount_usd: 15000 },
      { name: 'Tikuv sexi Qarshi', sector: 'ishlab-chiqarish', region: 'qashqadaryo', stage: 'ishlayotgan', amount_usd: 125000 },
    ]) { const r = await fetch('/api/projects', { method: 'POST', headers: H, body: JSON.stringify({ ...base, ...d }) }); out.push(r.status, await r.text()); }
    return out;
  });
  console.log(JSON.stringify(res).slice(0, 400));
  for (const [w, h] of [[360, 740], [390, 844]]) {
    const m = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); const q = await m.newPage();
    await q.goto(BASE + '/loyihalar'); await q.waitForSelector('tr.row');
    const rows = await q.evaluate(() => [...document.querySelectorAll('tr.row')].filter((tr) => !tr.querySelector('.tag--sample')).map((tr) => { const meta = tr.querySelector('.row__meta'); return { h: Math.round(tr.getBoundingClientRect().height), text: tr.innerText.replace(/\s+/g, ' ').slice(0, 90), metaClip: meta.scrollWidth > meta.clientWidth + 1 }; }));
    console.log(w, JSON.stringify(rows));
    await q.screenshot({ path: path.join(__dirname, 'screenshots', 'round3', `r8-real-rows-m${w}.png`) });
    await m.close();
  }
  await b.close();
})();
