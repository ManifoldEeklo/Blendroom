// POST { subscription, device: { id, name, auto } } -> register or refresh this device
// DELETE { endpoint, deviceId }                    -> forget this device
const { db, keyOf, entryOf, fail } = require('./_lib');
const idKey = id => { const c = String(id || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40); return c ? 'd_' + c : ''; };
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const body = req.body || {}, r = db();
    if (req.method === 'POST') {
      const sub = body.subscription, dev = body.device || {};
      if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) return res.status(400).json({ error: 'Invalid subscription' });
      const clean = { endpoint: sub.endpoint, expirationTime: sub.expirationTime || null, keys: { p256dh: String(sub.keys.p256dh), auth: String(sub.keys.auth) } };
      const key = idKey(dev.id) || keyOf(sub.endpoint), raw = await r.hget('subs', key), prev = raw ? entryOf(raw) : null, now = Date.now();
      const entry = { sub: clean, name: String(dev.name || '').slice(0, 60), auto: String(dev.auto || '').slice(0, 60), label: prev ? prev.label || '' : '', created: prev && prev.created ? prev.created : now, seen: now };
      await r.hset('subs', { [key]: JSON.stringify(entry) });
      const legacy = keyOf(sub.endpoint); if (legacy !== key) await r.hdel('subs', legacy);
      return res.json({ ok: true, id: key });
    }
    if (req.method === 'DELETE') {
      const key = idKey(body.deviceId) || (body.endpoint ? keyOf(body.endpoint) : '');
      if (key) await r.hdel('subs', key);
      return res.json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { fail(res, e); }
};
