import { getBookedSlotsForDate, handleBookingSubmission } from '../src/server/emailService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    const date = (req.query && req.query.date) || '';
    const slots = getBookedSlotsForDate(String(date));
    return res.status(200).json(slots);
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
      const result = await handleBookingSubmission(body || {});
      return res.status(result.status).json(result.body);
    } catch (err: any) {
      console.error('Error in /api/bookings:', err);
      return res.status(500).json({ ok: false, error: 'Booking failed' });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
