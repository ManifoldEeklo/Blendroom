// POST { subscription }  -> remember this device
// DELETE { endpoint }    -> forget this device
const { db, keyOf, fail } = require('./_lib');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const body = req.body || {};
    if (req.method === 'POST') {
      const sub = body.subscription;
      if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) return res.status(400).json({ error: 'Invalid subscription' });
      const clean = { endpoint: sub.endpoint, expirationTime: sub.expirationTime || null, keys: { p256dh: String(sub.keys.p256dh), auth: String(sub.keys.auth) } };
      await db().hset('subs', { [keyOf(sub.endpoint)]: JSON.stringify(clean) });
      return res.json({ ok: true });
    }
    if (req.method === 'DELETE') {
      if (body.endpoint) await db().hdel('subs', keyOf(body.endpoint));
      return res.json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { fail(res, e); }
};
