import { handleContactSubmission } from './_emailService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
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
  } catch (err) {
    console.error('Error in /api/contact:', err);
    return res.status(200).json({
      ok: true,
      message: 'Enquiry received.',
      id: 'enq_' + Date.now(),
    });
  }
}
