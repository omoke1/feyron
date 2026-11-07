import React, { useEffect, useState } from 'react';

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
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
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

export function TeamDashboardSection() {
  const [passcode, setPasscode] = useState<string>(() => {
    try {
      return sessionStorage.getItem('feyron-dashboard-code') || '';
    } catch {
      return '';
    }
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [enquiries, setEnquiries] = useState<DashboardEnquiry[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'bookings' | 'enquiries' | 'waitlist'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

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
        setFeedbackMsg('Record updated.');
        setTimeout(() => setFeedbackMsg(''), 2200);
      }
    } catch {
      // ignore
    }
  };

  const handleSendReminder = async (bookingId: string) => {
    setFeedbackMsg('Sending reminder email…');
    try {
      const res = await fetch('/api/dashboard/remind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-feyron-passcode': passcode,
        },
        body: JSON.stringify({ id: bookingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, reminderSent: true } : b))
        );
        setFeedbackMsg('Session reminder dispatched to guest.');
      } else {
        setFeedbackMsg(data.error || 'Could not dispatch reminder.');
      }
    } catch {
      setFeedbackMsg('Could not dispatch reminder.');
    }
    setTimeout(() => setFeedbackMsg(''), 3000);
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
          Enter the Feyron operations passcode to view booked calls, manage incoming enquiries and trigger session reminders.
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
          <div>
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
      e.details.toLowerCase().includes(q)
    );
  });

  const waitlistCount = enquiries.filter(
    (e) => e.source === 'products-waitlist' || e.interest === 'Products Waitlist'
  ).length;

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
              Live Pipeline · feyron.site
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800 }}>
              Overview &amp; Controls
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Records' },
              { id: 'bookings', label: `Bookings (${bookings.length})` },
              { id: 'enquiries', label: `Enquiries (${enquiries.length})` },
              { id: 'waitlist', label: `Waitlist (${waitlistCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  cursor: 'pointer',
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
              placeholder="Search name, email, company…"
              style={{
                padding: '9px 16px',
                borderRadius: '100px',
                border: '2px solid var(--ink, #1E1E1E)',
                background: 'var(--paper, #E7E7E7)',
                fontFamily: 'inherit',
                fontSize: '14px',
                minWidth: '220px',
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
            Workflow Audit Bookings ({filteredBookings.length})
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
              {filteredBookings.map((b) => (
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
                      onClick={() => handleSendReminder(b.id)}
                      style={{
                        cursor: 'pointer',
                        background: b.reminderSent ? '#fff' : 'var(--bg, #D4F534)',
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
                      {b.reminderSent ? 'Resend Reminder Email' : 'Send 2h Reminder Email'}
                    </button>
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
                    {b.outlookUrl && (
                      <a
                        href={b.outlookUrl}
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
                        + Outlook
                      </a>
                    )}
                    <a
                      href={`mailto:${b.email}?subject=${encodeURIComponent(`Your Feyron workflow audit — ${b.formattedDate}`)}`}
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
                      Email Guest
                    </a>
                  </div>
                </div>
              ))}
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
            Incoming Enquiries &amp; Leads
          </div>
          <h3 style={{ margin: '0 0 18px', fontSize: '22px', fontWeight: 800 }}>
            Project &amp; Workflow Enquiries ({filteredEnquiries.length})
          </h3>

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
              {filteredEnquiries.map((e) => (
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

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <a
                      href={`mailto:${e.email}?subject=${encodeURIComponent(`Following up on your Feyron enquiry — ${e.interest}`)}`}
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
                      Reply via Email →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
