import React, { useState, useEffect } from 'react';
import {
  pipelineEngine,
  PipelineState,
  isWithinWatSendWindow,
  getWatDate,
} from '../agent/pipelineEngine';
import {
  ProspectRecord,
  ApprovalQueueItem,
  IssueMap,
  ProposalRecord,
  CallSummary,
  MeetingRecord,
  BillingRecord,
  DealRecord,
  AgentName,
  PipelineStage,
} from '../agent/types';

interface AgentWorkflowStudioProps {
  passcode: string;
  showToast: (msg: string) => void;
}

export function AgentWorkflowStudio({ passcode, showToast }: AgentWorkflowStudioProps) {
  const [state, setState] = useState<PipelineState>(() => pipelineEngine.getState());
  const [selectedProspect, setSelectedProspect] = useState<ProspectRecord | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'scout' | 'board' | 'scenarios' | 'history' | 'settings'>('scout');
  const [watInfo, setWatInfo] = useState(() => isWithinWatSendWindow());
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [lastScenarioResult, setLastScenarioResult] = useState<any | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editedDraftText, setEditedDraftText] = useState<string>('');
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  // Active Lead Scout & Hunter States
  const [scoutSector, setScoutSector] = useState('Third-party Logistics & Haulage');
  const [scoutLocation, setScoutLocation] = useState('Lagos, Nigeria');
  const [scoutKeywords, setScoutKeywords] = useState('');
  const [scoutCustomCompanies, setScoutCustomCompanies] = useState('');
  const [scoutCount, setScoutCount] = useState<number>(3);
  const [isScouting, setIsScouting] = useState(false);
  const [scoutResults, setScoutResults] = useState<any[]>([]);
  const [csvInput, setCsvInput] = useState('');
  const [showCsvBox, setShowCsvBox] = useState(false);

  // Firecrawl Deep URL Scraper States
  const [firecrawlUrl, setFirecrawlUrl] = useState('');
  const [isFirecrawling, setIsFirecrawling] = useState(false);
  const [firecrawlData, setFirecrawlData] = useState<any | null>(null);
  const [showFirecrawlBox, setShowFirecrawlBox] = useState(false);

  // Update WAT clock every 10 seconds
  useEffect(() => {
    const unsub = pipelineEngine.subscribe((newState) => {
      setState({ ...newState });
    });
    const timer = setInterval(() => {
      setWatInfo(isWithinWatSendWindow());
    }, 10000);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const pendingQueue = state.approvalQueue.filter((q) => q.status === 'pending');

  const handleApprove = async (item: ApprovalQueueItem) => {
    setActionBusy(item.id);
    const draft = editingDraftId === item.id ? editedDraftText : item.draft_body;
    
    // Attempt live server dispatch
    try {
      await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-feyron-passcode': passcode,
        },
        body: JSON.stringify({
          action: 'dispatch_approved_email',
          payload: {
            to: item.proposed_destination,
            subject: item.draft_subject,
            bodyText: draft,
            prospectId: item.prospect_id,
            queueId: item.id,
          },
        }),
      });
    } catch {
      // client-side pipeline will continue
    }

    const res = pipelineEngine.approveQueueItem(item.id, draft);
    setActionBusy(null);
    setEditingDraftId(null);
    showToast(res.message);
  };

  const handleReject = (item: ApprovalQueueItem) => {
    const reason = window.prompt('Reason for rejecting or suppressing this action:', 'Not suitable for current pipeline stage.');
    if (reason === null) return;
    const res = pipelineEngine.rejectQueueItem(item.id, reason);
    showToast(res.message);
  };

  const handleTogglePause = () => {
    const paused = pipelineEngine.toggleEmergencyPause();
    showToast(paused ? 'Emergency Kill Switch ENGAGED. All outbound locked.' : 'Emergency pause RELEASED.');
  };

  const handleRunScenario = (scId: string) => {
    setRunningScenario(scId);
    try {
      const res = pipelineEngine.runScenario(scId);
      setLastScenarioResult(res);
      showToast(`Scenario ${scId} completed: ${res.outcome}`);
    } finally {
      setRunningScenario(null);
    }
  };

  const handleSwitchAutonomy = (actionKey: any) => {
    const current = (state.autonomy as any)[actionKey];
    const next = current === 'APPROVE' ? 'AUTO' : 'APPROVE';
    pipelineEngine.updateAutonomySetting(actionKey, next);
    showToast(`Autonomy for ${actionKey} set to ${next}`);
  };

  const handleRunScout = async () => {
    if (state.autonomy.paused) {
      showToast('System paused. Release Emergency Kill Switch to scout.');
      return;
    }
    setIsScouting(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-feyron-passcode': passcode,
        },
        body: JSON.stringify({
          action: 'scout_and_qualify',
          payload: {
            sector: scoutSector,
            location: scoutLocation,
            keywords: scoutKeywords,
            customCompanies: scoutCustomCompanies,
            count: scoutCount,
          },
        }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.leads) && data.leads.length > 0) {
        setScoutResults(data.leads);
        pipelineEngine.batchIngestProspects(data.leads);
        showToast(`Scout Agent identified and queued ${data.leads.length} high-priority leads!`);
      } else {
        showToast(data.error || 'No leads returned from scout.');
      }
    } catch (e: any) {
      showToast(`Scout error: ${e.message}`);
    } finally {
      setIsScouting(false);
    }
  };

  const handleImportCsv = () => {
    if (!csvInput.trim()) {
      showToast('Please paste company names or CSV lines.');
      return;
    }
    const lines = csvInput.trim().split(/\r?\n/);
    const parsedLeads: any[] = [];
    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts[0]) {
        parsedLeads.push({
          company_name: parts[0],
          industry: parts[1] || scoutSector,
          location: parts[2] || scoutLocation,
          contact_name: parts[3] || 'Decision Maker',
          verified_channel: parts[4] || 'operations@feyron.site',
          icp_score: 85,
          draft_subject: `Automating operational workflows at ${parts[0]}`,
          draft_body: `Dear Decision Maker,\n\nI reviewed ${parts[0]}'s public client channels and noticed opportunities to eliminate manual processing delays.\n\nAt Feyron, we engineer automated enterprise workflows that route requests instantly without phone calls or paper trails.\n\nWould you be open to a 20-minute discussion this Thursday at 14:00 WAT to review the architecture?\n\nKind regards,\nFredrick Omoke\nFeyron AI Productivity & Technology`,
        });
      }
    }
    if (parsedLeads.length > 0) {
      pipelineEngine.batchIngestProspects(parsedLeads);
      showToast(`Imported and queued ${parsedLeads.length} leads.`);
      setCsvInput('');
      setShowCsvBox(false);
    }
  };

  const handleFirecrawlScrape = async () => {
    if (!firecrawlUrl.trim()) {
      showToast('Please enter a website URL to scrape with Firecrawl.');
      return;
    }
    setIsFirecrawling(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-feyron-passcode': passcode,
        },
        body: JSON.stringify({
          action: 'firecrawl_scrape',
          payload: { url: firecrawlUrl },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setFirecrawlData(data);
        showToast(`Firecrawl successfully scraped ${data.url}!`);
      } else {
        showToast(data.error || 'Failed to scrape URL with Firecrawl.');
      }
    } catch (e: any) {
      showToast(`Firecrawl error: ${e.message}`);
    } finally {
      setIsFirecrawling(false);
    }
  };

  const handleConvertFirecrawlToLead = () => {
    if (!firecrawlData) return;
    const company = firecrawlData.title?.split(/[-|·]/)[0]?.trim() || firecrawlUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    const newLead = {
      company_name: company,
      industry: scoutSector,
      location: scoutLocation,
      website_or_source: firecrawlData.url,
      contact_name: 'Decision Maker',
      contact_title: 'Head of Operations',
      verified_channel: firecrawlData.emails?.[0] || 'operations@feyron.site',
      icp_score: 94,
      notes: `Scraped by Firecrawl: ${firecrawlData.description || 'Verified enterprise site'}`,
      signals_observed: firecrawlData.signals && firecrawlData.signals.length > 0 ? firecrawlData.signals : ['Manual customer intake workflows observed on public website.'],
      hypotheses: ['Operational delays handling customer requests without automated dispatch.'],
      recommended_package: 'CORE_SYSTEM',
      draft_subject: `Automating operational intake and dispatch at ${company}`,
      draft_body: `Dear Operations Lead,\n\nI reviewed ${company}'s public client portal and noticed opportunities to eliminate manual coordination delays.\n\nAt Feyron, we engineer automated enterprise workflows that route incoming client requests directly into core systems without spreadsheet lag or phone calls.\n\nWould you be open to a 20-minute discussion this Thursday at 14:00 WAT to see how this works?\n\nKind regards,\nFredrick Omoke\nFeyron AI Productivity & Technology`,
    };
    pipelineEngine.ingestScoutedProspect(newLead);
    showToast(`Converted ${company} into queued lead via Firecrawl!`);
    setFirecrawlData(null);
    setFirecrawlUrl('');
    setShowFirecrawlBox(false);
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: '20px',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Autonomy & WAT Live Control Banner */}
      <div
        style={{
          background: state.autonomy.paused ? '#FFE8E8' : '#FAF9F5',
          border: `2.5px solid ${state.autonomy.paused ? '#D32F2F' : 'var(--ink, #1E1E1E)'}`,
          borderRadius: '20px',
          padding: '20px 24px',
          boxShadow: state.autonomy.paused ? '4px 4px 0 #D32F2F' : '4px 4px 0 rgba(30,30,30,0.9)',
          display: 'grid',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11px',
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: state.autonomy.paused ? '#D32F2F' : '#6b6b55',
                fontWeight: 700,
                marginBottom: '4px',
              }}
            >
              Feyron Sales Workflow Engine · 9 Autonomous Roles
            </div>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)',
                fontWeight: 800,
                letterSpacing: '-.02em',
                color: 'var(--ink, #1E1E1E)',
              }}
            >
              Autonomous Pipeline &amp; Human Approval Queue
            </h2>
          </div>

          {/* Kill Switch & Send Window Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '100px',
                border: '2px solid var(--ink, #1E1E1E)',
                background: watInfo.inWindow ? 'var(--accent, #D4F534)' : '#FAF9F5',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--ink, #1E1E1E)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: watInfo.inWindow ? '#1E1E1E' : '#B33A3A',
                }}
              />
              {watInfo.formattedWat} · {watInfo.inWindow ? 'WINDOW OPEN' : 'WINDOW CLOSED'}
            </div>

            <button
              type="button"
              onClick={handleTogglePause}
              style={{
                cursor: 'pointer',
                border: '2px solid var(--ink, #1E1E1E)',
                borderRadius: '100px',
                padding: '8px 18px',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                fontWeight: 800,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                background: state.autonomy.paused ? '#D32F2F' : 'var(--ink, #1E1E1E)',
                color: state.autonomy.paused ? '#fff' : 'var(--accent, #D4F534)',
                boxShadow: '2px 2px 0 rgba(30,30,30,0.8)',
              }}
            >
              {state.autonomy.paused ? 'RESUME WORKFLOW AGENTS' : 'EMERGENCY KILL SWITCH'}
            </button>
          </div>
        </div>

        {state.autonomy.paused && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '2px solid #D32F2F',
              background: '#FFEBEE',
              color: '#B71C1C',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            KILL SWITCH ACTIVE: All autonomous agent actions are blocked. Zero cold emails, proposals, or touches can be dispatched.
          </div>
        )}

        {/* Live Counters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
            paddingTop: '6px',
          }}
        >
          <div
            style={{
              border: '1.5px solid var(--ink, #1E1E1E)',
              background: '#fff',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>
              Pending Approvals
            </div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '24px', fontWeight: 800 }}>
              {pendingQueue.length}
            </div>
          </div>

          <div
            style={{
              border: '1.5px solid var(--ink, #1E1E1E)',
              background: '#fff',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>
              Cold Outreach Today
            </div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '24px', fontWeight: 800 }}>
              {state.limits.cold_outreach_sent_today} / {state.limits.daily_outreach_limit}
            </div>
          </div>

          <div
            style={{
              border: '1.5px solid var(--ink, #1E1E1E)',
              background: '#fff',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>
              Scouted Leads Today
            </div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '24px', fontWeight: 800 }}>
              {state.limits.scouted_today} / {state.limits.daily_scout_limit}
            </div>
          </div>

          <div
            style={{
              border: '1.5px solid var(--ink, #1E1E1E)',
              background: '#fff',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>
              Active Pipeline Prospects
            </div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '24px', fontWeight: 800 }}>
              {state.prospects.length}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        className="feyron-mobile-scroll"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          maxWidth: '100%',
        }}
      >
        {[
          { id: 'scout', label: 'Lead Scout & Hunter (Google AI)' },
          { id: 'queue', label: `Approval Queue (${pendingQueue.length})` },
          { id: 'board', label: `Pipeline Board (${state.prospects.length})` },
          { id: 'scenarios', label: '20 Test Scenarios (Section 15)' },
          { id: 'history', label: `Audit Log (${state.historyLogs.length})` },
          { id: 'settings', label: 'Autonomy Switches & Limits' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id as any)}
            style={{
              cursor: 'pointer',
              flexShrink: 0,
              minHeight: '40px',
              border: '2px solid var(--ink, #1E1E1E)',
              borderRadius: '100px',
              padding: '8px 18px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              background: activeSubTab === tab.id ? 'var(--ink, #1E1E1E)' : 'var(--paper, #E7E7E7)',
              color: activeSubTab === tab.id ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
              boxShadow: activeSubTab === tab.id ? '3px 3px 0 rgba(30,30,30,0.8)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 1. APPROVAL QUEUE TAB                                              */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'queue' && (
        <section
          style={{
            background: '#fff',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '4px 4px 0 rgba(30,30,30,0.9)',
            display: 'grid',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>
                Human-in-the-Loop Gate
              </div>
              <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '20px', fontWeight: 800 }}>
                Pending Action Requests &amp; Reply Drafts
              </h3>
            </div>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                background: 'var(--paper, #E7E7E7)',
                padding: '4px 10px',
                borderRadius: '100px',
                border: '1.5px solid var(--ink, #1E1E1E)',
              }}
            >
              1-Click Human Authority
            </span>
          </div>

          {pendingQueue.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: '#FAF9F5',
                borderRadius: '16px',
                border: '1.5px dashed var(--ink, #1E1E1E)',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '13px',
                color: '#666',
              }}
            >
              No pending approval cards in queue. All agents are idle or running within automated thresholds.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {pendingQueue.map((item) => {
                const prospect = state.prospects.find((p) => p.prospect_id === item.prospect_id);
                const isEditing = editingDraftId === item.id;

                return (
                  <div
                    key={item.id}
                    style={{
                      border: '2px solid var(--ink, #1E1E1E)',
                      borderRadius: '16px',
                      background: '#FAF9F5',
                      padding: '20px',
                      boxShadow: '3px 3px 0 rgba(30,30,30,0.85)',
                      display: 'grid',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '11px',
                            fontWeight: 800,
                            background: 'var(--ink, #1E1E1E)',
                            color: 'var(--accent, #D4F534)',
                            padding: '4px 10px',
                            borderRadius: '100px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {item.agent}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '11px',
                            fontWeight: 700,
                            background: 'var(--paper, #E7E7E7)',
                            color: 'var(--ink, #1E1E1E)',
                            padding: '4px 10px',
                            borderRadius: '100px',
                            border: '1px solid var(--ink, #1E1E1E)',
                          }}
                        >
                          Action: {item.action_type}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '11px',
                            color: '#666',
                          }}
                        >
                          {new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} WAT
                        </span>
                      </div>

                      <div
                        style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 700,
                          background: item.confidence_score >= 90 ? 'var(--accent, #D4F534)' : '#FFE082',
                          color: 'var(--ink, #1E1E1E)',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                        }}
                      >
                        Confidence: {item.confidence_score}%
                      </div>
                    </div>

                    {/* Target Prospect Metadata */}
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#fff',
                        borderRadius: '10px',
                        border: '1.5px solid var(--ink, #1E1E1E)',
                        fontSize: '12.5px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <strong>Company:</strong> {prospect ? prospect.company_name : item.prospect_id}
                        {prospect?.contact_name && ` (${prospect.contact_name})`}
                      </div>
                      <div style={{ fontFamily: "'Geist Mono', monospace" }}>
                        <strong>Channel:</strong> {item.proposed_destination || prospect?.verified_channel || 'N/A'}
                      </div>
                    </div>

                    {/* Observed Facts */}
                    <div style={{ fontSize: '13px', lineHeight: 1.5, color: '#333' }}>
                      <strong style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>
                        Observed Facts:
                      </strong>
                      <p style={{ margin: '4px 0 0 0', background: 'var(--paper, #E7E7E7)', padding: '8px 12px', borderRadius: '8px' }}>
                        {item.observed_facts}
                      </p>
                    </div>

                    {/* Draft Preview / Inline Editor */}
                    <div style={{ display: 'grid', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>
                          Subject: <strong>{item.draft_subject}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditing) {
                              setEditingDraftId(null);
                            } else {
                              setEditingDraftId(item.id);
                              setEditedDraftText(item.draft_body);
                            }
                          }}
                          style={{
                            cursor: 'pointer',
                            background: 'transparent',
                            border: 'none',
                            textDecoration: 'underline',
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--ink, #1E1E1E)',
                          }}
                        >
                          {isEditing ? 'Cancel Edit' : 'Edit Copy'}
                        </button>
                      </div>

                      {isEditing ? (
                        <textarea
                          rows={8}
                          value={editedDraftText}
                          onChange={(e) => setEditedDraftText(e.target.value)}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '2px solid var(--ink, #1E1E1E)',
                            fontFamily: 'inherit',
                            fontSize: '13px',
                            lineHeight: 1.5,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            padding: '14px',
                            borderRadius: '10px',
                            border: '1.5px solid var(--ink, #1E1E1E)',
                            background: '#fff',
                            fontFamily: 'inherit',
                            fontSize: '13px',
                            lineHeight: 1.55,
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {item.draft_body}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleReject(item)}
                        style={{
                          cursor: 'pointer',
                          padding: '9px 18px',
                          borderRadius: '100px',
                          border: '2px solid var(--ink, #1E1E1E)',
                          background: 'var(--paper, #E7E7E7)',
                          color: 'var(--ink, #1E1E1E)',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        Reject / Dismiss
                      </button>

                      <button
                        type="button"
                        disabled={actionBusy === item.id || state.autonomy.paused}
                        onClick={() => handleApprove(item)}
                        style={{
                          cursor: actionBusy === item.id || state.autonomy.paused ? 'not-allowed' : 'pointer',
                          padding: '9px 22px',
                          borderRadius: '100px',
                          border: '2px solid var(--ink, #1E1E1E)',
                          background: state.autonomy.paused ? '#ccc' : 'var(--accent, #D4F534)',
                          color: 'var(--ink, #1E1E1E)',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11.5px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          boxShadow: '2px 2px 0 var(--ink, #1E1E1E)',
                        }}
                      >
                        {actionBusy === item.id ? 'Dispatching...' : 'Approve & Dispatch'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 1.5. ACTIVE LEAD SCOUT & HUNTER TAB (GOOGLE AI)                    */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'scout' && (
        <section
          style={{
            background: '#fff',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '4px 4px 0 rgba(30,30,30,0.9)',
            display: 'grid',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>
                Autonomous Lead Acquisition · Scout Agent
              </div>
              <h3 style={{ margin: '4px 0 0 0', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '22px', fontWeight: 800 }}>
                Google AI Lead Hunter &amp; Market Scout
              </h3>
              <p style={{ margin: '4px 0 0 0', fontFamily: "'Geist Mono', monospace", fontSize: '12px', color: '#666' }}>
                Scouts target companies, identifies operational friction points, scores ICP (0-100), and auto-drafts compliant Touch 1 emails.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowFirecrawlBox(!showFirecrawlBox)}
                style={{
                  cursor: 'pointer',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 700,
                  background: showFirecrawlBox ? 'var(--accent, #D4F534)' : '#FAF9F5',
                  color: 'var(--ink, #1E1E1E)',
                }}
              >
                {showFirecrawlBox ? 'Close Firecrawl Inspector' : 'Firecrawl URL Inspector'}
              </button>
              <button
                type="button"
                onClick={() => setShowCsvBox(!showCsvBox)}
                style={{
                  cursor: 'pointer',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 700,
                  background: showCsvBox ? 'var(--ink, #1E1E1E)' : 'var(--paper, #E7E7E7)',
                  color: showCsvBox ? '#fff' : 'var(--ink, #1E1E1E)',
                }}
              >
                {showCsvBox ? 'Close CSV Importer' : '+ Bulk Paste CSV Leads'}
              </button>
            </div>
          </div>

          {showFirecrawlBox && (
            <div
              style={{
                border: '2px solid var(--ink, #1E1E1E)',
                borderRadius: '14px',
                padding: '18px',
                background: '#FAF9F5',
                display: 'grid',
                gap: '12px',
                boxShadow: '3px 3px 0 rgba(30,30,30,0.85)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '16px', fontWeight: 800 }}>
                  Firecrawl Deep URL Web Scraper &amp; Signal Extractor
                </div>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '10px',
                    fontWeight: 700,
                    background: 'var(--accent, #D4F534)',
                    color: 'var(--ink, #1E1E1E)',
                    padding: '2px 8px',
                    borderRadius: '100px',
                    border: '1px solid var(--ink, #1E1E1E)',
                  }}
                >
                  Firecrawl v4
                </span>
              </div>
              <p style={{ margin: 0, fontFamily: "'Geist Mono', monospace", fontSize: '11.5px', color: '#555' }}>
                Enter any target company website URL. Firecrawl crawls the page, cleans it into LLM-ready markdown, detects contact emails, and flags operational bottlenecks.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={firecrawlUrl}
                  onChange={(e) => setFirecrawlUrl(e.target.value)}
                  placeholder="e.g. https://apexhaulage.example.ng or company domain"
                  style={{
                    flex: '1 1 280px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--ink, #1E1E1E)',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    background: '#fff',
                  }}
                />
                <button
                  type="button"
                  onClick={handleFirecrawlScrape}
                  disabled={isFirecrawling}
                  style={{
                    cursor: isFirecrawling ? 'wait' : 'pointer',
                    background: isFirecrawling ? '#ccc' : 'var(--ink, #1E1E1E)',
                    color: 'var(--accent, #D4F534)',
                    border: '1.5px solid var(--ink, #1E1E1E)',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  {isFirecrawling ? 'Firecrawling...' : 'Scrape Website'}
                </button>
              </div>

              {firecrawlData && (
                <div style={{ background: '#fff', border: '1.5px solid var(--ink, #1E1E1E)', borderRadius: '10px', padding: '14px', display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '15px', fontWeight: 800 }}>
                        {firecrawlData.title || firecrawlData.url}
                      </div>
                      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: '#666' }}>
                        {firecrawlData.url} · Engine: {firecrawlData.engine}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleConvertFirecrawlToLead}
                      style={{
                        cursor: 'pointer',
                        background: 'var(--accent, #D4F534)',
                        color: 'var(--ink, #1E1E1E)',
                        border: '1.5px solid var(--ink, #1E1E1E)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      Convert to Queued Lead →
                    </button>
                  </div>

                  {firecrawlData.emails && firecrawlData.emails.length > 0 && (
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px' }}>
                      <span style={{ fontWeight: 700 }}>Discovered Contact Emails: </span>
                      {firecrawlData.emails.join(', ')}
                    </div>
                  )}

                  {firecrawlData.signals && firecrawlData.signals.length > 0 && (
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px' }}>
                      <span style={{ fontWeight: 700, color: '#B71C1C' }}>Detected Friction Points: </span>
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                        {firecrawlData.signals.map((sig: string, sIdx: number) => (
                          <li key={sIdx}>{sig}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', textTransform: 'uppercase', color: '#666', fontWeight: 700, marginBottom: '4px' }}>
                      Clean Markdown Excerpt:
                    </div>
                    <div
                      style={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: '10.5px',
                        color: '#333',
                        background: '#FAF9F5',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #eee',
                        maxHeight: '130px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {firecrawlData.markdown?.slice(0, 1500)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {showCsvBox && (
            <div
              style={{
                border: '2px dashed var(--ink, #1E1E1E)',
                borderRadius: '14px',
                padding: '16px',
                background: '#FAF9F5',
                display: 'grid',
                gap: '10px',
              }}
            >
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 700 }}>
                Paste CSV or line-separated leads (Format: Company, Sector, Location, Contact Name, Email):
              </div>
              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                rows={4}
                placeholder="Metro Swift, Logistics, Lagos, Emeka Nnamdi, operations@metroswift.ng&#10;Crestview Real Estate, Property, Abuja, Amina Bello, amina@crestview.ng"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '12px',
                  background: '#fff',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleImportCsv}
                  style={{
                    cursor: 'pointer',
                    background: 'var(--ink, #1E1E1E)',
                    color: 'var(--accent, #D4F534)',
                    border: '1.5px solid var(--ink, #1E1E1E)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  Import and Queue Leads
                </button>
              </div>
            </div>
          )}

          {/* Scout Parameters Form */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              background: '#FAF9F5',
              padding: '16px',
              borderRadius: '16px',
              border: '1.5px solid var(--ink, #1E1E1E)',
            }}
          >
            <div>
              <label style={{ display: 'block', fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Target Sector / Industry
              </label>
              <select
                value={scoutSector}
                onChange={(e) => setScoutSector(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '12px',
                  background: '#fff',
                }}
              >
                <option value="Third-party Logistics & Haulage">Third-party Logistics &amp; Haulage</option>
                <option value="Commercial Real Estate & Facilities">Commercial Real Estate &amp; Facilities</option>
                <option value="Fintech, Lending & Payments">Fintech, Lending &amp; Payments</option>
                <option value="Healthcare, Clinics & Diagnostic Labs">Healthcare, Clinics &amp; Diagnostic Labs</option>
                <option value="E-commerce, Brands & D2C Fulfillment">E-commerce &amp; D2C Fulfillment</option>
                <option value="Legal, Tax & Accounting Practices">Legal, Tax &amp; Accounting Practices</option>
                <option value="Hospitality & Chain Operations">Hospitality &amp; Chain Operations</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Target Location / Market
              </label>
              <select
                value={scoutLocation}
                onChange={(e) => setScoutLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '12px',
                  background: '#fff',
                }}
              >
                <option value="Lagos, Nigeria">Lagos, Nigeria</option>
                <option value="Abuja, FCT, Nigeria">Abuja, FCT, Nigeria</option>
                <option value="Port Harcourt, Rivers, Nigeria">Port Harcourt, Nigeria</option>
                <option value="Accra, Ghana">Accra, Ghana</option>
                <option value="Nairobi, Kenya">Nairobi, Kenya</option>
                <option value="London, United Kingdom">London, United Kingdom</option>
                <option value="Global / Remote">Global / Remote</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Operational Friction Keywords
              </label>
              <input
                type="text"
                value={scoutKeywords}
                onChange={(e) => setScoutKeywords(e.target.value)}
                placeholder="e.g. manual dispatch, broken form, paper waybill"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '12px',
                  background: '#fff',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Target Companies or Domains (Optional)
              </label>
              <input
                type="text"
                value={scoutCustomCompanies}
                onChange={(e) => setScoutCustomCompanies(e.target.value)}
                placeholder="e.g. apexhaulage.ng, speedaf.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '12px',
                  background: '#fff',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ flex: '0 0 80px' }}>
                <label style={{ display: 'block', fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Count
                </label>
                <select
                  value={scoutCount}
                  onChange={(e) => setScoutCount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 6px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--ink, #1E1E1E)',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    background: '#fff',
                  }}
                >
                  <option value={1}>1 lead</option>
                  <option value={3}>3 leads</option>
                  <option value={5}>5 leads</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleRunScout}
                disabled={isScouting}
                style={{
                  flex: 1,
                  cursor: isScouting ? 'wait' : 'pointer',
                  border: '2px solid var(--ink, #1E1E1E)',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  background: isScouting ? '#bbb' : 'var(--accent, #D4F534)',
                  color: 'var(--ink, #1E1E1E)',
                  boxShadow: '2px 2px 0 var(--ink, #1E1E1E)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  minHeight: '38px',
                }}
              >
                {isScouting ? 'Scouting Google AI...' : 'Launch Scout Agent'}
              </button>
            </div>
          </div>

          {/* Quick-Preset Recommendations */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: '#666', fontWeight: 700 }}>
              Quick Presets:
            </span>
            {[
              { label: 'Lagos Logistics (Apex / Freight)', sector: 'Third-party Logistics & Haulage', location: 'Lagos, Nigeria' },
              { label: 'Abuja Real Estate & Facility Mgt', sector: 'Commercial Real Estate & Facilities', location: 'Abuja, FCT, Nigeria' },
              { label: 'Fintech & Lending (Tier 2)', sector: 'Fintech, Lending & Payments', location: 'Lagos, Nigeria' },
              { label: 'Diagnostic Labs & Health', sector: 'Healthcare, Clinics & Diagnostic Labs', location: 'Lagos, Nigeria' },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setScoutSector(p.sector);
                  setScoutLocation(p.location);
                }}
                style={{
                  cursor: 'pointer',
                  background: '#FAF9F5',
                  border: '1px solid var(--ink, #1E1E1E)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '10.5px',
                  color: '#333',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Live Scouted Results Display */}
          {scoutResults.length > 0 && (
            <div style={{ display: 'grid', gap: '16px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '18px', fontWeight: 800 }}>
                  Recently Scouted Leads ({scoutResults.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('queue')}
                  style={{
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    color: 'var(--ink, #1E1E1E)',
                  }}
                >
                  Go to Approval Queue ({pendingQueue.length}) →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {scoutResults.map((lead, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '2px solid var(--ink, #1E1E1E)',
                      borderRadius: '16px',
                      background: '#FAF9F5',
                      padding: '18px',
                      boxShadow: '3px 3px 0 rgba(30,30,30,0.85)',
                      display: 'grid',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '17px', fontWeight: 800 }}>
                          {lead.company_name}
                        </div>
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: '#666' }}>
                          {lead.industry} · {lead.location}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 800,
                          background: lead.icp_score >= 80 ? 'var(--accent, #D4F534)' : '#FFE082',
                          color: 'var(--ink, #1E1E1E)',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '100px',
                          padding: '3px 10px',
                        }}
                      >
                        ICP {lead.icp_score}/100
                      </span>
                    </div>

                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11.5px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                      <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                        Contact: {lead.contact_name} ({lead.contact_title})
                      </div>
                      <div style={{ color: '#555' }}>Channel: {lead.verified_channel}</div>
                    </div>

                    {lead.signals_observed && lead.signals_observed.length > 0 && (
                      <div>
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#666' }}>
                          Observed Operational Friction:
                        </div>
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: '#333' }}>
                          {lead.signals_observed.map((s: string, sIdx: number) => (
                            <li key={sIdx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {lead.draft_body && (
                      <div style={{ background: '#fff', border: '1px solid var(--ink, #1E1E1E)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#666', marginBottom: '4px' }}>
                          Generated Touch 1 Draft (Strict Section 7 Rules):
                        </div>
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                          Subj: {lead.draft_subject}
                        </div>
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', whiteSpace: 'pre-wrap', color: '#222', maxHeight: '140px', overflowY: 'auto' }}>
                          {lead.draft_body}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('queue')}
                        style={{
                          cursor: 'pointer',
                          background: 'var(--ink, #1E1E1E)',
                          color: 'var(--accent, #D4F534)',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '8px',
                          padding: '7px 14px',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        Inspect in Queue →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 2. PIPELINE BOARD TAB                                              */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'board' && (
        <section
          style={{
            background: '#fff',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '4px 4px 0 rgba(30,30,30,0.9)',
            display: 'grid',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>
                End-to-End Enterprise Flow
              </div>
              <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '20px', fontWeight: 800 }}>
                9-Stage Sales Pipeline
              </h3>
            </div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: '#666' }}>
              Click any company to inspect issue maps, calls, proposals &amp; records
            </div>
          </div>

          <div
            className="feyron-mobile-scroll"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(9, minmax(220px, 1fr))',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '12px',
            }}
          >
            {[
              { stage: 'SCOUTED', label: '1. Scouted', role: 'Scout' },
              { stage: 'ANALYSED', label: '2. Analysed', role: 'Analyst' },
              { stage: 'SEQUENCE_ACTIVE', label: '3. Sequence', role: 'Outreach Writer' },
              { stage: 'REPLIED', label: '4. Replied', role: 'Reply Handler' },
              { stage: 'CALL_BOOKED', label: '5. Booked', role: 'Scheduler' },
              { stage: 'MET_AND_SCORED', label: '6. Scored', role: 'Meeting Prep' },
              { stage: 'PROPOSAL_SENT', label: '7. Proposal', role: 'Proposal Agent' },
              { stage: 'CLOSED_WON', label: '8. Won', role: 'Deal Desk' },
              { stage: 'ONBOARDED', label: '9. Onboarded', role: 'Billing' },
            ].map((col) => {
              const prospectsInStage = state.prospects.filter((p) => p.stage === col.stage);

              return (
                <div
                  key={col.stage}
                  style={{
                    background: '#FAF9F5',
                    border: '2px solid var(--ink, #1E1E1E)',
                    borderRadius: '14px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    minHeight: '280px',
                  }}
                >
                  <div style={{ borderBottom: '1.5px solid var(--ink, #1E1E1E)', paddingBottom: '8px' }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '14px', fontWeight: 800 }}>
                      {col.label} ({prospectsInStage.length})
                    </div>
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', color: '#666' }}>
                      Owner: {col.role}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    {prospectsInStage.map((p) => (
                      <div
                        key={p.prospect_id}
                        onClick={() => setSelectedProspect(p)}
                        style={{
                          cursor: 'pointer',
                          background: '#fff',
                          border: '1.5px solid var(--ink, #1E1E1E)',
                          borderRadius: '10px',
                          padding: '10px',
                          boxShadow: '2px 2px 0 rgba(30,30,30,0.85)',
                          display: 'grid',
                          gap: '4px',
                        }}
                      >
                        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '13px', fontWeight: 700 }}>
                          {p.company_name}
                        </div>
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10.5px', color: '#555' }}>
                          {p.location.split(',')[0]} · {p.industry.split(' ')[0]}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: '#777',
                            marginTop: '4px',
                          }}
                        >
                          <span>Touches: {p.touch_count}/{p.max_touches}</span>
                          <span style={{ fontWeight: 700, color: 'var(--ink, #1E1E1E)' }}>View Dossier →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Prospect Modal / Dossier */}
          {selectedProspect && (
            <div
              style={{
                border: '2.5px solid var(--ink, #1E1E1E)',
                borderRadius: '16px',
                background: '#FAF9F5',
                padding: '20px',
                display: 'grid',
                gap: '16px',
                marginTop: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>
                    Prospect Dossier · {selectedProspect.prospect_id}
                  </div>
                  <h4 style={{ margin: '2px 0 0 0', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '22px', fontWeight: 800 }}>
                    {selectedProspect.company_name}
                  </h4>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '12px', color: '#444', marginTop: '2px' }}>
                    {selectedProspect.contact_name} ({selectedProspect.contact_title}) · {selectedProspect.verified_channel}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProspect(null)}
                  style={{
                    cursor: 'pointer',
                    background: 'var(--paper, #E7E7E7)',
                    border: '1.5px solid var(--ink, #1E1E1E)',
                    borderRadius: '100px',
                    padding: '6px 14px',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  Close Dossier
                </button>
              </div>

              {/* Dossier Tabs: Issue Map, Meeting Notes, Proposal, Billing */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {/* Issue Map Block */}
                <div style={{ background: '#fff', border: '1.5px solid var(--ink, #1E1E1E)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                    Analyst Issue Map
                  </div>
                  {state.issueMaps[selectedProspect.prospect_id] ? (
                    <div style={{ fontSize: '12.5px', display: 'grid', gap: '6px' }}>
                      <div>
                        <strong>Observed Signals:</strong>
                        <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>
                          {state.issueMaps[selectedProspect.prospect_id].signals_observed.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Recommended Package:</strong> {state.issueMaps[selectedProspect.prospect_id].recommended_package}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#777' }}>No issue map compiled for this prospect yet.</div>
                  )}
                </div>

                {/* Call Summary Block */}
                <div style={{ background: '#fff', border: '1.5px solid var(--ink, #1E1E1E)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                    Call Summary &amp; Score
                  </div>
                  {state.summaries[selectedProspect.prospect_id] ? (
                    <div style={{ fontSize: '12.5px', display: 'grid', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Score:</span>
                        <strong style={{ fontFamily: "'Geist Mono', monospace" }}>
                          {state.summaries[selectedProspect.prospect_id].total_qualification_score} / 35
                        </strong>
                      </div>
                      <div>
                        <strong>Verdict:</strong> {state.summaries[selectedProspect.prospect_id].qualification_verdict}
                      </div>
                      <div style={{ color: '#555', fontSize: '12px' }}>
                        {state.summaries[selectedProspect.prospect_id].agreed_next_step}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#777' }}>No call notes recorded yet.</div>
                  )}
                </div>

                {/* Proposal Block */}
                <div style={{ background: '#fff', border: '1.5px solid var(--ink, #1E1E1E)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                    Proposal &amp; Billing
                  </div>
                  {state.proposals[selectedProspect.prospect_id] ? (
                    <div style={{ fontSize: '12.5px', display: 'grid', gap: '6px' }}>
                      <div>Package: {state.proposals[selectedProspect.prospect_id].package_selected}</div>
                      <div>
                        Total Fee: <strong>₦{state.proposals[selectedProspect.prospect_id].total_price_ngn.toLocaleString()}</strong>
                      </div>
                      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: '#555' }}>
                        50% Deposit: ₦{state.proposals[selectedProspect.prospect_id].payment_schedule.deposit_amount_ngn.toLocaleString()}
                      </div>
                      <div>Status: {state.proposals[selectedProspect.prospect_id].status}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#777' }}>No proposal generated yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. 20 TEST SCENARIOS TAB (SECTION 15 COMPLIANCE)                   */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'scenarios' && (
        <section
          style={{
            background: '#fff',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '4px 4px 0 rgba(30,30,30,0.9)',
            display: 'grid',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>
              Section 15 Specification Test Harness
            </div>
            <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '20px', fontWeight: 800 }}>
              20 Autonomous Safety &amp; Invariant Test Scenarios
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#555' }}>
              Click any scenario to execute it live against the pipeline engine, verify invariant rules, and inspect output blocks.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '10px',
            }}
          >
            {[
              { id: 'S01', agent: 'Scout', title: 'Public Lead Discovery', desc: 'Finds Ikeja haulage operator with dead WhatsApp link' },
              { id: 'S02', agent: 'Analyst', title: 'Operational Issue Map', desc: 'Parses manual phone reservation & container tracking signals' },
              { id: 'S03', agent: 'Outreach Writer', title: 'Touch 1 Cold Email', desc: 'Generates calm Touch 1 within WAT window' },
              { id: 'S04', agent: 'Outreach Writer', title: 'Window Guard (22:00 WAT)', desc: 'Blocks send outside 08:30-17:30 WAT window' },
              { id: 'S05', agent: 'Outreach Writer', title: 'Max 3 Touches Invariant', desc: 'Hard blocks touch 4 from ever dispatching' },
              { id: 'S06', agent: 'Reply Handler', title: 'QUESTION Classification', desc: 'Classifies database query & drafts pricing response' },
              { id: 'S07', agent: 'Reply Handler', title: 'UNSUBSCRIBE Suppression', desc: 'Permanent opt-out halts sequence immediately' },
              { id: 'S08', agent: 'Reply Handler', title: 'Prompt Injection Defense', desc: 'Neutralizes hostile override attack & quarantines' },
              { id: 'S09', agent: 'Scheduler', title: 'Real WAT Slot Booking', desc: 'Confirms 20-min slot in WAT with calendar invite' },
              { id: 'S10', agent: 'Scheduler', title: '24h / 1h Reminders', desc: 'Dispatches automated pre-call reminders in WAT' },
              { id: 'S11', agent: 'Meeting Prep', title: 'Pre-Call Dossier', desc: 'Generates 1-page founder brief with probing questions' },
              { id: 'S12', agent: 'Meeting Prep', title: '7-Score Summary (30/35)', desc: 'Calculates qualification score & next steps' },
              { id: 'S13', agent: 'Proposal Agent', title: 'Core System (50/30/20)', desc: 'Selects ₦1.2M standard package and payment schedule' },
              { id: 'S14', agent: 'Proposal Agent', title: 'Locked Action (Discount)', desc: 'Prevents autonomous discounts; forces human escalation' },
              { id: 'S15', agent: 'Proposal Agent', title: 'Day 5 Proposal Follow-up', desc: 'Calm check-in without pressure or fake urgency' },
              { id: 'S16', agent: 'Deal Desk', title: 'Dual Signature Check', desc: 'Verifies client & founder digital signatures' },
              { id: 'S17', agent: 'Deal Desk', title: 'Handover Dossier', desc: 'Compiles clean deal record for technical onboarding' },
              { id: 'S18', agent: 'Billing', title: '50% Deposit Invoice', desc: 'Issues ₦600,000 deposit invoice and payment link' },
              { id: 'S19', agent: 'Billing', title: 'Webhook Confirmation', desc: 'Confirms verified bank deposit and issues receipt' },
              { id: 'S20', agent: 'Deal Desk', title: 'Kill Switch Lockdown', desc: 'Verifies zero outbound actions execute when paused' },
            ].map((sc) => (
              <div
                key={sc.id}
                style={{
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  borderRadius: '12px',
                  background: '#FAF9F5',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 800 }}>
                      {sc.id} · {sc.agent}
                    </span>
                  </div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                    {sc.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#555', marginTop: '2px' }}>
                    {sc.desc}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={runningScenario === sc.id}
                  onClick={() => handleRunScenario(sc.id)}
                  style={{
                    cursor: runningScenario === sc.id ? 'wait' : 'pointer',
                    marginTop: '6px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--ink, #1E1E1E)',
                    background: 'var(--paper, #E7E7E7)',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {runningScenario === sc.id ? 'Executing...' : 'Run Test →'}
                </button>
              </div>
            ))}
          </div>

          {/* Last Scenario Result Diagnostic Box */}
          {lastScenarioResult && (
            <div
              style={{
                marginTop: '12px',
                border: '2px solid var(--ink, #1E1E1E)',
                borderRadius: '12px',
                background: '#FAF9F5',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '12px', fontWeight: 800 }}>
                  DIAGNOSTIC OUTPUT · {lastScenarioResult.scenarioId}: {lastScenarioResult.title}
                </span>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 800,
                    background: 'var(--accent, #D4F534)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--ink, #1E1E1E)',
                  }}
                >
                  {lastScenarioResult.outcome}
                </span>
              </div>
              <pre
                style={{
                  margin: 0,
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11px',
                  background: '#fff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {JSON.stringify(lastScenarioResult.details, null, 2)}
              </pre>
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 4. AUDIT & HISTORY LOG TAB                                         */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'history' && (
        <section
          style={{
            background: '#fff',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '4px 4px 0 rgba(30,30,30,0.9)',
            display: 'grid',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>
              Immutable Audit Trail
            </div>
            <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '20px', fontWeight: 800 }}>
              Agent Action Logs ({state.historyLogs.length})
            </h3>
          </div>

          <div style={{ display: 'grid', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
            {state.historyLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--ink, #1E1E1E)',
                  background: log.status === 'blocked' ? '#FFEBEE' : log.status === 'escalated' ? '#FFF8E1' : '#FAF9F5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: '10px',
                      fontWeight: 800,
                      background: 'var(--ink, #1E1E1E)',
                      color: 'var(--accent, #D4F534)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {log.agent}
                  </span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 700 }}>
                    {log.action}
                  </span>
                  <span style={{ color: '#555' }}>· {log.detail}</span>
                </div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10.5px', color: '#777' }}>
                  {new Date(log.timestamp).toLocaleTimeString('en-GB')} WAT
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 5. AUTONOMY SWITCHES & LIMITS TAB                                  */}
      {/* ------------------------------------------------------------------- */}
      {activeSubTab === 'settings' && (
        <section
          style={{
            background: '#fff',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '4px 4px 0 rgba(30,30,30,0.9)',
            display: 'grid',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>
              Autonomy Controls
            </div>
            <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '20px', fontWeight: 800 }}>
              Per-Action Autonomy Toggles &amp; Daily Limits
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#555' }}>
              Switch actions between <strong>APPROVE</strong> (requires 1-click human card clearance) and <strong>AUTO</strong> (executes autonomously within limits).
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px',
            }}
          >
            {[
              { key: 'send_first_message', label: 'First Cold Touch', agent: 'Outreach Writer', desc: 'Initial unsolicited email to verified channel' },
              { key: 'send_followup', label: 'Follow-Up Touches', agent: 'Outreach Writer', desc: 'Touch 2 and 3 after minimum 48h gap' },
              { key: 'reply_to_question', label: 'Clarification Replies', agent: 'Reply Handler', desc: 'Answering pricing, technical, or timing questions' },
              { key: 'send_calendar_link', label: 'Calendar Invites', agent: 'Scheduler', desc: 'Dispatches 20-min booking link in WAT' },
              { key: 'send_proposal', label: 'Commercial Proposals', agent: 'Proposal Agent', desc: 'Sends fixed-price packages and 50/30/20 scope' },
              { key: 'create_payment_link', label: 'Deposit Invoices', agent: 'Billing', desc: 'Generates 50% deposit link and payment instructions' },
            ].map((item) => {
              const currentVal = (state.autonomy as any)[item.key];
              const isApprove = currentVal === 'APPROVE';

              return (
                <div
                  key={item.key}
                  style={{
                    border: '2px solid var(--ink, #1E1E1E)',
                    borderRadius: '12px',
                    background: '#FAF9F5',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>
                        {item.agent}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '16px', fontWeight: 800, marginTop: '2px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                      {item.desc}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 700 }}>
                      Current: {currentVal}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSwitchAutonomy(item.key)}
                      style={{
                        cursor: 'pointer',
                        padding: '6px 14px',
                        borderRadius: '100px',
                        border: '2px solid var(--ink, #1E1E1E)',
                        background: isApprove ? 'var(--paper, #E7E7E7)' : 'var(--accent, #D4F534)',
                        color: 'var(--ink, #1E1E1E)',
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      Switch to {isApprove ? 'AUTO' : 'APPROVE'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Locked Invariants Banner */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '2px solid var(--ink, #1E1E1E)',
              background: '#FFF9C4',
              display: 'grid',
              gap: '6px',
            }}
          >
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
              Hard-Locked Actions (Cannot be Automated under Any Mode):
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', lineHeight: 1.6 }}>
              <li><strong>Custom Pricing &amp; Discounts:</strong> Standard price list strictly enforced; discounts require founder authorization.</li>
              <li><strong>Final Contract Signatures:</strong> Digital contracts require verified human signature.</li>
              <li><strong>Moving Money / Refunds:</strong> All financial disbursement is strictly locked to human bank access.</li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
