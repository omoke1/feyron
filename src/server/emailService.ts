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

/**
 * Builds the official Feyron Enquiry Auto-Responder Email HTML.
 */
function buildContactAutoResponderHtml(opts: {
  fullName: string;
  interest: string;
  company: string;
  details: string;
}): string {
  const firstName = opts.fullName.split(/\s+/)[0] || opts.fullName;
  const safeFirstName = escapeHtml(firstName);
  const safeFullName = escapeHtml(opts.fullName);
  const safeInterest = escapeHtml(opts.interest);
  const safeCompany = escapeHtml(opts.company || 'Not specified');
  const safeDetails = escapeHtml(opts.details).replace(/\r?\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Feyron</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>table,td,div,p,a,span{font-family:Arial,Helvetica,sans-serif !important;}</style>
<![endif]-->
<style>
  html,body{margin:0 !important;padding:0 !important;width:100% !important;}
  *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  table{border-collapse:collapse;}
  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
  a{text-decoration:none;}
  a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;}
  u + #body a{color:inherit;text-decoration:none;}
 
  @media only screen and (max-width:620px){
    .container{width:100% !important;}
    .px{padding-left:24px !important;padding-right:24px !important;}
    .hero-h{font-size:30px !important;line-height:36px !important;}
    .stack{display:block !important;width:100% !important;}
    .btn-td{display:block !important;}
    .btn-a{display:block !important;text-align:center !important;}
    .hide-m{display:none !important;max-height:0 !important;overflow:hidden !important;}
  }
 
  @media (prefers-color-scheme:dark){
    .body-bg{background-color:#111111 !important;}
    .card{background-color:#262626 !important;}
    .t-dark{color:#E7E7E7 !important;}
    .t-muted{color:#A9A9A9 !important;}
    .callout{background-color:#1E1E1E !important;}
    .rule{border-color:#3A3A3A !important;}
  }
</style>
</head>
 
<body id="body" class="body-bg" style="margin:0;padding:0;background-color:#E7E7E7;word-spacing:normal;">
 
<!-- PREHEADER -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
  We received your note regarding ${safeInterest}. Here is what happens next.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>
 
<table role="presentation" class="body-bg" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E7E7E7;">
<tr>
<td align="center" style="padding:28px 12px;">
 
  <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
 
    <!-- ============ HEADER ============ -->
    <tr>
      <td class="px" bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:26px 40px;border-radius:16px 16px 0 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="middle" width="44" style="width:44px;">
              <table role="presentation" width="44" height="44" cellpadding="0" cellspacing="0" border="0" bgcolor="#FEB47B" style="width:44px;height:44px;background-color:#FEB47B;border-radius:10px;">
                <tr><td height="8" style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr>
                  <td align="center" valign="top" style="font-size:0;line-height:0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="9" height="18" bgcolor="#1E1E1E" style="width:9px;height:18px;background-color:#1E1E1E;border-radius:4px;font-size:0;line-height:0;">&nbsp;</td>
                        <td width="8" style="width:8px;font-size:0;line-height:0;">&nbsp;</td>
                        <td width="9" height="18" bgcolor="#1E1E1E" style="width:9px;height:18px;background-color:#1E1E1E;border-radius:4px;font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="5" style="height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr>
                  <td align="center" valign="top" style="font-size:0;line-height:0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr><td width="8" height="3" bgcolor="#1E1E1E" style="width:8px;height:3px;background-color:#1E1E1E;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="10" style="height:10px;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
            </td>
            <td valign="middle" style="padding-left:14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:24px;line-height:28px;font-weight:700;letter-spacing:-0.5px;color:#FFFFFF;">
              <a href="https://feyron.site" style="color:#FFFFFF;text-decoration:none;">Feyron</a>
            </td>
            <td align="right" valign="middle" class="hide-m" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:1.5px;text-transform:uppercase;color:#A9A9A9;">
              AI Productivity &amp; Technology
            </td>
          </tr>
        </table>
      </td>
    </tr>
 
    <!-- BRAND COLOUR BAR: gold, purple, emerald -->
    <tr>
      <td style="font-size:0;line-height:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="34%" height="5" bgcolor="#FEB47B" style="height:5px;background-color:#FEB47B;font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" height="5" bgcolor="#C084FC" style="height:5px;background-color:#C084FC;font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" height="5" bgcolor="#4ADE80" style="height:5px;background-color:#4ADE80;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
 
    <!-- ============ HERO ============ -->
    <tr>
      <td class="px" bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:52px 40px 56px 40px;">
        <p style="margin:0 0 18px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:#FEB47B;">${safeInterest}</p>
        <h1 class="hero-h" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:38px;line-height:44px;font-weight:700;letter-spacing:-1px;color:#FFFFFF;">Technology that moves work forward.</h1>
        <p style="margin:20px 0 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:17px;line-height:27px;color:#E7E7E7;">Thank you for contacting Feyron. We have received your note and will reply with practical next steps within one working day.</p>
      </td>
    </tr>
 
    <!-- ============ BODY CARD ============ -->
    <tr>
      <td class="px card" bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:44px 40px 8px 40px;">
 
        <h2 class="t-dark" style="margin:0 0 16px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:22px;line-height:28px;font-weight:700;letter-spacing:-0.3px;color:#1E1E1E;">Hi ${safeFirstName},</h2>
 
        <p class="t-dark" style="margin:0 0 24px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#1E1E1E;">Thank you for reaching out to Feyron regarding <strong>${safeInterest}</strong>${opts.company ? ` at <strong>${safeCompany}</strong>` : ''}. Our team reviews every enquiry directly and will reply within one working day with practical next steps.</p>
 
        <!-- ---------- BLOCK: WHAT HAPPENS NEXT (three points) ---------- -->
        <h3 class="t-dark" style="margin:0 0 18px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;color:#1E1E1E;">What happens next</h3>
 
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px 0;">
          <tr>
            <td valign="top" width="14" style="width:14px;padding-top:6px;">
              <table role="presentation" width="12" cellpadding="0" cellspacing="0" border="0"><tr><td width="12" height="12" bgcolor="#FEB47B" style="width:12px;height:12px;background-color:#FEB47B;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
            </td>
            <td class="t-dark" style="padding:0 0 16px 14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#1E1E1E;"><strong>Enquiry review.</strong> We analyze your workflow bottlenecks and tools involved.</td>
          </tr>
          <tr>
            <td valign="top" width="14" style="width:14px;padding-top:6px;">
              <table role="presentation" width="12" cellpadding="0" cellspacing="0" border="0"><tr><td width="12" height="12" bgcolor="#C084FC" style="width:12px;height:12px;background-color:#C084FC;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
            </td>
            <td class="t-dark" style="padding:0 0 16px 14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#1E1E1E;"><strong>Direct follow-up.</strong> We respond with clarifying questions or a clear idea of what to build.</td>
          </tr>
          <tr>
            <td valign="top" width="14" style="width:14px;padding-top:6px;">
              <table role="presentation" width="12" cellpadding="0" cellspacing="0" border="0"><tr><td width="12" height="12" bgcolor="#4ADE80" style="width:12px;height:12px;background-color:#4ADE80;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
            </td>
            <td class="t-dark" style="padding:0 0 0 14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#1E1E1E;"><strong>Discovery &amp; Plan.</strong> A written plan with clear architecture, timeline, and deliverables.</td>
          </tr>
        </table>
 
        <!-- ---------- BLOCK: CALLOUT ---------- -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
          <tr>
            <td class="callout" bgcolor="#F3F3F3" style="background-color:#F3F3F3;border-left:4px solid #FEB47B;border-radius:0 10px 10px 0;padding:20px 22px;">
              <p class="t-muted" style="margin:0 0 6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;color:#5F5F5F;">Your summary</p>
              <p class="t-dark" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#1E1E1E;">${safeDetails}</p>
            </td>
          </tr>
        </table>
 
        <p class="t-dark" style="margin:0 0 32px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#1E1E1E;">Need to add anything in the meantime? Simply reply to this email or write to <a href="mailto:hello@feyron.site" style="color:#FEB47B;text-decoration:none;font-weight:600;">hello@feyron.site</a>.</p>
 
        <!-- ---------- BLOCK: BUTTON ---------- -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 38px 0;">
          <tr>
            <td class="btn-td" bgcolor="#FEB47B" style="background-color:#FEB47B;border-radius:10px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://feyron.site/contact" style="height:50px;v-text-anchor:middle;width:240px;" arcsize="20%" stroke="f" fillcolor="#FEB47B"><w:anchorlock/><center style="color:#1E1E1E;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Book a workflow audit</center></v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-- -->
              <a class="btn-a" href="https://feyron.site/contact" style="display:inline-block;padding:15px 30px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:20px;font-weight:700;color:#1E1E1E;text-decoration:none;border-radius:10px;">Book a workflow audit</a>
              <!--<![endif]-->
            </td>
          </tr>
        </table>
 
        <!-- ---------- SIGN-OFF ---------- -->
        <p class="t-dark" style="margin:0 0 6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#1E1E1E;">Best regards,</p>
 
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 0 0;">
          <tr>
            <td class="rule" style="border-top:1px solid #E7E7E7;padding:24px 0 36px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" width="36" style="width:36px;">
                    <table role="presentation" width="36" height="36" cellpadding="0" cellspacing="0" border="0" bgcolor="#FEB47B" style="width:36px;height:36px;background-color:#FEB47B;border-radius:8px;">
                      <tr><td height="6" style="height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>
                      <tr>
                        <td align="center" valign="top" style="font-size:0;line-height:0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                            <td width="7" height="14" bgcolor="#1E1E1E" style="width:7px;height:14px;background-color:#1E1E1E;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>
                            <td width="6" style="width:6px;font-size:0;line-height:0;">&nbsp;</td>
                            <td width="7" height="14" bgcolor="#1E1E1E" style="width:7px;height:14px;background-color:#1E1E1E;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>
                          </tr></table>
                        </td>
                      </tr>
                      <tr><td height="4" style="height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
                      <tr>
                        <td align="center" valign="top" style="font-size:0;line-height:0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="6" height="3" bgcolor="#1E1E1E" style="width:6px;height:3px;background-color:#1E1E1E;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                        </td>
                      </tr>
                      <tr><td height="9" style="height:9px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                  <td valign="middle" style="padding-left:14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                    <p class="t-dark" style="margin:0;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">Fredy</p>
                    <p class="t-muted" style="margin:2px 0 0 0;font-size:14px;line-height:20px;color:#5F5F5F;">Feyron Team</p>
                    <p class="t-muted" style="margin:2px 0 0 0;font-size:14px;line-height:20px;color:#5F5F5F;"><a href="mailto:hello@feyron.site" style="color:#5F5F5F;text-decoration:none;">hello@feyron.site</a> &nbsp;|&nbsp; <a href="https://feyron.site" style="color:#5F5F5F;text-decoration:none;">feyron.site</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
 
      </td>
    </tr>
 
    <!-- ============ FOOTER ============ -->
    <tr>
      <td class="px" bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:36px 40px 40px 40px;border-radius:0 0 16px 16px;">
        <p style="margin:0 0 6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;line-height:24px;font-weight:700;letter-spacing:-0.3px;color:#FFFFFF;">Feyron</p>
        <p style="margin:0 0 22px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#FEB47B;">Technology that moves work forward.</p>
 
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;">
          <tr>
            <td style="padding-right:20px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;"><a href="https://feyron.site" style="color:#E7E7E7;text-decoration:underline;">Website</a></td>
            <td style="padding-right:20px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;"><a href="mailto:hello@feyron.site" style="color:#E7E7E7;text-decoration:underline;">Contact</a></td>
            <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;"><a href="https://feyron.site/privacy" style="color:#E7E7E7;text-decoration:underline;">Privacy</a></td>
          </tr>
        </table>
 
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-top:1px solid #3A3A3A;padding-top:20px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:19px;color:#A9A9A9;">
              Feyron Technologies &nbsp;|&nbsp; Lagos, Nigeria<br><br>
              You are receiving this email because you contacted Feyron at feyron.site.
              <a href="mailto:hello@feyron.site?subject=Unsubscribe" style="color:#E7E7E7;text-decoration:underline;">Unsubscribe</a><br><br>
              &copy; 2026 Feyron. AI Productivity &amp; Technology.
            </td>
          </tr>
        </table>
      </td>
    </tr>
 
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
 
</td>
</tr>
</table>
 
</body>
</html>`.trim();
}

/**
 * Builds the official Feyron Booking Confirmation Email HTML.
 */
function buildBookingConfirmationHtml(opts: {
  fullName: string;
  email: string;
  dateStr: string;
  slotStr: string;
  endSlotStr: string;
  formattedDate: string;
  meetingUrl: string;
  gcalUrl: string;
  rescheduleUrl: string;
}): string {
  const firstName = opts.fullName.split(/\s+/)[0] || opts.fullName;
  const safeFirstName = escapeHtml(firstName);
  const safeDate = escapeHtml(opts.formattedDate);
  const safeStart = escapeHtml(opts.slotStr);
  const safeEnd = escapeHtml(opts.endSlotStr);
  const safeMeetingUrl = escapeHtml(opts.meetingUrl);
  const safeGcalUrl = escapeHtml(opts.gcalUrl);
  const safeRescheduleUrl = escapeHtml(opts.rescheduleUrl);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Your workflow audit is booked | Feyron</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>table,td,div,p,a,span{font-family:Arial,Helvetica,sans-serif !important;}</style>
<![endif]-->
<style>
  html,body{margin:0 !important;padding:0 !important;width:100% !important;}
  *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  table{border-collapse:collapse;}
  a{text-decoration:none;}
  a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;}
  u + #body a{color:inherit;text-decoration:none;}
  @media only screen and (max-width:620px){
    .container{width:100% !important;}
    .px{padding-left:24px !important;padding-right:24px !important;}
    .hero-h{font-size:30px !important;line-height:36px !important;}
    .btn-td{display:block !important;}
    .btn-a{display:block !important;text-align:center !important;}
    .hide-m{display:none !important;max-height:0 !important;overflow:hidden !important;}
    .lbl{display:block !important;width:100% !important;padding-bottom:2px !important;}
    .val{display:block !important;width:100% !important;}
  }
  @media (prefers-color-scheme:dark){
    .body-bg{background-color:#111111 !important;}
    .card{background-color:#262626 !important;}
    .t-dark{color:#E7E7E7 !important;}
    .t-muted{color:#A9A9A9 !important;}
    .callout{background-color:#1E1E1E !important;}
    .rule{border-color:#3A3A3A !important;}
  }
</style>
</head>
 
<body id="body" class="body-bg" style="margin:0;padding:0;background-color:#E7E7E7;word-spacing:normal;">
 
<!-- PREHEADER -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
  ${safeDate} at ${safeStart} with Feyron. Here is what to expect and what to prepare.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>
 
<table role="presentation" class="body-bg" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E7E7E7;">
<tr><td align="center" style="padding:28px 12px;">
 
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
 
  <!-- HEADER -->
  <tr>
    <td class="px" bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:26px 40px;border-radius:16px 16px 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle" width="44" style="width:44px;">
            <table role="presentation" width="44" height="44" cellpadding="0" cellspacing="0" border="0" bgcolor="#FEB47B" style="width:44px;height:44px;background-color:#FEB47B;border-radius:10px;">
              <tr><td height="8" style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>
              <tr><td align="center" valign="top" style="font-size:0;line-height:0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td width="9" height="18" bgcolor="#1E1E1E" style="width:9px;height:18px;background-color:#1E1E1E;border-radius:4px;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="8" style="width:8px;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="9" height="18" bgcolor="#1E1E1E" style="width:9px;height:18px;background-color:#1E1E1E;border-radius:4px;font-size:0;line-height:0;">&nbsp;</td>
                </tr></table>
              </td></tr>
              <tr><td height="5" style="height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>
              <tr><td align="center" valign="top" style="font-size:0;line-height:0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="8" height="3" bgcolor="#1E1E1E" style="width:8px;height:3px;background-color:#1E1E1E;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
              </td></tr>
              <tr><td height="10" style="height:10px;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
          </td>
          <td valign="middle" style="padding-left:14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:24px;line-height:28px;font-weight:700;letter-spacing:-0.5px;color:#FFFFFF;"><a href="https://feyron.site" style="color:#FFFFFF;text-decoration:none;">Feyron</a></td>
          <td align="right" valign="middle" class="hide-m" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:1.5px;text-transform:uppercase;color:#A9A9A9;">AI Productivity &amp; Technology</td>
        </tr>
      </table>
    </td>
  </tr>
 
  <!-- COLOUR BAR -->
  <tr><td style="font-size:0;line-height:0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="34%" height="5" bgcolor="#FEB47B" style="height:5px;background-color:#FEB47B;font-size:0;line-height:0;">&nbsp;</td>
      <td width="33%" height="5" bgcolor="#C084FC" style="height:5px;background-color:#C084FC;font-size:0;line-height:0;">&nbsp;</td>
      <td width="33%" height="5" bgcolor="#4ADE80" style="height:5px;background-color:#4ADE80;font-size:0;line-height:0;">&nbsp;</td>
    </tr></table>
  </td></tr>
 
  <!-- HERO -->
  <tr>
    <td class="px" bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:48px 40px 52px 40px;">
      <p style="margin:0 0 18px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:#4ADE80;">Booking confirmed</p>
      <h1 class="hero-h" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:36px;line-height:42px;font-weight:700;letter-spacing:-1px;color:#FFFFFF;">Your workflow audit is booked.</h1>
      <p style="margin:20px 0 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:17px;line-height:27px;color:#E7E7E7;">Hi ${safeFirstName}, thank you for booking. In a few days we will map one process, find where time is lost and give you a written plan with a scope and a price.</p>
    </td>
  </tr>
 
  <!-- BODY -->
  <tr>
    <td class="px card" bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:40px 40px 8px 40px;">
 
      <h3 class="t-dark" style="margin:0 0 16px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;color:#1E1E1E;">Your session</h3>
 
      <!-- DETAILS CARD -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
        <tr>
          <td class="callout" bgcolor="#F3F3F3" style="background-color:#F3F3F3;border-left:4px solid #FEB47B;border-radius:0 10px 10px 0;padding:22px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="lbl t-muted" width="110" valign="top" style="width:110px;padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">Date</td>
                <td class="val t-dark" valign="top" style="padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">${safeDate}</td>
              </tr>
              <tr>
                <td class="lbl t-muted" width="110" valign="top" style="width:110px;padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">Time</td>
                <td class="val t-dark" valign="top" style="padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">${safeStart} to ${safeEnd} (West Africa Time)</td>
              </tr>
              <tr>
                <td class="lbl t-muted" width="110" valign="top" style="width:110px;padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">Format</td>
                <td class="val t-dark" valign="top" style="padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">Video call (<a href="${safeMeetingUrl}" style="color:#1E1E1E;text-decoration:underline;">Meeting room link</a>)</td>
              </tr>
              <tr>
                <td class="lbl t-muted" width="110" valign="top" style="width:110px;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">With</td>
                <td class="val t-dark" valign="top" style="padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">Fredy, Feyron Team</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
 
      <!-- BUTTON -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px 0;">
        <tr>
          <td class="btn-td" bgcolor="#FEB47B" style="background-color:#FEB47B;border-radius:10px;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${safeMeetingUrl}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="20%" stroke="f" fillcolor="#FEB47B"><w:anchorlock/><center style="color:#1E1E1E;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Join the session</center></v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <a class="btn-a" href="${safeMeetingUrl}" style="display:inline-block;padding:15px 30px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:20px;font-weight:700;color:#1E1E1E;text-decoration:none;border-radius:10px;">Join the session</a>
            <!--<![endif]-->
          </td>
        </tr>
      </table>
      <p class="t-muted" style="margin:0 0 36px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">
        <a href="${safeGcalUrl}" style="color:#1E1E1E;text-decoration:underline;" class="t-dark">Add to Google Calendar</a> &nbsp;|&nbsp;
        <a href="${safeRescheduleUrl}" style="color:#1E1E1E;text-decoration:underline;" class="t-dark">Reschedule</a>
      </p>
 
      <!-- PREPARE -->
      <h3 class="t-dark" style="margin:0 0 18px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;color:#1E1E1E;">How to prepare</h3>
 
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
        <tr>
          <td valign="top" width="14" style="width:14px;padding-top:6px;"><table role="presentation" width="12" cellpadding="0" cellspacing="0" border="0"><tr><td width="12" height="12" bgcolor="#FEB47B" style="width:12px;height:12px;background-color:#FEB47B;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td>
          <td class="t-dark" style="padding:0 0 16px 14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#1E1E1E;"><strong>Pick one process.</strong> The task that takes the most time each week, such as handling enquiries, documents or follow-ups.</td>
        </tr>
        <tr>
          <td valign="top" width="14" style="width:14px;padding-top:6px;"><table role="presentation" width="12" cellpadding="0" cellspacing="0" border="0"><tr><td width="12" height="12" bgcolor="#C084FC" style="width:12px;height:12px;background-color:#C084FC;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td>
          <td class="t-dark" style="padding:0 0 16px 14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#1E1E1E;"><strong>List the tools involved.</strong> Email, WhatsApp, spreadsheets, accounting or CRM software, and anything else the work touches.</td>
        </tr>
        <tr>
          <td valign="top" width="14" style="width:14px;padding-top:6px;"><table role="presentation" width="12" cellpadding="0" cellspacing="0" border="0"><tr><td width="12" height="12" bgcolor="#4ADE80" style="width:12px;height:12px;background-color:#4ADE80;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td>
          <td class="t-dark" style="padding:0 0 0 14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#1E1E1E;"><strong>Bring an example.</strong> A recent enquiry, document or report, with private details removed, and the person who does this work if possible.</td>
        </tr>
      </table>
 
      <!-- WHAT HAPPENS AFTER -->
      <h3 class="t-dark" style="margin:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;color:#1E1E1E;">After the session</h3>
      <p class="t-dark" style="margin:0 0 20px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#1E1E1E;">Within 2 working days you will receive a written plan: how the work moves today, what we would build, where a person approves, the timeline and the price. If you decide to build with us within 30 days, the audit fee counts towards the project.</p>
      <p class="t-dark" style="margin:0 0 30px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#1E1E1E;">Need to change anything? Reply directly to this email or use the reschedule link above.</p>
 
      <p class="t-dark" style="margin:0 0 6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#1E1E1E;">Best regards,</p>
 
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0 0 0;">
        <tr>
          <td class="rule" style="border-top:1px solid #E7E7E7;padding:22px 0 34px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <p class="t-dark" style="margin:0;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">Fredy</p>
            <p class="t-muted" style="margin:2px 0 0 0;font-size:14px;line-height:20px;color:#5F5F5F;">Feyron Team</p>
            <p class="t-muted" style="margin:2px 0 0 0;font-size:14px;line-height:20px;color:#5F5F5F;"><a href="mailto:hello@feyron.site" style="color:#5F5F5F;text-decoration:none;">hello@feyron.site</a> &nbsp;|&nbsp; <a href="https://feyron.site" style="color:#5F5F5F;text-decoration:none;">feyron.site</a></p>
          </td>
        </tr>
      </table>
 
    </td>
  </tr>
 
  <!-- FOOTER -->
  <tr>
    <td class="px" bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:34px 40px 38px 40px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 4px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;line-height:24px;font-weight:700;letter-spacing:-0.3px;color:#FFFFFF;">Feyron</p>
      <p style="margin:0 0 20px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#FEB47B;">Technology that moves work forward.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-top:1px solid #3A3A3A;padding-top:18px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:19px;color:#A9A9A9;">
            Feyron Technologies &nbsp;|&nbsp; Lagos, Nigeria<br><br>
            You are receiving this email because you booked a workflow audit with Feyron at feyron.site.
            <a href="https://feyron.site/privacy" style="color:#E7E7E7;text-decoration:underline;">Privacy</a><br><br>
            &copy; 2026 Feyron. AI Productivity &amp; Technology.
          </td>
        </tr>
      </table>
    </td>
  </tr>
 
</table>
<!--[if mso]></td></tr></table><![endif]-->
 
</td></tr>
</table>
 
</body>
</html>`.trim();
}

export interface ContactSubmissionBody {
  name?: string;
  fullName?: string;
  contact?: string;
  email?: string;
  company?: string;
  interest?: string;
  description?: string;
  message?: string;
  details?: string;
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
  const rawName = String(
    body.name || body.fullName || (isWaitlist ? 'Product Waitlist Subscriber' : '')
  ).trim();
  const rawCompany = String(body.company || '').trim();
  const rawInterestKey = String(body.interest || 'AI Automation').trim();
  const interestLabel = INTEREST_LABELS[rawInterestKey] || rawInterestKey;
  const rawMessage = String(
    body.description ||
      body.message ||
      body.bottleneck ||
      body.details ||
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

  // Internal team notification
  const internalHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
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

  // Send the official Feyron branded auto-responder template to visitor
  const visitorHtml = buildContactAutoResponderHtml({
    fullName: rawName,
    interest: interestLabel,
    company: rawCompany,
    details: rawMessage,
  });

  await sendEmailViaResend({
    to: [rawEmail],
    subject: `Thank you for reaching out — Feyron`,
    html: visitorHtml,
    text: `Hi ${rawName},\n\nThank you for reaching out to Feyron regarding ${interestLabel}. Our team reviews every enquiry directly and will reply within one working day with practical next steps.\n\nYour summary\n${rawMessage}\n\nNeed to add anything in the meantime? Simply reply to this email or write to hello@feyron.site.\n\n— Fredy\nFeyron Team\nhttps://feyron.site | hello@feyron.site`,
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

  const cleanSlug =
    guestName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 18) || 'guest';
  const compactDate = datePart.replace(/-/g, '');
  const compactTime = slotPart.replace(':', '');
  return `https://meet.jit.si/Feyron-${compactDate}-${compactTime}-${cleanSlug}`;
}

function formatHumanDate(datePart: string): string {
  const [y, m, d] = datePart.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = days[dt.getUTCDay()] || 'Day';
  const monthName = months[dt.getUTCMonth()] || '';
  return `${dayName}, ${d} ${monthName} ${y}`;
}

function calculateEndSlot(slotPart: string, durationMinutes = 20): string {
  const [hh, mm] = slotPart.split(':').map((n) => parseInt(n, 10));
  const startTotalMin = hh * 60 + mm;
  const endTotalMin = startTotalMin + durationMinutes;
  const endHH = String(Math.floor(endTotalMin / 60)).padStart(2, '0');
  const endMM = String(endTotalMin % 60).padStart(2, '0');
  return `${endHH}:${endMM}`;
}

function buildGoogleCalendarTemplateUrl(
  datePart: string,
  slotPart: string,
  endSlotPart: string,
  guestName: string,
  guestEmail: string,
  notes: string,
  meetingUrl: string
): string {
  const compactDate = datePart.replace(/-/g, '');
  const datesParam = `${compactDate}T${slotPart.replace(':', '')}00/${compactDate}T${endSlotPart.replace(':', '')}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Call — ${guestName} × Feyron`,
    dates: datesParam,
    ctz: 'Africa/Lagos',
    location: meetingUrl,
    add: `${guestEmail},hello@feyron.site`,
    details: [
      `20-minute Feyron Workflow Audit & Discovery Call`,
      `Join Video Session: ${meetingUrl}`,
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
  endSlotPart: string,
  guestName: string,
  guestEmail: string,
  notes: string,
  meetingUrl: string
): string {
  const compactDate = datePart.replace(/-/g, '');
  const dtStart = `${compactDate}T${slotPart.replace(':', '')}00`;
  const dtEnd = `${compactDate}T${endSlotPart.replace(':', '')}00`;
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const uid = `feyron-${compactDate}-${slotPart.replace(':', '')}-${Date.now()}@feyron.site`;
  const cleanNotes = (notes || 'Feyron 20-minute workflow audit').replace(/\r?\n/g, '\\n');

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
    `DESCRIPTION:Join Video Meeting: ${meetingUrl}\\n\\nGuest: ${guestName} (${guestEmail})\\nNotes: ${cleanNotes}\\n\\nFeyron — https://feyron.site`,
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
  date?: string;
  time?: string;
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
  const startsAt = String(
    body.starts_at || (body.date && body.time ? `${body.date} ${body.time}` : '')
  ).trim(); // "YYYY-MM-DD HH:MM"

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

  const endSlotPart = calculateEndSlot(slotPart, 20);
  const formattedDate = formatHumanDate(datePart);
  const meetingUrl = generateMeetingLink(datePart, slotPart, name);
  const safeMeetingUrl = escapeHtml(meetingUrl);
  const gcalUrl = buildGoogleCalendarTemplateUrl(
    datePart,
    slotPart,
    endSlotPart,
    name,
    email,
    notes,
    meetingUrl
  );
  const rescheduleUrl = 'https://feyron.site/contact';

  const icsContent = buildIcsCalendarInvite(
    datePart,
    slotPart,
    endSlotPart,
    name,
    email,
    notes,
    meetingUrl
  );
  const icsBase64 = Buffer.from(icsContent, 'utf-8').toString('base64');

  // Build the official Feyron Booking Email HTML
  const guestBookingHtml = buildBookingConfirmationHtml({
    fullName: name,
    email,
    dateStr: datePart,
    slotStr: slotPart,
    endSlotStr: endSlotPart,
    formattedDate,
    meetingUrl,
    gcalUrl,
    rescheduleUrl,
  });

  const attachments: ResendAttachment[] = [
    {
      filename: 'feyron-call.ics',
      content: icsBase64,
      content_type: 'text/calendar; charset=utf-8; method=REQUEST',
    },
  ];

  // Send confirmation to internal inbox
  const res = await sendEmailViaResend({
    to: [getToEmail()],
    subject: `[Feyron Call Booked] ${name} — ${formattedDate} (${slotPart} WAT)`,
    html: guestBookingHtml,
    text: [
      `New 20-min workflow audit call booked on feyron.site`,
      `Guest: ${name} (${email})`,
      `Date: ${formattedDate}`,
      `Time: ${slotPart} to ${endSlotPart} (West Africa Time)`,
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
      `👤 <b>Guest:</b> ${escapeHtml(name)}`,
      `📧 <b>Email:</b> ${escapeHtml(email)}`,
      `🕒 <b>When:</b> ${escapeHtml(formattedDate)} at ${escapeHtml(slotPart)} (WAT)`,
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

  // Send the official Feyron Booking confirmation email to the guest
  await sendEmailViaResend({
    to: [email],
    subject: `Your workflow audit is booked | Feyron`,
    html: guestBookingHtml,
    text: [
      `Hi ${name},`,
      ``,
      `Your workflow audit is booked!`,
      `Date: ${formattedDate}`,
      `Time: ${slotPart} to ${endSlotPart} (West Africa Time)`,
      `Join Video Meeting: ${meetingUrl}`,
      `Add to Google Calendar: ${gcalUrl}`,
      `Reschedule: ${rescheduleUrl}`,
      ``,
      `— Fredy`,
      `Feyron Team`,
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
