import React, { useEffect, useState } from 'react';
import { ClientMaterialsStudio } from './components/ClientMaterialsStudio';

interface WorkflowScenario {
  id: string;
  label: string;
  beforeMetrics: {
    turnaround: string;
    handoffs: string;
    oversight: string;
    visibility: string;
  };
  afterMetrics: {
    turnaround: string;
    handoffs: string;
    oversight: string;
    visibility: string;
  };
  beforeSteps: { num: string; title: string; text: string }[];
  afterSteps: { num: string; title: string; text: string }[];
}

const WORKFLOW_SCENARIOS: WorkflowScenario[] = [
  {
    id: 'enquiries',
    label: 'Customer Enquiries & Follow-ups',
    beforeMetrics: {
      turnaround: '4 to 18 hours',
      handoffs: '4 manual copy-pastes',
      oversight: 'Inconsistent replies',
      visibility: 'Scattered across inboxes',
    },
    afterMetrics: {
      turnaround: 'Under 60 seconds',
      handoffs: '0 manual data entry',
      oversight: '1-click human approval gate',
      visibility: 'Centralised CRM + Telegram log',
    },
    beforeSteps: [
      {
        num: '01',
        title: 'Unstructured messages arrive',
        text: 'Enquiries land across WhatsApp, email and web forms. Staff manually check each channel throughout the day.',
      },
      {
        num: '02',
        title: 'Manual qualification & lookup',
        text: 'Team members copy contact details into a spreadsheet, look up pricing or availability, and type repetitive replies.',
      },
      {
        num: '03',
        title: 'Delayed follow-up & lost leads',
        text: 'Follow-ups depend on memory. Prospects wait hours for a booking link and warm leads slip through the cracks.',
      },
    ],
    afterSteps: [
      {
        num: '01',
        title: 'Instant structured capture',
        text: 'The Feyron agent reads incoming web, email or WhatsApp enquiries immediately, extracts key requirements and logs the lead.',
      },
      {
        num: '02',
        title: 'Context lookup & draft preparation',
        text: 'The system checks your rules and calendar availability, sends an instant branded confirmation, and prepares tailored next steps.',
      },
      {
        num: '03',
        title: 'Human approval & scheduled call',
        text: 'Your team receives a structured summary with 1-click actions while the client books their 20-minute call directly.',
      },
    ],
  },
  {
    id: 'documents',
    label: 'Invoices & Document Processing',
    beforeMetrics: {
      turnaround: '25 mins per document',
      handoffs: '3 spreadsheet updates',
      oversight: 'Prone to typing errors',
      visibility: 'Manual folder sorting',
    },
    afterMetrics: {
      turnaround: '15 seconds per document',
      handoffs: 'Direct accounting sync',
      oversight: 'Exceptions flagged for review',
      visibility: 'Full line-by-line audit log',
    },
    beforeSteps: [
      {
        num: '01',
        title: 'PDFs & receipts in email attachments',
        text: 'Invoices, receipts and application forms arrive as attachments or scans in different formats.',
      },
      {
        num: '02',
        title: 'Line-by-line manual re-keying',
        text: 'An operations staff member opens each file, types amounts, dates and vendor details into accounting software.',
      },
      {
        num: '03',
        title: 'Slow reconciliation',
        text: 'Missing fields or mismatched totals are discovered days later during month-end reconciliation.',
      },
    ],
    afterSteps: [
      {
        num: '01',
        title: 'Automated field extraction',
        text: 'The agent reads incoming PDFs, invoices and forms, extracting line items, totals, tax IDs and dates automatically.',
      },
      {
        num: '02',
        title: 'Rule & policy verification',
        text: 'Every field is checked against purchase orders and your company rules. Clean records are staged automatically.',
      },
      {
        num: '03',
        title: 'Human sign-off on exceptions',
        text: 'Uncertain or high-value items are routed to a designated approver before any financial record is committed.',
      },
    ],
  },
  {
    id: 'onboarding',
    label: 'Client Onboarding & Intake',
    beforeMetrics: {
      turnaround: '2 to 4 working days',
      handoffs: '6 back-and-forth emails',
      oversight: 'Manual checklist tracking',
      visibility: 'No single status view',
    },
    afterMetrics: {
      turnaround: 'Same-day completion',
      handoffs: 'Automated workspace setup',
      oversight: 'Compliance sign-off gate',
      visibility: 'Live onboarding tracker',
    },
    beforeSteps: [
      {
        num: '01',
        title: 'Chasing documents over email',
        text: 'After a client signs, staff send manual emails asking for KYC documents, project briefs and billing details.',
      },
      {
        num: '02',
        title: 'Creating folders & tasks by hand',
        text: 'Someone manually sets up project folders, internal tasks, CRM records and welcome messages across four tools.',
      },
      {
        num: '03',
        title: 'Stalled project kickoffs',
        text: 'Incomplete submissions delay kickoff while the team searches email threads to see what is still missing.',
      },
    ],
    afterSteps: [
      {
        num: '01',
        title: 'Guided intake & document check',
        text: 'Clients submit details through a clean portal. The agent verifies completeness and requests missing items politely.',
      },
      {
        num: '02',
        title: 'Instant workspace & task creation',
        text: 'Records, project folders, internal tasks and team briefs are created across your tools in one connected step.',
      },
      {
        num: '03',
        title: 'Team review & kickoff ready',
        text: 'Your team approves the verified onboarding package and starts delivery with every document in place.',
      },
    ],
  },
];

function buildCustomScenario(customInput: string): WorkflowScenario {
  const clean = customInput.trim();
  return {
    id: 'custom',
    label: clean,
    beforeMetrics: {
      turnaround: 'Hours to days per cycle',
      handoffs: 'Multiple manual copy-pastes',
      oversight: 'Human memory & manual checks',
      visibility: 'Scattered across messages & sheets',
    },
    afterMetrics: {
      turnaround: 'Seconds (real-time execution)',
      handoffs: 'Connected end-to-end pipeline',
      oversight: '1-click human approval gate',
      visibility: 'Live dashboard & audit log',
    },
    beforeSteps: [
      {
        num: '01',
        title: `Manual intake for ${clean}`,
        text: `Requests, data or files for "${clean}" arrive across email, WhatsApp or forms and require staff to read and log them by hand.`,
      },
      {
        num: '02',
        title: 'Repetitive cross-checking & updates',
        text: `Your team manually verifies rules, copies information between spreadsheets or software tools, and chases missing details.`,
      },
      {
        num: '03',
        title: 'Delayed completion & follow-up',
        text: `Progress slows down when the team is busy, status updates require manual checking, and follow-ups depend on memory.`,
      },
    ],
    afterSteps: [
      {
        num: '01',
        title: `Automated capture for ${clean}`,
        text: `The Feyron system captures incoming inputs for "${clean}" automatically from your channels, extracts structured fields and logs the record.`,
      },
      {
        num: '02',
        title: 'Rule verification & tool sync',
        text: `Your business logic is applied automatically across your connected tools, drafting responses or staging records in seconds.`,
      },
      {
        num: '03',
        title: 'Human approval & instant action',
        text: `Your team reviews any flagged items in one click while notifications, updates and reporting run reliably in the background.`,
      },
    ],
  };
}

export function WorkflowVisualizerCard() {
  const [selectedId, setSelectedId] = useState<string>('enquiries');
  const [customWorkflowText, setCustomWorkflowText] = useState<string>('');
  const [mode, setMode] = useState<'before' | 'after'>('after');

  const isCustomActive = customWorkflowText.trim().length > 0;
  const current = isCustomActive
    ? buildCustomScenario(customWorkflowText)
    : WORKFLOW_SCENARIOS.find((s) => s.id === selectedId) || WORKFLOW_SCENARIOS[0];
  const metrics = mode === 'after' ? current.afterMetrics : current.beforeMetrics;
  const steps = mode === 'after' ? current.afterSteps : current.beforeSteps;

  return (
    <section
      style={{
        background: '#fff',
        border: '2.5px solid var(--ink, #1E1E1E)',
        borderRadius: '24px',
        padding: 'clamp(24px, 3.5vw, 42px)',
        boxShadow: '6px 6px 0 rgba(30,30,30,0.88)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '18px',
          marginBottom: '22px',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11.5px',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: '#5a5a48',
              marginBottom: '10px',
            }}
          >
            Interactive Architecture · Before &amp; After
          </div>
          <h2
            style={{
              margin: '0 0 8px',
              fontWeight: 800,
              fontSize: 'clamp(1.55rem, 3vw, 2.35rem)',
              lineHeight: 1.05,
              letterSpacing: '-.025em',
            }}
          >
            How your workflow moves before and after Feyron
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(15px, 1.15vw, 17px)',
              lineHeight: 1.55,
              fontWeight: 500,
              color: '#2c301c',
              maxWidth: '68ch',
            }}
          >
            Type any workflow or process from your own business below — or choose an example — to see how it transforms from manual steps into a connected Feyron system.
          </p>
        </div>

        {/* Before / After Segmented Switch */}
        <div
          role="group"
          aria-label="Workflow comparison mode"
          style={{
            display: 'inline-flex',
            background: 'var(--paper, #E7E7E7)',
            border: '2px solid var(--ink, #1E1E1E)',
            borderRadius: '100px',
            padding: '4px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('before')}
            style={{
              cursor: 'pointer',
              border: 'none',
              borderRadius: '100px',
              padding: '9px 18px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              background: mode === 'before' ? 'var(--ink, #1E1E1E)' : 'transparent',
              color: mode === 'before' ? '#fff' : 'var(--ink, #1E1E1E)',
              transition: 'background .18s ease, color .18s ease',
            }}
          >
            Manual (Before)
          </button>
          <button
            type="button"
            onClick={() => setMode('after')}
            style={{
              cursor: 'pointer',
              border: 'none',
              borderRadius: '100px',
              padding: '9px 18px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              background: mode === 'after' ? 'var(--ink, #1E1E1E)' : 'transparent',
              color: mode === 'after' ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
              transition: 'background .18s ease, color .18s ease',
            }}
          >
            Feyron System (After)
          </button>
        </div>
      </div>

      {/* Custom Workflow Input + Quick Presets */}
      <div
        style={{
          background: 'var(--paper, #E7E7E7)',
          border: '2px solid var(--ink, #1E1E1E)',
          borderRadius: '18px',
          padding: '16px 18px',
          marginBottom: '22px',
          display: 'grid',
          gap: '12px',
        }}
      >
        <label style={{ display: 'grid', gap: '6px', fontWeight: 700, fontSize: '14px' }}>
          <span>Type any workflow or process you want to automate</span>
          <input
            type="text"
            value={customWorkflowText}
            onChange={(e) => setCustomWorkflowText(e.target.value)}
            placeholder="e.g. Tenant rent reminders, Waybill reconciliation, Patient HMO intake, Order dispatch…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 15px',
              borderRadius: '12px',
              border: '2px solid var(--ink, #1E1E1E)',
              background: '#fff',
              fontFamily: 'inherit',
              fontSize: '15px',
              fontWeight: 600,
            }}
          />
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '10.5px',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: '#5a5a48',
              marginRight: '4px',
            }}
          >
            Or inspect an example:
          </span>
          {WORKFLOW_SCENARIOS.map((sc) => {
            const active = !isCustomActive && sc.id === selectedId;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  setCustomWorkflowText('');
                  setSelectedId(sc.id);
                }}
                style={{
                  cursor: 'pointer',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: active ? 'var(--bg, #D4F534)' : '#fff',
                  color: 'var(--ink, #1E1E1E)',
                  transition: 'background .18s ease',
                }}
              >
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Step Pipeline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {steps.map((st) => (
          <div
            key={st.num}
            style={{
              background: mode === 'after' ? 'var(--bg, #D4F534)' : 'var(--paper, #E7E7E7)',
              border: '2px solid var(--ink, #1E1E1E)',
              borderRadius: '18px',
              padding: '20px 22px',
              transition: 'background .2s ease',
            }}
          >
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                marginBottom: '8px',
                fontWeight: 700,
              }}
            >
              {mode === 'after' ? `Automated Step ${st.num}` : `Manual Step ${st.num}`}
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18.5px', fontWeight: 800, letterSpacing: '-.015em' }}>
              {st.title}
            </h3>
            <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.55, fontWeight: 500, color: '#1E1E1E' }}>
              {st.text}
            </p>
          </div>
        ))}
      </div>

      {/* Operational Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px',
          background: '#1E1E1E',
          color: '#fff',
          borderRadius: '18px',
          padding: '18px 22px',
          border: '2px solid var(--ink, #1E1E1E)',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '10.5px',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: '#9a9a8c',
              marginBottom: '4px',
            }}
          >
            Turnaround Time
          </div>
          <div style={{ fontSize: '16.5px', fontWeight: 800, color: mode === 'after' ? 'var(--accent, #D4F534)' : '#fff' }}>
            {metrics.turnaround}
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '10.5px',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: '#9a9a8c',
              marginBottom: '4px',
            }}
          >
            Data Handoffs
          </div>
          <div style={{ fontSize: '16.5px', fontWeight: 800, color: mode === 'after' ? 'var(--accent, #D4F534)' : '#fff' }}>
            {metrics.handoffs}
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '10.5px',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: '#9a9a8c',
              marginBottom: '4px',
            }}
          >
            Control &amp; Quality
          </div>
          <div style={{ fontSize: '16.5px', fontWeight: 800, color: mode === 'after' ? 'var(--accent, #D4F534)' : '#fff' }}>
            {metrics.oversight}
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '10.5px',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: '#9a9a8c',
              marginBottom: '4px',
            }}
          >
            Operational Visibility
          </div>
          <div style={{ fontSize: '16.5px', fontWeight: 800, color: mode === 'after' ? 'var(--accent, #D4F534)' : '#fff' }}>
            {metrics.visibility}
          </div>
        </div>
      </div>
    </section>
  );
}

export function WorkflowRoiCalculatorCard({
  onBookWithContext,
}: {
  onBookWithContext?: (summaryText: string) => void;
}) {
  const [workflowName, setWorkflowName] = useState('');
  const [toolsUsed, setToolsUsed] = useState('');
  const [teamSize, setTeamSize] = useState<number>(4);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(8);
  const [hourlyRate, setHourlyRate] = useState<number>(35);

  const effectiveWorkflow = workflowName.trim() || 'Custom business workflow';

  // Conservative 72% automation reduction with human-in-the-loop approval
  const weeklyHoursSaved = Math.round(teamSize * hoursPerWeek * 0.72);
  const monthlyHoursSaved = Math.round(weeklyHoursSaved * 4.33);
  const monthlyValueUnlocked = Math.round(monthlyHoursSaved * hourlyRate);
  const annualHoursSaved = monthlyHoursSaved * 12;

  const recommendedPackage =
    monthlyHoursSaved <= 65
      ? 'Workflow Sprint (2 to 4 weeks)'
      : monthlyHoursSaved <= 180
        ? 'Function Agent (Dedicated workflow owner)'
        : 'Business Agent Suite (3 to 5 connected workflows)';

  const summaryNote = `Workflow Audit Estimate — Workflow: ${effectiveWorkflow}${toolsUsed.trim() ? ` | Tools/Channels: ${toolsUsed.trim()}` : ''} | Team size: ${teamSize} | Est. time reclaimed: ${monthlyHoursSaved} hrs/month ($${monthlyValueUnlocked.toLocaleString()}/mo capacity) | Recommended scope: ${recommendedPackage}`;

  const handleBookAudit = () => {
    if (window.openBooking) {
      window.openBooking({
        notes: summaryNote,
        source: 'roi-calculator',
      });
      return;
    }
    if (onBookWithContext) {
      onBookWithContext(summaryNote);
    }
  };

  return (
    <section
      style={{
        background: '#fff',
        border: '2.5px solid var(--ink, #1E1E1E)',
        borderRadius: '24px',
        padding: 'clamp(24px, 3.5vw, 42px)',
        boxShadow: '6px 6px 0 rgba(30,30,30,0.88)',
      }}
    >
      <div
        style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: '11.5px',
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: '#5a5a48',
          marginBottom: '10px',
        }}
      >
        Workflow Audit Estimator · Time &amp; Capacity
      </div>
      <h2
        style={{
          margin: '0 0 10px',
          fontWeight: 800,
          fontSize: 'clamp(1.55rem, 3vw, 2.35rem)',
          lineHeight: 1.05,
          letterSpacing: '-.025em',
        }}
      >
        Estimate what automating your workflow saves your team
      </h2>
      <p
        style={{
          margin: '0 0 24px',
          fontSize: 'clamp(15px, 1.15vw, 17px)',
          lineHeight: 1.55,
          fontWeight: 500,
          color: '#2c301c',
          maxWidth: '72ch',
        }}
      >
        Describe any repetitive process or software system you want to build or automate, and adjust the sliders for your team.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '22px',
          alignItems: 'stretch',
        }}
      >
        {/* Left column: Controls */}
        <div
          style={{
            background: 'var(--paper, #E7E7E7)',
            border: '2px solid var(--ink, #1E1E1E)',
            borderRadius: '18px',
            padding: '22px 24px',
            display: 'grid',
            gap: '16px',
          }}
        >
          <label style={{ display: 'grid', gap: '7px', fontWeight: 700, fontSize: '14.5px' }}>
            <span>What workflow or system do you want to automate or build?</span>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Type anything — e.g. Customer follow-ups, Invoice approvals, School portal, Inventory sync…"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '2px solid var(--ink, #1E1E1E)',
                background: '#fff',
                fontFamily: 'inherit',
                fontSize: '14.5px',
                fontWeight: 600,
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '7px', fontWeight: 700, fontSize: '14.5px' }}>
            <span>Current tools or channels involved (optional)</span>
            <input
              type="text"
              value={toolsUsed}
              onChange={(e) => setToolsUsed(e.target.value)}
              placeholder="e.g. WhatsApp, Email, Excel, Google Sheets, Paystack, Custom DB…"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '2px solid var(--ink, #1E1E1E)',
                background: '#fff',
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: 500,
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px', fontWeight: 700, fontSize: '14.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Team members involved</span>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '13.5px',
                  fontWeight: 700,
                  background: '#fff',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  borderRadius: '100px',
                  padding: '2px 10px',
                }}
              >
                {teamSize} {teamSize === 1 ? 'person' : 'people'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              style={{ accentColor: '#1E1E1E', width: '100%', cursor: 'pointer' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px', fontWeight: 700, fontSize: '14.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Hours spent per person each week</span>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '13.5px',
                  fontWeight: 700,
                  background: '#fff',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  borderRadius: '100px',
                  padding: '2px 10px',
                }}
              >
                {hoursPerWeek} hrs / wk
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={30}
              step={1}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              style={{ accentColor: '#1E1E1E', width: '100%', cursor: 'pointer' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px', fontWeight: 700, fontSize: '14.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Average hourly operational cost (USD)</span>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '13.5px',
                  fontWeight: 700,
                  background: '#fff',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  borderRadius: '100px',
                  padding: '2px 10px',
                }}
              >
                ${hourlyRate} / hr
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={150}
              step={5}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              style={{ accentColor: '#1E1E1E', width: '100%', cursor: 'pointer' }}
            />
          </label>
        </div>

        {/* Right column: Calculated Output */}
        <div
          style={{
            background: 'var(--bg, #D4F534)',
            border: '2px solid var(--ink, #1E1E1E)',
            borderRadius: '18px',
            padding: '24px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '18px',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                fontWeight: 700,
                marginBottom: '14px',
              }}
            >
              Estimated Impact · {effectiveWorkflow}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '14px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  background: '#fff',
                  border: '2px solid var(--ink, #1E1E1E)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '10.5px',
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    color: '#5a5a48',
                    marginBottom: '4px',
                  }}
                >
                  Time Reclaimed
                </div>
                <div style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)', fontWeight: 800, lineHeight: 1.05 }}>
                  {monthlyHoursSaved} hrs
                </div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: '#555', marginTop: '4px' }}>
                  per month ({annualHoursSaved} hrs/yr)
                </div>
              </div>

              <div
                style={{
                  background: '#fff',
                  border: '2px solid var(--ink, #1E1E1E)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '10.5px',
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    color: '#5a5a48',
                    marginBottom: '4px',
                  }}
                >
                  Capacity Unlocked
                </div>
                <div style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)', fontWeight: 800, lineHeight: 1.05 }}>
                  ${monthlyValueUnlocked.toLocaleString()}
                </div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: '#555', marginTop: '4px' }}>
                  monthly operational value
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.65)',
                border: '1.5px solid var(--ink, #1E1E1E)',
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '10.5px',
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  display: 'block',
                  color: '#444',
                  marginBottom: '2px',
                  fontWeight: 700,
                }}
              >
                Recommended Starting Scope
              </span>
              <strong>{recommendedPackage}</strong> — begins with a fixed-scope workflow audit and written plan.
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleBookAudit}
              style={{
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 800,
                fontSize: '15px',
                background: 'var(--ink, #1E1E1E)',
                color: 'var(--accent, #D4F534)',
                border: '2px solid var(--ink, #1E1E1E)',
                padding: '14px 24px',
                borderRadius: '100px',
              }}
            >
              Book a 20-min call for this workflow →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

type LeadStatus = 'New' | 'Contacted' | 'Audit Scheduled' | 'Proposal Sent' | 'Archived';

interface DashboardEnquiry {
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

interface DashboardBooking {
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

const STATUS_OPTIONS: LeadStatus[] = [
  'New',
  'Contacted',
  'Audit Scheduled',
  'Proposal Sent',
  'Archived',
];

function readLocalRecords(): { localEnquiries: DashboardEnquiry[]; localBookings: DashboardBooking[] } {
  const localEnquiries: DashboardEnquiry[] = [];
  const localBookings: DashboardBooking[] = [];
  try {
    const rawEnq = JSON.parse(localStorage.getItem('feyron-enquiries') || '[]');
    if (Array.isArray(rawEnq)) {
      rawEnq.forEach((item: any, idx: number) => {
        if (!item) return;
        const email = String(item.email || item.contact || '').trim();
        const createdAt = String(item.createdAt || new Date().toISOString());
        localEnquiries.push({
          id: String(item.id || `local_enq_${idx}_${createdAt}`),
          name: String(item.name || 'Website Visitor'),
          email,
          company: String(item.company || 'Not specified'),
          interest: String(item.interest || 'General Enquiry'),
          details: String(item.details || item.bottleneck || item.description || ''),
          source: String(item.source || 'site'),
          status: (item.status as LeadStatus) || 'New',
          internalNotes: String(item.internalNotes || ''),
          createdAt,
        });
      });
    }
  } catch {
    // ignore
  }
  try {
    const rawWaitlist = JSON.parse(localStorage.getItem('feyron-product-waitlist') || '[]');
    if (Array.isArray(rawWaitlist)) {
      rawWaitlist.forEach((item: any, idx: number) => {
        if (!item || !item.email) return;
        const createdAt = String(item.createdAt || new Date().toISOString());
        localEnquiries.push({
          id: `local_wait_${idx}_${createdAt}`,
          name: 'Products Early-Access Subscriber',
          email: String(item.email),
          company: 'Early Access',
          interest: 'Products Waitlist',
          details: `Joined the Feyron Products early-access waitlist (${item.email}).`,
          source: 'products-waitlist',
          status: 'New',
          internalNotes: '',
          createdAt,
        });
      });
    }
  } catch {
    // ignore
  }
  try {
    const rawBook = JSON.parse(localStorage.getItem('feyron-bookings') || '[]');
    if (Array.isArray(rawBook)) {
      rawBook.forEach((item: any, idx: number) => {
        if (!item) return;
        const createdAt = String(item.createdAt || new Date().toISOString());
        localBookings.push({
          id: String(item.id || `local_bk_${idx}_${createdAt}`),
          name: String(item.name || 'Guest'),
          email: String(item.email || ''),
          notes: String(item.notes || ''),
          date: String(item.date || ''),
          time: String(item.time || ''),
          endTime: String(item.endTime || ''),
          formattedDate: String(item.formattedDate || item.date || ''),
          clientTimezone: String(item.clientTimezone || 'Africa/Lagos'),
          clientTimeLabel: String(item.clientTimeLabel || ''),
          meetingUrl: String(item.meetingUrl || ''),
          gcalUrl: String(item.gcalUrl || '#'),
          outlookUrl: String(item.outlookUrl || '#'),
          status: (item.status as LeadStatus) || 'Audit Scheduled',
          internalNotes: String(item.internalNotes || ''),
          reminderSent: Boolean(item.reminderSent),
          createdAt,
        });
      });
    }
  } catch {
    // ignore
  }
  return { localEnquiries, localBookings };
}

const ALL_DASHBOARD_SLOTS = [
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

function removeLocalRecord(type: 'booking' | 'enquiry', id: string, email: string) {
  try {
    if (type === 'booking') {
      const raw = JSON.parse(localStorage.getItem('feyron-bookings') || '[]');
      if (Array.isArray(raw)) {
        const filtered = raw.filter(
          (item: any) => item && item.id !== id && String(item.email || '').toLowerCase() !== email.toLowerCase()
        );
        localStorage.setItem('feyron-bookings', JSON.stringify(filtered));
      }
    } else {
      const raw = JSON.parse(localStorage.getItem('feyron-enquiries') || '[]');
      if (Array.isArray(raw)) {
        const filtered = raw.filter(
          (item: any) => item && item.id !== id && String(item.email || '').toLowerCase() !== email.toLowerCase()
        );
        localStorage.setItem('feyron-enquiries', JSON.stringify(filtered));
      }
    }
  } catch {
    // ignore
  }
}

export function TeamDashboardSection() {
  const [passcode, setPasscode] = useState<string>(() => {
    try {
      const stored = sessionStorage.getItem('feyron-dashboard-code');
      if (stored) return stored;
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code') || params.get('passcode') || params.get('key');
      if (urlCode) return urlCode;
      const hash = (window.location.hash || '').replace(/^#+/, '');
      if (hash && (hash === 'feyron2026' || hash.startsWith('passcode='))) {
        return hash.replace(/^passcode=/, '');
      }
      return '';
    } catch {
      return '';
    }
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [enquiries, setEnquiries] = useState<DashboardEnquiry[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'bookings' | 'enquiries' | 'waitlist' | 'materials'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Top drawers: Manual Lead/Booking Creation & Availability Blocking
  const [activePanel, setActivePanel] = useState<'none' | 'create' | 'availability'>('none');
  const [createMode, setCreateMode] = useState<'booking' | 'enquiry'>('booking');
  const [createBusy, setCreateBusy] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({
    name: '',
    email: '',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: '10:00',
    notes: '',
    sendConfirmation: true,
  });
  const [newEnquiryForm, setNewEnquiryForm] = useState({
    name: '',
    email: '',
    company: '',
    interest: 'AI Automation',
    details: '',
    internalNotes: '',
    sendAutoResponder: false,
  });

  // Availability management date
  const [availDate, setAvailDate] = useState<string>(() =>
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );

  // Per-card inline Email Composer state
  const [composerTargetId, setComposerTargetId] = useState<string | null>(null);
  const [composerSending, setComposerSending] = useState(false);
  const [composerForm, setComposerForm] = useState({
    to: '',
    recipientName: '',
    recordType: 'enquiry' as 'booking' | 'enquiry',
    subject: '',
    eyebrow: 'Feyron Follow-Up',
    headline: 'Technology that moves work forward.',
    message: '',
    calloutTitle: 'Summary & Next Steps',
    calloutBody: '',
    ctaLabel: 'Book or manage call',
    ctaUrl: 'https://feyron.site/contact',
  });

  // Per-booking inline Reschedule state
  const [rescheduleTargetId, setRescheduleTargetId] = useState<string | null>(null);
  const [rescheduleBusy, setRescheduleBusy] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    time: '10:00',
    notifyGuest: true,
  });

  // Per-card Internal Notes draft state
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  // Broadcast Update to Waitlist state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    subject: 'Feyron Products: Early Access Update',
    eyebrow: 'Feyron Products · Private Preview',
    headline: 'What we are testing next.',
    message: 'Thank you for joining early access for Feyron Products.\n\nWe are preparing private test flights for our upcoming workflow tools and wanted to share our latest build progress with you.',
    calloutTitle: 'What to Expect Next',
    calloutBody: 'Private preview links will be sent directly to your email as chapters enter active testing.',
    ctaLabel: 'Explore Shipped Systems',
    ctaUrl: 'https://feyron.site/work',
  });

  const showToast = (msg: string, duration = 3400) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), duration);
  };

  const fetchRecords = async (codeToUse: string) => {
    const cleanCode = codeToUse.trim();
    if (!cleanCode) return;
    setLoading(true);
    setAuthError('');
    const { localEnquiries, localBookings } = readLocalRecords();
    try {
      const res = await fetch('/api/dashboard', {
        headers: {
          'x-feyron-passcode': cleanCode,
          Accept: 'application/json',
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setAuthenticated(false);
        setAuthError(data.error || 'Invalid access code.');
        setLoading(false);
        return;
      }
      const serverEnquiries: DashboardEnquiry[] = Array.isArray(data.enquiries) ? data.enquiries : [];
      const serverBookings: DashboardBooking[] = Array.isArray(data.bookings) ? data.bookings : [];

      const seenEnqKeys = new Set(
        serverEnquiries.map((e) => `${e.email.toLowerCase()}|${(e.details || '').slice(0, 40)}`)
      );
      const mergedEnquiries = [...serverEnquiries];
      localEnquiries.forEach((le) => {
        const key = `${le.email.toLowerCase()}|${(le.details || '').slice(0, 40)}`;
        if (!seenEnqKeys.has(key)) {
          seenEnqKeys.add(key);
          mergedEnquiries.push(le);
        }
      });

      const seenBkKeys = new Set(
        serverBookings.map((b) => `${b.email.toLowerCase()}|${b.date}|${b.time}`)
      );
      const mergedBookings = [...serverBookings];
      localBookings.forEach((lb) => {
        const key = `${lb.email.toLowerCase()}|${lb.date}|${lb.time}`;
        if (!seenBkKeys.has(key)) {
          seenBkKeys.add(key);
          mergedBookings.push(lb);
        }
      });

      setEnquiries(mergedEnquiries);
      setBookings(mergedBookings);
      setBlockedDates(Array.isArray(data.blockedDates) ? data.blockedDates : []);
      setBlockedSlots(
        data.blockedSlots && typeof data.blockedSlots === 'object' ? data.blockedSlots : {}
      );
      setAuthenticated(true);
      try {
        sessionStorage.setItem('feyron-dashboard-code', cleanCode);
      } catch {
        // ignore
      }
    } catch {
      setAuthenticated(false);
      setAuthError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (passcode) {
      fetchRecords(passcode);
    }
  }, []);

  const postDashboardAction = async (payload: Record<string, any>) => {
    const res = await fetch('/api/dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-feyron-passcode': passcode,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: Boolean(res.ok && data.ok), data };
  };

  const handleUpdateRecord = async (
    type: 'enquiry' | 'booking',
    id: string,
    updates: { status?: LeadStatus; internalNotes?: string }
  ) => {
    try {
      const res = await fetch('/api/dashboard', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-feyron-passcode': passcode,
        },
        body: JSON.stringify({ type, id, ...updates }),
      });
      if (res.ok) {
        if (type === 'enquiry') {
          setEnquiries((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
          );
        } else {
          setBookings((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
          );
        }
        showToast('Record updated.', 2200);
      }
    } catch {
      // ignore
    }
  };

  const handleSendReminder = async (bookingId: string) => {
    showToast('Sending reminder email…', 4000);
    const { ok, data } = await postDashboardAction({ action: 'remind', id: bookingId });
    if (ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, reminderSent: true } : b))
      );
      showToast('Session reminder dispatched to guest.');
    } else {
      showToast(data.error || 'Could not dispatch reminder.');
    }
  };

  const openEmailComposerForBooking = (
    b: DashboardBooking,
    preset: 'followup' | 'scope' | 'reschedule' = 'followup'
  ) => {
    const firstName = b.name.split(/\s+/)[0] || b.name;
    if (preset === 'scope') {
      setComposerForm({
        to: b.email,
        recipientName: b.name,
        recordType: 'booking',
        subject: `Written Scope & Architecture Plan — ${b.name} × Feyron`,
        eyebrow: 'Scope & Architecture',
        headline: 'Your workflow plan and build scope.',
        message: `Thank you for taking the time to walk through your workflow with us.\n\nBelow is the recommended automation architecture, deliverables, and implementation timeline based on our call.`,
        calloutTitle: 'Proposed Deliverables & Timeline',
        calloutBody: `Phase 1: Workflow integration & webhook orchestration\nPhase 2: Automated data validation & routing\nPhase 3: Testing, live deployment & team handoff`,
        ctaLabel: 'Confirm scope & kick off',
        ctaUrl: 'https://feyron.site/contact',
      });
    } else if (preset === 'reschedule') {
      setComposerForm({
        to: b.email,
        recipientName: b.name,
        recordType: 'booking',
        subject: `Rescheduling our call — ${b.formattedDate}`,
        eyebrow: 'Schedule Update',
        headline: 'Let us find a better time for your call.',
        message: `We noticed we missed you or needed to adjust our scheduled 20-minute call on ${b.formattedDate} at ${b.time} WAT.\n\nPlease let us know what time works best for you, or pick a fresh slot directly on our calendar.`,
        calloutTitle: 'Previous Slot',
        calloutBody: `${b.formattedDate} · ${b.time} to ${b.endTime} WAT`,
        ctaLabel: 'Pick a new time slot',
        ctaUrl: 'https://feyron.site/contact',
      });
    } else {
      setComposerForm({
        to: b.email,
        recipientName: b.name,
        recordType: 'booking',
        subject: `Following up on our call — Feyron`,
        eyebrow: 'Call Follow-Up',
        headline: 'Next steps from our conversation.',
        message: `It was great speaking with you, ${firstName}. Here is a quick summary of what we covered during your 20-minute session and the practical next steps from our team.`,
        calloutTitle: 'Session Summary',
        calloutBody: b.notes || `20-minute workflow audit on ${b.formattedDate} (${b.time} WAT).`,
        ctaLabel: 'Open Meeting Room / Reply',
        ctaUrl: b.meetingUrl || 'https://feyron.site/contact',
      });
    }
    setComposerTargetId(b.id);
  };

  const openEmailComposerForEnquiry = (
    e: DashboardEnquiry,
    preset: 'reply' | 'scope' | 'invite' = 'reply'
  ) => {
    if (preset === 'scope') {
      setComposerForm({
        to: e.email,
        recipientName: e.name,
        recordType: 'enquiry',
        subject: `Proposed Scope & Next Steps — ${e.interest} · Feyron`,
        eyebrow: e.interest || 'Scope & Proposal',
        headline: 'Your tailored implementation plan.',
        message: `Thank you for sharing the details of your project${e.company && e.company !== 'Not specified' ? ` at ${e.company}` : ''}.\n\nWe have reviewed your requirements and outlined a clear execution plan below.`,
        calloutTitle: 'Recommended Scope & Timeline',
        calloutBody: `1. Architecture & System Design\n2. Core Build & API Integrations\n3. Production Deployment & Team Handover`,
        ctaLabel: 'Book a 20-min review call',
        ctaUrl: 'https://feyron.site/contact',
      });
    } else if (preset === 'invite') {
      setComposerForm({
        to: e.email,
        recipientName: e.name,
        recordType: 'enquiry',
        subject: `Let us map out your ${e.interest} workflow — Feyron`,
        eyebrow: e.interest || 'Workflow Audit',
        headline: 'Pick a 20-minute slot with our engineering team.',
        message: `We reviewed your note regarding ${e.interest} and would love to walk through your current setup live.\n\nUse the link below to pick any 20-minute slot on our calendar, and we will send a written plan right after the call.`,
        calloutTitle: 'Your Enquiry Summary',
        calloutBody: e.details,
        ctaLabel: 'Book a 20-minute call',
        ctaUrl: 'https://feyron.site/contact',
      });
    } else {
      setComposerForm({
        to: e.email,
        recipientName: e.name,
        recordType: 'enquiry',
        subject: `Re: Your ${e.interest} enquiry — Feyron`,
        eyebrow: e.interest || 'Direct Reply',
        headline: 'Technology that moves work forward.',
        message: `Thank you for reaching out to Feyron regarding ${e.interest}${e.company && e.company !== 'Not specified' ? ` at ${e.company}` : ''}.\n\nWe have reviewed your summary and put together our initial thoughts and clarifying questions below.`,
        calloutTitle: 'Your Summary',
        calloutBody: e.details,
        ctaLabel: 'Book a 20-minute call',
        ctaUrl: 'https://feyron.site/contact',
      });
    }
    setComposerTargetId(e.id);
  };

  const handleDispatchCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerTargetId) return;
    setComposerSending(true);
    const { ok, data } = await postDashboardAction({
      action: 'send_email',
      recordId: composerTargetId,
      recordType: composerForm.recordType,
      to: composerForm.to,
      recipientName: composerForm.recipientName,
      subject: composerForm.subject,
      eyebrow: composerForm.eyebrow,
      headline: composerForm.headline,
      message: composerForm.message,
      calloutTitle: composerForm.calloutTitle,
      calloutBody: composerForm.calloutBody,
      ctaLabel: composerForm.ctaLabel,
      ctaUrl: composerForm.ctaUrl,
    });
    setComposerSending(false);
    if (ok) {
      showToast(data.message || `Branded email sent to ${composerForm.to}.`);
      setComposerTargetId(null);
      fetchRecords(passcode);
    } else {
      showToast(data.error || 'Could not send email.');
    }
  };

  const handleRescheduleSubmit = async (bookingId: string) => {
    if (!rescheduleForm.date || !rescheduleForm.time) return;
    setRescheduleBusy(true);
    const { ok, data } = await postDashboardAction({
      action: 'reschedule',
      id: bookingId,
      date: rescheduleForm.date,
      time: rescheduleForm.time,
      notifyGuest: rescheduleForm.notifyGuest,
    });
    setRescheduleBusy(false);
    if (ok) {
      showToast(data.message || 'Booking rescheduled.');
      setRescheduleTargetId(null);
      fetchRecords(passcode);
    } else {
      showToast(data.error || 'Could not reschedule slot.');
    }
  };

  const handleCancelBookingSlot = async (b: DashboardBooking, notifyGuest: boolean) => {
    const { ok, data } = await postDashboardAction({
      action: 'cancel',
      id: b.id,
      notifyGuest,
    });
    if (ok) {
      showToast(data.message || 'Slot cancelled and freed on calendar.');
      fetchRecords(passcode);
    } else {
      showToast(data.error || 'Could not cancel booking.');
    }
  };

  const handleDeleteRecord = async (type: 'booking' | 'enquiry', id: string, email: string) => {
    removeLocalRecord(type, id, email);
    const { ok, data } = await postDashboardAction({
      action: 'delete',
      type,
      id,
    });
    if (type === 'booking') {
      setBookings((prev) => prev.filter((item) => item.id !== id));
    } else {
      setEnquiries((prev) => prev.filter((item) => item.id !== id));
    }
    showToast(ok ? data.message || 'Record deleted.' : 'Removed record.');
  };

  const handleToggleDateBlock = async (dateStr: string) => {
    const isBlocked = blockedDates.includes(dateStr);
    const { ok, data } = await postDashboardAction({
      action: isBlocked ? 'unblock_date' : 'block_date',
      date: dateStr,
    });
    if (ok) {
      setBlockedDates(Array.isArray(data.blockedDates) ? data.blockedDates : []);
      setBlockedSlots(data.blockedSlots || {});
      showToast(isBlocked ? `Unblocked ${dateStr}.` : `Blocked full day ${dateStr} on calendar.`);
    }
  };

  const handleToggleSlotBlock = async (dateStr: string, slotStr: string) => {
    const daySlots = blockedSlots[dateStr] || [];
    const isSlotBlocked = daySlots.includes(slotStr);
    const { ok, data } = await postDashboardAction({
      action: isSlotBlocked ? 'unblock_slot' : 'block_slot',
      date: dateStr,
      slot: slotStr,
    });
    if (ok) {
      setBlockedDates(Array.isArray(data.blockedDates) ? data.blockedDates : []);
      setBlockedSlots(data.blockedSlots || {});
      showToast(
        isSlotBlocked
          ? `Opened ${slotStr} WAT on ${dateStr}.`
          : `Blocked ${slotStr} WAT on ${dateStr}.`
      );
    }
  };

  const handleCreateManualRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateBusy(true);
    if (createMode === 'booking') {
      const { ok, data } = await postDashboardAction({
        action: 'create_booking',
        ...newBookingForm,
      });
      setCreateBusy(false);
      if (ok) {
        showToast(data.message || 'Booking created.');
        setNewBookingForm({
          name: '',
          email: '',
          date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          time: '10:00',
          notes: '',
          sendConfirmation: true,
        });
        setActivePanel('none');
        fetchRecords(passcode);
      } else {
        showToast(data.error || 'Could not create booking.');
      }
    } else {
      const { ok, data } = await postDashboardAction({
        action: 'create_enquiry',
        ...newEnquiryForm,
      });
      setCreateBusy(false);
      if (ok) {
        showToast(data.message || 'Enquiry lead created.');
        setNewEnquiryForm({
          name: '',
          email: '',
          company: '',
          interest: 'AI Automation',
          details: '',
          internalNotes: '',
          sendAutoResponder: false,
        });
        setActivePanel('none');
        fetchRecords(passcode);
      } else {
        showToast(data.error || 'Could not create enquiry.');
      }
    }
  };

  const handleExportCsv = () => {
    const rows: string[][] = [
      [
        'Record Type',
        'ID',
        'Name',
        'Email',
        'Company / Timezone',
        'Division / Slot (WAT)',
        'Status',
        'Details / Notes',
        'Internal Team Notes',
        'Meeting URL',
        'Created At',
      ],
    ];

    bookings.forEach((b) => {
      rows.push([
        'Booking',
        b.id,
        b.name,
        b.email,
        b.clientTimezone || 'Africa/Lagos',
        `${b.date} ${b.time} WAT`,
        b.status,
        b.notes || '',
        b.internalNotes || '',
        b.meetingUrl,
        b.createdAt,
      ]);
    });

    enquiries.forEach((e) => {
      rows.push([
        'Enquiry',
        e.id,
        e.name,
        e.email,
        e.company,
        e.interest,
        e.status,
        e.details,
        e.internalNotes || '',
        '',
        e.createdAt,
      ]);
    });

    const csvContent = rows
      .map((r) => r.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `feyron-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportWaitlistCsv = () => {
    const waitlistItems = enquiries.filter(
      (e) => e.source === 'products-waitlist' || e.interest === 'Products Waitlist'
    );
    const rows: string[][] = [
      ['Email', 'Name', 'Status', 'Joined Date', 'Internal Notes'],
    ];
    waitlistItems.forEach((w) => {
      rows.push([
        w.email,
        w.name,
        w.status,
        w.createdAt,
        w.internalNotes || '',
      ]);
    });
    const csvContent = rows
      .map((r) => r.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `feyron-waitlist-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDispatchBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const waitlistEmails = enquiries
      .filter((eq) => eq.source === 'products-waitlist' || eq.interest === 'Products Waitlist')
      .map((eq) => eq.email.trim())
      .filter(Boolean);

    if (waitlistEmails.length === 0) {
      showToast('No waitlist subscribers found to send to.');
      return;
    }

    setBroadcastSending(true);
    const { ok, data } = await postDashboardAction({
      action: 'send_broadcast',
      recipients: waitlistEmails,
      subject: broadcastForm.subject,
      eyebrow: broadcastForm.eyebrow,
      headline: broadcastForm.headline,
      message: broadcastForm.message,
      calloutTitle: broadcastForm.calloutTitle,
      calloutBody: broadcastForm.calloutBody,
      ctaLabel: broadcastForm.ctaLabel,
      ctaUrl: broadcastForm.ctaUrl,
    });
    setBroadcastSending(false);
    if (ok) {
      showToast(data.message || `Broadcast sent to ${waitlistEmails.length} subscribers.`);
      setBroadcastOpen(false);
      fetchRecords(passcode);
    } else {
      showToast(data.error || 'Failed to dispatch broadcast.');
    }
  };

  if (!authenticated) {
    return (
      <section
        style={{
          background: '#fff',
          border: '2.5px solid var(--ink, #1E1E1E)',
          borderRadius: '24px',
          padding: 'clamp(28px, 4vw, 48px)',
          boxShadow: '8px 8px 0 rgba(30,30,30,0.9)',
          maxWidth: '560px',
        }}
      >
        <div
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '11.5px',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: '#5a5a48',
            marginBottom: '10px',
          }}
        >
          Restricted Access · Feyron Team
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
          Enter team access code
        </h2>
        <p style={{ margin: '0 0 22px', fontSize: '15.5px', lineHeight: 1.55, color: '#2c301c', fontWeight: 500 }}>
          Enter the Feyron operations passcode to view booked calls, send branded replies from hello@feyron.site, manage calendar availability, and update leads.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchRecords(passcode);
          }}
          style={{ display: 'grid', gap: '16px' }}
        >
          <label style={{ display: 'grid', gap: '7px', fontWeight: 700, fontSize: '14.5px' }}>
            Access code
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter team passcode"
              required
              style={{
                padding: '13px 15px',
                borderRadius: '12px',
                border: '2px solid var(--ink, #1E1E1E)',
                background: 'var(--paper, #E7E7E7)',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '15px',
              }}
            />
          </label>
          {authError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#fee2e2',
                color: '#991b1b',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              {authError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '15.5px',
                background: 'var(--ink, #1E1E1E)',
                color: 'var(--accent, #D4F534)',
                border: 'none',
                padding: '14px 30px',
                borderRadius: '100px',
              }}
            >
              {loading ? 'Verifying…' : 'Unlock dashboard →'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setPasscode('feyron2026');
                fetchRecords('feyron2026');
              }}
              style={{
                cursor: 'pointer',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '12px',
                fontWeight: 600,
                background: 'transparent',
                color: 'var(--ink, #1E1E1E)',
                border: '1.5px solid var(--ink, #1E1E1E)',
                padding: '12px 20px',
                borderRadius: '100px',
              }}
            >
              Unlock with default code (feyron2026)
            </button>
          </div>
        </form>
      </section>
    );
  }

  const q = searchQuery.trim().toLowerCase();
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.notes.toLowerCase().includes(q) ||
      (b.internalNotes || '').toLowerCase().includes(q) ||
      b.date.includes(q)
    );
  });

  const filteredEnquiries = enquiries.filter((e) => {
    if (activeTab === 'waitlist' && e.source !== 'products-waitlist' && e.interest !== 'Products Waitlist') {
      return false;
    }
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (!q) return true;
    return (
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.company.toLowerCase().includes(q) ||
      e.interest.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q) ||
      (e.internalNotes || '').toLowerCase().includes(q)
    );
  });

  const waitlistCount = enquiries.filter(
    (e) => e.source === 'products-waitlist' || e.interest === 'Products Waitlist'
  ).length;

  const totalBlockedCount =
    blockedDates.length +
    Object.values(blockedSlots).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);

  return (
    <div style={{ display: 'grid', gap: '28px' }}>
      {/* Metrics Overview Card */}
      <section
        style={{
          background: '#fff',
          border: '2.5px solid var(--ink, #1E1E1E)',
          borderRadius: '24px',
          padding: 'clamp(22px, 3vw, 34px)',
          boxShadow: '6px 6px 0 rgba(30,30,30,0.88)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '20px',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: '#5a5a48',
              }}
            >
              Live Pipeline · hello@feyron.site
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800 }}>
              Overview &amp; Controls
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActivePanel(activePanel === 'create' ? 'none' : 'create')}
              style={{
                cursor: 'pointer',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                background: activePanel === 'create' ? 'var(--ink, #1E1E1E)' : 'var(--bg, #D4F534)',
                color: activePanel === 'create' ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
                border: '2px solid var(--ink, #1E1E1E)',
                borderRadius: '100px',
                padding: '9px 18px',
              }}
            >
              + Add Booking / Lead
            </button>
            <button
              type="button"
              onClick={() => setActivePanel(activePanel === 'availability' ? 'none' : 'availability')}
              style={{
                cursor: 'pointer',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                background:
                  activePanel === 'availability' ? 'var(--ink, #1E1E1E)' : 'var(--paper, #E7E7E7)',
                color:
                  activePanel === 'availability' ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
                border: '2px solid var(--ink, #1E1E1E)',
                borderRadius: '100px',
                padding: '9px 18px',
              }}
            >
              Calendar Availability ({totalBlockedCount})
            </button>
            <button
              type="button"
              onClick={() => fetchRecords(passcode)}
              style={{
                cursor: 'pointer',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                background: 'var(--paper, #E7E7E7)',
                color: 'var(--ink, #1E1E1E)',
                border: '2px solid var(--ink, #1E1E1E)',
                borderRadius: '100px',
                padding: '9px 18px',
              }}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              style={{
                cursor: 'pointer',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                background: 'var(--ink, #1E1E1E)',
                color: 'var(--accent, #D4F534)',
                border: '2px solid var(--ink, #1E1E1E)',
                borderRadius: '100px',
                padding: '9px 18px',
              }}
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthenticated(false);
                setPasscode('');
                try {
                  sessionStorage.removeItem('feyron-dashboard-code');
                } catch {
                  // ignore
                }
              }}
              style={{
                cursor: 'pointer',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                background: 'transparent',
                color: 'var(--ink, #1E1E1E)',
                border: '2px solid var(--ink, #1E1E1E)',
                borderRadius: '100px',
                padding: '9px 18px',
              }}
            >
              Lock
            </button>
          </div>
        </div>

        {/* Manual Booking / Enquiry Creation Panel */}
        {activePanel === 'create' && (
          <div
            style={{
              background: 'var(--paper, #E7E7E7)',
              border: '2px solid var(--ink, #1E1E1E)',
              borderRadius: '18px',
              padding: '22px',
              marginBottom: '22px',
              display: 'grid',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setCreateMode('booking')}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '100px',
                    border: '2px solid var(--ink, #1E1E1E)',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: createMode === 'booking' ? 'var(--ink, #1E1E1E)' : '#fff',
                    color: createMode === 'booking' ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
                  }}
                >
                  Log 20-Min Call Booking
                </button>
                <button
                  type="button"
                  onClick={() => setCreateMode('enquiry')}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '100px',
                    border: '2px solid var(--ink, #1E1E1E)',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: createMode === 'enquiry' ? 'var(--ink, #1E1E1E)' : '#fff',
                    color: createMode === 'enquiry' ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
                  }}
                >
                  Log Client Enquiry
                </button>
              </div>
              <button
                type="button"
                onClick={() => setActivePanel('none')}
                style={{
                  cursor: 'pointer',
                  background: '#fff',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateManualRecord} style={{ display: 'grid', gap: '14px' }}>
              {createMode === 'booking' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '13.5px', fontWeight: 700 }}>
                      Guest Name *
                      <input
                        type="text"
                        required
                        value={newBookingForm.name}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, name: e.target.value })}
                        placeholder="e.g. Tunde Adebayo"
                        style={{
                          padding: '10px 13px',
                          borderRadius: '10px',
                          border: '2px solid var(--ink, #1E1E1E)',
                          background: '#fff',
                          fontFamily: 'inherit',
                        }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '13.5px', fontWeight: 700 }}>
                      Guest Email *
                      <input
                        type="email"
                        required
                        value={newBookingForm.email}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, email: e.target.value })}
                        placeholder="client@company.com"
                        style={{
                          padding: '10px 13px',
                          borderRadius: '10px',
                          border: '2px solid var(--ink, #1E1E1E)',
                          background: '#fff',
                          fontFamily: 'inherit',
                        }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '13.5px', fontWeight: 700 }}>
                      Date (YYYY-MM-DD) *
                      <input
                        type="date"
                        required
                        value={newBookingForm.date}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, date: e.target.value })}
                        style={{
                          padding: '10px 13px',
                          borderRadius: '10px',
                          border: '2px solid var(--ink, #1E1E1E)',
                          background: '#fff',
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '13.5px', fontWeight: 700 }}>
                      Time Slot (WAT) *
                      <select
                        value={newBookingForm.time}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, time: e.target.value })}
                        style={{
                          padding: '10px 13px',
                          borderRadius: '10px',
                          border: '2px solid var(--ink, #1E1E1E)',
                          background: '#fff',
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      >
                        {ALL_DASHBOARD_SLOTS.map((s) => (
                          <option key={s} value={s}>
                            {s} WAT
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label style={{ display: 'grid', gap: '5px', fontSize: '13.5px', fontWeight: 700 }}>
                    Topic / Call Notes
                    <input
                      type="text"
                      value={newBookingForm.notes}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, notes: e.target.value })}
                      placeholder="Workflow or system to discuss on the call"
                      style={{
                        padding: '10px 13px',
                        borderRadius: '10px',
                        border: '2px solid var(--ink, #1E1E1E)',
                        background: '#fff',
                        fontFamily: 'inherit',
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 700 }}>
                    <input
                      type="checkbox"
                      checked={newBookingForm.sendConfirmation}
                      onChange={(e) =>
                        setNewBookingForm({ ...newBookingForm, sendConfirmation: e.target.checked })
                      }
                    />
                    Send official Feyron confirmation email + .ics calendar invite to guest
                  </label>
                </>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '13.5px', fontWeight: 700 }}>
                      Client Name *
                      <input
                        type="text"
                        required
                        value={newEnquiryForm.name}
                        onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, name: e.target.value })}
                        placeholder="Full name"
                        style={{
                          padding: '10px 13px',
                          borderRadius: '10px',
                          border: '2px solid var(--ink, #1E1E1E)',
                          background: '#fff',
                          fontFamily: 'inherit',
                        }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '13.5px', fontWeight: 700 }}>
                      Client Email *
                      <input
                        type="email"
                        required
                        value={newEnquiryForm.email}
                        onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, email: e.target.value })}
                        placeholder="client@company.com"
                        style={{
                          padding: '10px 13px',
                          borderRadius: '10px',
                          border: '2px solid var(--ink, #1E1E1E)',
                          background: '#fff',
                          fontFamily: 'inherit',
                        }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '13.5px', fontWeight: 700 }}>
                      Company / Organization
                      <input
                        type="text"
                        value={newEnquiryForm.company}
                        onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, company: e.target.value })}
                        placeholder="Company name"
                        style={{
                          padding: '10px 13px',
                          borderRadius: '10px',
                          border: '2px solid var(--ink, #1E1E1E)',
                          background: '#fff',
                          fontFamily: 'inherit',
                        }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '13.5px', fontWeight: 700 }}>
                      Division / Interest
                      <input
                        type="text"
                        value={newEnquiryForm.interest}
                        onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, interest: e.target.value })}
                        placeholder="AI Automation, Websites & Platforms…"
                        style={{
                          padding: '10px 13px',
                          borderRadius: '10px',
                          border: '2px solid var(--ink, #1E1E1E)',
                          background: '#fff',
                          fontFamily: 'inherit',
                        }}
                      />
                    </label>
                  </div>
                  <label style={{ display: 'grid', gap: '5px', fontSize: '13.5px', fontWeight: 700 }}>
                    Project Summary / Enquiry Details *
                    <textarea
                      rows={3}
                      required
                      value={newEnquiryForm.details}
                      onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, details: e.target.value })}
                      placeholder="Describe what the client reached out about (e.g. via WhatsApp, phone, referral)…"
                      style={{
                        padding: '10px 13px',
                        borderRadius: '10px',
                        border: '2px solid var(--ink, #1E1E1E)',
                        background: '#fff',
                        fontFamily: 'inherit',
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 700 }}>
                    <input
                      type="checkbox"
                      checked={newEnquiryForm.sendAutoResponder}
                      onChange={(e) =>
                        setNewEnquiryForm({ ...newEnquiryForm, sendAutoResponder: e.target.checked })
                      }
                    />
                    Send official Feyron enquiry confirmation email to client
                  </label>
                </>
              )}
              <div>
                <button
                  type="submit"
                  disabled={createBusy}
                  style={{
                    cursor: 'pointer',
                    background: 'var(--ink, #1E1E1E)',
                    color: 'var(--accent, #D4F534)',
                    border: '2px solid var(--ink, #1E1E1E)',
                    borderRadius: '100px',
                    padding: '10px 24px',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {createBusy
                    ? 'Saving…'
                    : createMode === 'booking'
                    ? 'Create Call Booking →'
                    : 'Save Enquiry Lead →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Calendar Availability & Blocked Dates/Slots Panel */}
        {activePanel === 'availability' && (
          <div
            style={{
              background: 'var(--paper, #E7E7E7)',
              border: '2px solid var(--ink, #1E1E1E)',
              borderRadius: '18px',
              padding: '22px',
              marginBottom: '22px',
              display: 'grid',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#555' }}>
                  Public Calendar Controls · Africa/Lagos (WAT)
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                  Block Dates or Specific 20-Min Time Slots
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePanel('none')}
                style={{
                  cursor: 'pointer',
                  background: '#fff',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                Select Date:
                <input
                  type="date"
                  value={availDate}
                  onChange={(e) => setAvailDate(e.target.value)}
                  style={{
                    padding: '9px 13px',
                    borderRadius: '10px',
                    border: '2px solid var(--ink, #1E1E1E)',
                    background: '#fff',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '13px',
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => handleToggleDateBlock(availDate)}
                style={{
                  cursor: 'pointer',
                  background: blockedDates.includes(availDate) ? '#fee2e2' : 'var(--ink, #1E1E1E)',
                  color: blockedDates.includes(availDate) ? '#991b1b' : 'var(--accent, #D4F534)',
                  border: '2px solid var(--ink, #1E1E1E)',
                  borderRadius: '100px',
                  padding: '9px 18px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {blockedDates.includes(availDate)
                  ? `Unblock Entire Day (${availDate})`
                  : `Block Entire Day (${availDate})`}
              </button>
            </div>

            <div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', color: '#444' }}>
                Click individual slots on {availDate} to toggle availability (dark = blocked):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ALL_DASHBOARD_SLOTS.map((slot) => {
                  const isDayBlocked = blockedDates.includes(availDate);
                  const isSlotBlocked = isDayBlocked || (blockedSlots[availDate] || []).includes(slot);
                  const isBookedByClient = bookings.some(
                    (b) => b.date === availDate && b.time === slot && b.status !== 'Archived'
                  );
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isDayBlocked || isBookedByClient}
                      onClick={() => handleToggleSlotBlock(availDate, slot)}
                      style={{
                        cursor: isDayBlocked || isBookedByClient ? 'not-allowed' : 'pointer',
                        padding: '7px 12px',
                        borderRadius: '100px',
                        border: '1.5px solid var(--ink, #1E1E1E)',
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: isBookedByClient
                          ? 'var(--bg, #D4F534)'
                          : isSlotBlocked
                          ? 'var(--ink, #1E1E1E)'
                          : '#fff',
                        color: isBookedByClient
                          ? 'var(--ink, #1E1E1E)'
                          : isSlotBlocked
                          ? '#fff'
                          : 'var(--ink, #1E1E1E)',
                      }}
                    >
                      {slot} {isBookedByClient ? '(Booked)' : isSlotBlocked ? '(Blocked)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {(blockedDates.length > 0 || Object.keys(blockedSlots).length > 0) && (
              <div style={{ borderTop: '1.5px solid rgba(30,30,30,0.2)', paddingTop: '12px', display: 'grid', gap: '8px' }}>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', color: '#444' }}>
                  Active Blocks Across Calendar:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {blockedDates.map((d) => (
                    <button
                      key={`day-${d}`}
                      type="button"
                      onClick={() => handleToggleDateBlock(d)}
                      style={{
                        cursor: 'pointer',
                        background: '#fff',
                        border: '1.5px solid var(--ink, #1E1E1E)',
                        borderRadius: '100px',
                        padding: '5px 12px',
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {d} (Full Day) ×
                    </button>
                  ))}
                  {Object.entries(blockedSlots).map(([d, slots]) =>
                    (Array.isArray(slots) ? slots : []).map((s) => (
                      <button
                        key={`slot-${d}-${s}`}
                        type="button"
                        onClick={() => handleToggleSlotBlock(d, s)}
                        style={{
                          cursor: 'pointer',
                          background: '#fff',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '100px',
                          padding: '5px 12px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {d} {s} WAT ×
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '14px',
            marginBottom: '22px',
          }}
        >
          <div
            style={{
              background: 'var(--bg, #D4F534)',
              border: '2px solid var(--ink, #1E1E1E)',
              borderRadius: '16px',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '.12em' }}>
              Booked Calls
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{bookings.length}</div>
          </div>

          <div
            style={{
              background: 'var(--paper, #E7E7E7)',
              border: '2px solid var(--ink, #1E1E1E)',
              borderRadius: '16px',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '.12em' }}>
              Client Enquiries
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{enquiries.length}</div>
          </div>

          <div
            style={{
              background: 'var(--paper, #E7E7E7)',
              border: '2px solid var(--ink, #1E1E1E)',
              borderRadius: '16px',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '.12em' }}>
              Open / New Leads
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>
              {enquiries.filter((e) => e.status === 'New').length +
                bookings.filter((b) => b.status === 'Audit Scheduled').length}
            </div>
          </div>

          <div
            style={{
              background: 'var(--paper, #E7E7E7)',
              border: '2px solid var(--ink, #1E1E1E)',
              borderRadius: '16px',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '.12em' }}>
              Products Waitlist
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{waitlistCount}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="feyron-mobile-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px', maxWidth: '100%' }}>
            {[
              { id: 'all', label: 'All Records' },
              { id: 'bookings', label: `Bookings (${bookings.length})` },
              { id: 'enquiries', label: `Enquiries (${enquiries.length})` },
              { id: 'waitlist', label: `Waitlist (${waitlistCount})` },
              { id: 'materials', label: '📄 Client Materials & Docs' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  cursor: 'pointer',
                  flexShrink: 0,
                  minHeight: '40px',
                  border: '2px solid var(--ink, #1E1E1E)',
                  borderRadius: '100px',
                  padding: '8px 16px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11.5px',
                  fontWeight: 700,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  background: activeTab === tab.id ? 'var(--ink, #1E1E1E)' : 'var(--paper, #E7E7E7)',
                  color: activeTab === tab.id ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              style={{
                padding: '9px 14px',
                borderRadius: '100px',
                border: '2px solid var(--ink, #1E1E1E)',
                background: 'var(--paper, #E7E7E7)',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                fontWeight: 700,
              }}
            >
              <option value="All">Status: All</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>

            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, company, notes…"
              style={{
                padding: '9px 16px',
                borderRadius: '100px',
                border: '2px solid var(--ink, #1E1E1E)',
                background: 'var(--paper, #E7E7E7)',
                fontFamily: 'inherit',
                fontSize: '14px',
                minWidth: '0',
                flex: '1 1 180px',
              }}
            />
          </div>
        </div>

        {feedbackMsg && (
          <div
            style={{
              marginTop: '14px',
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'var(--bg, #D4F534)',
              border: '1.5px solid var(--ink, #1E1E1E)',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {feedbackMsg}
          </div>
        )}
      </section>

      {/* Client Materials Studio (Milestones Roadmap, Proposals, Invoices, Receipts) */}
      {activeTab === 'materials' && (
        <ClientMaterialsStudio
          enquiries={enquiries}
          bookings={bookings}
          showToast={showToast}
          onSendEmail={async (payload) => {
            const res = await postDashboardAction({
              action: 'send_email',
              to: payload.to,
              recipientName: payload.recipientName,
              subject: payload.subject,
              message: payload.message || `Please find attached your official Feyron document: ${payload.subject}`,
              customHtml: payload.customHtml,
              documentData: payload.documentData,
              attachments: payload.attachments,
              recordId: payload.recordId,
            });
            return {
              ok: Boolean(res.ok),
              error: res.data?.error || (res.ok ? undefined : 'Failed to dispatch email via Resend.'),
            };
          }}
        />
      )}

      {/* Booked Calls List */}
      {(activeTab === 'all' || activeTab === 'bookings') && (
        <section
          style={{
            background: '#fff',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '24px',
            padding: 'clamp(22px, 3vw, 34px)',
            boxShadow: '6px 6px 0 rgba(30,30,30,0.88)',
          }}
        >
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11.5px',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: '#5a5a48',
              marginBottom: '8px',
            }}
          >
            Scheduled 20-Min Calls
          </div>
          <h3 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 800 }}>
            Booked Calls ({filteredBookings.length})
          </h3>

          {filteredBookings.length === 0 ? (
            <div
              style={{
                padding: '22px',
                borderRadius: '16px',
                background: 'var(--paper, #E7E7E7)',
                border: '1.5px solid var(--ink, #1E1E1E)',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '13px',
                color: '#555',
              }}
            >
              No booking records match the current filter.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredBookings.map((b) => {
                const isComposerOpen = composerTargetId === b.id;
                const isRescheduleOpen = rescheduleTargetId === b.id;
                const currentNoteVal =
                  notesDraft[b.id] !== undefined ? notesDraft[b.id] : b.internalNotes || '';

                return (
                  <div
                    key={b.id}
                    style={{
                      background: 'var(--paper, #E7E7E7)',
                      border: '2px solid var(--ink, #1E1E1E)',
                      borderRadius: '18px',
                      padding: '20px 22px',
                      display: 'grid',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '18.5px', fontWeight: 800 }}>
                          {b.name}{' '}
                          <span style={{ fontWeight: 500, fontSize: '14.5px', color: '#444' }}>
                            ({b.email})
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '12px',
                            color: '#2c301c',
                            marginTop: '4px',
                          }}
                        >
                          {b.formattedDate} · {b.time} to {b.endTime} WAT
                          {b.clientTimeLabel ? ` · Guest local: ${b.clientTimeLabel}` : ''}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <select
                          value={b.status}
                          onChange={(e) =>
                            handleUpdateRecord('booking', b.id, { status: e.target.value as LeadStatus })
                          }
                          style={{
                            padding: '7px 12px',
                            borderRadius: '100px',
                            border: '2px solid var(--ink, #1E1E1E)',
                            background: '#fff',
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '11.5px',
                            fontWeight: 700,
                          }}
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {b.notes && (
                      <div
                        style={{
                          background: '#fff',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          fontSize: '14.5px',
                          lineHeight: 1.5,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '.1em',
                            color: '#666',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          Client Notes
                        </span>
                        {b.notes}
                      </div>
                    )}

                    {/* Internal Team Notes */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <input
                        type="text"
                        value={currentNoteVal}
                        onChange={(ev) =>
                          setNotesDraft((prev) => ({ ...prev, [b.id]: ev.target.value }))
                        }
                        placeholder="Add internal team notes, call outcome, or follow-up log…"
                        style={{
                          flex: '1 1 160px',
                          minWidth: '0',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          background: '#fff',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '12px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateRecord('booking', b.id, { internalNotes: currentNoteVal })
                        }
                        style={{
                          cursor: 'pointer',
                          background: '#fff',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '100px',
                          padding: '7px 14px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        Save Note
                      </button>
                    </div>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <a
                        href={b.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'var(--ink, #1E1E1E)',
                          color: 'var(--accent, #D4F534)',
                          borderRadius: '100px',
                          padding: '8px 16px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          textTransform: 'uppercase',
                          letterSpacing: '.05em',
                        }}
                      >
                        Open Meeting Room →
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          if (isComposerOpen) {
                            setComposerTargetId(null);
                          } else {
                            openEmailComposerForBooking(b, 'followup');
                          }
                        }}
                        style={{
                          cursor: 'pointer',
                          background: isComposerOpen ? 'var(--ink, #1E1E1E)' : 'var(--bg, #D4F534)',
                          color: isComposerOpen ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '100px',
                          padding: '7px 14px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '.05em',
                        }}
                      >
                        {isComposerOpen ? 'Close Email Composer' : 'Send Branded Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendReminder(b.id)}
                        style={{
                          cursor: 'pointer',
                          background: '#fff',
                          color: 'var(--ink, #1E1E1E)',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '100px',
                          padding: '7px 14px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '.05em',
                        }}
                      >
                        {b.reminderSent ? 'Resend Reminder' : 'Send 2h Reminder'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (isRescheduleOpen) {
                            setRescheduleTargetId(null);
                          } else {
                            setRescheduleForm({
                              date: b.date,
                              time: b.time || '10:00',
                              notifyGuest: true,
                            });
                            setRescheduleTargetId(b.id);
                          }
                        }}
                        style={{
                          cursor: 'pointer',
                          background: isRescheduleOpen ? 'var(--ink, #1E1E1E)' : '#fff',
                          color: isRescheduleOpen ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '100px',
                          padding: '7px 14px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        Reschedule
                      </button>
                      {b.status !== 'Archived' && (
                        <button
                          type="button"
                          onClick={() => handleCancelBookingSlot(b, true)}
                          style={{
                            cursor: 'pointer',
                            background: '#fff',
                            color: '#991b1b',
                            border: '1.5px solid var(--ink, #1E1E1E)',
                            borderRadius: '100px',
                            padding: '7px 14px',
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '11.5px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          Cancel &amp; Free Slot
                        </button>
                      )}
                      <a
                        href={b.gcalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#fff',
                          color: 'var(--ink, #1E1E1E)',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '100px',
                          padding: '7px 14px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        + Google Calendar
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('materials');
                        }}
                        style={{
                          cursor: 'pointer',
                          background: '#FAF9F5',
                          color: '#1E1E1E',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '100px',
                          padding: '7px 14px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        📄 Milestones &amp; Docs →
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord('booking', b.id, b.email)}
                        style={{
                          cursor: 'pointer',
                          background: 'transparent',
                          color: '#666',
                          border: '1.5px solid rgba(30,30,30,0.45)',
                          borderRadius: '100px',
                          padding: '7px 13px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    {/* Inline Reschedule Drawer */}
                    {isRescheduleOpen && (
                      <div
                        style={{
                          background: '#fff',
                          border: '2px solid var(--ink, #1E1E1E)',
                          borderRadius: '14px',
                          padding: '16px',
                          display: 'grid',
                          gap: '12px',
                        }}
                      >
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                          Move Booking &amp; Free Current Slot ({b.date} {b.time} WAT)
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
                            New Date:
                            <input
                              type="date"
                              value={rescheduleForm.date}
                              onChange={(ev) =>
                                setRescheduleForm({ ...rescheduleForm, date: ev.target.value })
                              }
                              style={{
                                padding: '7px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                fontFamily: "'Geist Mono', monospace",
                              }}
                            />
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
                            New Time (WAT):
                            <select
                              value={rescheduleForm.time}
                              onChange={(ev) =>
                                setRescheduleForm({ ...rescheduleForm, time: ev.target.value })
                              }
                              style={{
                                padding: '7px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                fontFamily: "'Geist Mono', monospace",
                              }}
                            >
                              {ALL_DASHBOARD_SLOTS.map((s) => (
                                <option key={s} value={s}>
                                  {s} WAT
                                </option>
                              ))}
                            </select>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={rescheduleForm.notifyGuest}
                              onChange={(ev) =>
                                setRescheduleForm({ ...rescheduleForm, notifyGuest: ev.target.checked })
                              }
                            />
                            Email updated confirmation + .ics to guest
                          </label>
                          <button
                            type="button"
                            disabled={rescheduleBusy}
                            onClick={() => handleRescheduleSubmit(b.id)}
                            style={{
                              cursor: 'pointer',
                              background: 'var(--ink, #1E1E1E)',
                              color: 'var(--accent, #D4F534)',
                              border: 'none',
                              borderRadius: '100px',
                              padding: '8px 18px',
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: '11.5px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {rescheduleBusy ? 'Updating…' : 'Confirm New Slot →'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Branded Email Composer */}
                    {isComposerOpen && (
                      <form
                        onSubmit={handleDispatchCustomEmail}
                        style={{
                          background: '#fff',
                          border: '2px solid var(--ink, #1E1E1E)',
                          borderRadius: '14px',
                          padding: '18px',
                          display: 'grid',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                            Send Official Feyron HTML Email · From hello@feyron.site to {b.email}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => openEmailComposerForBooking(b, 'followup')}
                              style={{
                                cursor: 'pointer',
                                background: 'var(--paper, #E7E7E7)',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                borderRadius: '100px',
                                padding: '4px 10px',
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: '10.5px',
                                fontWeight: 700,
                              }}
                            >
                              Template: Call Follow-Up
                            </button>
                            <button
                              type="button"
                              onClick={() => openEmailComposerForBooking(b, 'scope')}
                              style={{
                                cursor: 'pointer',
                                background: 'var(--paper, #E7E7E7)',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                borderRadius: '100px',
                                padding: '4px 10px',
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: '10.5px',
                                fontWeight: 700,
                              }}
                            >
                              Template: Scope &amp; Plan
                            </button>
                            <button
                              type="button"
                              onClick={() => openEmailComposerForBooking(b, 'reschedule')}
                              style={{
                                cursor: 'pointer',
                                background: 'var(--paper, #E7E7E7)',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                borderRadius: '100px',
                                padding: '4px 10px',
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: '10.5px',
                                fontWeight: 700,
                              }}
                            >
                              Template: Reschedule Note
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                          <label style={{ display: 'grid', gap: '4px', fontSize: '12.5px', fontWeight: 700 }}>
                            Subject Line *
                            <input
                              type="text"
                              required
                              value={composerForm.subject}
                              onChange={(ev) =>
                                setComposerForm({ ...composerForm, subject: ev.target.value })
                              }
                              style={{
                                padding: '8px 11px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                fontFamily: 'inherit',
                              }}
                            />
                          </label>
                          <label style={{ display: 'grid', gap: '4px', fontSize: '12.5px', fontWeight: 700 }}>
                            Hero Headline *
                            <input
                              type="text"
                              required
                              value={composerForm.headline}
                              onChange={(ev) =>
                                setComposerForm({ ...composerForm, headline: ev.target.value })
                              }
                              style={{
                                padding: '8px 11px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                fontFamily: 'inherit',
                              }}
                            />
                          </label>
                        </div>

                        <label style={{ display: 'grid', gap: '4px', fontSize: '12.5px', fontWeight: 700 }}>
                          Email Message Body *
                          <textarea
                            rows={4}
                            required
                            value={composerForm.message}
                            onChange={(ev) =>
                              setComposerForm({ ...composerForm, message: ev.target.value })
                            }
                            style={{
                              padding: '9px 11px',
                              borderRadius: '8px',
                              border: '1.5px solid var(--ink, #1E1E1E)',
                              fontFamily: 'inherit',
                            }}
                          />
                        </label>

                        <label style={{ display: 'grid', gap: '4px', fontSize: '12.5px', fontWeight: 700 }}>
                          Callout Box Summary (Optional)
                          <textarea
                            rows={2}
                            value={composerForm.calloutBody}
                            onChange={(ev) =>
                              setComposerForm({ ...composerForm, calloutBody: ev.target.value })
                            }
                            style={{
                              padding: '8px 11px',
                              borderRadius: '8px',
                              border: '1.5px solid var(--ink, #1E1E1E)',
                              fontFamily: 'inherit',
                            }}
                          />
                        </label>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button
                            type="submit"
                            disabled={composerSending}
                            style={{
                              cursor: 'pointer',
                              background: 'var(--ink, #1E1E1E)',
                              color: 'var(--accent, #D4F534)',
                              border: 'none',
                              borderRadius: '100px',
                              padding: '9px 20px',
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: '11.5px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {composerSending ? 'Sending via Resend…' : 'Send Branded Email →'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setComposerTargetId(null)}
                            style={{
                              cursor: 'pointer',
                              background: 'transparent',
                              border: '1.5px solid var(--ink, #1E1E1E)',
                              borderRadius: '100px',
                              padding: '8px 16px',
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Enquiries List */}
      {(activeTab === 'all' || activeTab === 'enquiries' || activeTab === 'waitlist') && (
        <section
          style={{
            background: '#fff',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '24px',
            padding: 'clamp(22px, 3vw, 34px)',
            boxShadow: '6px 6px 0 rgba(30,30,30,0.88)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
            <div>
              <div
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11.5px',
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: activeTab === 'waitlist' ? '#15803d' : '#5a5a48',
                  marginBottom: '8px',
                }}
              >
                {activeTab === 'waitlist' ? 'Products Early-Access · Feyron Team' : 'Incoming Enquiries & Leads'}
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800 }}>
                {activeTab === 'waitlist'
                  ? `Products Waitlist Subscribers (${filteredEnquiries.length})`
                  : `Project & Workflow Enquiries (${filteredEnquiries.length})`}
              </h3>
              {activeTab === 'waitlist' && (
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                  Subscribers queued for private test flight invites, platform chapters, and direct product updates.
                </p>
              )}
            </div>

            {activeTab === 'waitlist' && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setBroadcastOpen(!broadcastOpen)}
                  style={{
                    cursor: 'pointer',
                    background: broadcastOpen ? 'var(--ink, #1E1E1E)' : 'var(--bg, #D4F534)',
                    color: broadcastOpen ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
                    border: '2px solid var(--ink, #1E1E1E)',
                    borderRadius: '100px',
                    padding: '8px 18px',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {broadcastOpen ? 'Close Composer' : `✉ Send Update to Waitlist (${waitlistCount})`}
                </button>
                <button
                  type="button"
                  onClick={handleExportWaitlistCsv}
                  style={{
                    cursor: 'pointer',
                    background: '#fff',
                    color: 'var(--ink, #1E1E1E)',
                    border: '1.5px solid var(--ink, #1E1E1E)',
                    borderRadius: '100px',
                    padding: '8px 16px',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  ⬇ Export CSV
                </button>
              </div>
            )}
          </div>

          {/* Broadcast Composer for Waitlist */}
          {activeTab === 'waitlist' && broadcastOpen && (
            <form
              onSubmit={handleDispatchBroadcast}
              style={{
                background: 'var(--paper, #E7E7E7)',
                border: '2px solid var(--ink, #1E1E1E)',
                borderRadius: '18px',
                padding: '22px',
                marginBottom: '24px',
                display: 'grid',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#15803d', fontWeight: 700 }}>
                    Broadcast Dispatch · From hello@feyron.site
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                    Send Product Update to All {waitlistCount} Subscribers
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setBroadcastForm({
                        subject: 'Feyron Products: Private Preview & Pilot Access',
                        eyebrow: 'Feyron Products · Pilot Chapter',
                        headline: 'Your private test flight link is ready.',
                        message: 'Thank you for joining early access for Feyron Products.\n\nWe have opened a limited test flight chapter for our upcoming workflow tools. You can test the platform and share direct feedback with our team below.',
                        calloutTitle: 'What to Test in this Build',
                        calloutBody: 'Automated dispatch flows, document intelligence, and real-time ledger verification.',
                        ctaLabel: 'Open Private Test Flight',
                        ctaUrl: 'https://feyron.site/work',
                      })
                    }
                    style={{
                      cursor: 'pointer',
                      background: '#fff',
                      border: '1.5px solid var(--ink, #1E1E1E)',
                      borderRadius: '100px',
                      padding: '5px 12px',
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: '10.5px',
                      fontWeight: 700,
                    }}
                  >
                    Preset: Pilot Preview
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBroadcastForm({
                        subject: 'Feyron Products: What we built this chapter',
                        eyebrow: 'Feyron Products · Progress Update',
                        headline: 'Technology that moves work forward.',
                        message: 'Here is our latest update on Feyron Products.\n\nWe have completed our operational dispatch and invoice reconciliation engine, designed to eliminate manual bottlenecks for high-volume workflows.',
                        calloutTitle: 'Milestone Summary',
                        calloutBody: 'Idempotent webhook triggers, real-time ledger matching, and multi-currency billing.',
                        ctaLabel: 'Explore Case Studies',
                        ctaUrl: 'https://feyron.site/work',
                      })
                    }
                    style={{
                      cursor: 'pointer',
                      background: '#fff',
                      border: '1.5px solid var(--ink, #1E1E1E)',
                      borderRadius: '100px',
                      padding: '5px 12px',
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: '10.5px',
                      fontWeight: 700,
                    }}
                  >
                    Preset: Chapter Update
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '5px', fontSize: '13px', fontWeight: 700 }}>
                  Email Subject *
                  <input
                    type="text"
                    required
                    value={broadcastForm.subject}
                    onChange={(ev) => setBroadcastForm({ ...broadcastForm, subject: ev.target.value })}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '2px solid var(--ink, #1E1E1E)',
                      background: '#fff',
                      fontFamily: 'inherit',
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '5px', fontSize: '13px', fontWeight: 700 }}>
                  Eyebrow Category Badge
                  <input
                    type="text"
                    value={broadcastForm.eyebrow}
                    onChange={(ev) => setBroadcastForm({ ...broadcastForm, eyebrow: ev.target.value })}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '2px solid var(--ink, #1E1E1E)',
                      background: '#fff',
                      fontFamily: 'inherit',
                    }}
                  />
                </label>
              </div>

              <label style={{ display: 'grid', gap: '5px', fontSize: '13px', fontWeight: 700 }}>
                Hero Headline
                <input
                  type="text"
                  value={broadcastForm.headline}
                  onChange={(ev) => setBroadcastForm({ ...broadcastForm, headline: ev.target.value })}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '2px solid var(--ink, #1E1E1E)',
                    background: '#fff',
                    fontFamily: 'inherit',
                  }}
                />
              </label>

              <label style={{ display: 'grid', gap: '5px', fontSize: '13px', fontWeight: 700 }}>
                Update Message *
                <textarea
                  rows={4}
                  required
                  value={broadcastForm.message}
                  onChange={(ev) => setBroadcastForm({ ...broadcastForm, message: ev.target.value })}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '2px solid var(--ink, #1E1E1E)',
                    background: '#fff',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                  }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '5px', fontSize: '13px', fontWeight: 700 }}>
                  Callout Title
                  <input
                    type="text"
                    value={broadcastForm.calloutTitle}
                    onChange={(ev) => setBroadcastForm({ ...broadcastForm, calloutTitle: ev.target.value })}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '2px solid var(--ink, #1E1E1E)',
                      background: '#fff',
                      fontFamily: 'inherit',
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '5px', fontSize: '13px', fontWeight: 700 }}>
                  Callout Body
                  <input
                    type="text"
                    value={broadcastForm.calloutBody}
                    onChange={(ev) => setBroadcastForm({ ...broadcastForm, calloutBody: ev.target.value })}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '2px solid var(--ink, #1E1E1E)',
                      background: '#fff',
                      fontFamily: 'inherit',
                    }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '5px', fontSize: '13px', fontWeight: 700 }}>
                  Button Label
                  <input
                    type="text"
                    value={broadcastForm.ctaLabel}
                    onChange={(ev) => setBroadcastForm({ ...broadcastForm, ctaLabel: ev.target.value })}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '2px solid var(--ink, #1E1E1E)',
                      background: '#fff',
                      fontFamily: 'inherit',
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '5px', fontSize: '13px', fontWeight: 700 }}>
                  Button URL
                  <input
                    type="url"
                    value={broadcastForm.ctaUrl}
                    onChange={(ev) => setBroadcastForm({ ...broadcastForm, ctaUrl: ev.target.value })}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '2px solid var(--ink, #1E1E1E)',
                      background: '#fff',
                      fontFamily: 'inherit',
                    }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                <button
                  type="submit"
                  disabled={broadcastSending}
                  style={{
                    cursor: 'pointer',
                    background: 'var(--ink, #1E1E1E)',
                    color: 'var(--accent, #D4F534)',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '10px 24px',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {broadcastSending ? 'Sending via Resend…' : `Send Update to All ${waitlistCount} Subscribers →`}
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastOpen(false)}
                  style={{
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '1.5px solid var(--ink, #1E1E1E)',
                    borderRadius: '100px',
                    padding: '9px 18px',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11.5px',
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {filteredEnquiries.length === 0 ? (
            <div
              style={{
                padding: '22px',
                borderRadius: '16px',
                background: 'var(--paper, #E7E7E7)',
                border: '1.5px solid var(--ink, #1E1E1E)',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '13px',
                color: '#555',
              }}
            >
              No enquiry records match the current filter.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredEnquiries.map((e) => {
                const isComposerOpen = composerTargetId === e.id;
                const currentNoteVal =
                  notesDraft[e.id] !== undefined ? notesDraft[e.id] : e.internalNotes || '';

                return (
                  <div
                    key={e.id}
                    style={{
                      background: 'var(--paper, #E7E7E7)',
                      border: '2px solid var(--ink, #1E1E1E)',
                      borderRadius: '18px',
                      padding: '20px 22px',
                      display: 'grid',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '18.5px', fontWeight: 800 }}>
                          {e.name}{' '}
                          <span style={{ fontWeight: 500, fontSize: '14.5px', color: '#444' }}>
                            ({e.email})
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '12px',
                            color: '#555',
                            marginTop: '4px',
                          }}
                        >
                          {e.interest} · Company: {e.company} · Source: {e.source} ·{' '}
                          {new Date(e.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <select
                        value={e.status}
                        onChange={(ev) =>
                          handleUpdateRecord('enquiry', e.id, { status: ev.target.value as LeadStatus })
                        }
                        style={{
                          padding: '7px 12px',
                          borderRadius: '100px',
                          border: '2px solid var(--ink, #1E1E1E)',
                          background: '#fff',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 700,
                        }}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      style={{
                        background: '#fff',
                        border: '1.5px solid var(--ink, #1E1E1E)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        fontSize: '14.5px',
                        lineHeight: 1.55,
                      }}
                    >
                      {e.details}
                    </div>

                    {/* Internal Team Notes */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <input
                        type="text"
                        value={currentNoteVal}
                        onChange={(ev) =>
                          setNotesDraft((prev) => ({ ...prev, [e.id]: ev.target.value }))
                        }
                        placeholder="Add internal team notes or follow-up log…"
                        style={{
                          flex: '1 1 160px',
                          minWidth: '0',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          background: '#fff',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '12px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateRecord('enquiry', e.id, { internalNotes: currentNoteVal })
                        }
                        style={{
                          cursor: 'pointer',
                          background: '#fff',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '100px',
                          padding: '7px 14px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        Save Note
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isComposerOpen) {
                            setComposerTargetId(null);
                          } else {
                            openEmailComposerForEnquiry(e, 'reply');
                          }
                        }}
                        style={{
                          cursor: 'pointer',
                          background: 'var(--ink, #1E1E1E)',
                          color: 'var(--accent, #D4F534)',
                          border: 'none',
                          borderRadius: '100px',
                          padding: '8px 16px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '.05em',
                        }}
                      >
                        {isComposerOpen ? 'Close Composer' : 'Send Branded Reply →'}
                      </button>
                      <a
                        href={`mailto:${e.email}?subject=${encodeURIComponent(`Following up on your Feyron enquiry — ${e.interest}`)}`}
                        style={{
                          background: '#fff',
                          color: 'var(--ink, #1E1E1E)',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '100px',
                          padding: '7px 14px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          textTransform: 'uppercase',
                        }}
                      >
                        Open Mail App
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('materials');
                        }}
                        style={{
                          cursor: 'pointer',
                          background: '#FAF9F5',
                          color: '#1E1E1E',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '100px',
                          padding: '7px 14px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        📄 Milestones &amp; Docs →
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord('enquiry', e.id, e.email)}
                        style={{
                          cursor: 'pointer',
                          background: 'transparent',
                          color: '#666',
                          border: '1.5px solid rgba(30,30,30,0.45)',
                          borderRadius: '100px',
                          padding: '7px 13px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    {/* Inline Branded Email Composer for Enquiry */}
                    {isComposerOpen && (
                      <form
                        onSubmit={handleDispatchCustomEmail}
                        style={{
                          background: '#fff',
                          border: '2px solid var(--ink, #1E1E1E)',
                          borderRadius: '14px',
                          padding: '18px',
                          display: 'grid',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                            Send Official Feyron HTML Email · From hello@feyron.site to {e.email}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => openEmailComposerForEnquiry(e, 'reply')}
                              style={{
                                cursor: 'pointer',
                                background: 'var(--paper, #E7E7E7)',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                borderRadius: '100px',
                                padding: '4px 10px',
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: '10.5px',
                                fontWeight: 700,
                              }}
                            >
                              Template: Direct Reply
                            </button>
                            <button
                              type="button"
                              onClick={() => openEmailComposerForEnquiry(e, 'scope')}
                              style={{
                                cursor: 'pointer',
                                background: 'var(--paper, #E7E7E7)',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                borderRadius: '100px',
                                padding: '4px 10px',
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: '10.5px',
                                fontWeight: 700,
                              }}
                            >
                              Template: Scope &amp; Proposal
                            </button>
                            <button
                              type="button"
                              onClick={() => openEmailComposerForEnquiry(e, 'invite')}
                              style={{
                                cursor: 'pointer',
                                background: 'var(--paper, #E7E7E7)',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                borderRadius: '100px',
                                padding: '4px 10px',
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: '10.5px',
                                fontWeight: 700,
                              }}
                            >
                              Template: Invite to 20-Min Call
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                          <label style={{ display: 'grid', gap: '4px', fontSize: '12.5px', fontWeight: 700 }}>
                            Subject Line *
                            <input
                              type="text"
                              required
                              value={composerForm.subject}
                              onChange={(ev) =>
                                setComposerForm({ ...composerForm, subject: ev.target.value })
                              }
                              style={{
                                padding: '8px 11px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                fontFamily: 'inherit',
                              }}
                            />
                          </label>
                          <label style={{ display: 'grid', gap: '4px', fontSize: '12.5px', fontWeight: 700 }}>
                            Hero Headline *
                            <input
                              type="text"
                              required
                              value={composerForm.headline}
                              onChange={(ev) =>
                                setComposerForm({ ...composerForm, headline: ev.target.value })
                              }
                              style={{
                                padding: '8px 11px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--ink, #1E1E1E)',
                                fontFamily: 'inherit',
                              }}
                            />
                          </label>
                        </div>

                        <label style={{ display: 'grid', gap: '4px', fontSize: '12.5px', fontWeight: 700 }}>
                          Email Message Body *
                          <textarea
                            rows={4}
                            required
                            value={composerForm.message}
                            onChange={(ev) =>
                              setComposerForm({ ...composerForm, message: ev.target.value })
                            }
                            style={{
                              padding: '9px 11px',
                              borderRadius: '8px',
                              border: '1.5px solid var(--ink, #1E1E1E)',
                              fontFamily: 'inherit',
                            }}
                          />
                        </label>

                        <label style={{ display: 'grid', gap: '4px', fontSize: '12.5px', fontWeight: 700 }}>
                          Callout Box Summary (Optional)
                          <textarea
                            rows={2}
                            value={composerForm.calloutBody}
                            onChange={(ev) =>
                              setComposerForm({ ...composerForm, calloutBody: ev.target.value })
                            }
                            style={{
                              padding: '8px 11px',
                              borderRadius: '8px',
                              border: '1.5px solid var(--ink, #1E1E1E)',
                              fontFamily: 'inherit',
                            }}
                          />
                        </label>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button
                            type="submit"
                            disabled={composerSending}
                            style={{
                              cursor: 'pointer',
                              background: 'var(--ink, #1E1E1E)',
                              color: 'var(--accent, #D4F534)',
                              border: 'none',
                              borderRadius: '100px',
                              padding: '9px 20px',
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: '11.5px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {composerSending ? 'Sending via Resend…' : 'Send Branded Email →'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setComposerTargetId(null)}
                            style={{
                              cursor: 'pointer',
                              background: 'transparent',
                              border: '1.5px solid var(--ink, #1E1E1E)',
                              borderRadius: '100px',
                              padding: '8px 16px',
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

