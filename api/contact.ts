import { handleContactSubmission } from '../src/server/emailService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    const result = await handleContactSubmission(body || {});
    return res.status(result.status).json(result.body);
  } catch (err: any) {
    console.error('Error in /api/contact:', err);
    return res.status(500).json({
      ok: false,
      error: 'An unexpected error occurred. Please email hello@feyron.site.',
    });
  }
}
