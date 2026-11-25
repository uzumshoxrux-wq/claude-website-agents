'use strict';
// Ixtiyoriy: lokal sinov uchun ikki akkaunt yaratadi. Ommaviy serverda ishga tushirmang.
const crypto = require('node:crypto');
const { db } = require('./db');

const users = [
  ['tadbirkor@sinov.local', 'tadbirkor', 'Sinov tadbirkor'],
  ['investor@sinov.local', 'investor', 'Sinov investor'],
];
const password = 'sinov12345';
for (const [email, role, name] of users) {
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) { console.log(`${email} — allaqachon bor`); continue; }
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  db.prepare('INSERT INTO users (email, password_hash, role, display_name) VALUES (?, ?, ?, ?)')
    .run(email, `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`, role, name);
  console.log(`${email} (${role}) yaratildi`);
}
console.log(`Parol: ${password}`);
