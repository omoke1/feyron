import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getBookedSlotsForDate,
  handleBookingSubmission,
  handleContactSubmission,
} from './src/server/emailService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Contact & Lead endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      const result = await handleContactSubmission(req.body || {});
      res.status(result.status).json(result.body);
    } catch (err) {
      console.error('POST /api/contact error:', err);
      res.status(500).json({
        ok: false,
        error: 'Could not send message right now. Please email hello@feyron.site.',
      });
    }
  });

  // Booking slots & submission endpoints (both /api/bookings and legacy /bookings)
  const handleGetSlots = (req: express.Request, res: express.Response) => {
    const date = String(req.query.date || '');
    res.status(200).json(getBookedSlotsForDate(date));
  };

  const handlePostBooking = async (req: express.Request, res: express.Response) => {
    try {
      const result = await handleBookingSubmission(req.body || {});
      res.status(result.status).json(result.body);
    } catch (err) {
      console.error('POST /api/bookings error:', err);
      res.status(500).json({ ok: false, error: 'Could not complete booking right now.' });
    }
  };

  app.get('/api/bookings', handleGetSlots);
  app.get('/api/bookings/slots', handleGetSlots);
  app.get('/bookings/slots', handleGetSlots);

  app.post('/api/bookings', handlePostBooking);
  app.post('/bookings', handlePostBooking);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Feyron server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
