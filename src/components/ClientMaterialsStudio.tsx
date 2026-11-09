import React, { useState, useMemo } from 'react';
import { generateExactDocument, ExactDocType } from '../templates/feyronExactDocuments';

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
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

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

  // Compile the Complete Branded HTML using Exact 1:1 Templates
  const generatedHtml = useMemo(() => {
    return generateExactDocument(docType as ExactDocType, {
      clientName,
      clientLegalName: clientCompany,
      clientAddress: 'Lagos, Nigeria',
      clientEmail,
      clientRole,
      projectName,
      agreementNo: `FEY-${new Date().getFullYear()}-001`,
      docNo: docRef,
      dateIssued,
      dueDate: targetDate,
      currency,
      amount: totalAmount,
      situationText: scopeSummary,
      buildText: scopeSummary,
      inScopeText: milestones.map((m) => m.phase).join('<br>'),
      outOfScopeText: 'Changes outside agreed scope quoted in writing before build',
      notes: scopeSummary,
      lineItems,
      feyronSignerName: signatoryName,
      feyronSignerRole: signatoryTitle,
    });
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

      {/* Mobile Segmented Toggle (Edit vs Live Preview on phones) */}
      <div
        className="feyron-mobile-only"
        style={{
          display: 'none',
          width: '100%',
          background: 'var(--paper, #E7E7E7)',
          padding: '4px',
          borderRadius: '100px',
          border: '2px solid var(--ink, #1E1E1E)',
          marginBottom: '16px',
          gap: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          style={{
            flex: 1,
            minHeight: '44px',
            padding: '10px 14px',
            borderRadius: '100px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Geist Mono', monospace",
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            background: mobileTab === 'form' ? 'var(--ink, #1E1E1E)' : 'transparent',
            color: mobileTab === 'form' ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
            transition: 'all 0.15s ease',
          }}
        >
          ✏️ Edit Document
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          style={{
            flex: 1,
            minHeight: '44px',
            padding: '10px 14px',
            borderRadius: '100px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Geist Mono', monospace",
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            background: mobileTab === 'preview' ? 'var(--ink, #1E1E1E)' : 'transparent',
            color: mobileTab === 'preview' ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
            transition: 'all 0.15s ease',
          }}
        >
          👁️ Live Preview
        </button>
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
        <div className="feyron-mobile-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '6px' }}>
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
                flexShrink: 0,
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
        className="feyron-mobile-grid-1"
        style={{
          display: 'grid',
          gridTemplateColumns: previewMode === 'split' ? '1fr 1fr' : '1fr',
          gap: '24px',
        }}
      >
        {/* LEFT COLUMN: Customizable Form Fields */}
        <div className={`feyron-studio-form-col ${mobileTab === 'preview' ? 'feyron-desktop-only' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
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
        <div className={`feyron-studio-preview-col ${mobileTab === 'form' ? 'feyron-desktop-only' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
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
              height: 'min(780px, 76vh)',
              WebkitOverflowScrolling: 'touch',
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
