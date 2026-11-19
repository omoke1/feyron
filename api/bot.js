import {
  getBookedSlotsForDate,
  getDashboardData,
  sendTelegramNotification,
  verifyDashboardAuth,
} from './_emailService.js';
import agentHandler from './agent.js';
import crypto from 'crypto';

function getTelegramToken() {
  return (process.env.TELEGRAM_BOT_TOKEN || '').trim();
}

function escapeHtml(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramReply(chatId, text, inlineButtons) {
  const token = getTelegramToken();
  if (!token || !chatId) return;

  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  if (inlineButtons && inlineButtons.length > 0) {
    payload.reply_markup = { inline_keyboard: inlineButtons };
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Failed to send Telegram bot reply:', err.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-feyron-passcode, Authorization, x-openbot-signature, x-signature-sha256, x-hub-signature-256');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'Feyron OpenBot & Telegram Bot Gateway',
      telegram_configured: Boolean(getTelegramToken()),
      openbot_webhook_configured: Boolean(process.env.OPENBOT_WEBHOOK_URL || process.env.BOT_WEBHOOK_URL),
      webhook_signing_configured: Boolean(process.env.OPENBOT_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET),
      calendar_feed_url: 'https://feyron.site/api/calendar.ics',
      commands: [
        { command: '/digest', description: 'Full breakdown of recent signups & bookings with names and messages' },
        { command: '/leads', description: 'List recent inbound client signups & waitlist entries' },
        { command: '/bookings', description: 'List upcoming booked discovery calls & meeting links' },
        { command: '/slots', description: 'Check available & taken time slots for a given date' },
        { command: '/status', description: 'Check WAT operating window, limits, and agent status' },
        { command: '/scout', description: 'Instruct the Scout Agent to hunt new enterprise leads' },
        { command: '/dashboard', description: 'Get a direct link to the operations dashboard' },
        { command: '/help', description: 'View available agent bot commands' },
      ],
    });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    // Optional webhook signature verification
    const secret = (process.env.OPENBOT_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || '').trim();
    let signatureVerified = true;
    if (secret) {
      const incomingSig = String(
        req.headers['x-openbot-signature'] ||
        req.headers['x-signature-sha256'] ||
        req.headers['x-hub-signature-256'] ||
        ''
      ).replace(/^sha256=/, '');

      if (incomingSig) {
        const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const expectedSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        signatureVerified = crypto.timingSafeEqual(Buffer.from(incomingSig, 'hex'), Buffer.from(expectedSig, 'hex'));
      }
    }

    // 1. Handle Telegram Webhook update
    if (body.message || body.channel_post || body.callback_query) {
      const msg = body.message || body.channel_post;
      const callback = body.callback_query;
      const chatId = msg?.chat?.id || callback?.message?.chat?.id;
      const text = (msg?.text || callback?.data || '').trim();

      if (!chatId) {
        return res.status(200).json({ ok: true, ignored: 'no chat id' });
      }

      // Command: /start or /help
      if (text.startsWith('/start') || text.startsWith('/help')) {
        const helpText = [
          `<b>Feyron Agentic Command Center</b>`,
          `Welcome to the Feyron Operations & Sales Agent Bot.`,
          ``,
          `<b>Available Commands:</b>`,
          `• <code>/digest</code> — Full digest with contact names, messages & upcoming calls`,
          `• <code>/leads</code> — View recent website signups & waitlist contacts`,
          `• <code>/bookings</code> — View scheduled 20-min workflow audit calls`,
          `• <code>/status</code> — Check WAT business hours, daily limits, and pipeline status`,
          `• <code>/scout</code> — Run Google AI Scout to hunt for new enterprise leads`,
          `• <code>/dashboard</code> — Get 1-tap link to the Admin Operations Studio`,
          ``,
          `Every new client enquiry or high-scoring prospect is pushed directly to this chat in real time.`,
        ].join('\n');

        await sendTelegramReply(chatId, helpText, [
          [
            { text: 'Full Digest (/digest)', callback_data: '/digest' },
            { text: 'View Leads (/leads)', callback_data: '/leads' },
          ],
          [
            { text: 'Check Status (/status)', callback_data: '/status' },
            { text: 'Open Admin Dashboard', url: 'https://feyron.site/admin' },
          ],
        ]);
        return res.status(200).json({ ok: true });
      }

      // Command: /digest
      if (text.startsWith('/digest')) {
        const data = getDashboardData();
        const enquiries = data.enquiries || [];
        const bookings = data.bookings || [];

        const lines = [
          `<b>FEYRON OPERATIONS DIGEST</b>`,
          `Total Signups: <b>${enquiries.length}</b> | Scheduled Calls: <b>${bookings.length}</b>`,
          ``,
          `<b>Recent Inbound Signups:</b>`,
        ];

        if (enquiries.length === 0) {
          lines.push(`<i>No signups recorded in this session.</i>`);
        } else {
          enquiries.slice(0, 5).forEach((e, i) => {
            lines.push(`<b>${i + 1}. ${escapeHtml(e.name)}</b> (${escapeHtml(e.company || 'Private')})`);
            lines.push(`   Email: <code>${escapeHtml(e.email)}</code>`);
            lines.push(`   Interest: <i>${escapeHtml(e.interest || 'AI Automation')}</i>`);
            lines.push(`   Message: "${escapeHtml((e.details || '').slice(0, 150))}"`);
            lines.push(``);
          });
        }

        lines.push(`<b>Scheduled 20-min Calls:</b>`);
        if (bookings.length === 0) {
          lines.push(`<i>No calls scheduled currently.</i>`);
        } else {
          bookings.slice(0, 3).forEach((b, i) => {
            lines.push(`<b>${i + 1}. ${escapeHtml(b.name)}</b> (<code>${escapeHtml(b.email)}</code>)`);
            lines.push(`   When: ${escapeHtml(b.formattedDate || b.date)} at ${escapeHtml(b.time)} WAT`);
            lines.push(`   Meeting: <a href="${escapeHtml(b.meetingUrl || '')}">${escapeHtml(b.meetingUrl || '')}</a>`);
            lines.push(``);
          });
        }

        await sendTelegramReply(chatId, lines.join('\n'), [
          [{ text: 'Open Admin Dashboard', url: 'https://feyron.site/admin' }],
        ]);
        return res.status(200).json({ ok: true });
      }

      // Command: /leads
      if (text.startsWith('/leads')) {
        const data = getDashboardData();
        const enquiries = data.enquiries || [];

        if (enquiries.length === 0) {
          await sendTelegramReply(chatId, `<b>Feyron Inbound Leads</b>\n\nNo signups recorded yet. New submissions from feyron.site will appear here automatically.`);
        } else {
          const topLeads = enquiries.slice(0, 5);
          const lines = [
            `<b>Feyron Recent Inbound Signups (${enquiries.length} total)</b>`,
            ``,
          ];
          topLeads.forEach((e, i) => {
            lines.push(`<b>${i + 1}. ${escapeHtml(e.name)}</b> (${escapeHtml(e.company || 'Private')})`);
            lines.push(`   Email: <code>${escapeHtml(e.email)}</code>`);
            lines.push(`   Interest: <i>${escapeHtml(e.interest || 'AI Automation')}</i>`);
            lines.push(`   Status: <b>${escapeHtml(e.status || 'New')}</b> · ${new Date(e.createdAt).toLocaleDateString()}`);
            lines.push(`   Message: "${escapeHtml((e.details || '').slice(0, 100))}"`);
            lines.push(``);
          });
          await sendTelegramReply(chatId, lines.join('\n'), [
            [{ text: 'Manage in Dashboard', url: 'https://feyron.site/admin' }],
          ]);
        }
        return res.status(200).json({ ok: true });
      }

      // Command: /bookings
      if (text.startsWith('/bookings')) {
        const data = getDashboardData();
        const bookings = (data.bookings || []).filter((b) => b.status !== 'Archived');
        if (bookings.length === 0) {
          await sendTelegramReply(chatId, `<b>Feyron Scheduled Calls</b>\n\nNo calls currently scheduled.`);
        } else {
          const lines = [`<b>Feyron Scheduled Calls (${bookings.length} total)</b>`, ``];
          bookings.slice(0, 5).forEach((b, i) => {
            lines.push(`<b>${i + 1}. ${escapeHtml(b.name)}</b> (${escapeHtml(b.email)})`);
            lines.push(`   Date: ${escapeHtml(b.formattedDate || b.date)} at ${escapeHtml(b.time)} WAT`);
            lines.push(`   Meeting: <a href="${escapeHtml(b.meetingUrl || '')}">${escapeHtml(b.meetingUrl || '')}</a>`);
            lines.push(``);
          });
          await sendTelegramReply(chatId, lines.join('\n'), [
            [{ text: 'Open Admin Dashboard', url: 'https://feyron.site/admin' }],
          ]);
        }
        return res.status(200).json({ ok: true });
      }

      // Command: /status
      if (text.startsWith('/status')) {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const wat = new Date(utc + 3600000);
        const watHour = wat.getHours();
        const watMin = wat.getMinutes();
        const day = wat.getDay();
        const inWindow = day >= 1 && day <= 5 && watHour * 60 + watMin >= 510 && watHour * 60 + watMin <= 1050;
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];

        const statusMsg = [
          `<b>Feyron System & WAT Operating Window</b>`,
          ``,
          `• <b>Current WAT Time:</b> ${String(watHour).padStart(2, '0')}:${String(watMin).padStart(2, '0')} (${dayName})`,
          `• <b>Operating Send Window:</b> ${inWindow ? 'OPEN (Mon-Fri 08:30-17:30 WAT)' : 'CLOSED (Cold outreach held)'}`,
          `• <b>AI Engine:</b> Google Gemini 2.5/3.8 Flash (Active)`,
          `• <b>Scraper Engine:</b> Firecrawl Open-Source SDK (Active)`,
          `• <b>Calendar Feed:</b> <code>https://feyron.site/api/calendar.ics</code>`,
        ].join('\n');

        await sendTelegramReply(chatId, statusMsg);
        return res.status(200).json({ ok: true });
      }

      // Command: /dashboard
      if (text.startsWith('/dashboard')) {
        await sendTelegramReply(chatId, `<b>Feyron Admin Operations Dashboard</b>\n\nAccess all records, agent approval queues, and Firecrawl lead inspection here:`, [
          [{ text: 'Unlock Admin Dashboard →', url: 'https://feyron.site/admin' }],
        ]);
        return res.status(200).json({ ok: true });
      }

      // Default fallback for other messages
      await sendTelegramReply(chatId, `Received message: "<i>${text}</i>". Send <code>/help</code> for available commands.`, [
        [{ text: 'Help & Commands', callback_data: '/help' }],
      ]);
      return res.status(200).json({ ok: true });
    }

    // 2. Handle OpenBot or Custom Webhook JSON request
    const { command, query, action, payload, date } = body || {};

    // Helper: generate full formatted text digest
    const generateDigestText = (data) => {
      const enquiries = data.enquiries || [];
      const bookings = data.bookings || [];
      const lines = [
        `*FEYRON OPERATIONS DIGEST*`,
        `Total Signups: ${enquiries.length} | Scheduled Calls: ${bookings.length}`,
        ``,
        `*Recent Inbound Signups:*`,
      ];
      if (enquiries.length === 0) {
        lines.push(`None recorded.`);
      } else {
        enquiries.slice(0, 5).forEach((e, i) => {
          lines.push(`${i + 1}. *${e.name}* (${e.company || 'Private'})`);
          lines.push(`   Email: ${e.email}`);
          lines.push(`   Interest: ${e.interest || 'AI Automation'}`);
          lines.push(`   Message: "${e.details || ''}"`);
          lines.push(`   Received: ${e.createdAt || 'Recent'}`);
          lines.push(``);
        });
      }
      lines.push(`*Scheduled 20-min Calls:*`);
      if (bookings.length === 0) {
        lines.push(`None scheduled.`);
      } else {
        bookings.slice(0, 3).forEach((b, i) => {
          lines.push(`${i + 1}. *${b.name}* (${b.email})`);
          lines.push(`   When: ${b.formattedDate || b.date} at ${b.time} WAT`);
          lines.push(`   Meeting: ${b.meetingUrl || 'https://feyron.site'}`);
          lines.push(``);
        });
      }
      lines.push(`Dashboard: https://feyron.site/admin`);
      return lines.join('\n');
    };

    // Command: digest or summary
    if (command === 'digest' || action === 'get_digest' || command === 'summary') {
      const data = getDashboardData();
      const digestText = generateDigestText(data);
      return res.status(200).json({
        ok: true,
        digest: digestText,
        whatsapp_message: digestText,
        text: digestText,
        enquiries_count: data.enquiries?.length || 0,
        bookings_count: data.bookings?.length || 0,
        enquiries: data.enquiries || [],
        bookings: data.bookings || [],
      });
    }

    // Command: leads
    if (command === 'leads' || action === 'get_leads') {
      const data = getDashboardData();
      const enquiries = data.enquiries || [];
      const lines = [`*Feyron Recent Inbound Signups (${enquiries.length} total)*`, ``];
      enquiries.forEach((e, i) => {
        lines.push(`${i + 1}. *${e.name}* (${e.company || 'Private'})`);
        lines.push(`   Email: ${e.email}`);
        lines.push(`   Interest: ${e.interest || 'AI Automation'}`);
        lines.push(`   Message: "${e.details || ''}"`);
        lines.push(``);
      });
      return res.status(200).json({
        ok: true,
        count: enquiries.length,
        summary: lines.join('\n'),
        whatsapp_message: lines.join('\n'),
        enquiries,
      });
    }

    // Command: bookings
    if (command === 'bookings' || action === 'get_bookings') {
      const data = getDashboardData();
      const bookings = data.bookings || [];
      return res.status(200).json({
        ok: true,
        count: bookings.length,
        bookings,
        calendar_feed_url: 'https://feyron.site/api/calendar.ics',
      });
    }

    // Command: slots
    if (command === 'slots' || action === 'get_slots') {
      const targetDate = String(date || body.date || new Date().toISOString().split('T')[0]);
      const slots = getBookedSlotsForDate(targetDate);
      return res.status(200).json({
        ok: true,
        date: targetDate,
        ...slots,
      });
    }

    if (command === 'status' || action === 'get_status') {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const wat = new Date(utc + 3600000);
      return res.status(200).json({
        ok: true,
        wat_time: `${wat.getHours()}:${wat.getMinutes()}`,
        in_send_window: wat.getDay() >= 1 && wat.getDay() <= 5 && wat.getHours() * 60 + wat.getMinutes() >= 510,
        calendar_feed_url: 'https://feyron.site/api/calendar.ics',
        service: 'Feyron OpenBot Bridge',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Feyron Bot Webhook received.',
      supported_commands: ['/digest', '/leads', '/bookings', '/slots', '/status', '/scout', '/dashboard'],
    });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
