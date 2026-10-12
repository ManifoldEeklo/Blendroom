// Admin only (Authorization: Bearer ADMIN_TOKEN)
// GET  -> number of devices + recent messages
// POST { title, body, url } -> push the message to every device
const webpush = require('web-push');
const { db, isAdmin, parse, fail } = require('./_lib');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!isAdmin(req)) return res.status(401).json({ error: 'Wrong password' });
  try {
    const r = db();
    if (req.method === 'GET') {
      const [n, hist] = await Promise.all([r.hlen('subs'), r.lrange('msgs', 0, 29)]);
      return res.json({ devices: n || 0, history: (hist || []).map(parse) });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv, VAPID_SUBJECT: subj } = process.env;
    if (!pub || !priv) return res.status(500).json({ error: 'VAPID keys are not set' });
    const b = req.body || {}, title = String(b.title || 'Blendroom').slice(0, 80), text = String(b.body || '').slice(0, 300), url = String(b.url || '/').slice(0, 300);
    if (!text.trim()) return res.status(400).json({ error: 'Write a message first' });
    webpush.setVapidDetails(subj || 'mailto:admin@example.com', pub, priv);
    const all = (await r.hgetall('subs')) || {};
    const payload = JSON.stringify({ title, body: text, url, tag: 'msg-' + Date.now() });
    let sent = 0, removed = 0, failed = 0;
    await Promise.all(Object.entries(all).map(async ([k, v]) => {
      try { await webpush.sendNotification(parse(v), payload, { TTL: 24 * 3600, urgency: 'normal' }); sent++; }
      catch (e) { if (e.statusCode === 404 || e.statusCode === 410) { await r.hdel('subs', k); removed++; } else failed++; }
    }));
    await r.lpush('msgs', JSON.stringify({ title, body: text, url, at: Date.now(), sent }));
    await r.ltrim('msgs', 0, 49);
    res.json({ sent, removed, failed });
  } catch (e) { fail(res, e); }
};
