/**
 * Feyron Sales Workflow Agents — Types & Data Contracts
 * Version 0.1 | Owner: Fredrick Omoke | Feyron AI Productivity & Technology
 * Tagline: Technology that moves work forward.
 */

export type AutonomyMode = 'APPROVE' | 'AUTO';

export interface AutonomySettings {
  source_prospects?: AutonomyMode;
  verify_emails?: AutonomyMode;
  analyse_prospects?: AutonomyMode;
  send_first_message: AutonomyMode;
  send_followup: AutonomyMode;
  send_followups?: AutonomyMode;
  reply_to_question: AutonomyMode;
  reply_to_questions_from_approved_answers?: AutonomyMode;
  reply_to_interested_prospects?: AutonomyMode;
  send_calendar_link: AutonomyMode;
  book_meeting_from_free_slots?: AutonomyMode;
  send_meeting_reminders?: AutonomyMode;
  send_proposal: AutonomyMode;
  send_proposal_followups?: AutonomyMode;
  create_payment_link: AutonomyMode;
  send_receipt_after_verified_payment?: AutonomyMode;
  send_overdue_reminders?: AutonomyMode;
  paused: boolean;
  is_paused?: boolean;
  pause_reason?: string;
}

export interface WorkflowLimits {
  daily_outreach_limit: number;
  cold_outreach_sent_today: number;
  daily_scout_limit: number;
  scouted_today: number;
  touches_per_prospect: number;
  new_prospects_per_day?: number;
  first_messages_per_day?: number;
  send_window_start_hour_wat?: number;
  send_window_end_hour_wat?: number;
  bounce_rate_max_percent?: number;
}

export const DEFAULT_AUTONOMY_SETTINGS: AutonomySettings = {
  source_prospects: 'AUTO',
  verify_emails: 'AUTO',
  analyse_prospects: 'AUTO',
  send_first_message: 'APPROVE',
  send_followup: 'AUTO',
  send_followups: 'APPROVE',
  reply_to_question: 'APPROVE',
  reply_to_questions_from_approved_answers: 'AUTO',
  reply_to_interested_prospects: 'APPROVE',
  send_calendar_link: 'AUTO',
  book_meeting_from_free_slots: 'AUTO',
  send_meeting_reminders: 'AUTO',
  send_proposal: 'APPROVE',
  send_proposal_followups: 'APPROVE',
  create_payment_link: 'APPROVE',
  send_receipt_after_verified_payment: 'AUTO',
  send_overdue_reminders: 'AUTO',
  paused: false,
  is_paused: false,
};

export const WORKFLOW_LIMITS: WorkflowLimits = {
  daily_outreach_limit: 10,
  cold_outreach_sent_today: 0,
  daily_scout_limit: 20,
  scouted_today: 0,
  touches_per_prospect: 3,
  new_prospects_per_day: 30,
  first_messages_per_day: 10,
  send_window_start_hour_wat: 8.5,
  send_window_end_hour_wat: 17.5,
  bounce_rate_max_percent: 5,
};

export const DEFAULT_WORKFLOW_LIMITS: WorkflowLimits = WORKFLOW_LIMITS;

export const LOCKED_ACTIONS: string[] = [
  'give_discount_or_custom_pricing',
  'sign_contract_without_human',
  'move_money_or_issue_refund',
  'Prices outside the price list',
  'Discounts outside an active campaign',
  'Accepting or signing a contract',
  'Issuing refunds',
  'Deleting records',
  'Bulk or cold WhatsApp messages',
  'Legal, tax or financial advice',
  'Moving money',
];

export type AgentName =
  | 'Scout'
  | 'Analyst'
  | 'Outreach Writer'
  | 'Reply Handler'
  | 'Scheduler'
  | 'Meeting Prep & Notes'
  | 'Proposal Agent'
  | 'Deal Desk'
  | 'Billing & Onboarding';

export type PipelineStage =
  | 'SCOUTED'
  | 'ANALYSED'
  | 'SEQUENCE_ACTIVE'
  | 'REPLIED'
  | 'CALL_BOOKED'
  | 'MET_AND_SCORED'
  | 'PROPOSAL_SENT'
  | 'CLOSED_WON'
  | 'ONBOARDED'
  | 'DISQUALIFIED';

export type VerificationStatus = 'valid' | 'risky' | 'invalid' | 'unknown';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ChannelType = 'email' | 'whatsapp' | 'linkedin_draft';
export type PriorityLevel = 'A' | 'B' | 'C';
export type ReplyClassification =
  | 'INTERESTED'
  | 'QUESTION'
  | 'OBJECTION'
  | 'NOT_NOW'
  | 'WRONG_PERSON'
  | 'UNSUBSCRIBE'
  | 'OUT_OF_OFFICE'
  | 'HOSTILE'
  | 'UNCLEAR';

export interface ProspectRecord {
  id?: string;
  prospect_id: string;
  company_name: string;
  businessName?: string;
  industry: string;
  niche?: string;
  location: string;
  city?: string;
  country?: string;
  website_or_source: string;
  verified_channel: string;
  contact_name: string;
  contact_title: string;
  stage: PipelineStage;
  created_at: string;
  updated_at: string;
  touch_count: number;
  last_touch_at?: string;
  max_touches: number;
  notes?: string;
  verificationStatus?: VerificationStatus;
  isDoNotContact?: boolean;
  isOptedOut?: boolean;
}

export interface IssueMap {
  id?: string;
  prospect_id: string;
  signals_observed: string[];
  hypotheses: string[];
  recommended_package: string;
  custom_observations?: string;
  generated_at: string;
  bestChannel?: ChannelType;
  priority?: PriorityLevel;
}

export interface ConversationMessage {
  id: string;
  date: string;
  channel: ChannelType;
  sender: 'feyron_agent' | 'prospect' | 'founder';
  content: string;
  touchNumber: number;
  sourceReference?: string;
}

export interface ConversationLog {
  id?: string;
  prospect_id?: string;
  prospectId?: string;
  messages?: ConversationMessage[];
  touchCount?: number;
  latestReplyClass?: ReplyClassification;
  isOptedOut?: boolean;
}

export interface MeetingRecord {
  meeting_id: string;
  prospect_id: string;
  scheduled_at_wat: string;
  duration_minutes: number;
  meeting_link: string;
  attendees: string[];
  status: 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED';
  reminder_24h_sent: boolean;
  reminder_1h_sent: boolean;
}

export interface CallSummary {
  prospect_id: string;
  call_date: string;
  pain_severity_score: number; // 1-5
  decision_maker_access_score: number; // 1-5
  budget_match_score: number; // 1-5
  timeline_urgency_score: number; // 1-5
  technical_feasibility_score: number; // 1-5
  founder_receptivity_score: number; // 1-5
  operational_readiness_score: number; // 1-5
  total_qualification_score: number; // sum out of 35
  qualification_verdict: 'QUALIFIED' | 'DISQUALIFIED' | 'NURTURE';
  agreed_next_step: string;
  raw_notes: string;
}

export interface ProposalRecord {
  proposal_id: string;
  prospect_id: string;
  package_selected: 'SINGLE_AUTOMATION' | 'CORE_SYSTEM' | 'FLAGSHIP_CUSTOM' | string;
  total_price_ngn: number;
  payment_schedule: {
    deposit_percent: number; // 50
    deposit_amount_ngn: number;
    milestone_percent: number; // 30
    milestone_amount_ngn: number;
    completion_percent: number; // 20
    completion_amount_ngn: number;
  };
  scope_deliverables: string[];
  valid_until: string; // 30 days ISO
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'SENT' | 'ACCEPTED' | 'DECLINED';
}

export interface DealRecord {
  deal_id: string;
  prospect_id: string;
  client_signature_verified: boolean;
  client_signed_at: string;
  founder_signature_verified: boolean;
  founder_signed_at: string;
  agreement_checksum: string;
  status: 'WON' | 'LOST' | 'IN_REVIEW';
}

export interface BillingRecord {
  billing_id: string;
  deal_id: string;
  prospect_id: string;
  deposit_invoice_number: string;
  deposit_amount_ngn: number;
  payment_link: string;
  payment_verified: boolean;
  verified_at?: string;
  receipt_number?: string;
  intake_form_url: string;
  kickoff_scheduled_at: string | null;
  status: 'DEPOSIT_INVOICED' | 'DEPOSIT_PAID' | 'RECEIPT_SENT' | 'KICKOFF_COMPLETED';
}

export interface ApprovalQueueItem {
  id: string;
  agent: AgentName;
  prospect_id: string;
  action_type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  observed_facts: string;
  confidence_score: number;
  draft_subject?: string;
  draft_body: string;
  proposed_destination?: string;
  notes?: string;
  approved_at?: string;
}

// Standard Output block envelopes
export interface ReplyDraftOutput {
  type: 'REPLY_DRAFT';
  to: string;
  channel: ChannelType;
  subject?: string;
  message: string;
  source: string;
  confidence: ConfidenceLevel;
  mode: AutonomyMode;
  agentRole: string;
  prospectId: string;
  createdAt: string;
}

export interface ActionRequestOutput {
  type: 'ACTION_REQUEST';
  action: string;
  details: string;
  why: string;
  risk: string;
  mode: AutonomyMode;
  agentRole: string;
  prospectId: string;
  payload?: any;
  createdAt: string;
}

export interface EscalationOutput {
  type: 'ESCALATION';
  reason: string;
  whatWasSaid: string;
  whatISuggest: string;
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  agentRole: string;
  prospectId?: string;
  createdAt: string;
}

export interface RecordUpdateOutput {
  type: 'RECORD_UPDATE';
  recordType: 'prospect' | 'issue_map' | 'conversation' | 'meeting' | 'proposal' | 'deal' | 'billing';
  recordId: string;
  field: string;
  oldValue: any;
  newValue: any;
  source: string;
  agentRole: string;
  createdAt: string;
}

export type AgentOutputBlock = ReplyDraftOutput | ActionRequestOutput | EscalationOutput | RecordUpdateOutput;
