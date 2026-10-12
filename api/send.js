// Admin only (Authorization: Bearer ADMIN_TOKEN)
// GET  -> devices + recent messages
// POST { title, body, url, to? } -> push to every device, or only to the device ids in "to"
const webpush = require('web-push');
const { db, isAdmin, parse, entryOf, fail } = require('./_lib');
const shown = e => e.label || e.name || e.auto || 'Unnamed device';
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!isAdmin(req)) return res.status(401).json({ error: 'Wrong password' });
  try {
    const r = db();
    const all = (await r.hgetall('subs')) || {};
    const list = Object.entries(all).map(([id, v]) => ({ id, e: entryOf(v) })).filter(x => x.e.sub && x.e.sub.endpoint);
    if (req.method === 'GET') {
      const hist = (await r.lrange('msgs', 0, 29)) || [];
      const devs = list.map(({ id, e }) => ({ id, name: shown(e), auto: e.auto || '', label: e.label || '', own: e.name || '', created: e.created || 0, seen: e.seen || 0 })).sort((a, b) => b.seen - a.seen);
      return res.json({ devices: devs.length, list: devs, history: hist.map(parse) });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv, VAPID_SUBJECT: subj } = process.env;
    if (!pub || !priv) return res.status(500).json({ error: 'VAPID keys are not set' });
    const b = req.body || {}, title = String(b.title || 'Blendroom').slice(0, 80), text = String(b.body || '').slice(0, 300), url = String(b.url || '/').slice(0, 300);
    if (!text.trim()) return res.status(400).json({ error: 'Write a message first' });
    const to = Array.isArray(b.to) && b.to.length ? new Set(b.to.map(String)) : null;
    const targets = to ? list.filter(x => to.has(x.id)) : list;
    if (!targets.length) return res.status(400).json({ error: to ? 'Choose at least one device' : 'No devices yet' });
    let subject = String(subj || 'mailto:admin@example.com').trim().replace(/^["']|["']$/g, '');
    if (!/^(mailto:|https:\/\/)/i.test(subject)) subject = /@/.test(subject) ? 'mailto:' + subject : 'mailto:admin@example.com';
    webpush.setVapidDetails(subject, pub.trim(), priv.trim());
    const payload = JSON.stringify({ title, body: text, url, tag: 'msg-' + Date.now() });
    let sent = 0, removed = 0, failed = 0;
    await Promise.all(targets.map(async ({ id, e }) => {
      try { await webpush.sendNotification(e.sub, payload, { TTL: 24 * 3600, urgency: 'normal' }); sent++; }
      catch (err) { if (err.statusCode === 404 || err.statusCode === 410) { await r.hdel('subs', id); removed++; } else failed++; }
    }));
    await r.lpush('msgs', JSON.stringify({ title, body: text, url, at: Date.now(), sent, to: to ? targets.map(x => shown(x.e)) : null }));
    await r.ltrim('msgs', 0, 49);
    res.json({ sent, removed, failed });
  } catch (e) { fail(res, e); }
};
