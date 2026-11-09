import fs from 'fs';
import path from 'path';

try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
      }
    }
  }
} catch {
  // Ignore .env read errors in serverless runtime
}

function getResendApiKey(): string {
  return (process.env.RESEND_API_KEY || process.env.ESEND_API_KEY || '').trim();
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

export function getDashboardPasscode(): string {
  return (process.env.DASHBOARD_PASSCODE || 'feyron2026').trim();
}

let cachedAutoTelegramChatId = '';

export interface TelegramButton {
  text: string;
  url: string;
}

/**
 * Sends a real-time notification message to Telegram via Bot API.
 * Supports optional inline action buttons.
 */
export async function sendTelegramNotification(
  htmlMessage: string,
  inlineButtons?: TelegramButton[][]
): Promise<void> {
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

    const payload: Record<string, any> = {
      chat_id: chatId,
      text: htmlMessage,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };

    if (inlineButtons && inlineButtons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineButtons,
      };
    }

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
  isInternal?: boolean;
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

  // Attempt 3: If Resend sandbox restricts recipient (only for internal alerts)
  if (options.isInternal) {
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
  }

  return {
    success: false,
    error: errMsg2 || 'Resend API failed',
  };
}


export type FeyronIntentCategory =
  | 'ai-automation'
  | 'platform-development'
  | 'integrations-payments'
  | 'products-waitlist'
  | 'general';

export interface IntentConfig {
  category: FeyronIntentCategory;
  badgeLabel: string;
  badgeColor: string;
  heroHeadline: string;
  heroDescription: string;
  bodyIntro: string;
  stepsTitle: string;
  steps: Array<{ title: string; desc: string; color: string }>;
  caseStudyNote?: { name: string; desc: string; url: string };
  ctaText: string;
  ctaUrl: string;
  subjectLine: string;
  plainTextNextSteps: string;
}

export function resolveIntentConfig(
  rawInterest: string,
  rawSource: string = '',
  rawDetails: string = ''
): IntentConfig {
  const normInterest = (rawInterest || '').toLowerCase();
  const normSource = (rawSource || '').toLowerCase();
  const normDetails = (rawDetails || '').toLowerCase();
  const combined = `${normInterest} ${normSource} ${normDetails}`;

  // 1. Products Waitlist
  if (normSource === 'products-waitlist' || normInterest.includes('waitlist')) {
    return {
      category: 'products-waitlist',
      badgeLabel: 'EARLY ACCESS SUBSCRIBER',
      badgeColor: '#4ADE80',
      heroHeadline: "You're on the early-access list.",
      heroDescription:
        'Thank you for joining early access for Feyron Products. You are queued to receive private test flight access to our upcoming workflow and software platforms before public release.',
      bodyIntro:
        'Thank you for joining the Feyron Products early-access list. We build technology that moves work forward, and our subscribers get direct, priority previews of new tools as they enter pilot phase.',
      stepsTitle: 'What to expect from early access',
      steps: [
        {
          title: 'Zero noise policy.',
          desc: 'We only email when a working test build, pilot release, or major feature chapter is ready for hands-on review.',
          color: '#FEB47B',
        },
        {
          title: 'Private test flights.',
          desc: 'You will receive private access links to test workflow tools and influence our product roadmap.',
          color: '#C084FC',
        },
        {
          title: 'Founding member benefits.',
          desc: 'Priority onboarding, dedicated technical support, and early subscriber tier benefits on all public launches.',
          color: '#4ADE80',
        },
      ],
      caseStudyNote: {
        name: 'Explore Live Platforms',
        desc: 'Review our shipped systems across multi-vendor logistics, enterprise verification, and payments.',
        url: 'https://feyron.site/work',
      },
      ctaText: 'Explore our shipped case studies',
      ctaUrl: 'https://feyron.site/work',
      subjectLine: "You're on the early-access list — Feyron Products",
      plainTextNextSteps:
        '- Zero noise: We only email when a private test flight or pilot is live.\n- Direct input: Test new tools and help guide what we build.\n- Founding perks: Priority onboarding and subscriber benefits.',
    };
  }

  // 2. AI Automation & Custom Agents
  if (
    combined.includes('ai') ||
    combined.includes('agent') ||
    combined.includes('automat') ||
    combined.includes('froodi') ||
    combined.includes('bot') ||
    combined.includes('llm') ||
    combined.includes('workflow')
  ) {
    return {
      category: 'ai-automation',
      badgeLabel: 'AI AUTOMATION & WORKFLOW AGENTS',
      badgeColor: '#FEB47B',
      heroHeadline: 'Architecting intelligent workflows that scale.',
      heroDescription:
        'Thank you for contacting Feyron. We analyze your operational workflows directly and will reply with a technical assessment and implementation scope within one working day.',
      bodyIntro:
        'Thank you for reaching out to Feyron regarding AI Automation and Custom Agents. Our team reviews every enquiry directly to understand your operational touchpoints and will reply within one working day with practical next steps.',
      stepsTitle: 'What we evaluate for your automation',
      steps: [
        {
          title: 'Workflow & Bottleneck Audit.',
          desc: 'We analyze your manual handoffs, repetitive operational tasks, and team coordination delays.',
          color: '#FEB47B',
        },
        {
          title: 'Agent Architecture & Boundaries.',
          desc: 'Matching the right model APIs and stateful logic to your existing stack with strict data boundaries.',
          color: '#C084FC',
        },
        {
          title: 'Implementation Roadmap & ROI.',
          desc: 'A written plan detailing required API connectors, execution timeline, and measurable hours saved.',
          color: '#4ADE80',
        },
      ],
      caseStudyNote: {
        name: 'Froodi Logistics & Dispatch',
        desc: 'Automated dispatch console and rider routing platform that saved 14+ hours/week.',
        url: 'https://feyron.site/work/froodi',
      },
      ctaText: 'Book a 20-min workflow audit',
      ctaUrl: 'https://feyron.site/contact',
      subjectLine: 'Next steps: AI Automation & Agent Systems — Feyron',
      plainTextNextSteps:
        '- Workflow & Bottleneck Audit: Mapping your repetitive operational handoffs.\n- Agent Architecture & Boundaries: Matching models and state machines with strict data security.\n- Implementation Roadmap & ROI: Clear connectors, delivery timeline, and hours saved.',
    };
  }

  // 3. Platforms, Web Apps & Software Engineering
  if (
    combined.includes('platform') ||
    combined.includes('website') ||
    combined.includes('software') ||
    combined.includes('portal') ||
    combined.includes('app') ||
    combined.includes('workverify') ||
    combined.includes('propledger') ||
    combined.includes('phovify')
  ) {
    return {
      category: 'platform-development',
      badgeLabel: 'PLATFORM & WEB ENGINEERING',
      badgeColor: '#C084FC',
      heroHeadline: 'High-performance platforms built to scale.',
      heroDescription:
        'Thank you for contacting Feyron. We have received your platform specifications and will reply with architectural recommendations and scope within one working day.',
      bodyIntro:
        'Thank you for reaching out to Feyron regarding software and platform development. Our engineering team reviews every specification directly and will reply within one working day with practical next steps.',
      stepsTitle: 'Our platform delivery approach',
      steps: [
        {
          title: 'Architecture & Stack Selection.',
          desc: 'Selecting modern, resilient stacks (React, TypeScript, cloud databases, edge APIs) tailored for fast performance and clean maintenance.',
          color: '#FEB47B',
        },
        {
          title: 'UX Systems & Interface Polish.',
          desc: 'Designing intuitive, high-conversion user flows with responsive performance across mobile and desktop.',
          color: '#C084FC',
        },
        {
          title: 'Sprint Milestones & Scope.',
          desc: 'A phased milestone roadmap with clear sprint deliverables, deployment checkpoints, and fixed transparent pricing.',
          color: '#4ADE80',
        },
      ],
      caseStudyNote: {
        name: 'WorkVerify Portal',
        desc: 'Enterprise credential verification platform with real-time audit logs and multi-tenant security.',
        url: 'https://feyron.site/work/workverify',
      },
      ctaText: 'Schedule a 20-min architecture review',
      ctaUrl: 'https://feyron.site/contact',
      subjectLine: 'Next steps: Platform Engineering & Web Architecture — Feyron',
      plainTextNextSteps:
        '- Architecture & Stack Selection: Modern React/Node foundations for speed and longevity.\n- UX Systems & Interface Polish: Intuitive user journeys and high conversion flows.\n- Sprint Milestones & Scope: Phased deliverables and transparent pricing.',
    };
  }

  // 4. Integrations & Payment Infrastructure
  if (
    combined.includes('payment') ||
    combined.includes('fintech') ||
    combined.includes('integration') ||
    combined.includes('api') ||
    combined.includes('gateway') ||
    combined.includes('flowpay') ||
    combined.includes('qreva') ||
    combined.includes('stripe') ||
    combined.includes('paystack')
  ) {
    return {
      category: 'integrations-payments',
      badgeLabel: 'INTEGRATIONS & PAYMENT INFRASTRUCTURE',
      badgeColor: '#4ADE80',
      heroHeadline: 'Resilient infrastructure connecting your operations.',
      heroDescription:
        'Thank you for contacting Feyron. We will review your API endpoints and payment gateway architecture within one working day.',
      bodyIntro:
        'Thank you for reaching out to Feyron regarding payment and system integrations. Our team reviews every technical requirement directly and will reply within one working day with practical next steps.',
      stepsTitle: 'What we evaluate for your integration',
      steps: [
        {
          title: 'API & Webhook Reliability.',
          desc: 'Designing idempotent webhook handlers, secure signature checks, and zero-data-loss error retries.',
          color: '#FEB47B',
        },
        {
          title: 'Payment Gateway & Split Routing.',
          desc: 'Configuring multi-currency checkout, automated split-payouts, and transparent reconciliation ledgers.',
          color: '#C084FC',
        },
        {
          title: 'Security & Implementation Plan.',
          desc: 'Secure credential isolation, audit logging, and automated reconciliation matching your accounting workflow.',
          color: '#4ADE80',
        },
      ],
      caseStudyNote: {
        name: 'FlowPay Invoicing & Reconciliation',
        desc: 'Real-time billing, multi-currency collections, and automated payment matching.',
        url: 'https://feyron.site/work/flowpay',
      },
      ctaText: 'Schedule an integration consultation',
      ctaUrl: 'https://feyron.site/contact',
      subjectLine: 'Next steps: Integrations & Payments Architecture — Feyron',
      plainTextNextSteps:
        '- API & Webhook Reliability: Idempotent processing and zero-loss error recovery.\n- Gateway & Split Routing: Multi-currency checkout and automated reconciliation.\n- Security & Implementation Plan: Secret isolation and end-to-end integration tests.',
    };
  }

  // 5. General Consultation
  return {
    category: 'general',
    badgeLabel: 'CONSULTATION & PROJECT INQUIRY',
    badgeColor: '#FEB47B',
    heroHeadline: 'Technology that moves work forward.',
    heroDescription:
      'Thank you for contacting Feyron. We have received your note and will reply with practical next steps within one working day.',
    bodyIntro:
      'Thank you for reaching out to Feyron. Our team reviews every enquiry directly and will reply within one working day with practical next steps.',
    stepsTitle: 'What happens next',
    steps: [
      {
        title: 'Enquiry review.',
        desc: 'We analyze your workflow bottlenecks, project scope, and tools involved.',
        color: '#FEB47B',
      },
      {
        title: 'Direct follow-up.',
        desc: 'We respond with clarifying questions or a clear architectural recommendation.',
        color: '#C084FC',
      },
      {
        title: 'Discovery & Plan.',
        desc: 'A written plan with clear architecture, timeline, and deliverables.',
        color: '#4ADE80',
      },
    ],
    ctaText: 'Book a workflow audit',
    ctaUrl: 'https://feyron.site/contact',
    subjectLine: 'Thank you for reaching out — Feyron',
    plainTextNextSteps:
      '- Enquiry review: We analyze your bottlenecks and project scope.\n- Direct follow-up: We respond with clarifying questions or recommendation.\n- Discovery & Plan: A written plan with clear architecture and timeline.',
  };
}

export function resolveBookingTopicAgenda(notes: string = ''): Array<{ title: string; desc: string; color: string }> {
  const norm = (notes || '').toLowerCase();
  if (norm.includes('ai') || norm.includes('agent') || norm.includes('automat') || norm.includes('froodi')) {
    return [
      {
        title: 'Your workflow bottlenecks.',
        desc: 'What manual tasks, handoffs, or operational friction are slowing your team down today.',
        color: '#FEB47B',
      },
      {
        title: 'Tooling & model architecture.',
        desc: 'Matching the right model APIs, custom agent logic, and security boundaries to your data.',
        color: '#C084FC',
      },
      {
        title: 'Implementation scope & ROI.',
        desc: 'Clear recommendations on required connectors, delivery timeline, and measurable hours saved.',
        color: '#4ADE80',
      },
    ];
  }
  if (norm.includes('platform') || norm.includes('web') || norm.includes('app') || norm.includes('software')) {
    return [
      {
        title: 'Platform scope & user journeys.',
        desc: 'Reviewing your core user flows, user onboarding, and technical requirements.',
        color: '#FEB47B',
      },
      {
        title: 'Architecture & tech stack.',
        desc: 'Selecting modern React/TypeScript frameworks, cloud databases, and high-performance hosting.',
        color: '#C084FC',
      },
      {
        title: 'Sprint roadmap & delivery.',
        desc: 'Breaking down milestones, release velocity, and fixed-scope timeline estimates.',
        color: '#4ADE80',
      },
    ];
  }
  if (norm.includes('payment') || norm.includes('fintech') || norm.includes('integration') || norm.includes('api')) {
    return [
      {
        title: 'Systems & gateway mapping.',
        desc: 'Reviewing your API endpoints, payment providers (Stripe, Paystack, Flutterwave), and sync needs.',
        color: '#FEB47B',
      },
      {
        title: 'Reliability & error recovery.',
        desc: 'Designing idempotent webhook handling, state machines, and automated reconciliation.',
        color: '#C084FC',
      },
      {
        title: 'Integration blueprint.',
        desc: 'Clear architectural steps to connect your software and operations securely.',
        color: '#4ADE80',
      },
    ];
  }
  return [
    {
      title: 'Your goals & priorities.',
      desc: 'What you are looking to build, automate, integrate or improve for your team or customers.',
      color: '#FEB47B',
    },
    {
      title: 'Current setup & tools.',
      desc: 'Any existing websites, software platforms, communication channels or workflows your team uses today.',
      color: '#C084FC',
    },
    {
      title: 'Practical next steps.',
      desc: 'Clear recommendations on architecture, scope, delivery timeline and how we can move your project forward.',
      color: '#4ADE80',
    },
  ];
}


/**
 * Builds the official Feyron Enquiry Auto-Responder Email HTML.
 * Dynamically tailored to the visitor's selected category, project specifications, and intent.
 */
function buildContactAutoResponderHtml(opts: {
  fullName: string;
  interest: string;
  company: string;
  details: string;
  intent?: IntentConfig;
}): string {
  const firstName = opts.fullName.split(/\s+/)[0] || opts.fullName;
  const safeFirstName = escapeHtml(firstName);
  const safeFullName = escapeHtml(opts.fullName);
  const safeInterest = escapeHtml(opts.interest);
  const safeCompany = escapeHtml(opts.company || 'Not specified');
  const safeDetails = escapeHtml(opts.details).replace(/\r?\n/g, '<br/>');
  const intent = opts.intent || resolveIntentConfig(opts.interest, '', opts.details);

  const stepsRows = intent.steps
    .map(
      (step) => `<tr>
        <td valign="top" width="14" style="width:14px;padding-top:6px;">
          <table role="presentation" width="12" cellpadding="0" cellspacing="0" border="0"><tr><td width="12" height="12" bgcolor="${step.color}" style="width:12px;height:12px;background-color:${step.color};border-radius:3px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
        </td>
        <td class="t-dark" style="padding:0 0 16px 14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#1E1E1E;"><strong>${escapeHtml(step.title)}</strong> ${escapeHtml(step.desc)}</td>
      </tr>`
    )
    .join('');

  const caseStudyBlock = intent.caseStudyNote
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px 0;">
        <tr>
          <td style="background-color:#FAFAFA;border:1.5px solid #E5E5E0;border-radius:12px;padding:18px 22px;">
            <p style="margin:0 0 4px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;line-height:16px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;color:#5F5F5F;">Related Proven System</p>
            <p class="t-dark" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#1E1E1E;">
              <strong>${escapeHtml(intent.caseStudyNote.name)}</strong>: ${escapeHtml(intent.caseStudyNote.desc)}
              <a href="${intent.caseStudyNote.url}" style="color:#FEB47B;text-decoration:none;font-weight:700;display:inline-block;margin-left:6px;">View Case Study &rarr;</a>
            </p>
          </td>
        </tr>
      </table>`
    : '';

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
        <p style="margin:0 0 18px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:${intent.badgeColor};">${escapeHtml(intent.badgeLabel)}</p>
        <h1 class="hero-h" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:38px;line-height:44px;font-weight:700;letter-spacing:-1px;color:#FFFFFF;">${escapeHtml(intent.heroHeadline)}</h1>
        <p style="margin:20px 0 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:17px;line-height:27px;color:#E7E7E7;">${escapeHtml(intent.heroDescription)}</p>
      </td>
    </tr>
 
    <!-- ============ BODY CARD ============ -->
    <tr>
      <td class="px card" bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:44px 40px 8px 40px;">
 
        <h2 class="t-dark" style="margin:0 0 16px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:22px;line-height:28px;font-weight:700;letter-spacing:-0.3px;color:#1E1E1E;">Hi ${safeFirstName},</h2>
 
        <p class="t-dark" style="margin:0 0 24px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#1E1E1E;">${intent.bodyIntro}</p>
 
        <!-- DYNAMIC STEPS BLOCK -->
        <h3 class="t-dark" style="margin:0 0 18px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;color:#1E1E1E;">${escapeHtml(intent.stepsTitle)}</h3>
 
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px 0;">
          ${stepsRows}
        </table>
 
        <!-- SUMMARY CALLOUT -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
          <tr>
            <td class="callout" bgcolor="#F3F3F3" style="background-color:#F3F3F3;border-left:4px solid ${intent.badgeColor};border-radius:0 10px 10px 0;padding:20px 22px;">
              <p class="t-muted" style="margin:0 0 6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;color:#5F5F5F;">${intent.category === 'products-waitlist' ? 'Your Details' : 'Your Enquiry Summary'}</p>
              <p class="t-dark" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#1E1E1E;">${safeDetails}</p>
            </td>
          </tr>
        </table>

        ${caseStudyBlock}
 
        <p class="t-dark" style="margin:0 0 32px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#1E1E1E;">Need to add anything in the meantime? Simply reply to this email or write to <a href="mailto:hello@feyron.site" style="color:#FEB47B;text-decoration:none;font-weight:600;">hello@feyron.site</a>.</p>
 
        <!-- CTA BUTTON -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 38px 0;">
          <tr>
            <td class="btn-td" bgcolor="#FEB47B" style="background-color:#FEB47B;border-radius:10px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${intent.ctaUrl}" style="height:50px;v-text-anchor:middle;width:260px;" arcsize="20%" stroke="f" fillcolor="#FEB47B"><w:anchorlock/><center style="color:#1E1E1E;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${escapeHtml(intent.ctaText)}</center></v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-- -->
              <a class="btn-a" href="${intent.ctaUrl}" style="display:inline-block;padding:15px 30px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:20px;font-weight:700;color:#1E1E1E;text-decoration:none;border-radius:10px;">${escapeHtml(intent.ctaText)}</a>
              <!--<![endif]-->
            </td>
          </tr>
        </table>
 
        <!-- SIGN-OFF -->
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
            <td style="padding-right:20px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;"><a href="https://feyron.site/work" style="color:#E7E7E7;text-decoration:underline;">Case Studies</a></td>
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
 * Dynamically tailored with session agenda matched to the guest's topic notes.
 */
function buildBookingConfirmationHtml(opts: {
  fullName: string;
  email: string;
  notes?: string;
  dateStr: string;
  slotStr: string;
  endSlotStr: string;
  formattedDate: string;
  meetingUrl: string;
  gcalUrl: string;
  outlookUrl?: string;
  clientTimeLabel?: string;
  rescheduleUrl: string;
  isReminder?: boolean;
  isInternal?: boolean;
}): string {
  const firstName = opts.fullName.split(/\s+/)[0] || opts.fullName;
  const safeFirstName = escapeHtml(firstName);
  const safeFullName = escapeHtml(opts.fullName);
  const safeEmail = escapeHtml(opts.email);
  const safeNotes = opts.notes ? escapeHtml(opts.notes).replace(/\r?\n/g, '<br/>') : '';
  const safeDate = escapeHtml(opts.formattedDate);
  const safeStart = escapeHtml(opts.slotStr);
  const safeEnd = escapeHtml(opts.endSlotStr);
  const safeMeetingUrl = escapeHtml(opts.meetingUrl);
  const safeGcalUrl = escapeHtml(opts.gcalUrl);
  const safeOutlookUrl = opts.outlookUrl ? escapeHtml(opts.outlookUrl) : '';
  const safeClientTime = opts.clientTimeLabel ? escapeHtml(opts.clientTimeLabel) : '';
  const safeRescheduleUrl = escapeHtml(opts.rescheduleUrl);
  const heroBadge = opts.isInternal
    ? 'New Meeting Booked'
    : opts.isReminder
      ? 'Upcoming Call Reminder'
      : 'Session Confirmed';
  const heroHeadline = opts.isInternal
    ? `New call booked with ${opts.fullName}.`
    : opts.isReminder
      ? 'Your call with Feyron starts soon.'
      : 'Your call with Feyron is confirmed.';
  const emailTitle = opts.isInternal
    ? `New call booked with ${safeFullName} | Feyron`
    : opts.isReminder
      ? 'Reminder: Your call with Feyron | Feyron'
      : 'Your call with Feyron is confirmed | Feyron';
  const heroIntro = opts.isInternal
    ? `${safeFullName} (<a href="mailto:${safeEmail}" style="color:#FEB47B;text-decoration:underline;">${safeEmail}</a>) scheduled a 20-minute call for ${safeDate} at ${safeStart} WAT. The direct video meeting link and session details are below.`
    : opts.isReminder
      ? `Hi ${safeFirstName}, this is a quick reminder for your upcoming 20-minute strategy call with Feyron. Your calendar invitation is attached and video room link is below.`
      : `Hi ${safeFirstName}, thank you for scheduling a 20-minute strategy session with Feyron. Your session details and video room link are below. A calendar invite (.ics) has been attached.`;

  const agenda = resolveBookingTopicAgenda(opts.notes || '');
  const agendaRows = agenda
    .map(
      (item) => `<tr>
        <td valign="top" width="14" style="width:14px;padding-top:6px;"><table role="presentation" width="12" cellpadding="0" cellspacing="0" border="0"><tr><td width="12" height="12" bgcolor="${item.color}" style="width:12px;height:12px;background-color:${item.color};border-radius:3px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td>
        <td class="t-dark" style="padding:0 0 16px 14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:25px;color:#1E1E1E;"><strong>${escapeHtml(item.title)}</strong> ${escapeHtml(item.desc)}</td>
      </tr>`
    )
    .join('');

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
<title>${emailTitle}</title>
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
  ${safeDate} at ${safeStart} with Feyron. Direct video link and session agenda.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
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
      <p style="margin:0 0 18px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:#4ADE80;">${escapeHtml(heroBadge)}</p>
      <h1 class="hero-h" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:36px;line-height:42px;font-weight:700;letter-spacing:-1px;color:#FFFFFF;">${escapeHtml(heroHeadline)}</h1>
      <p style="margin:20px 0 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:17px;line-height:27px;color:#E7E7E7;">${heroIntro}</p>
    </td>
  </tr>
 
  <!-- BODY -->
  <tr>
    <td class="px card" bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:40px 40px 8px 40px;">
 
      <h3 class="t-dark" style="margin:0 0 16px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;color:#1E1E1E;">Session details</h3>
 
      <!-- DETAILS CARD -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
        <tr>
          <td class="callout" bgcolor="#F3F3F3" style="background-color:#F3F3F3;border-left:4px solid #FEB47B;border-radius:0 10px 10px 0;padding:22px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${
                opts.isInternal
                  ? `<tr>
                <td class="lbl t-muted" width="110" valign="top" style="width:110px;padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">Guest</td>
                <td class="val t-dark" valign="top" style="padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">${safeFullName} (${safeEmail})</td>
              </tr>`
                  : ''
              }
              <tr>
                <td class="lbl t-muted" width="110" valign="top" style="width:110px;padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">Date</td>
                <td class="val t-dark" valign="top" style="padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">${safeDate}</td>
              </tr>
              <tr>
                <td class="lbl t-muted" width="110" valign="top" style="width:110px;padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">Time</td>
                <td class="val t-dark" valign="top" style="padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">${safeStart} to ${safeEnd} (West Africa Time)${safeClientTime ? `<br><span style="font-size:13px;font-weight:500;color:#5F5F5F;">Local time: ${safeClientTime}</span>` : ''}</td>
              </tr>
              <tr>
                <td class="lbl t-muted" width="110" valign="top" style="width:110px;padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">Format</td>
                <td class="val t-dark" valign="top" style="padding:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">20-minute video call (<a href="${safeMeetingUrl}" style="color:#1E1E1E;text-decoration:underline;">Meeting room link</a>)</td>
              </tr>
              <tr>
                <td class="lbl t-muted" width="110" valign="top" style="width:110px;padding:${safeNotes ? '0 0 12px 0' : '0'};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">With</td>
                <td class="val t-dark" valign="top" style="padding:${safeNotes ? '0 0 12px 0' : '0'};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">Fredy, Feyron Team</td>
              </tr>
              ${
                safeNotes
                  ? `<tr>
                <td class="lbl t-muted" width="110" valign="top" style="width:110px;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">Topic / Notes</td>
                <td class="val t-dark" valign="top" style="padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;font-weight:500;color:#1E1E1E;">${safeNotes}</td>
              </tr>`
                  : ''
              }
            </table>
          </td>
        </tr>
      </table>
 
      <!-- BUTTON -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px 0;">
        <tr>
          <td class="btn-td" bgcolor="#FEB47B" style="background-color:#FEB47B;border-radius:10px;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${safeMeetingUrl}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="20%" stroke="f" fillcolor="#FEB47B"><w:anchorlock/><center style="color:#1E1E1E;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Join the call</center></v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <a class="btn-a" href="${safeMeetingUrl}" style="display:inline-block;padding:15px 30px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:20px;font-weight:700;color:#1E1E1E;text-decoration:none;border-radius:10px;">Join the call</a>
            <!--<![endif]-->
          </td>
        </tr>
      </table>
      <p class="t-muted" style="margin:0 0 36px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#5F5F5F;">
        <a href="${safeGcalUrl}" style="color:#1E1E1E;text-decoration:underline;" class="t-dark">Add to Google Calendar</a>${safeOutlookUrl ? ` &nbsp;|&nbsp; <a href="${safeOutlookUrl}" style="color:#1E1E1E;text-decoration:underline;" class="t-dark">Add to Outlook</a>` : ''} &nbsp;|&nbsp;
        <a href="${safeRescheduleUrl}" style="color:#1E1E1E;text-decoration:underline;" class="t-dark">Reschedule</a>
      </p>
 
      <!-- AGENDA (DYNAMIC TO TOPIC) -->
      <h3 class="t-dark" style="margin:0 0 18px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;color:#1E1E1E;">What we will cover</h3>
 
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
        ${agendaRows}
      </table>
 
      <!-- WHAT HAPPENS AFTER -->
      <h3 class="t-dark" style="margin:0 0 12px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;color:#1E1E1E;">After the call</h3>
      <p class="t-dark" style="margin:0 0 20px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#1E1E1E;">Following our session, we will send you a clear written summary outlining what we recommend building, how it connects to your operations, the delivery timeline and transparent pricing.</p>
      <p class="t-dark" style="margin:0 0 30px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#1E1E1E;">Need to share anything ahead of time or adjust your slot? Reply directly to this email or use the reschedule link above.</p>
 
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
            You are receiving this email because you scheduled a call with Feyron at feyron.site.
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

  const internalPromise = sendEmailViaResend({
    to: [getToEmail()],
    subject: `[Feyron] New ${interestLabel} enquiry from ${rawName}`,
    html: internalHtml,
    text: internalText,
    replyTo: rawEmail,
    isInternal: true,
  });

  const intent = resolveIntentConfig(rawInterestKey, source, rawMessage);
  const visitorHtml = buildContactAutoResponderHtml({
    fullName: rawName,
    interest: interestLabel,
    company: rawCompany,
    details: rawMessage,
    intent,
  });

  const visitorPromise = sendEmailViaResend({
    to: [rawEmail],
    subject: intent.subjectLine,
    html: visitorHtml,
    text: `Hi ${rawName},\n\n${intent.bodyIntro}\n\nYour summary:\n${rawMessage}\n\n${intent.stepsTitle}:\n${intent.plainTextNextSteps}\n\nNeed to add anything in the meantime? Simply reply to this email or write to hello@feyron.site.\n\n— Fredy\nFeyron Team\nhttps://feyron.site | hello@feyron.site`,
    replyTo: getToEmail(),
    isInternal: false,
  });

  // Persist enquiry record for the Team Dashboard
  const enquiryId = `enq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  recordEnquiry({
    id: enquiryId,
    name: rawName,
    email: rawEmail,
    company: rawCompany || 'Not specified',
    interest: interestLabel,
    details: rawMessage,
    source,
    status: 'New',
    internalNotes: '',
    createdAt: new Date().toISOString(),
  });

  // Also dispatch real-time Telegram Bot notification (zero emojis, clean typography + inline action buttons)
  await sendTelegramNotification(
    [
      `<b>NEW FEYRON ENQUIRY — ${safeInterest.toUpperCase()}</b>`,
      `<b>Name:</b> ${safeName}`,
      `<b>Email:</b> ${safeEmail}`,
      `<b>Company:</b> ${safeCompany}`,
      `<b>Source:</b> ${safeSource}`,
      ``,
      `<b>Details:</b>`,
      escapeHtml(rawMessage),
    ].join('\n'),
    [
      [
        { text: 'Open Team Dashboard', url: 'https://feyron.site/dashboard' },
        { text: 'Visit feyron.site', url: 'https://feyron.site' },
      ],
    ]
  );

  const [internalOutcome, visitorOutcome] = await Promise.allSettled([
    internalPromise,
    visitorPromise,
  ]);

  if (internalOutcome.status === 'rejected' || (internalOutcome.status === 'fulfilled' && !internalOutcome.value.success)) {
    const err = internalOutcome.status === 'rejected' ? internalOutcome.reason : internalOutcome.value.error;
    console.warn('Contact internal email delivery notice:', err);
  }

  if (visitorOutcome.status === 'rejected' || (visitorOutcome.status === 'fulfilled' && !visitorOutcome.value.success)) {
    const err = visitorOutcome.status === 'rejected' ? visitorOutcome.reason : visitorOutcome.value.error;
    console.warn('Contact visitor email delivery notice:', err);
  }

  const internalResult = internalOutcome.status === 'fulfilled' ? internalOutcome.value : { success: false, error: 'Failed' };

  return {
    status: 200,
    body: {
      ok: true,
      message: 'Enquiry sent successfully.',
      id: internalResult.id || enquiryId,
    },
  };
}

// ============================================================================
// Persistent Lead & Booking Store (data/feyron-store.json + in-memory cache)
// ============================================================================

export type LeadStatus = 'New' | 'Contacted' | 'Audit Scheduled' | 'Proposal Sent' | 'Archived';

export interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  company: string;
  interest: string;
  details: string;
  source: string;
  status: LeadStatus;
  internalNotes: string;
  createdAt: string;
}

export interface BookingRecord {
  id: string;
  name: string;
  email: string;
  notes: string;
  date: string;
  time: string;
  endTime: string;
  formattedDate: string;
  clientTimezone: string;
  clientTimeLabel: string;
  meetingUrl: string;
  gcalUrl: string;
  outlookUrl: string;
  status: LeadStatus;
  reminderSent: boolean;
  internalNotes: string;
  createdAt: string;
}

interface FeyronDataStore {
  enquiries: EnquiryRecord[];
  bookings: BookingRecord[];
  blockedDates: string[];
  blockedSlots: Record<string, string[]>;
}

export const ALL_WAT_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
];

const STORE_FILE = process.env.VERCEL
  ? '/tmp/feyron-store.json'
  : path.join(process.cwd(), 'data', 'feyron-store.json');

const memoryStore: FeyronDataStore = {
  enquiries: [],
  bookings: [],
  blockedDates: [],
  blockedSlots: {},
};

// In-memory store for booked 20-min call slots per date (YYYY-MM-DD -> Set of "HH:MM")
const bookedSlotsByDate = new Map<string, Set<string>>();

function loadPersistentStore(): FeyronDataStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        memoryStore.enquiries = Array.isArray(parsed.enquiries) ? parsed.enquiries : [];
        memoryStore.bookings = Array.isArray(parsed.bookings) ? parsed.bookings : [];
        memoryStore.blockedDates = Array.isArray(parsed.blockedDates) ? parsed.blockedDates : [];
        memoryStore.blockedSlots =
          parsed.blockedSlots && typeof parsed.blockedSlots === 'object'
            ? parsed.blockedSlots
            : {};
        for (const b of memoryStore.bookings) {
          if (b.date && b.time && b.status !== 'Archived') {
            const set = bookedSlotsByDate.get(b.date) || new Set<string>();
            set.add(b.time);
            bookedSlotsByDate.set(b.date, set);
          }
        }
      }
    }
  } catch {
    // Fallback to in-memory store if filesystem is read-only
  }
  return memoryStore;
}

function savePersistentStore(): void {
  try {
    const dir = path.dirname(STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch {
    // Ignore write errors in read-only serverless environments
  }
}

loadPersistentStore();

function recordEnquiry(item: EnquiryRecord): void {
  memoryStore.enquiries.unshift(item);
  if (memoryStore.enquiries.length > 500) {
    memoryStore.enquiries.length = 500;
  }
  savePersistentStore();
}

function recordBooking(item: BookingRecord): void {
  memoryStore.bookings.unshift(item);
  if (memoryStore.bookings.length > 500) {
    memoryStore.bookings.length = 500;
  }
  savePersistentStore();
}

export function getBookedSlotsForDate(dateStr: string): { taken: string[]; blockedDay?: boolean } {
  const clean = String(dateStr || '').trim();
  if (!clean) return { taken: [] };
  if (memoryStore.blockedDates.includes(clean)) {
    return { taken: [...ALL_WAT_SLOTS], blockedDay: true };
  }
  const combined = new Set<string>();
  const booked = bookedSlotsByDate.get(clean);
  if (booked) {
    booked.forEach((s) => combined.add(s));
  }
  const customBlocked = memoryStore.blockedSlots[clean];
  if (Array.isArray(customBlocked)) {
    customBlocked.forEach((s) => combined.add(s));
  }
  return { taken: Array.from(combined) };
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

/**
 * Converts a Lagos (Africa/Lagos, UTC+1) date + HH:MM into a UTC Date instance.
 */
function lagosSlotToUtcDate(datePart: string, slotPart: string): Date {
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = slotPart.split(':').map(Number);
  // Lagos is UTC+1 year-round (no DST)
  return new Date(Date.UTC(y, m - 1, d, hh - 1, mm, 0));
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

function buildOutlookCalendarUrl(
  datePart: string,
  slotPart: string,
  endSlotPart: string,
  guestName: string,
  guestEmail: string,
  notes: string,
  meetingUrl: string
): string {
  const startUtc = lagosSlotToUtcDate(datePart, slotPart).toISOString().replace(/\.\d+Z$/, 'Z');
  const endUtc = lagosSlotToUtcDate(datePart, endSlotPart).toISOString().replace(/\.\d+Z$/, 'Z');

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `Call — ${guestName} × Feyron`,
    startdt: startUtc,
    enddt: endUtc,
    location: meetingUrl,
    body: [
      `20-minute Feyron Workflow Audit & Discovery Call`,
      `Join Video Session: ${meetingUrl}`,
      `Guest: ${guestName} (${guestEmail})`,
      notes ? `Notes: ${notes}` : '',
      `https://feyron.site | hello@feyron.site`,
    ]
      .filter(Boolean)
      .join('\n'),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
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

export async function sendBookingReminderEmail(booking: BookingRecord): Promise<{
  ok: boolean;
  error?: string;
}> {
  const rescheduleUrl = 'https://feyron.site/contact';
  const reminderHtml = buildBookingConfirmationHtml({
    fullName: booking.name,
    email: booking.email,
    notes: booking.notes,
    dateStr: booking.date,
    slotStr: booking.time,
    endSlotStr: booking.endTime,
    formattedDate: booking.formattedDate,
    meetingUrl: booking.meetingUrl,
    gcalUrl: booking.gcalUrl,
    outlookUrl: booking.outlookUrl,
    clientTimeLabel: booking.clientTimeLabel,
    rescheduleUrl,
    isReminder: true,
  });

  const res = await sendEmailViaResend({
    to: [booking.email],
    subject: `Reminder: Your call with Feyron (${booking.formattedDate} at ${booking.time} WAT)`,
    html: reminderHtml,
    text: [
      `Hi ${booking.name},`,
      ``,
      `This is a reminder for your upcoming 20-minute call with Feyron.`,
      `Date: ${booking.formattedDate}`,
      `Time: ${booking.time} to ${booking.endTime} (West Africa Time)${booking.clientTimeLabel ? ` / ${booking.clientTimeLabel}` : ''}`,
      `Join Video Meeting: ${booking.meetingUrl}`,
      ``,
      `— Fredy`,
      `Feyron Team`,
      `https://feyron.site | hello@feyron.site`,
    ].join('\n'),
    replyTo: getToEmail(),
  });

  await sendTelegramNotification(
    [
      `<b>REMINDER DISPATCHED — FEYRON CALL</b>`,
      `<b>Guest:</b> ${escapeHtml(booking.name)} (${escapeHtml(booking.email)})`,
      `<b>When:</b> ${escapeHtml(booking.formattedDate)} at ${escapeHtml(booking.time)} WAT`,
      `<b>Meeting Link:</b> <a href="${escapeHtml(booking.meetingUrl)}">${escapeHtml(booking.meetingUrl)}</a>`,
    ].join('\n'),
    [
      [
        { text: 'Open Meeting Room', url: booking.meetingUrl },
        { text: 'Open Team Dashboard', url: 'https://feyron.site/dashboard' },
      ],
    ]
  );

  if (res.success) {
    booking.reminderSent = true;
    savePersistentStore();
    return { ok: true };
  }
  return { ok: false, error: res.error || 'Could not send reminder email.' };
}

function scheduleTwoHourReminderIfUpcoming(booking: BookingRecord): void {
  if (process.env.VERCEL) return;
  const startUtcMs = lagosSlotToUtcDate(booking.date, booking.time).getTime();
  const twoHoursBeforeMs = startUtcMs - 2 * 60 * 60 * 1000;
  const delayMs = twoHoursBeforeMs - Date.now();
  // Schedule in-memory timer if the reminder window is in the future and within 7 days
  if (delayMs > 60 * 1000 && delayMs < 7 * 24 * 60 * 60 * 1000) {
    const timer = setTimeout(() => {
      if (!booking.reminderSent && booking.status !== 'Archived') {
        sendBookingReminderEmail(booking).catch(() => {});
      }
    }, delayMs);
    if (typeof (timer as any)?.unref === 'function') {
      (timer as any).unref();
    }
  }
}

export interface BookingSubmissionBody {
  website?: string;
  name?: string;
  email?: string;
  notes?: string | null;
  starts_at?: string;
  date?: string;
  time?: string;
  client_timezone?: string;
  client_time_label?: string;
  lang?: string;
  source?: string;
  skipEmails?: boolean;
  bypassBlockedCheck?: boolean;
}

export async function handleBookingSubmission(body: BookingSubmissionBody): Promise<{
  status: number;
  body: {
    ok: boolean;
    error?: string;
    id?: string;
    booking?: BookingRecord;
    gcalUrl?: string;
    outlookUrl?: string;
    meetingUrl?: string;
  };
}> {
  if (body.website && String(body.website).trim().length > 0) {
    return { status: 200, body: { ok: true } };
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const notes = String(body.notes || '').trim();
  const clientTimezone = String(body.client_timezone || 'Africa/Lagos').trim();
  const clientTimeLabel = String(body.client_time_label || '').trim();
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

  if (!body.bypassBlockedCheck) {
    if (memoryStore.blockedDates.includes(datePart)) {
      return {
        status: 409,
        body: { ok: false, error: 'Selected date is unavailable.' },
      };
    }
    const dayBlockedSlots = memoryStore.blockedSlots[datePart];
    if (Array.isArray(dayBlockedSlots) && dayBlockedSlots.includes(slotPart)) {
      return {
        status: 409,
        body: { ok: false, error: 'Selected time slot is unavailable.' },
      };
    }
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
  const outlookUrl = buildOutlookCalendarUrl(
    datePart,
    slotPart,
    endSlotPart,
    name,
    email,
    notes,
    meetingUrl
  );
  const rescheduleUrl = 'https://feyron.site/contact';

  const bookingRecord: BookingRecord = {
    id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    email,
    notes,
    date: datePart,
    time: slotPart,
    endTime: endSlotPart,
    formattedDate,
    clientTimezone,
    clientTimeLabel,
    meetingUrl,
    gcalUrl,
    outlookUrl,
    status: 'Audit Scheduled',
    reminderSent: false,
    internalNotes: body.source === 'dashboard' ? 'Created manually from Team Dashboard.' : '',
    createdAt: new Date().toISOString(),
  };

  if (body.skipEmails) {
    recordBooking(bookingRecord);
    return {
      status: 200,
      body: {
        ok: true,
        id: bookingRecord.id,
        booking: bookingRecord,
        gcalUrl,
        outlookUrl,
        meetingUrl,
      },
    };
  }

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

  // Build the official Feyron Booking Email HTML for the guest
  const guestBookingHtml = buildBookingConfirmationHtml({
    fullName: name,
    email,
    notes,
    dateStr: datePart,
    slotStr: slotPart,
    endSlotStr: endSlotPart,
    formattedDate,
    meetingUrl,
    gcalUrl,
    outlookUrl,
    clientTimeLabel,
    rescheduleUrl,
  });

  // Build the internal notification HTML for the Feyron team inbox
  const internalBookingHtml = buildBookingConfirmationHtml({
    fullName: name,
    email,
    notes,
    dateStr: datePart,
    slotStr: slotPart,
    endSlotStr: endSlotPart,
    formattedDate,
    meetingUrl,
    gcalUrl,
    outlookUrl,
    clientTimeLabel,
    rescheduleUrl,
    isInternal: true,
  });

  const attachments: ResendAttachment[] = [
    {
      filename: 'feyron-call.ics',
      content: icsBase64,
      content_type: 'text/calendar; charset=utf-8; method=REQUEST',
    },
  ];

  // Send confirmation to internal inbox
  const internalPromise = sendEmailViaResend({
    to: [getToEmail()],
    subject: `[Feyron] New call booked with ${name} — ${formattedDate} (${slotPart} WAT)`,
    html: internalBookingHtml,
    text: [
      `New 20-minute call booked on feyron.site`,
      `Guest: ${name} (${email})`,
      `Date: ${formattedDate}`,
      `Time: ${slotPart} to ${endSlotPart} (West Africa Time)${clientTimeLabel ? ` / Guest local: ${clientTimeLabel}` : ''}`,
      `Join Video Meeting: ${meetingUrl}`,
      `Notes: ${notes || 'None'}`,
      `Add to Google Calendar: ${gcalUrl}`,
      `Add to Outlook: ${outlookUrl}`,
    ].join('\n'),
    replyTo: email,
    attachments,
    isInternal: true,
  });

  const guestPromise = sendEmailViaResend({
    to: [email],
    subject: `Your call with Feyron is confirmed — ${formattedDate} (${slotPart} WAT)`,
    html: guestBookingHtml,
    text: [
      `Hi ${name},`,
      ``,
      `Your 20-minute call with Feyron is confirmed.`,
      `Date: ${formattedDate}`,
      `Time: ${slotPart} to ${endSlotPart} (West Africa Time)${clientTimeLabel ? ` / Local time: ${clientTimeLabel}` : ''}`,
      notes ? `Topic / Notes: ${notes}` : '',
      `Join Video Meeting: ${meetingUrl}`,
      `Add to Google Calendar: ${gcalUrl}`,
      `Add to Outlook: ${outlookUrl}`,
      `Reschedule: ${rescheduleUrl}`,
      ``,
      `— Fredy`,
      `Feyron Team`,
      `https://feyron.site | hello@feyron.site`,
    ]
      .filter(Boolean)
      .join('\n'),
    replyTo: getToEmail(),
    attachments,
    isInternal: false,
  });

  recordBooking(bookingRecord);
  scheduleTwoHourReminderIfUpcoming(bookingRecord);

  // Dispatch real-time Telegram Bot alert (zero emojis, clean typography + inline action buttons)
  await sendTelegramNotification(
    [
      `<b>NEW 20-MIN CALL BOOKED — FEYRON</b>`,
      `<b>Guest:</b> ${escapeHtml(name)}`,
      `<b>Email:</b> ${escapeHtml(email)}`,
      `<b>When:</b> ${escapeHtml(formattedDate)} at ${escapeHtml(slotPart)} (WAT)${clientTimeLabel ? ` · ${escapeHtml(clientTimeLabel)}` : ''}`,
      `<b>Meeting Link:</b> <a href="${safeMeetingUrl}">${safeMeetingUrl}</a>`,
      `<b>Notes:</b> ${escapeHtml(notes || 'None')}`,
    ].join('\n'),
    [
      [
        { text: 'Open Meeting Room', url: meetingUrl },
        { text: 'Add to Google Calendar', url: gcalUrl },
      ],
      [{ text: 'Open Team Dashboard', url: 'https://feyron.site/dashboard' }],
    ]
  );

  const [internalBookingOutcome, guestBookingOutcome] = await Promise.allSettled([
    internalPromise,
    guestPromise,
  ]);

  if (internalBookingOutcome.status === 'rejected' || (internalBookingOutcome.status === 'fulfilled' && !internalBookingOutcome.value.success)) {
    const err = internalBookingOutcome.status === 'rejected' ? internalBookingOutcome.reason : internalBookingOutcome.value.error;
    console.warn('Booking internal email delivery notice:', err);
  }

  if (guestBookingOutcome.status === 'rejected' || (guestBookingOutcome.status === 'fulfilled' && !guestBookingOutcome.value.success)) {
    const err = guestBookingOutcome.status === 'rejected' ? guestBookingOutcome.reason : guestBookingOutcome.value.error;
    console.warn('Booking guest email delivery notice:', err);
  }

  const res = internalBookingOutcome.status === 'fulfilled' ? internalBookingOutcome.value : { success: false, error: 'Failed' };

  return {
    status: 200,
    body: {
      ok: true,
      id: bookingRecord.id,
      booking: bookingRecord,
      gcalUrl,
      outlookUrl,
      meetingUrl,
    },
  };
}

/**
 * Builds an official Feyron branded HTML email for custom replies, follow-ups, scopes/quotes, and reschedule notes sent from the Team Dashboard.
 */
function buildCustomDashboardEmailHtml(opts: {
  recipientName: string;
  eyebrow: string;
  headline: string;
  subheadline?: string;
  messageBody: string;
  calloutTitle?: string;
  calloutBody?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const firstName = (opts.recipientName || 'there').split(/\s+/)[0] || 'there';
  const safeFirstName = escapeHtml(firstName);
  const safeEyebrow = escapeHtml(opts.eyebrow || 'Feyron Follow-Up');
  const safeHeadline = escapeHtml(opts.headline || 'Technology that moves work forward.');
  const safeSubheadline = escapeHtml(
    opts.subheadline || 'Direct update from the Feyron engineering and automation team.'
  );

  const paragraphs = String(opts.messageBody || '')
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const renderedParagraphs = paragraphs
    .map(
      (p) =>
        `<p class="t-dark" style="margin:0 0 20px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#1E1E1E;">${escapeHtml(
          p
        ).replace(/\r?\n/g, '<br/>')}</p>`
    )
    .join('\n        ');

  const hasCallout = Boolean(opts.calloutBody && opts.calloutBody.trim());
  const safeCalloutTitle = escapeHtml(opts.calloutTitle || 'Summary & Next Steps');
  const safeCalloutBody = escapeHtml(opts.calloutBody || '').replace(/\r?\n/g, '<br/>');

  const ctaLabel = (opts.ctaLabel || 'Book or manage call').trim();
  const ctaUrl = (opts.ctaUrl || 'https://feyron.site/contact').trim();

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
<style>
  html,body{margin:0 !important;padding:0 !important;width:100% !important;}
  *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  table{border-collapse:collapse;}
  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
  a{text-decoration:none;}
  @media only screen and (max-width:620px){
    .container{width:100% !important;}
    .px{padding-left:24px !important;padding-right:24px !important;}
    .hero-h{font-size:30px !important;line-height:36px !important;}
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
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
  ${safeSubheadline}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>
<table role="presentation" class="body-bg" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E7E7E7;">
<tr>
<td align="center" style="padding:28px 12px;">
  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
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
    <tr>
      <td class="px" bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:52px 40px 56px 40px;">
        <p style="margin:0 0 18px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:#FEB47B;">${safeEyebrow}</p>
        <h1 class="hero-h" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:38px;line-height:44px;font-weight:700;letter-spacing:-1px;color:#FFFFFF;">${safeHeadline}</h1>
        <p style="margin:20px 0 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:17px;line-height:27px;color:#E7E7E7;">${safeSubheadline}</p>
      </td>
    </tr>
    <tr>
      <td class="px card" bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:44px 40px 8px 40px;">
        <h2 class="t-dark" style="margin:0 0 16px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:22px;line-height:28px;font-weight:700;letter-spacing:-0.3px;color:#1E1E1E;">Hi ${safeFirstName},</h2>
        ${renderedParagraphs}
        ${
          hasCallout
            ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 28px 0;">
          <tr>
            <td class="callout" bgcolor="#F3F3F3" style="background-color:#F3F3F3;border-left:4px solid #FEB47B;border-radius:0 10px 10px 0;padding:20px 22px;">
              <p class="t-muted" style="margin:0 0 6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;color:#5F5F5F;">${safeCalloutTitle}</p>
              <p class="t-dark" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#1E1E1E;">${safeCalloutBody}</p>
            </td>
          </tr>
        </table>`
            : ''
        }
        <p class="t-dark" style="margin:0 0 30px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#1E1E1E;">You can reply directly to this email or write to <a href="mailto:hello@feyron.site" style="color:#FEB47B;text-decoration:none;font-weight:600;">hello@feyron.site</a>.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 38px 0;">
          <tr>
            <td class="btn-td" bgcolor="#FEB47B" style="background-color:#FEB47B;border-radius:10px;">
              <a class="btn-a" href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:15px 30px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:20px;font-weight:700;color:#1E1E1E;text-decoration:none;border-radius:10px;">${escapeHtml(ctaLabel)}</a>
            </td>
          </tr>
        </table>
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
              You are receiving this email because you contacted Feyron at feyron.site.<br><br>
              &copy; 2026 Feyron. AI Productivity &amp; Technology.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</td>
</tr>
</table>
</body>
</html>`.trim();
}

// ============================================================================
// Team Dashboard API Handlers
// ============================================================================

export function verifyDashboardAuth(passcode?: string | null): boolean {
  const expected = getDashboardPasscode();
  return Boolean(passcode && passcode.trim() === expected);
}

export function getDashboardData(): {
  enquiries: EnquiryRecord[];
  bookings: BookingRecord[];
  blockedDates: string[];
  blockedSlots: Record<string, string[]>;
} {
  return {
    enquiries: memoryStore.enquiries,
    bookings: memoryStore.bookings,
    blockedDates: memoryStore.blockedDates,
    blockedSlots: memoryStore.blockedSlots,
  };
}

export function updateDashboardRecord(body: {
  type: 'enquiry' | 'booking';
  id: string;
  status?: LeadStatus;
  internalNotes?: string;
}): { ok: boolean; error?: string } {
  if (body.type === 'enquiry') {
    const item = memoryStore.enquiries.find((e) => e.id === body.id);
    if (!item) return { ok: false, error: 'Enquiry record not found.' };
    if (body.status) item.status = body.status;
    if (typeof body.internalNotes === 'string') item.internalNotes = body.internalNotes;
    savePersistentStore();
    return { ok: true };
  }
  if (body.type === 'booking') {
    const item = memoryStore.bookings.find((b) => b.id === body.id);
    if (!item) return { ok: false, error: 'Booking record not found.' };
    if (body.status) {
      item.status = body.status;
      if (body.status === 'Archived') {
        const set = bookedSlotsByDate.get(item.date);
        if (set) set.delete(item.time);
      } else {
        const set = bookedSlotsByDate.get(item.date) || new Set<string>();
        set.add(item.time);
        bookedSlotsByDate.set(item.date, set);
      }
    }
    if (typeof body.internalNotes === 'string') item.internalNotes = body.internalNotes;
    savePersistentStore();
    return { ok: true };
  }
  return { ok: false, error: 'Invalid record type.' };
}

export async function triggerBookingReminder(bookingId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const item = memoryStore.bookings.find((b) => b.id === bookingId);
  if (!item) return { ok: false, error: 'Booking record not found.' };
  return sendBookingReminderEmail(item);
}

export async function handleDashboardAction(body: any): Promise<{
  ok: boolean;
  error?: string;
  message?: string;
  booking?: BookingRecord;
  enquiry?: EnquiryRecord;
  blockedDates?: string[];
  blockedSlots?: Record<string, string[]>;
}> {
  const action = String(body?.action || 'remind').trim();

  // 1. Send session reminder
  if (action === 'remind') {
    return triggerBookingReminder(String(body?.id || ''));
  }

  // 2. Send custom branded Feyron email directly from the dashboard
  if (action === 'send_email') {
    const recipientEmail = String(body?.to || '').trim();
    const recipientName = String(body?.recipientName || 'there').trim();
    const subject = String(body?.subject || '').trim();
    const eyebrow = String(body?.eyebrow || 'Feyron Follow-Up').trim();
    const headline = String(body?.headline || 'Technology that moves work forward.').trim();
    const messageBody = String(body?.message || '').trim();
    const calloutTitle = String(body?.calloutTitle || '').trim();
    const calloutBody = String(body?.calloutBody || '').trim();
    const ctaLabel = String(body?.ctaLabel || 'Book or manage call').trim();
    const ctaUrl = String(body?.ctaUrl || 'https://feyron.site/contact').trim();

    if (!isEmailAddress(recipientEmail) || !subject || !messageBody) {
      return {
        ok: false,
        error: 'Recipient email, subject, and message body are required.',
      };
    }

    const html = buildCustomDashboardEmailHtml({
      recipientName,
      eyebrow,
      headline,
      messageBody,
      calloutTitle,
      calloutBody,
      ctaLabel,
      ctaUrl,
    });

    const sendRes = await sendEmailViaResend({
      to: [recipientEmail],
      subject,
      html,
      text: [
        `Hi ${recipientName.split(/\s+/)[0] || recipientName},`,
        ``,
        messageBody,
        calloutBody ? `\n${calloutTitle || 'Summary'}:\n${calloutBody}` : '',
        ``,
        `— Fredy`,
        `Feyron Team`,
        `https://feyron.site | hello@feyron.site`,
      ]
        .filter(Boolean)
        .join('\n'),
      replyTo: getToEmail(),
    });

    if (!sendRes.success) {
      return { ok: false, error: sendRes.error || 'Failed to dispatch email via Resend.' };
    }

    // Automatically log sent email in record's internal notes & update status if New
    const recordId = String(body?.recordId || '').trim();
    const recordType = String(body?.recordType || '').trim();
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const logLine = `[Email sent ${stamp}: "${subject}"]`;

    if (recordType === 'booking' && recordId) {
      const bk = memoryStore.bookings.find((b) => b.id === recordId);
      if (bk) {
        bk.internalNotes = bk.internalNotes ? `${bk.internalNotes}\n${logLine}` : logLine;
        if (body?.newStatus) bk.status = body.newStatus;
        savePersistentStore();
      }
    } else if (recordType === 'enquiry' && recordId) {
      const eq = memoryStore.enquiries.find((e) => e.id === recordId);
      if (eq) {
        eq.internalNotes = eq.internalNotes ? `${eq.internalNotes}\n${logLine}` : logLine;
        if (body?.newStatus) {
          eq.status = body.newStatus;
        } else if (eq.status === 'New') {
          eq.status = 'Contacted';
        }
        savePersistentStore();
      }
    }

    return { ok: true, message: `Branded email sent to ${recipientEmail}.` };
  }

  // 3. Reschedule a booking (frees old slot, claims new slot, updates links, optionally notifies guest)
  if (action === 'reschedule') {
    const id = String(body?.id || '').trim();
    const newDate = String(body?.date || '').trim();
    const newTime = String(body?.time || '').trim();
    const notifyGuest = body?.notifyGuest !== false;

    const bk = memoryStore.bookings.find((b) => b.id === id);
    if (!bk) return { ok: false, error: 'Booking record not found.' };
    if (!newDate || !newTime) {
      return { ok: false, error: 'Please select both a new date and time.' };
    }

    if (newDate !== bk.date || newTime !== bk.time) {
      const targetSet = bookedSlotsByDate.get(newDate) || new Set<string>();
      if (targetSet.has(newTime)) {
        return { ok: false, error: `Slot ${newTime} on ${newDate} is already booked.` };
      }
      // Free old slot
      const oldSet = bookedSlotsByDate.get(bk.date);
      if (oldSet) oldSet.delete(bk.time);
      // Claim new slot
      targetSet.add(newTime);
      bookedSlotsByDate.set(newDate, targetSet);
    }

    const endSlotPart = calculateEndSlot(newTime, 20);
    const formattedDate = formatHumanDate(newDate);
    const meetingUrl = generateMeetingLink(newDate, newTime, bk.name);
    const gcalUrl = buildGoogleCalendarTemplateUrl(
      newDate,
      newTime,
      endSlotPart,
      bk.name,
      bk.email,
      bk.notes,
      meetingUrl
    );
    const outlookUrl = buildOutlookCalendarUrl(
      newDate,
      newTime,
      endSlotPart,
      bk.name,
      bk.email,
      bk.notes,
      meetingUrl
    );

    bk.date = newDate;
    bk.time = newTime;
    bk.endTime = endSlotPart;
    bk.formattedDate = formattedDate;
    bk.meetingUrl = meetingUrl;
    bk.gcalUrl = gcalUrl;
    bk.outlookUrl = outlookUrl;
    bk.status = 'Audit Scheduled';
    bk.reminderSent = false;
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    bk.internalNotes = bk.internalNotes
      ? `${bk.internalNotes}\n[Rescheduled ${stamp} to ${formattedDate} at ${newTime} WAT]`
      : `[Rescheduled ${stamp} to ${formattedDate} at ${newTime} WAT]`;
    savePersistentStore();

    if (notifyGuest && isEmailAddress(bk.email)) {
      const icsContent = buildIcsCalendarInvite(
        newDate,
        newTime,
        endSlotPart,
        bk.name,
        bk.email,
        bk.notes,
        meetingUrl
      );
      const icsBase64 = Buffer.from(icsContent, 'utf-8').toString('base64');
      const guestHtml = buildBookingConfirmationHtml({
        fullName: bk.name,
        email: bk.email,
        notes: bk.notes,
        dateStr: newDate,
        slotStr: newTime,
        endSlotStr: endSlotPart,
        formattedDate,
        meetingUrl,
        gcalUrl,
        outlookUrl,
        clientTimeLabel: '',
        rescheduleUrl: 'https://feyron.site/contact',
      });
      await sendEmailViaResend({
        to: [bk.email],
        subject: `Updated time: Your call with Feyron — ${formattedDate} (${newTime} WAT)`,
        html: guestHtml,
        text: `Hi ${bk.name},\n\nYour 20-minute call with Feyron has been rescheduled to ${formattedDate} at ${newTime} WAT.\nJoin Video Meeting: ${meetingUrl}\nAdd to Google Calendar: ${gcalUrl}\n\n— Fredy\nFeyron Team`,
        replyTo: getToEmail(),
        attachments: [
          {
            filename: 'feyron-call-updated.ics',
            content: icsBase64,
            content_type: 'text/calendar; charset=utf-8; method=REQUEST',
          },
        ],
      }).catch(() => {});
    }

    return {
      ok: true,
      message: `Booking moved to ${formattedDate} at ${newTime} WAT.`,
      booking: bk,
    };
  }

  // 4. Cancel a booking (frees slot on public calendar and marks Archived)
  if (action === 'cancel') {
    const id = String(body?.id || '').trim();
    const notifyGuest = Boolean(body?.notifyGuest);
    const bk = memoryStore.bookings.find((b) => b.id === id);
    if (!bk) return { ok: false, error: 'Booking record not found.' };

    const set = bookedSlotsByDate.get(bk.date);
    if (set) set.delete(bk.time);
    bk.status = 'Archived';
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    bk.internalNotes = bk.internalNotes
      ? `${bk.internalNotes}\n[Slot cancelled & freed ${stamp}]`
      : `[Slot cancelled & freed ${stamp}]`;
    savePersistentStore();

    if (notifyGuest && isEmailAddress(bk.email)) {
      const cancelHtml = buildCustomDashboardEmailHtml({
        recipientName: bk.name,
        eyebrow: 'Call Update',
        headline: 'Your call slot has been cancelled.',
        subheadline: 'You can pick a new time whenever works best for your schedule.',
        messageBody: `We have cancelled your scheduled 20-minute call on ${bk.formattedDate} at ${bk.time} WAT as requested.\n\nWhenever you are ready to pick a new time, you can book directly on our calendar using the link below.`,
        ctaLabel: 'Pick a new time',
        ctaUrl: 'https://feyron.site/contact',
      });
      await sendEmailViaResend({
        to: [bk.email],
        subject: `Cancelled: Your call with Feyron (${bk.formattedDate})`,
        html: cancelHtml,
        text: `Hi ${bk.name},\n\nWe have cancelled your scheduled call on ${bk.formattedDate} at ${bk.time} WAT.\nYou can book a new time whenever convenient at https://feyron.site/contact.\n\n— Fredy\nFeyron Team`,
        replyTo: getToEmail(),
      }).catch(() => {});
    }

    return { ok: true, message: 'Call slot cancelled and freed on calendar.', booking: bk };
  }

  // 5. Delete a booking or enquiry record permanently
  if (action === 'delete') {
    const id = String(body?.id || '').trim();
    const type = String(body?.type || '').trim();
    if (type === 'booking') {
      const idx = memoryStore.bookings.findIndex((b) => b.id === id);
      if (idx === -1) return { ok: false, error: 'Booking record not found.' };
      const removed = memoryStore.bookings[idx];
      const set = bookedSlotsByDate.get(removed.date);
      if (set) set.delete(removed.time);
      memoryStore.bookings.splice(idx, 1);
      savePersistentStore();
      return { ok: true, message: 'Booking deleted and calendar slot freed.' };
    }
    if (type === 'enquiry') {
      const idx = memoryStore.enquiries.findIndex((e) => e.id === id);
      if (idx === -1) return { ok: false, error: 'Enquiry record not found.' };
      memoryStore.enquiries.splice(idx, 1);
      savePersistentStore();
      return { ok: true, message: 'Enquiry record deleted.' };
    }
    return { ok: false, error: 'Invalid record type to delete.' };
  }

  // 6. Block or unblock full dates or specific time slots
  if (
    action === 'block_date' ||
    action === 'unblock_date' ||
    action === 'block_slot' ||
    action === 'unblock_slot'
  ) {
    const dateStr = String(body?.date || '').trim();
    const slotStr = String(body?.slot || '').trim();
    if (!dateStr) return { ok: false, error: 'Date (YYYY-MM-DD) is required.' };

    if (action === 'block_date') {
      if (!memoryStore.blockedDates.includes(dateStr)) {
        memoryStore.blockedDates.push(dateStr);
        memoryStore.blockedDates.sort();
      }
    } else if (action === 'unblock_date') {
      memoryStore.blockedDates = memoryStore.blockedDates.filter((d) => d !== dateStr);
    } else if (action === 'block_slot') {
      if (!slotStr) return { ok: false, error: 'Time slot (HH:MM) is required.' };
      const list = Array.isArray(memoryStore.blockedSlots[dateStr])
        ? memoryStore.blockedSlots[dateStr]
        : [];
      if (!list.includes(slotStr)) {
        list.push(slotStr);
        list.sort();
      }
      memoryStore.blockedSlots[dateStr] = list;
    } else if (action === 'unblock_slot') {
      if (Array.isArray(memoryStore.blockedSlots[dateStr])) {
        memoryStore.blockedSlots[dateStr] = memoryStore.blockedSlots[dateStr].filter(
          (s) => s !== slotStr
        );
        if (memoryStore.blockedSlots[dateStr].length === 0) {
          delete memoryStore.blockedSlots[dateStr];
        }
      }
    }

    savePersistentStore();
    return {
      ok: true,
      blockedDates: memoryStore.blockedDates,
      blockedSlots: memoryStore.blockedSlots,
    };
  }

  // 7. Create a manual booking from the Team Dashboard
  if (action === 'create_booking') {
    const sendConfirmation = body?.sendConfirmation !== false;
    const res = await handleBookingSubmission({
      name: body?.name,
      email: body?.email,
      notes: body?.notes,
      date: body?.date,
      time: body?.time,
      source: 'dashboard',
      skipEmails: !sendConfirmation,
      bypassBlockedCheck: true,
    });
    if (!res.body.ok) {
      return { ok: false, error: res.body.error || 'Could not create booking.' };
    }
    return {
      ok: true,
      message: sendConfirmation
        ? 'Booking created and confirmation email sent.'
        : 'Booking logged without sending email.',
      booking: res.body.booking,
    };
  }

  // 8. Create a manual enquiry / lead from the Team Dashboard
  if (action === 'create_enquiry') {
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const company = String(body?.company || '').trim();
    const interestKey = String(body?.interest || 'ai-automation').trim();
    const interest = INTEREST_LABELS[interestKey] || interestKey || 'AI Automation';
    const details = String(body?.details || '').trim();
    const sendAutoResponder = Boolean(body?.sendAutoResponder);

    if (!name || !isEmailAddress(email)) {
      return { ok: false, error: 'Name and a valid email address are required.' };
    }

    const enquiryRecord: EnquiryRecord = {
      id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      email,
      company: company || 'Not specified',
      interest,
      details: details || 'Logged manually by Feyron Team.',
      source: 'Team Dashboard',
      status: (body?.status as LeadStatus) || 'New',
      internalNotes: String(body?.internalNotes || '').trim(),
      createdAt: new Date().toISOString(),
    };
    recordEnquiry(enquiryRecord);

    if (sendAutoResponder) {
      const visitorHtml = buildContactAutoResponderHtml({
        fullName: name,
        interest,
        company,
        details: enquiryRecord.details,
      });
      await sendEmailViaResend({
        to: [email],
        subject: `Thank you for reaching out — Feyron`,
        html: visitorHtml,
        text: `Hi ${name},\n\nThank you for reaching out to Feyron regarding ${interest}. Our team reviews every enquiry directly and will reply within one working day with practical next steps.\n\n— Fredy\nFeyron Team`,
        replyTo: getToEmail(),
      }).catch(() => {});
    }

    return {
      ok: true,
      message: 'Enquiry lead created.',
      enquiry: enquiryRecord,
    };
  }

  return { ok: false, error: `Unknown dashboard action: ${action}` };
}


