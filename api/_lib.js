// Shared helpers for the Blendroom push API (files starting with _ are not routes on Vercel)
const crypto = require('crypto');
let client = null;
function db() {
  if (client) return client;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw Object.assign(new Error('No database connected. Add an Upstash Redis (KV) store to this Vercel project.'), { status: 500 });
  const { Redis } = require('@upstash/redis');
  client = new Redis({ url, token });
  return client;
}
function isAdmin(req) {
  const want = process.env.ADMIN_TOKEN || '';
  const got = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!want || !got) return false;
  const a = Buffer.from(want), b = Buffer.from(got);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const keyOf = endpoint => crypto.createHash('sha256').update(String(endpoint)).digest('hex').slice(0, 40);
const parse = v => (typeof v === 'string' ? JSON.parse(v) : v);
function fail(res, e) { res.status(e.status || 500).json({ error: e.message || 'Server error' }); }
module.exports = { db, isAdmin, keyOf, parse, fail };
