import React, { useState, useMemo } from 'react';

export interface ClientMaterialsStudioProps {
  enquiries: Array<{
    id: string;
    name: string;
    email: string;
    company?: string;
    interest?: string;
    details?: string;
  }>;
  bookings: Array<{
    id: string;
    name: string;
    email: string;
    notes?: string;
    date: string;
    time: string;
  }>;
  onSendEmail: (payload: {
    to: string;
    recipientName: string;
    subject: string;
    customHtml: string;
    recordId?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  showToast: (msg: string, duration?: number) => void;
}

export type DocType =
  | 'milestones'
  | 'proposal'
  | 'service_order'
  | 'invoice'
  | 'receipt'
  | 'acceptance'
  | 'change_request'
  | 'care_report'
  | 'brochure'
  | 'letterhead';

interface MilestoneRow {
  sprint: string;
  phase: string;
  deliverables: string;
  dependencies: string;
  timeline: string;
  billing: string;
}

export function ClientMaterialsStudio({
  enquiries,
  bookings,
  onSendEmail,
  showToast,
}: ClientMaterialsStudioProps) {
  const [docType, setDocType] = useState<DocType>('milestones');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  // Core Document Header Fields
  const [clientName, setClientName] = useState('Sarah Jenkins');
  const [clientEmail, setClientEmail] = useState('client@example.com');
  const [clientCompany, setClientCompany] = useState('Apex Global Enterprises');
  const [clientRole, setClientRole] = useState('VP of Technology & Operations');
  const [projectName, setProjectName] = useState('Enterprise AI Workflow Automation & Portal');
  const [docRef, setDocRef] = useState(() => `FEY-MS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [dateIssued, setDateIssued] = useState(() => new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().slice(0, 10);
  });
  const [currency, setCurrency] = useState('$');
  const [totalAmount, setTotalAmount] = useState('24,500');

  // Scope & narrative details
  const [scopeSummary, setScopeSummary] = useState(
    'Feyron delivers end-to-end engineering, continuous integration, and autonomous AI agents designed to eliminate repetitive operational overhead and accelerate business workflows.'
  );

  // Milestones Data
  const [milestones, setMilestones] = useState<MilestoneRow[]>([
    {
      sprint: 'Sprint 01',
      phase: 'Architecture, Audit & Environment Provisioning',
      deliverables: 'Architecture blueprint, data schema, API contract, sandboxed staging environments, CI/CD pipeline.',
      dependencies: 'Cloud credentials (AWS/GCP/Supabase), brand assets, API keys.',
      timeline: 'Week 1 - 2',
      billing: 'Deposit / Kickoff (40%)',
    },
    {
      sprint: 'Sprint 02',
      phase: 'Core Build & Autonomous Agent Engine',
      deliverables: 'Agent reasoning engine, Resend/WhatsApp integration, automated document processing pipeline.',
      dependencies: 'Standard operational procedures (SOPs), sample client documents.',
      timeline: 'Week 3 - 4',
      billing: 'Progress Gate (30%)',
    },
    {
      sprint: 'Sprint 03',
      phase: 'User Interface, Admin Console & Live Telemetry',
      deliverables: 'Client self-service portal, operational dashboard, real-time audit logs, human approval workflows.',
      dependencies: 'Design sign-off, internal testing feedback within 48h SLA.',
      timeline: 'Week 5 - 6',
      billing: 'Pre-Deployment Gate (20%)',
    },
    {
      sprint: 'Sprint 04',
      phase: 'Hardening, Security Audit & User Acceptance Testing (UAT)',
      deliverables: 'End-to-end load testing, vulnerability scanning, staff training documentation & Loom walkthrough.',
      dependencies: 'Client stakeholder team available for 1 hour live verification.',
      timeline: 'Week 7',
      billing: 'Final Acceptance (10%)',
    },
    {
      sprint: 'Sprint 05',
      phase: 'Go-Live, Production Switchover & 30-Day SLA Warranty',
      deliverables: 'Production domain cutover, 24/7 monitoring alerting, bug-fix SLA guarantee.',
      dependencies: 'DNS records configuration, production billing activation.',
      timeline: 'Week 8',
      billing: 'Complete',
    },
  ]);

  // Invoice / Receipt Line Items
  const [lineItems, setLineItems] = useState([
    { desc: 'Autonomous Agent Engine & Workflow Integration', qty: '1', rate: '14,000', amount: '14,000' },
    { desc: 'Custom Client Portal & Real-time Telemetry Dashboard', qty: '1', rate: '7,500', amount: '7,500' },
    { desc: 'Security Hardening, Cloud Setup & 30-Day SLA Warranty', qty: '1', rate: '3,000', amount: '3,000' },
  ]);

  // SLA & Notes
  const [slaTurnaround, setSlaTurnaround] = useState('2 business days for review & feedback approvals');
  const [warrantyPeriod, setWarrantyPeriod] = useState('30 calendar days post-deployment bug fix warranty');
  const [paymentTerms, setPaymentTerms] = useState('40% on kickoff, 30% milestone gate 2, 30% upon final acceptance');
  const [signatoryName, setSignatoryName] = useState('Feyron Engineering & Operations');
  const [signatoryTitle, setSignatoryTitle] = useState('Principal Architect & Delivery Lead');

  // Preview & Dispatch states
  const [previewMode, setPreviewMode] = useState<'split' | 'modal' | 'code'>('split');
  const [isSending, setIsSending] = useState(false);

  // Handle client selection from existing records
  const handleSelectClient = (recordId: string) => {
    setSelectedLeadId(recordId);
    if (!recordId) return;

    const enquiry = enquiries.find((e) => e.id === recordId);
    if (enquiry) {
      setClientName(enquiry.name || 'Valued Client');
      setClientEmail(enquiry.email || '');
      setClientCompany(enquiry.company || 'Client Organization');
      if (enquiry.interest) {
        setProjectName(`${enquiry.interest} Implementation`);
      }
      if (enquiry.details) {
        setScopeSummary(enquiry.details);
      }
      showToast(`Autofilled client details for ${enquiry.name}`);
      return;
    }

    const booking = bookings.find((b) => b.id === recordId);
    if (booking) {
      setClientName(booking.name || 'Valued Client');
      setClientEmail(booking.email || '');
      setProjectName(`Digital Systems Architecture & Implementation`);
      if (booking.notes) {
        setScopeSummary(`Focus areas discussed: ${booking.notes}`);
      }
      showToast(`Autofilled booking details for ${booking.name}`);
    }
  };

  // Quick Preset Switcher
  const applyPreset = (presetKey: 'ai' | 'platform' | 'payments') => {
    if (presetKey === 'ai') {
      setProjectName('Autonomous AI Workflow & Agent Infrastructure');
      setTotalAmount('18,500');
      setScopeSummary(
        'Deployment of autonomous AI agents capable of handling incoming client enquiries, document data extraction, automated email replies, CRM synchronisation, and exception flagging with human-in-the-loop controls.'
      );
      setMilestones([
        {
          sprint: 'Sprint 01',
          phase: 'Workflow Mapping & LLM Tool Schema Design',
          deliverables: 'API integration schemas, prompt guardrails, agent state machine, staging sandbox.',
          dependencies: 'Channel access (Email/Resend, CRM, communication webhooks).',
          timeline: 'Week 1 - 2',
          billing: '40% Kickoff ($7,400)',
        },
        {
          sprint: 'Sprint 02',
          phase: 'Autonomous Agent Engine & Tool Calling Pipeline',
          deliverables: 'Self-correcting agent execution, rate-limiting, error fallbacks, email notification triggers.',
          dependencies: 'Approved email templates, test client datasets.',
          timeline: 'Week 3 - 4',
          billing: '30% Milestone ($5,550)',
        },
        {
          sprint: 'Sprint 03',
          phase: 'Human Approval Dashboard, Telemetry & 30-Day SLA',
          deliverables: 'Web dashboard for overriding agent actions, execution logs, analytics, go-live deployment.',
          dependencies: 'Admin user list, production DNS cutover.',
          timeline: 'Week 5 - 6',
          billing: '30% Acceptance ($5,550)',
        },
      ]);
      setLineItems([
        { desc: 'Autonomous Agent Engine & Integration Infrastructure', qty: '1', rate: '11,000', amount: '11,000' },
        { desc: 'Human Oversight Console & Telemetry Dashboard', qty: '1', rate: '4,500', amount: '4,500' },
        { desc: 'Security Hardening, Testing & 30-Day SLA Support', qty: '1', rate: '3,000', amount: '3,000' },
      ]);
      showToast('Applied AI Workflow & Agent Preset');
    } else if (presetKey === 'platform') {
      setProjectName('Full-Stack Digital Platform & Mobile Web Portal');
      setTotalAmount('32,000');
      setScopeSummary(
        'Design, engineering, and deployment of a modern web and mobile platform featuring authenticated customer portals, real-time sync, performant edge APIs, and automated administration backends.'
      );
      setMilestones([
        {
          sprint: 'Sprint 01',
          phase: 'UI/UX Design System & Architectural Blueprint',
          deliverables: 'High-fidelity Figma components, database entity relationship diagrams, CI/CD setup.',
          dependencies: 'Brand guidelines, target user profiles, logo SVG.',
          timeline: 'Week 1 - 2',
          billing: '35% Kickoff ($11,200)',
        },
        {
          sprint: 'Sprint 02',
          phase: 'Frontend Application & Authentication Portals',
          deliverables: 'Responsive client interface, account dashboards, session management, theme engine.',
          dependencies: 'Copywriting reviews, OAuth keys.',
          timeline: 'Week 3 - 5',
          billing: '35% Progress ($11,200)',
        },
        {
          sprint: 'Sprint 03',
          phase: 'Backend APIs, Performance Auditing & Production Launch',
          deliverables: 'Database optimization, edge caching, automated backups, go-live checklist.',
          dependencies: 'Domain DNS, production environment sign-off.',
          timeline: 'Week 6 - 8',
          billing: '30% Acceptance ($9,600)',
        },
      ]);
      showToast('Applied Platform Engineering Preset');
    } else {
      setProjectName('Fintech & High-Volume Payment Infrastructure');
      setTotalAmount('28,000');
      setScopeSummary(
        'Integration of multi-currency payment rails, automated reconciliation engine, digital receipt generation, webhook verification, and PCI-compliant financial workflows.'
      );
      setMilestones([
        {
          sprint: 'Sprint 01',
          phase: 'Payment Architecture & Security Protocols',
          deliverables: 'Tokenization workflows, webhook handlers, idempotency keys, sandbox transaction tests.',
          dependencies: 'Merchant gateway API credentials, settlement bank details.',
          timeline: 'Week 1 - 2',
          billing: '40% Kickoff ($11,200)',
        },
        {
          sprint: 'Sprint 02',
          phase: 'Automated Invoicing & Settlement Engine',
          deliverables: 'Instant PDF receipt dispatch, split-payment logic, failed transaction retry system.',
          dependencies: 'Accounting chart of accounts, currency conversion rules.',
          timeline: 'Week 3 - 4',
          billing: '35% Progress ($9,800)',
        },
        {
          sprint: 'Sprint 03',
          phase: 'Auditing, Stress Testing & Production Cutover',
          deliverables: 'Volume stress testing, ledger verification, compliance sign-off, live transactions.',
          dependencies: 'Production key rotation, financial stakeholder sign-off.',
          timeline: 'Week 5 - 6',
          billing: '25% Final ($7,000)',
        },
      ]);
      showToast('Applied Payments Infrastructure Preset');
    }
  };

  // Generate Document Reference dynamically on docType change
  const handleDocTypeChange = (newType: DocType) => {
    setDocType(newType);
    const prefixMap: Record<DocType, string> = {
      milestones: 'MS',
      proposal: 'PROP',
      service_order: 'SOF',
      invoice: 'INV',
      receipt: 'REC',
      acceptance: 'ACC',
      change_request: 'CRF',
      care_report: 'CARE',
      brochure: 'BRO',
      letterhead: 'LTR',
    };
    const code = prefixMap[newType] || 'DOC';
    setDocRef(`FEY-${code}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  };

  // Compile the Complete Branded HTML
  const generatedHtml = useMemo(() => {
    const brandSvg = `<svg viewBox="0 0 100 100" fill="#1E1E1E"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.5,0.0H85.5A14.5,14.5 0 0 1 100.0,14.5V85.5A14.5,14.5 0 0 1 85.5,100.0H14.5A14.5,14.5 0 0 1 0.0,85.5V14.5A14.5,14.5 0 0 1 14.5,0.0Z M21.2,16.2H33.1A8.2,8.2 0 0 1 41.3,24.4V59.4A8.2,8.2 0 0 1 33.1,67.6H21.2A8.2,8.2 0 0 1 13.0,59.4V24.4A8.2,8.2 0 0 1 21.2,16.2Z M66.9,16.2H78.8A8.2,8.2 0 0 1 87.0,24.4V59.4A8.2,8.2 0 0 1 78.8,67.6H66.9A8.2,8.2 0 0 1 58.7,59.4V24.4A8.2,8.2 0 0 1 66.9,16.2Z M45.1,76.0H54.9A4.9,4.9 0 0 1 59.8,80.9V80.9A4.9,4.9 0 0 1 54.9,85.8H45.1A4.9,4.9 0 0 1 40.2,80.9V80.9A4.9,4.9 0 0 1 45.1,76.0Z"/></svg>`;

    const sharedCss = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&family=Geist+Mono:wght@400;600;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        margin: 0;
        padding: 32px 16px;
        background: #FAF9F5;
        color: #1E1E1E;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        display: flex;
        justify-content: center;
      }
      .page {
        width: 100%;
        max-width: 860px;
        background: #FFFFFF;
        border: 2px solid #1E1E1E;
        border-radius: 18px;
        box-shadow: 8px 8px 0 rgba(30, 30, 30, 0.9);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .header {
        background: #1E1E1E;
        color: #FFFFFF;
        padding: 34px 44px 30px;
      }
      .brand-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .logo-mark {
        width: 40px;
        height: 40px;
        background: #4ADE80;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .logo-mark svg {
        width: 24px;
        height: 24px;
      }
      .brand-name {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.03em;
      }
      .brand-sub {
        margin-left: auto;
        font-family: 'Geist Mono', monospace;
        font-size: 11px;
        letter-spacing: 1.4px;
        text-transform: uppercase;
        color: #A9A9A9;
      }
      .badge-strip {
        display: flex;
        height: 6px;
      }
      .bar-gold { flex: 34; background: #FEB47B; }
      .bar-purple { flex: 33; background: #C084FC; }
      .bar-emerald { flex: 33; background: #4ADE80; }
      .kicker {
        font-family: 'Geist Mono', monospace;
        font-size: 11.5px;
        letter-spacing: 1.6px;
        text-transform: uppercase;
        font-weight: 700;
        color: #4ADE80;
        margin: 26px 0 10px;
      }
      .title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 34px;
        line-height: 1.15;
        font-weight: 800;
        margin: 0 0 10px;
        letter-spacing: -0.02em;
      }
      .meta-line {
        font-size: 14.5px;
        color: #E7E7E7;
        font-family: 'Geist Mono', monospace;
      }
      .content {
        padding: 34px 44px 40px;
        display: flex;
        flex-direction: column;
        gap: 26px;
        flex: 1;
      }
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        background: #FAF9F5;
        border: 1.5px solid #1E1E1E;
        border-radius: 12px;
        padding: 16px 20px;
      }
      .meta-cell-label {
        font-family: 'Geist Mono', monospace;
        font-size: 10.5px;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #717171;
        margin-bottom: 4px;
      }
      .meta-cell-val {
        font-size: 14px;
        font-weight: 700;
        color: #1E1E1E;
      }
      .sec-label {
        font-family: 'Geist Mono', monospace;
        font-size: 11px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        font-weight: 700;
        color: #5F5F5F;
        margin-bottom: 8px;
      }
      .sec-p {
        font-size: 14.5px;
        line-height: 1.6;
        color: #2C301C;
      }
      table.data-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border: 1.5px solid #1E1E1E;
        border-radius: 12px;
        overflow: hidden;
        margin-top: 10px;
        font-size: 13.5px;
      }
      table.data-table th {
        background: #1E1E1E;
        color: #FFFFFF;
        font-family: 'Geist Mono', monospace;
        font-size: 11px;
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: 12px 14px;
        text-align: left;
        border-bottom: 1.5px solid #1E1E1E;
      }
      table.data-table td {
        padding: 14px 14px;
        border-bottom: 1px solid #E5E5E0;
        vertical-align: top;
        line-height: 1.5;
      }
      table.data-table tr:last-child td {
        border-bottom: none;
      }
      .callout {
        background: #F2F8ED;
        border-left: 5px solid #4ADE80;
        border-radius: 0 10px 10px 0;
        padding: 18px 22px;
      }
      .callout-title {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 15px;
        margin-bottom: 6px;
      }
      .callout-text {
        font-size: 13.5px;
        line-height: 1.55;
        color: #2C301C;
      }
      .sign-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-top: 10px;
      }
      .sign-card {
        border: 1.5px solid #1E1E1E;
        border-radius: 12px;
        padding: 18px 20px;
        background: #FAF9F5;
      }
      .sign-line {
        border-bottom: 1.5px dashed #1E1E1E;
        height: 48px;
        margin-bottom: 12px;
      }
      .footer {
        background: #1E1E1E;
        color: #9E9E9E;
        padding: 22px 44px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1.5px solid #1E1E1E;
      }
      .footer-links a {
        color: #4ADE80;
        text-decoration: none;
        margin-left: 14px;
      }
      @media print {
        body {
          background: #FFFFFF !important;
          padding: 0 !important;
        }
        .page {
          border: 1px solid #1E1E1E !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          max-width: 100% !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `;

    // 1. MILESTONES & DELIVERABLES ROADMAP
    if (docType === 'milestones') {
      const milestoneRowsHtml = milestones
        .map(
          (m) => `
        <tr>
          <td style="font-family:'Geist Mono',monospace;font-weight:700;width:95px;color:#1E1E1E;">${m.sprint}</td>
          <td>
            <div style="font-weight:700;margin-bottom:4px;color:#1E1E1E;">${m.phase}</div>
            <div style="font-size:12.5px;color:#4B5563;">${m.deliverables}</div>
          </td>
          <td style="font-size:12.5px;color:#4B5563;">${m.dependencies}</td>
          <td style="white-space:nowrap;">
            <div style="font-weight:700;font-family:'Geist Mono',monospace;font-size:12.5px;">${m.timeline}</div>
            <div style="font-size:11px;color:#6B7280;margin-top:2px;">${m.billing}</div>
          </td>
        </tr>`
        )
        .join('');

      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Milestones &amp; Deliverables Roadmap — ${projectName}</title>
<style>${sharedCss}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand-row">
      <div class="logo-mark">${brandSvg}</div>
      <span class="brand-name">Feyron</span>
      <span class="brand-sub">AI Productivity &amp; Technology</span>
    </div>
    <div class="kicker">Execution Framework &bull; Delivery Schedule</div>
    <h1 class="title">Milestones &amp; Deliverables Roadmap</h1>
    <div class="meta-line">Ref: ${docRef} &bull; Target Go-Live: ${targetDate} &bull; Total Value: ${currency}${totalAmount}</div>
  </div>
  <div class="badge-strip"><div class="bar-gold"></div><div class="bar-purple"></div><div class="bar-emerald"></div></div>

  <div class="content">
    <div class="meta-grid">
      <div>
        <div class="meta-cell-label">Client Organization</div>
        <div class="meta-cell-val">${clientCompany}</div>
      </div>
      <div>
        <div class="meta-cell-label">Key Stakeholder</div>
        <div class="meta-cell-val">${clientName}</div>
      </div>
      <div>
        <div class="meta-cell-label">Project Scope</div>
        <div class="meta-cell-val">${projectName}</div>
      </div>
      <div>
        <div class="meta-cell-label">Effective Date</div>
        <div class="meta-cell-val">${dateIssued}</div>
      </div>
    </div>

    <div>
      <div class="sec-label">01 // Engagement &amp; Delivery Blueprint</div>
      <p class="sec-p">${scopeSummary}</p>
    </div>

    <div>
      <div class="sec-label">02 // Sprint Milestones, Handoffs &amp; Billing Triggers</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Sprint</th>
            <th>Phase &amp; Deliverables</th>
            <th>Client Dependencies</th>
            <th>Target &amp; Billing</th>
          </tr>
        </thead>
        <tbody>
          ${milestoneRowsHtml}
        </tbody>
      </table>
    </div>

    <div class="callout">
      <div class="callout-title">SLA &amp; Review Accountability Commitment</div>
      <div class="callout-text">
        <strong>Review SLA:</strong> Client agrees to a <strong>${slaTurnaround}</strong> for milestone sign-offs. Prompt feedback guarantees adherence to the published timeline.<br/>
        <strong>Warranty:</strong> Feyron includes a complimentary <strong>${warrantyPeriod}</strong> covering defects, performance regressions, and bug remediation.
      </div>
    </div>

    <div>
      <div class="sec-label">03 // Sign-off &amp; Authorization</div>
      <div class="sign-grid">
        <div class="sign-card">
          <div class="sec-label">Client Approval: ${clientCompany}</div>
          <div class="sign-line"></div>
          <div style="font-weight:700;font-size:13.5px;">${clientName}</div>
          <div style="font-size:12px;color:#666;">${clientRole} &bull; ${clientEmail}</div>
        </div>
        <div class="sign-card">
          <div class="sec-label">Feyron Delivery Lead</div>
          <div class="sign-line"></div>
          <div style="font-weight:700;font-size:13.5px;">${signatoryName}</div>
          <div style="font-size:12px;color:#666;">${signatoryTitle} &bull; hello@feyron.site</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>Feyron Technologies &bull; Confidential &bull; ${docRef}</span>
    <div class="footer-links">
      <a href="https://www.feyron.site">feyron.site</a>
      <a href="mailto:hello@feyron.site">hello@feyron.site</a>
    </div>
  </div>
</div>
</body>
</html>`;
    }

    // 2. COMMERCIAL INVOICE
    if (docType === 'invoice') {
      const lineItemsHtml = lineItems
        .map(
          (item) => `
        <tr>
          <td>
            <div style="font-weight:700;color:#1E1E1E;">${item.desc}</div>
          </td>
          <td style="text-align:center;font-family:'Geist Mono',monospace;">${item.qty}</td>
          <td style="text-align:right;font-family:'Geist Mono',monospace;">${currency}${item.rate}</td>
          <td style="text-align:right;font-family:'Geist Mono',monospace;font-weight:700;">${currency}${item.amount}</td>
        </tr>`
        )
        .join('');

      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Commercial Invoice — ${docRef}</title>
<style>${sharedCss}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand-row">
      <div class="logo-mark">${brandSvg}</div>
      <span class="brand-name">Feyron</span>
      <span class="brand-sub">Commercial Billing</span>
    </div>
    <div class="kicker">Official Milestone Invoice</div>
    <h1 class="title">Commercial Invoice</h1>
    <div class="meta-line">Invoice Ref: ${docRef} &bull; Due Date: ${targetDate} &bull; Total Due: ${currency}${totalAmount}</div>
  </div>
  <div class="badge-strip"><div class="bar-gold"></div><div class="bar-purple"></div><div class="bar-emerald"></div></div>

  <div class="content">
    <div class="meta-grid">
      <div>
        <div class="meta-cell-label">Billed To</div>
        <div class="meta-cell-val">${clientCompany}</div>
        <div style="font-size:12px;color:#666;">Attn: ${clientName}</div>
      </div>
      <div>
        <div class="meta-cell-label">Client Email</div>
        <div class="meta-cell-val" style="font-size:12.5px;">${clientEmail}</div>
      </div>
      <div>
        <div class="meta-cell-label">Issue Date</div>
        <div class="meta-cell-val">${dateIssued}</div>
      </div>
      <div>
        <div class="meta-cell-label">Payment Terms</div>
        <div class="meta-cell-val">${paymentTerms.split(',')[0] || 'Due on Receipt'}</div>
      </div>
    </div>

    <div>
      <div class="sec-label">Project / Service Scope</div>
      <p class="sec-p"><strong>${projectName}:</strong> ${scopeSummary}</p>
    </div>

    <div>
      <div class="sec-label">Itemized Deliverables &amp; Services</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:center;width:60px;">Qty</th>
            <th style="text-align:right;width:120px;">Unit Rate</th>
            <th style="text-align:right;width:130px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHtml}
          <tr style="background:#FAF9F5;font-weight:700;">
            <td colspan="3" style="text-align:right;font-family:'Geist Mono',monospace;text-transform:uppercase;font-size:12px;">Total Payable</td>
            <td style="text-align:right;font-family:'Geist Mono',monospace;font-size:17px;color:#1E1E1E;">${currency}${totalAmount}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="callout">
      <div class="callout-title">Payment Settlement Details</div>
      <div class="callout-text">
        <strong>Bank Transfer:</strong> Details available upon agreement. Reference payment with <code>${docRef}</code>.<br/>
        <strong>Card / Payment Link:</strong> Contact billing@feyron.site for direct online card settlement via Stripe.
      </div>
    </div>
  </div>

  <div class="footer">
    <span>Feyron Billing &bull; ${docRef} &bull; hello@feyron.site</span>
    <div class="footer-links">
      <a href="https://www.feyron.site">feyron.site</a>
    </div>
  </div>
</div>
</body>
</html>`;
    }

    // 3. PAYMENT RECEIPT
    if (docType === 'receipt') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Payment Receipt — ${docRef}</title>
<style>${sharedCss}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand-row">
      <div class="logo-mark" style="background:#4ADE80;">${brandSvg}</div>
      <span class="brand-name">Feyron</span>
      <span class="brand-sub" style="color:#4ADE80;">Payment Settled</span>
    </div>
    <div class="kicker" style="color:#4ADE80;">Official Payment &amp; Settlement Receipt</div>
    <h1 class="title">Payment Receipt</h1>
    <div class="meta-line">Receipt Ref: ${docRef} &bull; Date Paid: ${dateIssued} &bull; Amount: ${currency}${totalAmount} PAID IN FULL</div>
  </div>
  <div class="badge-strip"><div class="bar-gold"></div><div class="bar-purple"></div><div class="bar-emerald"></div></div>

  <div class="content">
    <div style="background:#DCFCE7;border:2px solid #16A34A;border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:14px;">
      <div style="font-size:26px;">✓</div>
      <div>
        <div style="font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:16px;color:#15803D;">Payment Confirmed &amp; Credited</div>
        <div style="font-size:13px;color:#166534;">We acknowledge receipt of ${currency}${totalAmount} for ${projectName}. Thank you for your partnership.</div>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="meta-cell-label">Received From</div>
        <div class="meta-cell-val">${clientCompany}</div>
        <div style="font-size:12px;color:#666;">Attn: ${clientName}</div>
      </div>
      <div>
        <div class="meta-cell-label">Client Email</div>
        <div class="meta-cell-val" style="font-size:12.5px;">${clientEmail}</div>
      </div>
      <div>
        <div class="meta-cell-label">Settlement Date</div>
        <div class="meta-cell-val">${dateIssued}</div>
      </div>
      <div>
        <div class="meta-cell-label">Payment Status</div>
        <div class="meta-cell-val" style="color:#16A34A;font-weight:800;">CLEARED</div>
      </div>
    </div>

    <div>
      <div class="sec-label">Summary of Settled Services</div>
      <p class="sec-p">${scopeSummary}</p>
    </div>

    <div class="callout">
      <div class="callout-title">Accounting &amp; Tax Records</div>
      <div class="callout-text">
        This document serves as an official proof of payment. Please retain this receipt for your corporate financial reconciliation and audit files.
      </div>
    </div>
  </div>

  <div class="footer">
    <span>Feyron Accounts &bull; Receipt ${docRef}</span>
    <div class="footer-links">
      <a href="https://www.feyron.site">feyron.site</a>
    </div>
  </div>
</div>
</body>
</html>`;
    }

    // 4. CLIENT PROPOSAL / WORK ORDER / ACCEPTANCE / OTHER
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${docType.toUpperCase()} — ${projectName}</title>
<style>${sharedCss}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand-row">
      <div class="logo-mark">${brandSvg}</div>
      <span class="brand-name">Feyron</span>
      <span class="brand-sub">Enterprise Services</span>
    </div>
    <div class="kicker">Official Feyron Document</div>
    <h1 class="title">${docType.replace('_', ' ').toUpperCase()}</h1>
    <div class="meta-line">Ref: ${docRef} &bull; Date: ${dateIssued} &bull; Project: ${projectName}</div>
  </div>
  <div class="badge-strip"><div class="bar-gold"></div><div class="bar-purple"></div><div class="bar-emerald"></div></div>

  <div class="content">
    <div class="meta-grid">
      <div>
        <div class="meta-cell-label">Client</div>
        <div class="meta-cell-val">${clientCompany}</div>
      </div>
      <div>
        <div class="meta-cell-label">Representative</div>
        <div class="meta-cell-val">${clientName}</div>
      </div>
      <div>
        <div class="meta-cell-label">Value</div>
        <div class="meta-cell-val">${currency}${totalAmount}</div>
      </div>
      <div>
        <div class="meta-cell-label">Target Completion</div>
        <div class="meta-cell-val">${targetDate}</div>
      </div>
    </div>

    <div>
      <div class="sec-label">Executive Brief &amp; Scope</div>
      <p class="sec-p">${scopeSummary}</p>
    </div>

    <div class="callout">
      <div class="callout-title">SLA &amp; Engagement Commitments</div>
      <div class="callout-text">
        <strong>Review Turnaround:</strong> ${slaTurnaround}<br/>
        <strong>Warranty:</strong> ${warrantyPeriod}<br/>
        <strong>Payment Schedule:</strong> ${paymentTerms}
      </div>
    </div>

    <div>
      <div class="sec-label">Authorized Signatures</div>
      <div class="sign-grid">
        <div class="sign-card">
          <div class="sec-label">Client: ${clientCompany}</div>
          <div class="sign-line"></div>
          <div style="font-weight:700;font-size:13.5px;">${clientName}</div>
          <div style="font-size:12px;color:#666;">${clientRole}</div>
        </div>
        <div class="sign-card">
          <div class="sec-label">Feyron Delivery Lead</div>
          <div class="sign-line"></div>
          <div style="font-weight:700;font-size:13.5px;">${signatoryName}</div>
          <div style="font-size:12px;color:#666;">${signatoryTitle}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>Feyron Technologies &bull; ${docRef}</span>
    <div class="footer-links">
      <a href="https://www.feyron.site">feyron.site</a>
      <a href="mailto:hello@feyron.site">hello@feyron.site</a>
    </div>
  </div>
</div>
</body>
</html>`;
  }, [
    docType,
    clientName,
    clientEmail,
    clientCompany,
    clientRole,
    projectName,
    docRef,
    dateIssued,
    targetDate,
    currency,
    totalAmount,
    scopeSummary,
    milestones,
    lineItems,
    slaTurnaround,
    warrantyPeriod,
    paymentTerms,
    signatoryName,
    signatoryTitle,
  ]);

  // Actions
  const handleOpenPrintPreview = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Pop-up blocked. Please allow pop-ups for preview.');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(generatedHtml);
    printWindow.document.close();
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docRef}_${docType}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${docRef}_${docType}.html`);
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      showToast('Document HTML copied to clipboard!');
    } catch {
      showToast('Failed to copy to clipboard.');
    }
  };

  const handleSendToClient = async () => {
    if (!clientEmail || !clientEmail.includes('@')) {
      showToast('Please enter a valid client email address.');
      return;
    }

    const docTitles: Record<DocType, string> = {
      milestones: 'Milestones & Deliverables Roadmap',
      proposal: 'Client Engagement Proposal',
      service_order: 'Official Service Order Form',
      invoice: 'Commercial Milestone Invoice',
      receipt: 'Payment & Settlement Receipt',
      acceptance: 'Milestone Acceptance Sign-Off',
      change_request: 'Scope Change Request',
      care_report: 'Monthly Care Report',
      brochure: 'Services & Platform Brochure',
      letterhead: 'Executive Letterhead Document',
    };

    const subject = `${docTitles[docType] || 'Official Document'} — ${projectName} (${docRef})`;

    const confirmed = window.confirm(
      `Send "${subject}" directly to ${clientName} <${clientEmail}> via Resend?`
    );
    if (!confirmed) return;

    setIsSending(true);
    try {
      const res = await onSendEmail({
        to: clientEmail,
        recipientName: clientName,
        subject,
        customHtml: generatedHtml,
        recordId: selectedLeadId || undefined,
      });

      if (res.ok) {
        showToast(`Document sent successfully to ${clientEmail}!`);
      } else {
        showToast(`Failed to send: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      showToast(`Error sending document: ${err.message || String(err)}`);
    } finally {
      setIsSending(false);
    }
  };

  // Milestone Row Editor helpers
  const handleUpdateMilestone = (idx: number, field: keyof MilestoneRow, val: string) => {
    setMilestones((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    );
  };

  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        sprint: `Sprint 0${prev.length + 1}`,
        phase: 'New Milestone Phase',
        deliverables: 'Deliverables description and engineering outputs.',
        dependencies: 'Client inputs and sign-off.',
        timeline: 'Week X - Y',
        billing: 'Milestone Gate',
      },
    ]);
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <section
      style={{
        background: '#FFFFFF',
        border: '2px solid var(--ink, #1E1E1E)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '4px 4px 0 rgba(30, 30, 30, 0.9)',
      }}
    >
      {/* Studio Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #E5E5E0',
          paddingBottom: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11px',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: '#15803d',
              fontWeight: 700,
              marginBottom: '4px',
            }}
          >
            Feyron Official Materials Studio &bull; Manual Mode
          </div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>
            Client Materials &amp; Document Generator
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#555' }}>
            Generate, customize, preview, and send official branded Feyron materials (Milestones, Proposals, Invoices, Receipts) to clients.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleOpenPrintPreview}
            style={{
              cursor: 'pointer',
              background: '#FAF9F5',
              color: '#1E1E1E',
              border: '2px solid #1E1E1E',
              borderRadius: '100px',
              padding: '9px 18px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🖨️</span> Print / Save PDF
          </button>

          <button
            type="button"
            onClick={handleDownloadHtml}
            style={{
              cursor: 'pointer',
              background: '#FAF9F5',
              color: '#1E1E1E',
              border: '2px solid #1E1E1E',
              borderRadius: '100px',
              padding: '9px 16px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11.5px',
              fontWeight: 700,
            }}
          >
            💾 Download HTML
          </button>

          <button
            type="button"
            onClick={handleCopyHtml}
            style={{
              cursor: 'pointer',
              background: '#FAF9F5',
              color: '#1E1E1E',
              border: '2px solid #1E1E1E',
              borderRadius: '100px',
              padding: '9px 16px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11.5px',
              fontWeight: 700,
            }}
          >
            📋 Copy HTML
          </button>

          <button
            type="button"
            disabled={isSending}
            onClick={handleSendToClient}
            style={{
              cursor: isSending ? 'not-allowed' : 'pointer',
              background: 'var(--ink, #1E1E1E)',
              color: 'var(--accent, #D4F534)',
              border: 'none',
              borderRadius: '100px',
              padding: '10px 22px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isSending ? 'Sending via Resend…' : '✉️ Send to Client Now'}
          </button>
        </div>
      </div>

      {/* Select Document Type Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '11px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#666',
            marginBottom: '8px',
            fontWeight: 700,
          }}
        >
          Select Document Template:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'milestones', label: 'Milestones & Deliverables Roadmap' },
            { id: 'invoice', label: 'Commercial Invoice' },
            { id: 'receipt', label: 'Payment Receipt' },
            { id: 'proposal', label: 'Proposal & Scope' },
            { id: 'service_order', label: 'Service Order Form' },
            { id: 'acceptance', label: 'Milestone Acceptance' },
            { id: 'change_request', label: 'Scope Change Request' },
            { id: 'care_report', label: 'Monthly Care Report' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleDocTypeChange(item.id as DocType)}
              style={{
                cursor: 'pointer',
                border: '2px solid var(--ink, #1E1E1E)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                fontWeight: 700,
                background: docType === item.id ? 'var(--ink, #1E1E1E)' : '#FAF9F5',
                color: docType === item.id ? 'var(--accent, #D4F534)' : '#1E1E1E',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Autofill & Industry Presets Toolbar */}
      <div
        style={{
          background: '#FAF9F5',
          border: '1.5px solid #1E1E1E',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#555',
            }}
          >
            Autofill From Database:
          </span>
          <select
            value={selectedLeadId}
            onChange={(e) => handleSelectClient(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1.5px solid #1E1E1E',
              fontFamily: 'inherit',
              fontSize: '12px',
              background: '#FFFFFF',
              fontWeight: 600,
              minWidth: '240px',
            }}
          >
            <option value="">-- Choose Existing Lead / Booking --</option>
            <optgroup label="Recent Enquiries">
              {enquiries.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} {e.company ? `(${e.company})` : ''} — {e.interest || 'Lead'}
                </option>
              ))}
            </optgroup>
            <optgroup label="Booked Calls">
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.date} {b.time}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#555',
            }}
          >
            Quick Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('ai')}
            style={{
              cursor: 'pointer',
              background: '#FFFFFF',
              border: '1.5px solid #1E1E1E',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '11.5px',
              fontWeight: 700,
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            ⚡ AI Agents
          </button>
          <button
            type="button"
            onClick={() => applyPreset('platform')}
            style={{
              cursor: 'pointer',
              background: '#FFFFFF',
              border: '1.5px solid #1E1E1E',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '11.5px',
              fontWeight: 700,
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            🌐 Platform &amp; Web
          </button>
          <button
            type="button"
            onClick={() => applyPreset('payments')}
            style={{
              cursor: 'pointer',
              background: '#FFFFFF',
              border: '1.5px solid #1E1E1E',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '11.5px',
              fontWeight: 700,
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            💳 Payments
          </button>
        </div>
      </div>

      {/* Main Split Layout: Form Controls on Left, Live Preview on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: previewMode === 'split' ? '1fr 1fr' : '1fr',
          gap: '24px',
        }}
      >
        {/* LEFT COLUMN: Customizable Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#1E1E1E',
              borderBottom: '1.5px solid #1E1E1E',
              paddingBottom: '6px',
            }}
          >
            1. Document &amp; Client Details
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Client Name *
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '13px',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Client Email * (for 1-click dispatch)
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '13px',
                }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Company / Organization
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '13px',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Client Role / Title
              <input
                type="text"
                value={clientRole}
                onChange={(e) => setClientRole(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '13px',
                }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Project Title
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '13px',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Document Ref #
              <input
                type="text"
                value={docRef}
                onChange={(e) => setDocRef(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '12.5px',
                  fontFamily: "'Geist Mono', monospace",
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Total Budget
              <div style={{ display: 'flex' }}>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    border: '1.5px solid #1E1E1E',
                    borderRight: 'none',
                    borderRadius: '6px 0 0 6px',
                    padding: '8px',
                    fontWeight: 700,
                  }}
                >
                  <option value="$">$</option>
                  <option value="£">£</option>
                  <option value="€">€</option>
                  <option value="₦">₦</option>
                </select>
                <input
                  type="text"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '0 6px 6px 0',
                    border: '1.5px solid #1E1E1E',
                    fontSize: '13px',
                    width: '100%',
                    fontWeight: 700,
                  }}
                />
              </div>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Issue Date
              <input
                type="date"
                value={dateIssued}
                onChange={(e) => setDateIssued(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '12.5px',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Target Go-Live / Due Date
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '12.5px',
                }}
              />
            </label>
          </div>

          <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
            Executive Scope &amp; Brief Statement
            <textarea
              rows={3}
              value={scopeSummary}
              onChange={(e) => setScopeSummary(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1.5px solid #1E1E1E',
                fontSize: '13px',
                fontFamily: 'inherit',
              }}
            />
          </label>

          {/* SPRINT / MILESTONE BUILDER (if milestones) */}
          {docType === 'milestones' && (
            <div style={{ marginTop: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  2. Roadmap Sprints &amp; Deliverables ({milestones.length})
                </div>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  style={{
                    cursor: 'pointer',
                    background: '#FAF9F5',
                    border: '1.5px solid #1E1E1E',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  + Add Sprint
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1.5px solid #1E1E1E',
                      borderRadius: '8px',
                      padding: '12px',
                      background: '#FAF9F5',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={m.sprint}
                        onChange={(e) => handleUpdateMilestone(idx, 'sprint', e.target.value)}
                        style={{
                          width: '85px',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          border: '1px solid #1E1E1E',
                          fontWeight: 700,
                          fontSize: '12px',
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      />
                      <input
                        type="text"
                        value={m.phase}
                        onChange={(e) => handleUpdateMilestone(idx, 'phase', e.target.value)}
                        placeholder="Phase Title"
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '4px',
                          border: '1px solid #1E1E1E',
                          fontWeight: 700,
                          fontSize: '12.5px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        style={{
                          cursor: 'pointer',
                          background: 'transparent',
                          border: 'none',
                          color: '#DC2626',
                          fontWeight: 800,
                          fontSize: '14px',
                          padding: '0 4px',
                        }}
                        title="Remove sprint"
                      >
                        ✕
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={m.deliverables}
                      onChange={(e) => handleUpdateMilestone(idx, 'deliverables', e.target.value)}
                      placeholder="Concrete deliverables and engineering outputs..."
                      style={{
                        padding: '6px 8px',
                        borderRadius: '4px',
                        border: '1px solid #CCC',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                      }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '6px' }}>
                      <input
                        type="text"
                        value={m.dependencies}
                        onChange={(e) => handleUpdateMilestone(idx, 'dependencies', e.target.value)}
                        placeholder="Client Dependencies"
                        style={{
                          padding: '6px 8px',
                          borderRadius: '4px',
                          border: '1px solid #CCC',
                          fontSize: '11.5px',
                        }}
                      />
                      <input
                        type="text"
                        value={m.timeline}
                        onChange={(e) => handleUpdateMilestone(idx, 'timeline', e.target.value)}
                        placeholder="Timeline (e.g. Week 1-2)"
                        style={{
                          padding: '6px 8px',
                          borderRadius: '4px',
                          border: '1px solid #CCC',
                          fontSize: '11.5px',
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      />
                      <input
                        type="text"
                        value={m.billing}
                        onChange={(e) => handleUpdateMilestone(idx, 'billing', e.target.value)}
                        placeholder="Billing Gate"
                        style={{
                          padding: '6px 8px',
                          borderRadius: '4px',
                          border: '1px solid #CCC',
                          fontSize: '11.5px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLA, Warranty & Signatory settings */}
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#1E1E1E',
              borderBottom: '1.5px solid #1E1E1E',
              paddingBottom: '6px',
              marginTop: '10px',
            }}
          >
            3. SLAs, Warranty &amp; Signatures
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Review SLA Turnaround
              <input
                type="text"
                value={slaTurnaround}
                onChange={(e) => setSlaTurnaround(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '12px',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Warranty Commitment
              <input
                type="text"
                value={warrantyPeriod}
                onChange={(e) => setWarrantyPeriod(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '12px',
                }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Feyron Signatory Name
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '12px',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              Feyron Signatory Title
              <input
                type="text"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #1E1E1E',
                  fontSize: '12px',
                }}
              />
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN: Live In-Browser Document Preview */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1.5px solid #1E1E1E',
              paddingBottom: '6px',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#1E1E1E',
              }}
            >
              Document Preview (Live Render)
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setPreviewMode(previewMode === 'split' ? 'modal' : 'split')}
                style={{
                  cursor: 'pointer',
                  background: '#FAF9F5',
                  border: '1px solid #1E1E1E',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '10.5px',
                  fontWeight: 700,
                }}
              >
                {previewMode === 'split' ? 'Expand Full View' : 'Split View'}
              </button>
            </div>
          </div>

          <div
            style={{
              width: '100%',
              height: '780px',
              border: '2px solid #1E1E1E',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
              background: '#FAF9F5',
            }}
          >
            <iframe
              title="Client Material Preview"
              srcDoc={generatedHtml}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
