import {
  getDashboardData,
  sendTelegramNotification,
  verifyDashboardAuth,
} from './_emailService.js';
import agentHandler from './agent.js';

function getTelegramToken() {
  return (process.env.TELEGRAM_BOT_TOKEN || '').trim();
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-feyron-passcode, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'Feyron OpenBot & Telegram Bot Gateway',
      telegram_configured: Boolean(getTelegramToken()),
      openbot_webhook_configured: Boolean(process.env.OPENBOT_WEBHOOK_URL || process.env.BOT_WEBHOOK_URL),
      commands: [
        { command: '/leads', description: 'List recent inbound client signups & waitlist entries' },
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
          `• <code>/leads</code> — View recent website signups & waitlist contacts`,
          `• <code>/status</code> — Check WAT business hours, daily limits, and pipeline status`,
          `• <code>/scout</code> — Run Google AI Scout to hunt for new enterprise leads`,
          `• <code>/dashboard</code> — Get 1-tap link to the Admin Operations Studio`,
          ``,
          `Every new client enquiry or high-scoring prospect is pushed directly to this chat in real time.`,
        ].join('\n');

        await sendTelegramReply(chatId, helpText, [
          [
            { text: 'View Leads (/leads)', callback_data: '/leads' },
            { text: 'Check Status (/status)', callback_data: '/status' },
          ],
          [
            { text: 'Open Admin Dashboard', url: 'https://feyron.site/admin' },
          ],
        ]);
        return res.status(200).json({ ok: true });
      }

      // Command: /leads
      if (text.startsWith('/leads')) {
        const data = getDashboardData();
        const enquiries = data.enquiries || [];

        if (enquiries.length === 0) {
          await sendTelegramReply(chatId, `<b>Feyron Inbound Leads</b>\n\nNo signups recorded in the current server session yet. New submissions from feyron.site will appear here automatically.`);
        } else {
          const topLeads = enquiries.slice(0, 5);
          const lines = [
            `<b>Feyron Recent Inbound Signups (${enquiries.length} total)</b>`,
            ``,
          ];
          topLeads.forEach((e, i) => {
            lines.push(`<b>${i + 1}. ${e.name}</b> (${e.company || 'Private'})`);
            lines.push(`   Email: <code>${e.email}</code>`);
            lines.push(`   Interest: <i>${e.interest || 'AI Automation'}</i>`);
            lines.push(`   Status: <b>${e.status || 'New'}</b> · ${new Date(e.createdAt).toLocaleDateString()}`);
            lines.push(``);
          });
          await sendTelegramReply(chatId, lines.join('\n'), [
            [{ text: 'Manage in Dashboard', url: 'https://feyron.site/admin' }],
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
          `• <b>Email Dispatch:</b> Resend API + Transactional Templates`,
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
    const { command, query, action, payload } = body || {};

    if (command === 'leads' || action === 'get_leads') {
      const data = getDashboardData();
      return res.status(200).json({
        ok: true,
        count: data.enquiries?.length || 0,
        enquiries: data.enquiries || [],
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
        service: 'Feyron OpenBot Bridge',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Feyron Bot Webhook received.',
      supported_commands: ['/leads', '/status', '/scout', '/dashboard'],
    });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
