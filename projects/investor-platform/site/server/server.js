'use strict';
// Platforma serveri: tashqi bog'liqliksiz (Node 22: node:http + node:sqlite).
// API: /api/*, rasm fayllari: /uploads/*, statik fayllar: /assets, /fonts,
// qolgan GET so'rovlar ilova qobig'ini (index.html) qaytaradi.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const config = require('../config');
const tax = require('./taxonomy');
const { db } = require('./db');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPLOAD_DIR = path.join(config.dataDir, 'uploads');
const INDEX_TEMPLATE = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');

/* ------------------------------------------------------------------ */
/* Yordamchilar                                                        */
/* ------------------------------------------------------------------ */

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; " +
    "font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}

function json(res, status, data, headers = {}) {
  send(res, status, JSON.stringify(data), {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new HttpError(413, 'Yuborilgan ma’lumot hajmi juda katta.'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJSON(req) {
  const type = (req.headers['content-type'] || '').split(';')[0].trim();
  if (type !== 'application/json') throw new HttpError(415, 'So‘rov JSON formatida bo‘lishi kerak.');
  const buf = await readBody(req, 64 * 1024);
  if (!buf.length) return {};
  try {
    const v = JSON.parse(buf.toString('utf8'));
    if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error();
    return v;
  } catch {
    throw new HttpError(400, 'Noto‘g‘ri JSON.');
  }
}

function parseCookies(req) {
  const out = {};
  const h = req.headers.cookie;
  if (!h) return out;
  for (const part of h.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

const str = (v) => (typeof v === 'string' ? v.trim() : '');

/* ------------------------------------------------------------------ */
/* Parollar va sessiyalar                                              */
/* ------------------------------------------------------------------ */

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function verifyPassword(password, stored) {
  const [alg, saltB64, hashB64] = String(stored).split('$');
  if (alg !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}
// Mavjud bo'lmagan email bilan kirishda ham bir xil vaqt sarflash uchun.
const DUMMY_HASH = hashPassword(crypto.randomBytes(12).toString('hex'));

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const SESSION_COOKIE = 'sid';

function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const maxAge = config.sessionDays * 86400;
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(sha256(token), userId, Date.now() + maxAge * 1000);
  res.setHeader('Set-Cookie', cookieString(token, maxAge));
}

function cookieString(value, maxAge) {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}` +
    (config.cookieSecure ? '; Secure' : '');
}

function currentUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const row = db.prepare(`SELECT u.id, u.email, u.role, u.display_name, s.expires_at
    FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`).get(sha256(token));
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
    return null;
  }
  return { id: row.id, email: row.email, role: row.role, name: row.display_name };
}

function requireUser(ctx, role) {
  if (!ctx.user) throw new HttpError(401, 'Bu amal uchun akkauntga kiring.');
  if (role && ctx.user.role !== role) {
    throw new HttpError(403, role === 'tadbirkor'
      ? 'Bu amal faqat tadbirkor akkaunti uchun.'
      : 'Bu amal faqat investor akkaunti uchun.');
  }
  return ctx.user;
}

// Oddiy xotiradagi cheklov: kirish/ro'yxatdan o'tishni ko'p urinishdan himoya qiladi.
const attempts = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || a.reset < now) {
    attempts.set(key, { n: 1, reset: now + windowMs });
    return;
  }
  a.n += 1;
  if (a.n > max) throw new HttpError(429, 'Urinishlar juda ko‘p. Birozdan keyin qayta urinib ko‘ring.');
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of attempts) if (v.reset < now) attempts.delete(k);
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
}, 10 * 60 * 1000).unref();

/* ------------------------------------------------------------------ */
/* Loyiha ma'lumotlari                                                 */
/* ------------------------------------------------------------------ */

const LIMITS = { name: 80, summary: 160, description: 4000, use_of_funds: 2000, terms: 2000 };
const REQUIRED_FOR_PUBLISH = ['name', 'sector', 'region', 'stage', 'summary', 'amount_usd', 'use_of_funds', 'terms'];
const REQUIRED_MSG = {
  name: 'Biznes nomini kiriting.',
  sector: 'Sohani tanlang.',
  region: 'Hududni tanlang.',
  stage: 'Loyiha bosqichini tanlang.',
  summary: 'Qisqa tavsifni yozing.',
  amount_usd: 'Kerakli investitsiya miqdorini kiriting.',
  use_of_funds: 'Mablag‘ nimaga ishlatilishini yozing.',
  terms: 'Hamkorlik shartlarini yozing.',
};

function validateProject(input, forPublish) {
  const errors = {};
  const data = {};
  for (const f of Object.keys(LIMITS)) {
    data[f] = str(input[f]).replace(/\r\n/g, '\n');
    if (data[f].length > LIMITS[f]) errors[f] = `Ko‘pi bilan ${LIMITS[f]} ta belgi.`;
  }
  const enums = { sector: tax.sectorKeys, region: tax.regionKeys, stage: tax.stageKeys };
  for (const [f, set] of Object.entries(enums)) {
    const v = str(input[f]);
    data[f] = v || null;
    if (v && !set.has(v)) errors[f] = 'Ro‘yxatdan tanlang.';
  }
  const rawAmount = input.amount_usd;
  if (rawAmount === '' || rawAmount === null || rawAmount === undefined) {
    data.amount_usd = null;
  } else {
    const n = Number(String(rawAmount).replace(/[\s ]/g, ''));
    if (!Number.isInteger(n) || n < 100 || n > 100000000) {
      errors.amount_usd = 'Butun son kiriting: 100 dan 100 000 000 USD gacha.';
    }
    data.amount_usd = Number.isInteger(n) ? n : null;
  }
  if (forPublish) {
    for (const f of REQUIRED_FOR_PUBLISH) {
      if (!errors[f] && (data[f] === null || data[f] === '')) errors[f] = REQUIRED_MSG[f];
    }
    if (!errors.summary && data.summary.length < 20) errors.summary = 'Qisqa tavsif kamida 20 ta belgidan iborat bo‘lsin.';
  }
  return { data, errors };
}

function imageUrl(file) {
  return file ? `/uploads/${file}` : null;
}

function projectDetail(row, user) {
  return {
    id: row.id,
    status: row.status,
    name: row.name,
    sector: row.sector,
    region: row.region,
    stage: row.stage,
    summary: row.summary,
    description: row.description,
    amount_usd: row.amount_usd,
    use_of_funds: row.use_of_funds,
    terms: row.terms,
    image: imageUrl(row.image),
    is_sample: !!row.is_sample,
    published_at: row.published_at,
    updated_at: row.updated_at,
    is_own: !!user && user.id === row.owner_id,
  };
}

function getProject(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

function ownProject(ctx, id) {
  const user = requireUser(ctx, 'tadbirkor');
  const row = getProject(id);
  if (!row || row.owner_id !== user.id) throw new HttpError(404, 'Loyiha topilmadi.');
  return row;
}

function catalogQuery(params, user) {
  const where = ["p.status = 'published'"];
  const args = [];
  const sector = params.get('soha');
  const region = params.get('hudud');
  const stage = params.get('bosqich');
  const amount = params.get('summa');
  const q = (params.get('q') || '').trim().slice(0, 80);
  if (sector && tax.sectorKeys.has(sector)) { where.push('p.sector = ?'); args.push(sector); }
  if (region && tax.regionKeys.has(region)) { where.push('p.region = ?'); args.push(region); }
  if (stage && tax.stageKeys.has(stage)) { where.push('p.stage = ?'); args.push(stage); }
  if (amount && tax.amountKeys.has(amount)) {
    const [, , min, max] = tax.amounts.find((a) => a[0] === amount);
    where.push('p.amount_usd >= ?'); args.push(min);
    if (max !== null) { where.push('p.amount_usd <= ?'); args.push(max); }
  }
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, (c) => '\\' + c)}%`;
    where.push("(p.name LIKE ? ESCAPE '\\' OR p.summary LIKE ? ESCAPE '\\')");
    args.push(like, like);
  }
  if (params.get('saqlangan') === '1') {
    if (!user) throw new HttpError(401, 'Saqlanganlarni ko‘rish uchun akkauntga kiring.');
    where.push('EXISTS (SELECT 1 FROM saved s WHERE s.project_id = p.id AND s.user_id = ?)');
    args.push(user.id);
  }
  return { where: where.join(' AND '), args };
}

const SORT_SQL = {
  yangi: 'p.published_at DESC, p.id DESC',
  'summa-kamayish': 'p.amount_usd DESC, p.id DESC',
  'summa-osish': 'p.amount_usd ASC, p.id DESC',
  nom: 'p.name COLLATE NOCASE ASC, p.id ASC',
};

/* ------------------------------------------------------------------ */
/* API marshrutlari                                                    */
/* ------------------------------------------------------------------ */

const routes = [];
const route = (method, pattern, handler) => routes.push({ method, pattern, handler });

// --- Akkaunt ---
route('GET', /^\/api\/auth\/me$/, (ctx) => ({ user: ctx.user }));

route('POST', /^\/api\/auth\/register$/, async (ctx) => {
  rateLimit('reg:' + ctx.ip, 20, 10 * 60 * 1000);
  const b = await readJSON(ctx.req);
  const email = str(b.email).toLowerCase();
  const name = str(b.name);
  const password = typeof b.password === 'string' ? b.password : '';
  const role = str(b.role);
  const errors = {};
  if (!['tadbirkor', 'investor'].includes(role)) errors.role = 'Akkaunt turini tanlang.';
  if (name.length < 2 || name.length > 60) errors.name = 'Ismingizni kiriting (2–60 ta belgi).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) errors.email = 'To‘g‘ri email manzil kiriting, masalan: ism@pochta.uz';
  if (password.length < 8 || password.length > 200) errors.password = 'Parol kamida 8 ta belgidan iborat bo‘lsin.';
  if (!errors.email && db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
    errors.email = 'Bu email bilan akkaunt allaqachon bor. Kirish sahifasidan foydalaning.';
  }
  if (Object.keys(errors).length) throw new HttpError(422, 'Formada xatolar bor.', { errors });
  const r = db.prepare('INSERT INTO users (email, password_hash, role, display_name) VALUES (?, ?, ?, ?)')
    .run(email, hashPassword(password), role, name);
  createSession(ctx.res, Number(r.lastInsertRowid));
  return { status: 201, body: { user: { id: Number(r.lastInsertRowid), email, role, name } } };
});

route('POST', /^\/api\/auth\/login$/, async (ctx) => {
  rateLimit('login:' + ctx.ip, 30, 10 * 60 * 1000);
  const b = await readJSON(ctx.req);
  const email = str(b.email).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';
  const row = db.prepare("SELECT * FROM users WHERE email = ? AND role != 'tizim'").get(email);
  const ok = verifyPassword(password, row ? row.password_hash : DUMMY_HASH) && !!row;
  if (!ok) throw new HttpError(401, 'Email yoki parol noto‘g‘ri.', { errors: { password: 'Email yoki parol noto‘g‘ri.' } });
  createSession(ctx.res, row.id);
  return { user: { id: row.id, email: row.email, role: row.role, name: row.display_name } };
});

route('POST', /^\/api\/auth\/logout$/, (ctx) => {
  const token = parseCookies(ctx.req)[SESSION_COOKIE];
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
  ctx.res.setHeader('Set-Cookie', cookieString('', 0));
  return { ok: true };
});

// --- Ochiq katalog ---
route('GET', /^\/api\/projects$/, (ctx) => {
  const p = ctx.url.searchParams;
  const { where, args } = catalogQuery(p, ctx.user);
  const total = db.prepare(`SELECT COUNT(*) AS n FROM projects p WHERE ${where}`).get(...args).n;
  let limit = p.has('limit') ? Number(p.get('limit')) : 50;
  if (!Number.isInteger(limit) || limit < 0) limit = 50;
  limit = Math.min(limit, 100);
  let offset = Number(p.get('offset'));
  if (!Number.isInteger(offset) || offset < 0) offset = 0;
  const sortKey = tax.sortKeys.has(p.get('tartib')) ? p.get('tartib') : 'yangi';
  let items = [];
  if (limit > 0) {
    const savedCol = ctx.user
      ? 'EXISTS (SELECT 1 FROM saved s WHERE s.project_id = p.id AND s.user_id = ?) AS saved'
      : '0 AS saved';
    const rows = db.prepare(`SELECT p.id, p.name, p.sector, p.region, p.stage, p.summary, p.amount_usd, p.is_sample, ${savedCol}
      FROM projects p WHERE ${where} ORDER BY ${SORT_SQL[sortKey]} LIMIT ? OFFSET ?`)
      .all(...(ctx.user ? [ctx.user.id] : []), ...args, limit, offset);
    items = rows.map((r) => ({ ...r, is_sample: !!r.is_sample, saved: !!r.saved }));
  }
  return { total, items, offset, limit };
});

route('GET', /^\/api\/projects\/(\d+)$/, (ctx, [id]) => {
  const row = getProject(Number(id));
  const visible = row && (row.status !== 'draft' || (ctx.user && ctx.user.id === row.owner_id));
  if (!visible) throw new HttpError(404, 'Loyiha topilmadi.');
  const project = projectDetail(row, ctx.user);
  let saved = false;
  let myRequest = null;
  if (ctx.user) {
    saved = !!db.prepare('SELECT 1 FROM saved WHERE user_id = ? AND project_id = ?').get(ctx.user.id, row.id);
    const r = db.prepare('SELECT id, status, created_at FROM requests WHERE project_id = ? AND investor_id = ? ORDER BY id DESC LIMIT 1')
      .get(row.id, ctx.user.id);
    if (r) myRequest = r;
  }
  return { project, saved, my_request: myRequest };
});

// --- Saqlanganlar ---
route('GET', /^\/api\/me\/saved$/, (ctx) => {
  const user = requireUser(ctx);
  const rows = db.prepare(`SELECT s.project_id FROM saved s JOIN projects p ON p.id = s.project_id
    WHERE s.user_id = ? AND p.status = 'published'`).all(user.id);
  return { ids: rows.map((r) => r.project_id) };
});

route('PUT', /^\/api\/saved\/(\d+)$/, (ctx, [id]) => {
  const user = requireUser(ctx);
  const row = getProject(Number(id));
  if (!row || row.status !== 'published') throw new HttpError(404, 'Loyiha topilmadi.');
  db.prepare('INSERT OR IGNORE INTO saved (user_id, project_id) VALUES (?, ?)').run(user.id, row.id);
  return { saved: true };
});

route('DELETE', /^\/api\/saved\/(\d+)$/, (ctx, [id]) => {
  const user = requireUser(ctx);
  db.prepare('DELETE FROM saved WHERE user_id = ? AND project_id = ?').run(user.id, Number(id));
  return { saved: false };
});

// --- Tadbirkor: loyihalar ---
route('GET', /^\/api\/me\/projects$/, (ctx) => {
  const user = requireUser(ctx, 'tadbirkor');
  const rows = db.prepare(`SELECT p.*,
      (SELECT COUNT(*) FROM requests r WHERE r.project_id = p.id AND r.status = 'pending') AS pending_requests
    FROM projects p WHERE owner_id = ? ORDER BY updated_at DESC, id DESC`).all(user.id);
  return { items: rows.map((r) => ({ ...projectDetail(r, user), pending_requests: r.pending_requests })) };
});

route('POST', /^\/api\/projects$/, async (ctx) => {
  const user = requireUser(ctx, 'tadbirkor');
  const b = await readJSON(ctx.req);
  const publish = b.action === 'publish';
  const { data, errors } = validateProject(b, publish);
  if (Object.keys(errors).length) throw new HttpError(422, 'Formada xatolar bor.', { errors });
  const r = db.prepare(`INSERT INTO projects (owner_id, status, name, sector, region, stage, summary, description,
      amount_usd, use_of_funds, terms, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${publish ? "datetime('now')" : 'NULL'})`)
    .run(user.id, publish ? 'published' : 'draft', data.name, data.sector, data.region, data.stage, data.summary,
      data.description, data.amount_usd, data.use_of_funds, data.terms);
  return { status: 201, body: { project: projectDetail(getProject(Number(r.lastInsertRowid)), user) } };
});

route('PUT', /^\/api\/projects\/(\d+)$/, async (ctx, [id]) => {
  const row = ownProject(ctx, Number(id));
  const b = await readJSON(ctx.req);
  // action: 'draft' (qoralama sifatida saqlash), 'publish' (nashr qilish), 'save' (holatni o'zgartirmasdan)
  let target = row.status;
  if (b.action === 'publish') target = 'published';
  else if (b.action === 'draft') target = row.status === 'published' ? 'published' : row.status === 'closed' ? 'closed' : 'draft';
  const { data, errors } = validateProject(b, target === 'published');
  if (Object.keys(errors).length) throw new HttpError(422, 'Formada xatolar bor.', { errors });
  db.prepare(`UPDATE projects SET name = ?, sector = ?, region = ?, stage = ?, summary = ?, description = ?,
      amount_usd = ?, use_of_funds = ?, terms = ?, status = ?, updated_at = datetime('now'),
      published_at = CASE WHEN ? = 'published' AND status != 'published' THEN datetime('now') ELSE published_at END
    WHERE id = ?`)
    .run(data.name, data.sector, data.region, data.stage, data.summary, data.description, data.amount_usd,
      data.use_of_funds, data.terms, target, target, row.id);
  return { project: projectDetail(getProject(row.id), ctx.user) };
});

route('POST', /^\/api\/projects\/(\d+)\/(publish|close)$/, (ctx, [id, action]) => {
  const row = ownProject(ctx, Number(id));
  if (action === 'publish') {
    const { errors } = validateProject(row, true);
    if (Object.keys(errors).length) {
      throw new HttpError(422, 'Nashr qilish uchun barcha majburiy maydonlarni to‘ldiring.', { errors });
    }
    db.prepare(`UPDATE projects SET status = 'published', published_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).run(row.id);
  } else {
    if (row.status !== 'published') throw new HttpError(409, 'Faqat nashr qilingan e’lonni yopish mumkin.');
    db.prepare(`UPDATE projects SET status = 'closed', updated_at = datetime('now') WHERE id = ?`).run(row.id);
  }
  return { project: projectDetail(getProject(row.id), ctx.user) };
});

route('DELETE', /^\/api\/projects\/(\d+)$/, (ctx, [id]) => {
  const row = ownProject(ctx, Number(id));
  if (row.status !== 'draft') throw new HttpError(409, 'Faqat qoralamani o‘chirish mumkin. Nashr qilingan e’lonni yoping.');
  if (row.image) fs.rm(path.join(UPLOAD_DIR, row.image), { force: true }, () => {});
  db.prepare('DELETE FROM projects WHERE id = ?').run(row.id);
  return { ok: true };
});

// Rasm: so'rov tanasi to'g'ridan-to'g'ri rasm fayli (image/jpeg, image/png yoki image/webp).
const IMAGE_TYPES = {
  'image/jpeg': { ext: 'jpg', magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  'image/webp': { ext: 'webp', magic: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
};

route('PUT', /^\/api\/projects\/(\d+)\/image$/, async (ctx, [id]) => {
  const row = ownProject(ctx, Number(id));
  const type = (ctx.req.headers['content-type'] || '').split(';')[0].trim();
  const spec = IMAGE_TYPES[type];
  if (!spec) throw new HttpError(415, 'Faqat JPG, PNG yoki WebP rasm yuklash mumkin.');
  const buf = await readBody(ctx.req, config.maxImageBytes);
  if (buf.length < 12 || !spec.magic(buf)) throw new HttpError(415, 'Fayl rasm emas yoki shikastlangan.');
  const file = `${row.id}-${crypto.randomBytes(8).toString('hex')}.${spec.ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, file), buf);
  if (row.image) fs.rm(path.join(UPLOAD_DIR, row.image), { force: true }, () => {});
  db.prepare(`UPDATE projects SET image = ?, updated_at = datetime('now') WHERE id = ?`).run(file, row.id);
  return { image: imageUrl(file) };
});

route('DELETE', /^\/api\/projects\/(\d+)\/image$/, (ctx, [id]) => {
  const row = ownProject(ctx, Number(id));
  if (row.image) fs.rm(path.join(UPLOAD_DIR, row.image), { force: true }, () => {});
  db.prepare(`UPDATE projects SET image = NULL, updated_at = datetime('now') WHERE id = ?`).run(row.id);
  return { image: null };
});

// --- So'rovlar ---
route('POST', /^\/api\/projects\/(\d+)\/requests$/, async (ctx, [id]) => {
  const user = requireUser(ctx, 'investor');
  const row = getProject(Number(id));
  if (!row || row.status === 'draft') throw new HttpError(404, 'Loyiha topilmadi.');
  if (row.status !== 'published') throw new HttpError(409, 'Bu e’lon yopilgan, so‘rov yuborib bo‘lmaydi.');
  if (row.is_sample) throw new HttpError(409, 'Bu namuna e’lon. Unga so‘rov yuborib bo‘lmaydi.');
  if (row.owner_id === user.id) throw new HttpError(409, 'O‘z loyihangizga so‘rov yubora olmaysiz.');
  const existing = db.prepare("SELECT id FROM requests WHERE project_id = ? AND investor_id = ? AND status IN ('pending','accepted')")
    .get(row.id, user.id);
  if (existing) throw new HttpError(409, 'Siz bu loyihaga allaqachon so‘rov yuborgansiz. Holatini kabinetingizda ko‘ring.');
  const b = await readJSON(ctx.req);
  const message = str(b.message);
  const contact = str(b.contact);
  const errors = {};
  if (message.length < 10) errors.message = 'Xabar kamida 10 ta belgidan iborat bo‘lsin.';
  if (message.length > 1000) errors.message = 'Xabar ko‘pi bilan 1000 ta belgi.';
  if (contact.length < 5) errors.contact = 'Javob olish uchun telefon, email yoki Telegram manzilini yozing.';
  if (contact.length > 150) errors.contact = 'Ko‘pi bilan 150 ta belgi.';
  if (Object.keys(errors).length) throw new HttpError(422, 'Formada xatolar bor.', { errors });
  const r = db.prepare('INSERT INTO requests (project_id, investor_id, message, contact) VALUES (?, ?, ?, ?)')
    .run(row.id, user.id, message, contact);
  return { status: 201, body: { request: { id: Number(r.lastInsertRowid), status: 'pending' } } };
});

// Investor: o'zi yuborgan so'rovlar. Tadbirkorning aloqa ma'lumoti qaytarilmaydi.
route('GET', /^\/api\/me\/requests\/outgoing$/, (ctx) => {
  const user = requireUser(ctx, 'investor');
  const items = db.prepare(`SELECT r.id, r.project_id, p.name AS project_name, p.status AS project_status,
      r.message, r.status, r.created_at, r.decided_at
    FROM requests r JOIN projects p ON p.id = r.project_id
    WHERE r.investor_id = ? ORDER BY r.id DESC`).all(user.id);
  return { items };
});

// Tadbirkor: faqat o'z loyihalariga kelgan so'rovlar (investor aloqasi shu yerda ko'rinadi).
route('GET', /^\/api\/me\/requests\/incoming$/, (ctx) => {
  const user = requireUser(ctx, 'tadbirkor');
  const items = db.prepare(`SELECT r.id, r.project_id, p.name AS project_name, r.message, r.contact,
      u.display_name AS investor_name, r.status, r.created_at, r.decided_at
    FROM requests r JOIN projects p ON p.id = r.project_id JOIN users u ON u.id = r.investor_id
    WHERE p.owner_id = ? ORDER BY (r.status = 'pending') DESC, r.id DESC`).all(user.id);
  return { items };
});

route('POST', /^\/api\/requests\/(\d+)\/(accept|reject)$/, (ctx, [id, action]) => {
  const user = requireUser(ctx, 'tadbirkor');
  const r = db.prepare(`SELECT r.id, r.status FROM requests r JOIN projects p ON p.id = r.project_id
    WHERE r.id = ? AND p.owner_id = ?`).get(Number(id), user.id);
  if (!r) throw new HttpError(404, 'So‘rov topilmadi.');
  if (r.status !== 'pending') throw new HttpError(409, 'Bu so‘rov bo‘yicha qaror allaqachon qabul qilingan.');
  const status = action === 'accept' ? 'accepted' : 'rejected';
  db.prepare(`UPDATE requests SET status = ?, decided_at = datetime('now') WHERE id = ?`).run(status, r.id);
  return { request: { id: r.id, status } };
});

/* ------------------------------------------------------------------ */
/* Statik fayllar va ilova qobig'i                                      */
/* ------------------------------------------------------------------ */

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function serveFile(req, res, file, cacheControl) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Topilmadi', { 'Content-Type': 'text/plain; charset=utf-8' });
    const etag = `"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const headers = {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': cacheControl,
      ETag: etag,
    };
    if (req.headers['if-none-match'] === etag) return send(res, 304, null, headers);
    res.writeHead(200, { ...SECURITY_HEADERS, ...headers, 'Content-Length': st.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

// Ilova ichidagi ma'lum sahifalar (qolganlari 404 holati bilan qaytadi).
const APP_ROUTES = [
  /^\/$/, /^\/loyihalar$/, /^\/loyihalar\/\d+$/, /^\/kirish$/, /^\/royxatdan-otish$/,
  /^\/kabinet$/, /^\/kabinet\/yangi$/, /^\/kabinet\/loyiha\/\d+$/,
];

function serveShell(ctx) {
  const known = APP_ROUTES.some((r) => r.test(ctx.url.pathname));
  const boot = {
    platformName: config.platformName,
    taxonomy: tax.publicJSON(),
    user: ctx.user,
  };
  const html = INDEX_TEMPLATE
    .replaceAll('{{PLATFORM_NAME}}', escapeHtml(config.platformName))
    .replace('{{BOOT_JSON}}', JSON.stringify(boot).replace(/</g, '\\u003c'));
  send(ctx.res, known ? 200 : 404, ctx.req.method === 'HEAD' ? null : html, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  });
}

/* ------------------------------------------------------------------ */
/* So'rovlarni qayta ishlash                                           */
/* ------------------------------------------------------------------ */

async function handle(req, res) {
  let url;
  try {
    url = new URL(req.url, 'http://localhost');
  } catch {
    return send(res, 400, 'Bad request');
  }
  const pathname = url.pathname;
  const ctx = { req, res, url, ip: req.socket.remoteAddress || '' };

  if (pathname.startsWith('/api/')) {
    try {
      // CSRF himoyasi: o'zgartiruvchi so'rovlar faqat ilovaning o'zidan (maxsus sarlavha bilan) qabul qilinadi.
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        if (req.headers['x-requested-with'] !== 'fetch') throw new HttpError(403, 'So‘rov rad etildi.');
        const origin = req.headers.origin;
        if (origin && new URL(origin).host !== req.headers.host) throw new HttpError(403, 'So‘rov rad etildi.');
      }
      ctx.user = currentUser(req);
      for (const r of routes) {
        if (r.method !== req.method) continue;
        const m = pathname.match(r.pattern);
        if (!m) continue;
        const out = await r.handler(ctx, m.slice(1));
        if (out && out.status && out.body) return json(res, out.status, out.body);
        return json(res, 200, out);
      }
      throw new HttpError(404, 'Topilmadi.');
    } catch (e) {
      if (e instanceof HttpError) return json(res, e.status, { error: e.message, ...(e.extra || {}) });
      console.error(e);
      return json(res, 500, { error: 'Serverda kutilmagan xato yuz berdi.' });
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');

  if (pathname.startsWith('/uploads/')) {
    const name = pathname.slice('/uploads/'.length);
    if (!/^\d+-[a-f0-9]{16}\.(jpg|png|webp)$/.test(name)) return send(res, 404, 'Topilmadi');
    return serveFile(req, res, path.join(UPLOAD_DIR, name), 'public, max-age=31536000, immutable');
  }
  if (pathname.startsWith('/assets/') || pathname.startsWith('/fonts/')) {
    const file = path.normalize(path.join(PUBLIC_DIR, decodeURIComponent(pathname)));
    if (!file.startsWith(PUBLIC_DIR + path.sep)) return send(res, 404, 'Topilmadi');
    const cache = pathname.startsWith('/fonts/') ? 'public, max-age=31536000, immutable' : 'no-cache';
    return serveFile(req, res, file, cache);
  }
  if (pathname === '/favicon.ico') return send(res, 204, null);

  ctx.user = currentUser(req);
  return serveShell(ctx);
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((e) => {
    console.error(e);
    if (!res.headersSent) send(res, 500, 'Server xatosi');
  });
});

if (require.main === module) {
  server.listen(config.port, config.host, () => {
    console.log(`${config.platformName}: http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`);
  });
}

module.exports = { server };
