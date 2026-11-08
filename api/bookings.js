import { getBookedSlotsForDate, handleBookingSubmission } from './_emailService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    try {
      const date = (req.query && req.query.date) || '';
      const slots = getBookedSlotsForDate(String(date));
      return res.status(200).json(slots);
    } catch (err) {
      console.error('Error in GET /api/bookings:', err);
      return res.status(200).json({ taken: [] });
    }
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
    } catch (err) {
      console.error('Error in POST /api/bookings:', err);
      return res.status(500).json({ ok: false, error: 'Booking failed' });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
