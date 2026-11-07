import dotenv from 'dotenv';

dotenv.config();

function getResendApiKey(): string {
  return (process.env.RESEND_API_KEY || '').trim();
}

function getFromEmail(): string {
  return (process.env.RESEND_FROM_EMAIL || 'Feyron <hello@feyron.site>').trim();
}

function getToEmail(): string {
  return (process.env.CONTACT_TO_EMAIL || 'hello@feyron.site').trim();
}

function getOwnerFallbackEmail(): string {
  return (process.env.RESEND_FALLBACK_TO_EMAIL || 'fredrickomoke@gmail.com').trim();
}

function getTelegramBotToken(): string {
  return (process.env.TELEGRAM_BOT_TOKEN || '').trim();
}

function getTelegramChatId(): string {
  return (process.env.TELEGRAM_CHAT_ID || '').trim();
}

let cachedAutoTelegramChatId = '';

/**
 * Sends a real-time notification message to Telegram via Bot API.
 * If TELEGRAM_CHAT_ID is not explicitly set, automatically inspects the latest
 * bot `/start` message via getUpdates so setup is effortless.
 */
export async function sendTelegramNotification(htmlMessage: string): Promise<void> {
  const token = getTelegramBotToken();
  if (!token) return;

  try {
    let chatId = getTelegramChatId() || cachedAutoTelegramChatId;
    if (!chatId) {
      const updatesRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=10`);
      if (updatesRes.ok) {
        const updatesData = await updatesRes.json();
        const results = Array.isArray(updatesData?.result) ? updatesData.result : [];
        for (let i = results.length - 1; i >= 0; i--) {
          const item = results[i];
          const foundId =
            item?.message?.chat?.id ||
            item?.channel_post?.chat?.id ||
            item?.my_chat_member?.chat?.id;
          if (foundId) {
            chatId = String(foundId);
            cachedAutoTelegramChatId = chatId;
            break;
          }
        }
      }
    }

    if (!chatId) return;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error('Telegram notification error (non-blocking):', err);
  }
}

function escapeHtml(input: string): string {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isEmailAddress(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

const INTEREST_LABELS: Record<string, string> = {
  'ai-automation': 'AI Automation',
  'websites-platforms': 'Websites & Platforms',
  'integrations-payments': 'Integrations & Payments',
  'not-sure': 'Not sure yet',
};

interface ResendAttachment {
  filename: string;
  content: string; // Base64 encoded content
  content_type?: string;
}

interface ResendSendPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
  reply_to?: string;
  attachments?: ResendAttachment[];
}

async function postToResend(
  payload: ResendSendPayload,
  apiKey: string
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

/**
 * Sends an email via Resend with automatic domain/sandbox fallbacks:
 * 1) Tries configured `from` (e.g. `Feyron <hello@feyron.site>`) and target `to`.
 * 2) If `feyron.site` is not verified yet in Resend, retries with `Feyron <onboarding@resend.dev>`.
 * 3) If Resend is in sandbox/testing mode (only allows sending to account owner email),
 *    retries sending to `fredrickomoke@gmail.com` so no lead is ever lost.
 */
export async function sendEmailViaResend(options: {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: ResendAttachment[];
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { success: false, error: 'Missing RESEND_API_KEY' };
  }

  const primaryPayload: ResendSendPayload = {
    from: getFromEmail(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    ...(options.replyTo ? { reply_to: options.replyTo } : {}),
    ...(options.attachments ? { attachments: options.attachments } : {}),
  };

  // Attempt 1: Primary domain & recipient
  const attempt1 = await postToResend(primaryPayload, apiKey);
  if (attempt1.ok) {
    return { success: true, id: attempt1.data?.id };
  }

  const errMsg1 = String(attempt1.data?.message || attempt1.data?.error || '');

  // Attempt 2: Fallback sender `onboarding@resend.dev` if domain is not verified yet
  const onboardingPayload: ResendSendPayload = {
    ...primaryPayload,
    from: 'Feyron <onboarding@resend.dev>',
  };
  const attempt2 = await postToResend(onboardingPayload, apiKey);
  if (attempt2.ok) {
    return { success: true, id: attempt2.data?.id };
  }

  const errMsg2 = String(attempt2.data?.message || attempt2.data?.error || errMsg1);

  // Attempt 3: If Resend sandbox restricts recipient to the account owner's email address,
  // extract that email or fall back to fredrickomoke@gmail.com
  const matchOwnerEmail = errMsg2.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const fallbackRecipient = matchOwnerEmail ? matchOwnerEmail[1] : getOwnerFallbackEmail();

  if (fallbackRecipient && !options.to.includes(fallbackRecipient)) {
    const sandboxPayload: ResendSendPayload = {
      ...onboardingPayload,
      to: [fallbackRecipient],
    };
    const attempt3 = await postToResend(sandboxPayload, apiKey);
    if (attempt3.ok) {
      return { success: true, id: attempt3.data?.id };
    }
    return {
      success: false,
      error: String(attempt3.data?.message || errMsg2 || 'Resend API failed'),
    };
  }

  return {
    success: false,
    error: errMsg2 || 'Resend API failed',
  };
}

export interface ContactSubmissionBody {
  name?: string;
  contact?: string;
  email?: string;
  company?: string;
  interest?: string;
  description?: string;
  message?: string;
  bottleneck?: string;
  source?: string;
  website?: string; // Honeypot
}

export async function handleContactSubmission(body: ContactSubmissionBody): Promise<{
  status: number;
  body: { ok: boolean; message?: string; error?: string; id?: string };
}> {
  if (body.website && String(body.website).trim().length > 0) {
    return { status: 200, body: { ok: true, message: 'Received' } };
  }

  const source = String(body.source || 'website').trim();
  const isWaitlist = source === 'products-waitlist' || body.interest === 'Products Waitlist';

  const rawEmail = String(body.email || body.contact || '').trim();
  const rawName = String(body.name || (isWaitlist ? 'Product Waitlist Subscriber' : '')).trim();
  const rawCompany = String(body.company || '').trim();
  const rawInterestKey = String(body.interest || 'AI Automation').trim();
  const interestLabel = INTEREST_LABELS[rawInterestKey] || rawInterestKey;
  const rawMessage = String(
    body.description ||
      body.message ||
      body.bottleneck ||
      (isWaitlist ? 'Joined the Feyron Products early-access list.' : '')
  ).trim();

  if (!rawName || !rawEmail || !rawMessage) {
    return {
      status: 400,
      body: { ok: false, error: 'Please complete your name, email address, and message.' },
    };
  }

  if (!isEmailAddress(rawEmail)) {
    return {
      status: 400,
      body: { ok: false, error: 'Please enter a valid email address (e.g. you@company.com).' },
    };
  }

  const safeName = escapeHtml(rawName);
  const safeEmail = escapeHtml(rawEmail);
  const safeCompany = escapeHtml(rawCompany || 'Not specified');
  const safeInterest = escapeHtml(interestLabel);
  const safeMessage = escapeHtml(rawMessage).replace(/\r?\n/g, '<br/>');
  const safeSource = escapeHtml(source);
  const submittedAt = new Date().toUTCString();

  const internalHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
</head>
<body style="margin:0;padding:24px;background:#f4f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e1e1e;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:2px solid #1e1e1e;border-radius:18px;overflow:hidden;">
    <div style="background:#1e1e1e;color:#d4f534;padding:22px 28px;">
      <div style="font-family:monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.85;margin-bottom:6px;">
        Feyron Lead Notification · ${safeSource}
      </div>
      <h1 style="margin:0;font-size:22px;font-weight:800;color:#faf7ea;">
        New Enquiry: ${safeInterest}
      </h1>
    </div>
    <div style="padding:26px 28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#666;width:130px;font-weight:600;">Name</td>
          <td style="padding:8px 0;font-size:15px;font-weight:700;color:#1e1e1e;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#666;font-weight:600;">Email</td>
          <td style="padding:8px 0;font-size:15px;font-weight:700;color:#1e1e1e;">
            <a href="mailto:${safeEmail}" style="color:#1e1e1e;text-decoration:underline;">${safeEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#666;font-weight:600;">Company</td>
          <td style="padding:8px 0;font-size:15px;color:#1e1e1e;">${safeCompany}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#666;font-weight:600;">Interest Area</td>
          <td style="padding:8px 0;font-size:15px;color:#1e1e1e;">
            <span style="display:inline-block;background:#d4f534;color:#1e1e1e;font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px;border:1.5px solid #1e1e1e;">
              ${safeInterest}
            </span>
          </td>
        </tr>
      </table>

      <div style="background:#f7f7f2;border:1.5px solid #1e1e1e;border-radius:14px;padding:18px 20px;margin-bottom:20px;">
        <div style="font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#666;margin-bottom:8px;">
          Project / Workflow Details
        </div>
        <div style="font-size:15px;line-height:1.6;color:#1e1e1e;">
          ${safeMessage}
        </div>
      </div>

      <div style="font-size:12px;color:#777;border-top:1px solid #e5e5e0;padding-top:14px;">
        Submitted on ${submittedAt} via <strong>feyron.site</strong>
      </div>
    </div>
  </div>
</body>
</html>`.trim();

  const internalText = [
    `New Feyron Enquiry (${interestLabel})`,
    `Name: ${rawName}`,
    `Email: ${rawEmail}`,
    `Company: ${rawCompany || 'Not specified'}`,
    `Interest: ${interestLabel}`,
    `Source: ${source}`,
    ``,
    `Details:`,
    rawMessage,
  ].join('\n');

  const internalResult = await sendEmailViaResend({
    to: [getToEmail()],
    subject: `[Feyron] New ${interestLabel} enquiry from ${rawName}`,
    html: internalHtml,
    text: internalText,
    replyTo: rawEmail,
  });

  // Also dispatch real-time Telegram Bot notification
  await sendTelegramNotification(
    [
      `🔔 <b>New Feyron Lead (${safeInterest})</b>`,
      `👤 <b>Name:</b> ${safeName}`,
      `📧 <b>Email:</b> ${safeEmail}`,
      `🏢 <b>Company:</b> ${safeCompany}`,
      `📍 <b>Source:</b> ${safeSource}`,
      ``,
      `💬 <b>Details:</b>`,
      escapeHtml(rawMessage),
    ].join('\n')
  );

  if (!internalResult.success) {
    return {
      status: 502,
      body: {
        ok: false,
        error:
          internalResult.error ||
          'Could not deliver email right now. Please write to hello@feyron.site.',
      },
    };
  }

  // Send branded auto-responder to visitor
  const visitorHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
</head>
<body style="margin:0;padding:24px;background:#f4f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e1e1e;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:2px solid #1e1e1e;border-radius:18px;overflow:hidden;">
    <div style="background:#1e1e1e;color:#faf7ea;padding:22px 28px;">
      <div style="font-family:monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#d4f534;margin-bottom:6px;">
        Feyron · AI Productivity &amp; Technology
      </div>
      <h1 style="margin:0;font-size:22px;font-weight:800;color:#faf7ea;">
        We&apos;ve received your note, ${safeName}.
      </h1>
    </div>
    <div style="padding:26px 28px;">
      <p style="margin:0 0 16px;font-size:15.5px;line-height:1.6;color:#2c301c;">
        Thank you for reaching out to <strong>Feyron</strong> regarding <strong>${safeInterest}</strong>.
        Our team in Lagos reviews every enquiry directly and will reply within one working day with practical next steps.
      </p>
      <div style="background:#f7f7f2;border:1.5px solid #1e1e1e;border-radius:14px;padding:16px 18px;margin-bottom:20px;">
        <div style="font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#666;margin-bottom:6px;">
          Your summary
        </div>
        <div style="font-size:14.5px;line-height:1.55;color:#1e1e1e;">
          ${safeMessage}
        </div>
      </div>
      <p style="margin:0;font-size:14px;line-height:1.55;color:#555;">
        Need to add anything in the meantime? Simply reply to this email or write to
        <a href="mailto:hello@feyron.site" style="color:#1e1e1e;font-weight:700;">hello@feyron.site</a>.
      </p>
    </div>
    <div style="background:#f7f7f2;padding:14px 28px;border-top:1px solid #e5e5e0;font-size:12px;color:#666;">
      <a href="https://feyron.site" style="color:#1e1e1e;font-weight:700;text-decoration:none;">feyron.site</a> · Lagos, Nigeria
    </div>
  </div>
</body>
</html>`.trim();

  await sendEmailViaResend({
    to: [rawEmail],
    subject: `We received your enquiry — Feyron`,
    html: visitorHtml,
    text: `Hi ${rawName},\n\nThank you for reaching out to Feyron regarding ${interestLabel}. We have received your note and will reply within one working day.\n\n— Feyron Team\nhttps://feyron.site`,
    replyTo: getToEmail(),
  }).catch(() => {});

  return {
    status: 200,
    body: {
      ok: true,
      message: 'Enquiry sent successfully.',
      id: internalResult.id,
    },
  };
}

// In-memory store for booked 20-min call slots per date (YYYY-MM-DD -> Set of "HH:MM")
const bookedSlotsByDate = new Map<string, Set<string>>();

export function getBookedSlotsForDate(dateStr: string): { taken: string[] } {
  const clean = String(dateStr || '').trim();
  const set = bookedSlotsByDate.get(clean);
  return { taken: set ? Array.from(set) : [] };
}

function generateMeetingLink(datePart: string, slotPart: string, guestName: string): string {
  const configuredMeet = (process.env.GOOGLE_MEET_LINK || '').trim();
  if (configuredMeet) return configuredMeet;

  const cleanSlug = guestName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 18) || 'guest';
  const compactDate = datePart.replace(/-/g, '');
  const compactTime = slotPart.replace(':', '');
  return `https://meet.jit.si/Feyron-${compactDate}-${compactTime}-${cleanSlug}`;
}

function buildGoogleCalendarTemplateUrl(
  datePart: string,
  slotPart: string,
  guestName: string,
  guestEmail: string,
  notes: string,
  meetingUrl: string
): string {
  const [hh, mm] = slotPart.split(':').map((n) => parseInt(n, 10));
  const startTotalMin = hh * 60 + mm;
  const endTotalMin = startTotalMin + 20;
  const endHH = String(Math.floor(endTotalMin / 60)).padStart(2, '0');
  const endMM = String(endTotalMin % 60).padStart(2, '0');

  const compactDate = datePart.replace(/-/g, '');
  const datesParam = `${compactDate}T${slotPart.replace(':', '')}00/${compactDate}T${endHH}${endMM}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Call — ${guestName} × Feyron`,
    dates: datesParam,
    ctz: 'Africa/Lagos',
    location: meetingUrl,
    add: `${guestEmail},hello@feyron.site`,
    details: [
      `20-minute Feyron Discovery Call`,
      `Join video meeting: ${meetingUrl}`,
      `Guest: ${guestName} (${guestEmail})`,
      notes ? `Notes: ${notes}` : '',
      `https://feyron.site | hello@feyron.site`,
    ]
      .filter(Boolean)
      .join('\n'),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcsCalendarInvite(
  datePart: string,
  slotPart: string,
  guestName: string,
  guestEmail: string,
  notes: string,
  meetingUrl: string
): string {
  const [hh, mm] = slotPart.split(':').map((n) => parseInt(n, 10));
  const startTotalMin = hh * 60 + mm;
  const endTotalMin = startTotalMin + 20;
  const endHH = String(Math.floor(endTotalMin / 60)).padStart(2, '0');
  const endMM = String(endTotalMin % 60).padStart(2, '0');

  const compactDate = datePart.replace(/-/g, '');
  const dtStart = `${compactDate}T${slotPart.replace(':', '')}00`;
  const dtEnd = `${compactDate}T${endHH}${endMM}00`;
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const uid = `feyron-${compactDate}-${slotPart.replace(':', '')}-${Date.now()}@feyron.site`;
  const cleanNotes = (notes || 'Feyron 20-minute discovery call').replace(/\r?\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Feyron//Cal Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART;TZID=Africa/Lagos:${dtStart}`,
    `DTEND;TZID=Africa/Lagos:${dtEnd}`,
    `SUMMARY:Call — ${guestName} × Feyron`,
    `LOCATION:${meetingUrl}`,
    `URL:${meetingUrl}`,
    `DESCRIPTION:Join Video Call: ${meetingUrl}\\n\\nGuest: ${guestName} (${guestEmail})\\nNotes: ${cleanNotes}\\n\\nFeyron — https://feyron.site`,
    `ORGANIZER;CN=Feyron:mailto:hello@feyron.site`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE;CN=${guestName}:mailto:${guestEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export interface BookingSubmissionBody {
  website?: string;
  name?: string;
  email?: string;
  notes?: string | null;
  starts_at?: string;
  lang?: string;
  source?: string;
}

export async function handleBookingSubmission(body: BookingSubmissionBody): Promise<{
  status: number;
  body: {
    ok: boolean;
    error?: string;
    id?: string;
    gcalUrl?: string;
    meetingUrl?: string;
  };
}> {
  if (body.website && String(body.website).trim().length > 0) {
    return { status: 200, body: { ok: true } };
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const notes = String(body.notes || '').trim();
  const startsAt = String(body.starts_at || '').trim(); // "YYYY-MM-DD HH:MM"

  if (!name || !isEmailAddress(email) || !startsAt) {
    return {
      status: 400,
      body: { ok: false, error: 'Please provide your name, a valid email, and a time slot.' },
    };
  }

  const [datePart, slotPart] = startsAt.split(/\s+/);
  if (!datePart || !slotPart) {
    return {
      status: 400,
      body: { ok: false, error: 'Invalid slot format.' },
    };
  }

  const existing = bookedSlotsByDate.get(datePart) || new Set<string>();
  if (existing.has(slotPart)) {
    return {
      status: 409,
      body: { ok: false, error: 'Slot already taken.' },
    };
  }
  existing.add(slotPart);
  bookedSlotsByDate.set(datePart, existing);

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeNotes = escapeHtml(notes || 'No additional notes provided.').replace(/\r?\n/g, '<br/>');
  const safeSlot = escapeHtml(`${datePart} at ${slotPart} (Lagos / WAT)`);

  const meetingUrl = generateMeetingLink(datePart, slotPart, name);
  const safeMeetingUrl = escapeHtml(meetingUrl);
  const gcalUrl = buildGoogleCalendarTemplateUrl(
    datePart,
    slotPart,
    name,
    email,
    notes,
    meetingUrl
  );
  const icsContent = buildIcsCalendarInvite(
    datePart,
    slotPart,
    name,
    email,
    notes,
    meetingUrl
  );
  const icsBase64 = Buffer.from(icsContent, 'utf-8').toString('base64');

  const bookingHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f4f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e1e1e;">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;border:2px solid #1e1e1e;border-radius:18px;overflow:hidden;">
    <div style="background:#1e1e1e;color:#d4f534;padding:22px 28px;">
      <div style="font-family:monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.85;margin-bottom:6px;">
        Feyron · 20-Minute Discovery Call Confirmed
      </div>
      <h1 style="margin:0;font-size:22px;font-weight:800;color:#faf7ea;">
        Call — ${safeName} × Feyron
      </h1>
    </div>
    <div style="padding:26px 28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
        <tr>
          <td style="padding:7px 0;font-size:13px;color:#666;width:110px;font-weight:600;">When</td>
          <td style="padding:7px 0;font-size:15px;font-weight:700;color:#1e1e1e;">${safeSlot} (20 mins)</td>
        </tr>
        <tr>
          <td style="padding:7px 0;font-size:13px;color:#666;font-weight:600;">Attendees</td>
          <td style="padding:7px 0;font-size:15px;color:#1e1e1e;">
            ${safeName} (<a href="mailto:${safeEmail}" style="color:#1e1e1e;">${safeEmail}</a>) &amp; Feyron (<a href="mailto:hello@feyron.site" style="color:#1e1e1e;">hello@feyron.site</a>)
          </td>
        </tr>
        <tr>
          <td style="padding:7px 0;font-size:13px;color:#666;font-weight:600;">Meeting Link</td>
          <td style="padding:7px 0;font-size:14.5px;font-weight:700;">
            <a href="${safeMeetingUrl}" style="color:#1e1e1e;text-decoration:underline;word-break:break-all;">${safeMeetingUrl}</a>
          </td>
        </tr>
      </table>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
        <a href="${safeMeetingUrl}" style="display:inline-block;background:#d4f534;color:#1e1e1e;border:2px solid #1e1e1e;font-weight:800;font-size:14px;padding:11px 22px;border-radius:100px;text-decoration:none;margin-right:8px;">
          Join Video Meeting →
        </a>
        <a href="${escapeHtml(gcalUrl)}" style="display:inline-block;background:#1e1e1e;color:#faf7ea;border:2px solid #1e1e1e;font-weight:700;font-size:14px;padding:11px 20px;border-radius:100px;text-decoration:none;">
          + Add to Google Calendar
        </a>
      </div>

      <div style="background:#f7f7f2;border:1.5px solid #1e1e1e;border-radius:14px;padding:16px 18px;margin-top:16px;">
        <div style="font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#666;margin-bottom:6px;">
          Additional Notes
        </div>
        <div style="font-size:14.5px;line-height:1.55;color:#1e1e1e;">${safeNotes}</div>
      </div>

      <div style="font-size:12px;color:#777;border-top:1px solid #e5e5e0;padding-top:14px;margin-top:18px;">
        A calendar invite (<strong>feyron-call.ics</strong>) is attached to this email so it appears automatically in your calendar.
      </div>
    </div>
  </div>
</body>
</html>`.trim();

  const attachments: ResendAttachment[] = [
    {
      filename: 'feyron-call.ics',
      content: icsBase64,
      content_type: 'text/calendar; charset=utf-8; method=REQUEST',
    },
  ];

  const res = await sendEmailViaResend({
    to: [getToEmail()],
    subject: `[Feyron Call Booked] ${name} — ${datePart} ${slotPart} WAT`,
    html: bookingHtml,
    text: [
      `New 20-min call booked on feyron.site`,
      `Guest: ${name} (${email})`,
      `When: ${datePart} at ${slotPart} (Lagos / WAT)`,
      `Join Video Meeting: ${meetingUrl}`,
      `Notes: ${notes || 'None'}`,
      `Add to Google Calendar: ${gcalUrl}`,
    ].join('\n'),
    replyTo: email,
    attachments,
  });

  // Also dispatch real-time Telegram Bot alert with the meeting link
  await sendTelegramNotification(
    [
      `📅 <b>New 20-Min Call Booked on Feyron!</b>`,
      `👤 <b>Guest:</b> ${safeName}`,
      `📧 <b>Email:</b> ${safeEmail}`,
      `🕒 <b>Slot:</b> ${safeSlot}`,
      `🎥 <b>Meeting Link:</b> <a href="${safeMeetingUrl}">${safeMeetingUrl}</a>`,
      `📝 <b>Notes:</b> ${escapeHtml(notes || 'None')}`,
      `🔗 <a href="${escapeHtml(gcalUrl)}">+ Add to Google Calendar</a>`,
    ].join('\n')
  );

  if (!res.success) {
    existing.delete(slotPart);
    return {
      status: 502,
      body: { ok: false, error: res.error || 'Could not confirm booking right now.' },
    };
  }

  // Send instant Cal.com-style meeting invite & link to the guest
  await sendEmailViaResend({
    to: [email],
    subject: `Invitation: Call — ${name} × Feyron (${datePart} ${slotPart} WAT)`,
    html: bookingHtml,
    text: [
      `Hi ${name},`,
      ``,
      `Your 20-minute discovery call with Feyron is confirmed!`,
      `When: ${datePart} at ${slotPart} (Lagos / WAT)`,
      `Join Video Meeting: ${meetingUrl}`,
      `Add to Google Calendar: ${gcalUrl}`,
      ``,
      `— Feyron Team`,
      `https://feyron.site | hello@feyron.site`,
    ].join('\n'),
    replyTo: getToEmail(),
    attachments,
  }).catch(() => {});

  return {
    status: 200,
    body: { ok: true, id: res.id, gcalUrl, meetingUrl },
  };
}
