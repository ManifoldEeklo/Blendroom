// Shared helpers for the Blendroom push API (files starting with _ are not routes on Vercel)
const crypto = require('crypto');
let client = null;
function db() {
  if (client) return client;
  // accept the default names and names with a custom prefix (e.g. STORAGE_KV_REST_API_URL)
  const env = process.env, find = suf => { const k = Object.keys(env).find(n => n === suf || n.endsWith('_' + suf)); return k ? env[k] : ''; };
  const url = find('KV_REST_API_URL') || find('UPSTASH_REDIS_REST_URL');
  const token = find('KV_REST_API_TOKEN') || find('UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) {
    const hasTcp = Object.keys(env).some(n => /REDIS_URL$|KV_URL$/.test(n));
    throw Object.assign(new Error(hasTcp
      ? 'A database is connected, but not Upstash. Connect "Upstash for Redis" under Storage, then redeploy.'
      : 'No database connected. Connect "Upstash for Redis" under Storage, then redeploy.'), { status: 500 });
  }
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
