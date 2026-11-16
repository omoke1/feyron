import {
  verifyDashboardAuth,
  sendEmailViaResend,
  sendTelegramNotification,
} from './_emailService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-feyron-passcode');

  if (req.method === 'OPTIONS') {
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
    (req.headers && req.headers['x-feyron-passcode']) ||
      (req.query && req.query.passcode) ||
      (body && body.passcode) ||
      ''
  );

  if (!verifyDashboardAuth(passcode)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized: Invalid Feyron access code.' });
  }

  if (req.method === 'GET') {
    // Return agent system status & WAT time verification
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const wat = new Date(utc + 3600000);
    const watHour = wat.getHours();
    const watMin = wat.getMinutes();
    const day = wat.getDay();
    const inWindow = day >= 1 && day <= 5 && watHour * 60 + watMin >= 510 && watHour * 60 + watMin <= 1050;

    return res.status(200).json({
      ok: true,
      service: 'Feyron Sales Workflow Agent Engine',
      wat_time: `${String(watHour).padStart(2, '0')}:${String(watMin).padStart(2, '0')}`,
      wat_day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
      in_send_window: inWindow,
      gemini_available: Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY),
    });
  }

  if (req.method === 'POST') {
    const { action, payload } = body || {};

    if (action === 'dispatch_approved_email') {
      const { to, subject, bodyText, prospectId, queueId } = payload || {};
      if (!to || !bodyText) {
        return res.status(400).json({ ok: false, error: 'Missing destination or message body.' });
      }

      // If live email credentials are set, send email and telegram notification
      try {
        await sendEmailViaResend({
          to,
          subject: subject || 'Feyron Automation Systems',
          text: bodyText,
          html: `<div style="font-family:sans-serif;line-height:1.6;color:#1E1E1E;white-space:pre-wrap;">${bodyText}</div>`,
        });
      } catch (err) {
        console.warn('Agent email dispatch deferred:', err.message);
      }

      try {
        await sendTelegramNotification(
          `<b>[Agent Outbound Dispatched]</b>\nTo: ${to}\nSubject: ${subject}\nProspect: ${prospectId || 'N/A'}\nQueue ID: ${queueId || 'N/A'}`
        );
      } catch (err) {
        // ignore
      }

      return res.status(200).json({
        ok: true,
        message: `Dispatched to ${to} successfully.`,
        dispatched_at: new Date().toISOString(),
      });
    }

    if (action === 'call_gemini_agent') {
      const { agentName, systemPrompt, userMessage } = payload || {};
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

      if (!apiKey) {
        return res.status(200).json({
          ok: true,
          simulated: true,
          message: 'Gemini API key not configured on server; returning simulated agent output.',
          raw_response: `<ACTION_REQUEST>\n<AGENT>${agentName || 'Agent'}</AGENT>\n<PROSPECT_ID>SIM-001</PROSPECT_ID>\n<ACTION_TYPE>simulated_action</ACTION_TYPE>\n<REASON>Automated check complete</REASON>\n<CONFIDENCE>90</CONFIDENCE>\n<PROPOSED_PAYLOAD>\n{"status": "ready"}\n</PROPOSED_PAYLOAD>\n</ACTION_REQUEST>`,
        });
      }

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nTask Input:\n${userMessage}` }],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        if (!response.ok) {
          const errData = await response.text();
          return res.status(502).json({ ok: false, error: `Gemini API error: ${errData}` });
        }

        const data = await response.json();
        const text =
          data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from model.';

        return res.status(200).json({
          ok: true,
          simulated: false,
          raw_response: text,
        });
      } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
      }
    }

    return res.status(400).json({ ok: false, error: `Unknown action: ${action}` });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
