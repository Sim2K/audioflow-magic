export default function handler(req, res) {
    if (req.method === 'GET') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  }