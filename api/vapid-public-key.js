// GET -> the public VAPID key the app needs to subscribe to push messages
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const key = process.env.VAPID_PUBLIC_KEY || '';
  if (!key) return res.status(500).json({ error: 'VAPID_PUBLIC_KEY is not set' });
  res.json({ key });
};
