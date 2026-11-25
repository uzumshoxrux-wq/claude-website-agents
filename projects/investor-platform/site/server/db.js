'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const config = require('../config');
const { samples } = require('./samples');

fs.mkdirSync(path.join(config.dataDir, 'uploads'), { recursive: true });
const dbFile = path.join(config.dataDir, 'platform.db');
const db = new DatabaseSync(dbFile);

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 3000;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('tadbirkor','investor','tizim')),
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','closed')),
  name TEXT NOT NULL DEFAULT '',
  sector TEXT,
  region TEXT,
  stage TEXT,
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  amount_usd INTEGER,
  use_of_funds TEXT NOT NULL DEFAULT '',
  terms TEXT NOT NULL DEFAULT '',
  image TEXT,
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT
);
CREATE INDEX IF NOT EXISTS projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS projects_owner ON projects(owner_id);

CREATE TABLE IF NOT EXISTS saved (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, project_id)
);

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  investor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  contact TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at TEXT
);
CREATE INDEX IF NOT EXISTS requests_project ON requests(project_id);
CREATE INDEX IF NOT EXISTS requests_investor ON requests(investor_id);
`);

// "Namuna" e'lonlari: tizim akkauntiga tegishli, unga kirib bo'lmaydi.
function seedSamples() {
  const has = db.prepare('SELECT COUNT(*) AS n FROM projects WHERE is_sample = 1').get().n;
  if (has > 0 || process.env.NO_SAMPLES === '1') return;
  let sys = db.prepare("SELECT id FROM users WHERE role = 'tizim'").get();
  if (!sys) {
    const r = db.prepare("INSERT INTO users (email, password_hash, role, display_name) VALUES (?, '!', 'tizim', 'Namuna')")
      .run('namuna@localhost.invalid');
    sys = { id: r.lastInsertRowid };
  }
  const ins = db.prepare(`INSERT INTO projects
    (owner_id, status, name, sector, region, stage, summary, description, amount_usd, use_of_funds, terms, is_sample, published_at, created_at, updated_at)
    VALUES (?, 'published', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now', ?), datetime('now', ?), datetime('now', ?))`);
  samples.forEach((s, i) => {
    const t = `-${samples.length - i} hours`;
    ins.run(sys.id, s.name, s.sector, s.region, s.stage, s.summary, s.description, s.amount, s.use, s.terms, t, t, t);
  });
}
seedSamples();

module.exports = { db, dbFile };
