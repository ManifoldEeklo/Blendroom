// Admin only: PATCH { id, label } renames a device, DELETE { id } removes it
const { db, isAdmin, entryOf, fail } = require('./_lib');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!isAdmin(req)) return res.status(401).json({ error: 'Wrong password' });
  try {
    const r = db(), b = req.body || {}, id = String(b.id || '');
    if (!id) return res.status(400).json({ error: 'No device' });
    if (req.method === 'PATCH') {
      const raw = await r.hget('subs', id); if (!raw) return res.status(404).json({ error: 'Device not found' });
      const e = entryOf(raw); e.label = String(b.label || '').trim().slice(0, 60);
      await r.hset('subs', { [id]: JSON.stringify(e) });
      return res.json({ ok: true });
    }
    if (req.method === 'DELETE') { await r.hdel('subs', id); return res.json({ ok: true }); }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { fail(res, e); }
};
