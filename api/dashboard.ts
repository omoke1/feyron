import {
  getDashboardData,
  triggerBookingReminder,
  updateDashboardRecord,
  verifyDashboardAuth,
} from '../src/server/emailService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-feyron-passcode');
    return res.status(204).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const passcode = String(
    req.headers?.['x-feyron-passcode'] || req.query?.passcode || body?.passcode || ''
  );

  if (!verifyDashboardAuth(passcode)) {
    return res.status(401).json({ ok: false, error: 'Invalid access code.' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, ...getDashboardData() });
  }

  if (req.method === 'PATCH') {
    const result = updateDashboardRecord(body || {});
    return res.status(result.ok ? 200 : 400).json(result);
  }

  if (req.method === 'POST') {
    const result = await triggerBookingReminder(String(body?.id || ''));
    return res.status(result.ok ? 200 : 400).json(result);
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
