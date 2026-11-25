'use strict';
// API oqimining tezkor sinovi: vaqtinchalik bazada serverni ko'taradi va
// ro'yxatdan o'tish → loyiha joylash → so'rov → qabul oqimini hamda egalik/maxfiylik tekshiruvlarini sinaydi.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'platforma-test-'));
process.env.DATA_DIR = tmp;
process.env.PORT = '0';
const { server } = require('./server');

class Client {
  constructor(base) { this.base = base; this.cookie = ''; }
  async req(method, url, body, headers = {}) {
    const h = { 'X-Requested-With': 'fetch', ...headers };
    if (this.cookie) h.Cookie = this.cookie;
    let payload;
    if (Buffer.isBuffer(body)) payload = body;
    else if (body !== undefined) { payload = JSON.stringify(body); h['Content-Type'] = 'application/json'; }
    const res = await fetch(this.base + url, { method, headers: h, body: payload });
    const sc = res.headers.get('set-cookie');
    if (sc) this.cookie = sc.split(';')[0];
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data, text };
  }
}

const full = {
  name: 'Sinov novvoyxonasi',
  sector: 'oziq-ovqat', region: 'jizzax', stage: 'ishlayotgan',
  summary: 'Mahalla uchun tandir non va pishiriqlar tayyorlaydi.',
  description: 'Ikki yildan beri ishlaydi.',
  amount_usd: '15 000',
  use_of_funds: 'Tandir — 50%\nXomashyo — 50%',
  terms: 'Foydadan 20% ulush.',
};

async function main() {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const guest = new Client(base);
  const ent = new Client(base);
  const inv = new Client(base);
  const other = new Client(base);
  let n = 0;
  const ok = (msg) => console.log(`  ✓ ${++n}. ${msg}`);

  let r = await guest.req('GET', '/api/projects');
  assert.equal(r.status, 200);
  assert.ok(r.data.total >= 1 && r.data.items.length === r.data.total && r.data.items.every((p) => p.is_sample));
  ok(`Mehmon katalogni ko'radi (${r.data.total} ta namuna e'lon)`);

  r = await guest.req('GET', '/');
  assert.equal(r.status, 200);
  assert.match(r.text, /<title>[^<]+<\/title>/);
  ok('Bosh sahifa qobig\'i ochiladi');

  r = await ent.req('POST', '/api/auth/register', { role: 'tadbirkor', name: 'Aziz', email: 'aziz@test.uz', password: 'parol12345' });
  assert.equal(r.status, 201);
  r = await inv.req('POST', '/api/auth/register', { role: 'investor', name: 'Dilnoza', email: 'dilnoza@test.uz', password: 'parol12345' });
  assert.equal(r.status, 201);
  r = await other.req('POST', '/api/auth/register', { role: 'tadbirkor', name: 'Boshqa', email: 'boshqa@test.uz', password: 'parol12345' });
  assert.equal(r.status, 201);
  ok('Tadbirkor, investor va ikkinchi tadbirkor ro\'yxatdan o\'tdi');

  r = await ent.req('POST', '/api/auth/register', { role: 'investor', name: 'X', email: 'aziz@test.uz', password: 'parol12345' });
  assert.equal(r.status, 422);
  assert.ok(r.data.errors.email);
  ok('Takroriy email rad etiladi');

  r = await new Client(base).req('POST', '/api/auth/login', { email: 'aziz@test.uz', password: 'notogri' });
  assert.equal(r.status, 401);
  ok('Noto\'g\'ri parol bilan kirib bo\'lmaydi');

  r = await ent.req('POST', '/api/projects', { name: 'Sinov novvoyxonasi', action: 'draft' });
  assert.equal(r.status, 201);
  const pid = r.data.project.id;
  assert.equal(r.data.project.status, 'draft');
  ok('Qisman to\'ldirilgan qoralama saqlandi');

  r = await guest.req('GET', `/api/projects/${pid}`);
  assert.equal(r.status, 404);
  r = await guest.req('GET', '/api/projects?limit=100');
  assert.ok(!r.data.items.some((p) => p.id === pid));
  ok('Qoralama katalogda va ochiq sahifada ko\'rinmaydi');

  r = await ent.req('PUT', `/api/projects/${pid}`, { name: 'Sinov novvoyxonasi', action: 'publish' });
  assert.equal(r.status, 422);
  assert.ok(r.data.errors.sector && r.data.errors.amount_usd && r.data.errors.terms);
  ok('To\'ldirilmagan maydonlar bilan nashr qilishda maydon xatolari qaytadi');

  r = await other.req('PUT', `/api/projects/${pid}`, { ...full, action: 'publish' });
  assert.equal(r.status, 404);
  r = await inv.req('PUT', `/api/projects/${pid}`, { ...full, action: 'publish' });
  assert.equal(r.status, 403);
  ok('Begona akkaunt loyihani tahrirlay olmaydi');

  r = await ent.req('PUT', `/api/projects/${pid}`, { ...full, action: 'publish' });
  assert.equal(r.status, 200);
  assert.equal(r.data.project.status, 'published');
  assert.equal(r.data.project.amount_usd, 15000);
  ok('E\'lon nashr qilindi');

  const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082', 'hex');
  r = await ent.req('PUT', `/api/projects/${pid}/image`, png, { 'Content-Type': 'image/png' });
  assert.equal(r.status, 200);
  const img = await fetch(base + r.data.image);
  assert.equal(img.status, 200);
  r = await ent.req('PUT', `/api/projects/${pid}/image`, Buffer.from('salom dunyo, bu rasm emas'), { 'Content-Type': 'image/png' });
  assert.equal(r.status, 415);
  ok('Rasm yuklanadi, rasm bo\'lmagan fayl rad etiladi');

  r = await guest.req('GET', '/api/projects?hudud=jizzax&soha=oziq-ovqat&bosqich=ishlayotgan&summa=b&tartib=summa-kamayish');
  assert.ok(r.data.items.some((p) => p.id === pid));
  r = await guest.req('GET', '/api/projects?summa=a');
  assert.ok(!r.data.items.some((p) => p.id === pid));
  r = await guest.req('GET', '/api/projects?tartib=summa-kamayish&limit=100');
  const amounts = r.data.items.map((p) => p.amount_usd);
  assert.deepEqual(amounts, [...amounts].sort((a, b) => b - a));
  ok('Investor e\'lonni soha/hudud/bosqich/summa filtri bilan topadi, summa tartibi to\'g\'ri');

  r = await guest.req('PUT', `/api/saved/${pid}`);
  assert.equal(r.status, 401);
  r = await inv.req('PUT', `/api/saved/${pid}`);
  assert.equal(r.status, 200);
  r = await inv.req('GET', '/api/projects?saqlangan=1');
  assert.deepEqual(r.data.items.map((p) => p.id), [pid]);
  const inv2 = new Client(base);
  await inv2.req('POST', '/api/auth/login', { email: 'dilnoza@test.uz', password: 'parol12345' });
  r = await inv2.req('GET', '/api/me/saved');
  assert.deepEqual(r.data.ids, [pid]);
  ok('Saqlash serverda: boshqa sessiyadan ham ko\'rinadi, mehmon saqlay olmaydi');

  const contact = '+998 90 111 22 33 @dilnoza_inv';
  r = await guest.req('POST', `/api/projects/${pid}/requests`, { message: 'Qiziqaman, batafsil gaplashsak.', contact });
  assert.equal(r.status, 401);
  r = await ent.req('POST', `/api/projects/${pid}/requests`, { message: 'Qiziqaman, batafsil gaplashsak.', contact });
  assert.equal(r.status, 403);
  r = await inv.req('POST', `/api/projects/${pid}/requests`, { message: 'qisqa', contact: '' });
  assert.equal(r.status, 422);
  assert.ok(r.data.errors.message && r.data.errors.contact);
  r = await inv.req('POST', `/api/projects/${pid}/requests`, { message: 'Qiziqaman, batafsil gaplashsak.', contact });
  assert.equal(r.status, 201);
  const rid = r.data.request.id;
  r = await inv.req('POST', `/api/projects/${pid}/requests`, { message: 'Yana bir bor yozyapman.', contact });
  assert.equal(r.status, 409);
  const sample = (await guest.req('GET', '/api/projects')).data.items.find((p) => p.is_sample);
  r = await inv.req('POST', `/api/projects/${sample.id}/requests`, { message: 'Qiziqaman, batafsil gaplashsak.', contact });
  assert.equal(r.status, 409);
  ok('Investor so\'rov yubordi (validatsiya, takror va namunaga yuborish bloklanadi)');

  for (const c of [guest, other]) {
    const pub = await c.req('GET', `/api/projects/${pid}`);
    const list = await c.req('GET', '/api/projects?limit=100');
    for (const t of [pub.text, list.text]) {
      assert.ok(!t.includes('aziz@test.uz') && !t.includes('dilnoza') && !t.includes('111 22 33') && !t.includes('owner_id'));
    }
  }
  ok('Ochiq katalog va loyiha API javobida email/aloqa ma\'lumoti yo\'q');

  r = await other.req('GET', '/api/me/requests/incoming');
  assert.equal(r.data.items.length, 0);
  r = await other.req('POST', `/api/requests/${rid}/accept`);
  assert.equal(r.status, 404);
  r = await inv.req('POST', `/api/requests/${rid}/accept`);
  assert.equal(r.status, 403);
  ok('So\'rov begona tadbirkorga ko\'rinmaydi va uni qabul qila olmaydi');

  r = await ent.req('GET', '/api/me/requests/incoming');
  assert.equal(r.data.items.length, 1);
  assert.equal(r.data.items[0].contact, contact);
  r = await ent.req('POST', `/api/requests/${rid}/accept`);
  assert.equal(r.status, 200);
  r = await ent.req('POST', `/api/requests/${rid}/reject`);
  assert.equal(r.status, 409);
  ok('Loyiha egasi so\'rovni (investor aloqasi bilan) ko\'rdi va qabul qildi');

  r = await inv.req('GET', '/api/me/requests/outgoing');
  assert.equal(r.data.items[0].status, 'accepted');
  assert.ok(!JSON.stringify(r.data).includes('aziz@test.uz'));
  ok('Investor kabinetida holat: accepted (Qabul qilindi)');

  r = await ent.req('POST', `/api/projects/${pid}/close`);
  assert.equal(r.data.project.status, 'closed');
  r = await guest.req('GET', '/api/projects?limit=100');
  assert.ok(!r.data.items.some((p) => p.id === pid));
  r = await inv.req('POST', `/api/projects/${pid}/requests`, { message: 'Yopilgandan keyin yozyapman.', contact });
  assert.equal(r.status, 409);
  ok('Yopilgan e\'lon katalogdan chiqadi va so\'rov qabul qilmaydi');

  r = await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { Cookie: inv.cookie } });
  assert.equal(r.status, 403);
  r = await fetch(`${base}/api/projects`, { method: 'POST', headers: { Cookie: ent.cookie, 'Content-Type': 'text/plain', 'X-Requested-With': 'fetch' }, body: '{}' });
  assert.equal(r.status, 415);
  ok('CSRF himoyasi: maxsus sarlavhasiz yoki JSON bo\'lmagan so\'rov rad etiladi');

  r = await inv.req('POST', '/api/auth/logout');
  r = await inv.req('GET', '/api/auth/me');
  assert.equal(r.data.user, null);
  ok('Chiqishdan keyin sessiya bekor qilinadi');

  console.log(`\nHammasi o'tdi: ${n} ta tekshiruv.`);
}

main()
  .catch((e) => { console.error('\nSINOV XATOSI:', e); process.exitCode = 1; })
  .finally(() => { server.close(); fs.rmSync(tmp, { recursive: true, force: true }); });
