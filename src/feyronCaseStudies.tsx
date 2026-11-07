import React from 'react';
import froodiImg from './assets/images/portfolio_froodi_dashboard_1794086715229.jpg';
import qrevaImg from './assets/images/portfolio_qreva_checkout_1794086716368.jpg';
import phovifyImg from './assets/images/portfolio_phovify_crm_1794086717462.jpg';
import flowpayImg from './assets/images/portfolio_flowpay_invoicing_1794086718695.jpg';
import propledgerImg from './assets/images/portfolio_propledger_estates_1794086721156.jpg';
import workverifyImg from './assets/images/portfolio_workverify_portal_1794086720248.jpg';

export interface CaseStudyMetric {
  value: string;
  label: string;
}

export interface CaseStudyDeliverable {
  title: string;
  description: string;
}

export interface FeyronCaseStudy {
  slug: string;
  aliases: string[];
  index: string;
  name: string;
  headline: string;
  division: string;
  sector: string;
  role: string;
  year: string;
  timeline: string;
  liveUrl?: string;
  coverImage: string;
  fallbackImage: string;
  summary: string;
  challenge: string;
  approach: string;
  bookingContextNote: string;
  metrics: CaseStudyMetric[];
  deliverables: CaseStudyDeliverable[];
  stack: string[];
}

export const FEYRON_CASE_STUDIES: FeyronCaseStudy[] = [
  {
    slug: 'froodi',
    aliases: ['froodi', 'agents'],
    index: '01',
    name: 'Froodi',
    headline: 'Multi-Vendor Order Dispatch & Rider Routing Platform',
    division: 'AI Automation & Logistics',
    sector: 'Food & Grocery Delivery',
    role: 'Product Design, Web Platform & Dispatch Automation',
    year: '2026',
    timeline: '3 Weeks',
    coverImage: froodiImg,
    fallbackImage: '/site/assets/work/portfolio-froodi.jpg',
    summary:
      'A unified dispatch console, kitchen preparation board, and automated rider routing platform built for multi-location food and grocery delivery operations.',
    challenge:
      'Dispatchers were manually matching riders to restaurant orders across WhatsApp group chats and spreadsheets. During peak lunch and dinner rushes, orders sat unassigned, customers had no visibility into delivery ETAs, and end-of-day vendor reconciliation took hours.',
    approach:
      'We designed and shipped a web platform with real-time courier matching, kitchen prep timers, automated WhatsApp status updates for buyers and riders, and an automated split-payout ledger for partner restaurants.',
    bookingContextNote: 'Interested in building a similar platform to Froodi (Order Dispatch & Delivery Operations).',
    metrics: [
      { value: '42s', label: 'Average Rider Dispatch Time' },
      { value: '99.4%', label: 'Order Fulfillment Accuracy' },
      { value: '3.2x', label: 'Daily Order Volume Capacity' },
      { value: '14 hrs/wk', label: 'Saved on Vendor Payouts' }
    ],
    deliverables: [
      {
        title: 'Live Dispatch & Rider Console',
        description: 'Real-time map and order queue matching incoming deliveries to the nearest available courier with instant fallback reassignment.'
      },
      {
        title: 'Merchant Kitchen Portal',
        description: 'Tablet-friendly order board for partner kitchens to accept orders, update prep times, and print packing slips.'
      },
      {
        title: 'Automated Customer Updates',
        description: 'WhatsApp and SMS notifications triggered automatically when an order is confirmed, picked up, and arriving at the door.'
      },
      {
        title: 'Partner Payout Ledger',
        description: 'Split accounting separating food revenue, delivery fees, and platform commission for clean daily vendor settlement.'
      }
    ],
    stack: ['React', 'TypeScript', 'Node.js', 'Supabase', 'Paystack', 'WhatsApp Cloud API']
  },
  {
    slug: 'qreva',
    aliases: ['qreva', 'moneyincheck'],
    index: '02',
    name: 'Qreva',
    headline: 'Social Commerce Storefront & Instant Checkout',
    division: 'Integrations & Payments',
    sector: 'Social Commerce & Retail',
    role: 'Full-Stack Web App, Checkout & Payment Webhooks',
    year: '2026',
    timeline: '2.5 Weeks',
    liveUrl: 'https://qreva-one.vercel.app',
    coverImage: qrevaImg,
    fallbackImage: '/site/assets/work/portfolio-qreva.jpg',
    summary:
      'Qreva turns Instagram and WhatsApp DM orders into a fast mobile storefront with real-time inventory reservations, instant payment verification, and digital receipts.',
    challenge:
      'Merchants selling on Instagram and WhatsApp were losing sales waiting to verify bank transfer screenshots, accidentally double-selling out-of-stock items, and manually copying delivery addresses from chat threads.',
    approach:
      'We built Qreva as a mobile-first storefront and checkout platform that reserves stock during checkout, verifies Paystack and bank transfer webhooks in seconds, and immediately dispatches receipts and packing slips.',
    bookingContextNote: 'Interested in building a similar platform to Qreva (Storefront, Checkout & Payment Integration).',
    metrics: [
      { value: '< 3s', label: 'Payment Verification Speed' },
      { value: '+38%', label: 'Checkout Conversion Lift' },
      { value: '0', label: 'Fake Transfer Screenshot Losses' },
      { value: '100%', label: 'Automated Digital Receipts' }
    ],
    deliverables: [
      {
        title: 'Mobile Checkout Storefronts',
        description: 'Fast product pages that buyers open directly from WhatsApp or Instagram bio links with one-tap checkout.'
      },
      {
        title: 'Webhook Payment Verification',
        description: 'Direct payment gateway integration that confirms transfers and card payments automatically without waiting for screenshots.'
      },
      {
        title: 'Real-Time Inventory Locking',
        description: 'Automatic stock reservation during active checkout sessions so two buyers never pay for the same last item.'
      },
      {
        title: 'Automated Order & Receipt Flow',
        description: 'Instant PDF receipt delivery to the buyer and structured fulfillment alerts sent straight to the merchant dashboard.'
      }
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Paystack Webhooks', 'Vercel']
  },
  {
    slug: 'phovify',
    aliases: ['phovify', 'workee'],
    index: '03',
    name: 'Phovify & WaCRM',
    headline: 'WhatsApp Lead Pipeline & Client Booking Portal',
    division: 'AI Automation & CRM',
    sector: 'Service Studios & Agencies',
    role: 'Product Design, CRM Pipeline & Booking Flow',
    year: '2026',
    timeline: '2 Weeks',
    coverImage: phovifyImg,
    fallbackImage: '/site/assets/work/portfolio-phovify.jpg',
    summary:
      'Phovify & WaCRM unifies WhatsApp lead capture, client qualification, calendar scheduling, and deposit collection into a single workspace for service teams.',
    challenge:
      'Prospective clients reached out on WhatsApp at all hours, but slow manual replies, scattered chat threads, and back-and-forth scheduling caused high-value leads to go cold before booking.',
    approach:
      'We built a visual pipeline and booking portal that captures inquiries, guides prospects through a clean slot-picker and deposit checkout, and keeps every conversation synced to a structured client profile.',
    bookingContextNote: 'Interested in building a similar system to Phovify & WaCRM (WhatsApp CRM & Booking Portal).',
    metrics: [
      { value: '12s', label: 'Lead Response & Routing Time' },
      { value: '+64%', label: 'Qualified Consultation Bookings' },
      { value: '-78%', label: 'No-Show Rate via Deposits' },
      { value: '11 hrs/wk', label: 'Saved on Manual Follow-Ups' }
    ],
    deliverables: [
      {
        title: 'Visual Lead Pipeline Board',
        description: 'Kanban-style CRM board tracking every lead from initial inquiry through deposit paid, session booked, and project delivered.'
      },
      {
        title: 'Interactive Booking & Deposit Portal',
        description: 'Real-time calendar slot selector paired with deposit collection so every confirmed slot is backed by a committed client.'
      },
      {
        title: 'Automated Follow-Up Sequences',
        description: 'Timed WhatsApp and email reminders at 24 hours and 1 hour prior to appointments, including one-click reschedule links.'
      },
      {
        title: 'Client History & Asset Hub',
        description: 'Centralized client record storing past bookings, invoices, intake responses, and delivery links in one place.'
      }
    ],
    stack: ['React', 'TypeScript', 'Supabase', 'WhatsApp Business API', 'Google Calendar API', 'Resend']
  },
  {
    slug: 'flowpay',
    aliases: ['flowpay', 'firevalle'],
    index: '04',
    name: 'FlowPay',
    headline: 'Multi-Currency Invoicing & Treasury Reconciliation',
    division: 'Integrations & Payments',
    sector: 'B2B Billing & Finance',
    role: 'Web Platform, Invoicing Engine & Ledger Design',
    year: '2026',
    timeline: '3 Weeks',
    coverImage: flowpayImg,
    fallbackImage: '/site/assets/work/portfolio-flowpay.jpg',
    summary:
      'FlowPay streamlines B2B accounts receivable by pairing multi-currency invoice links with virtual account matching, automated reminder schedules, and live cashflow reporting.',
    challenge:
      'Finance teams were generating static PDF invoices in spreadsheets, manually checking bank statements to see who had paid, and spending days every month reconciling partial payments across NGN, USD, and GBP.',
    approach:
      'We designed and built FlowPay with dedicated virtual accounts per invoice, automated payment matching, scheduled follow-ups for overdue balances, and one-click accounting exports.',
    bookingContextNote: 'Interested in building a similar platform to FlowPay (B2B Invoicing & Payment Reconciliation).',
    metrics: [
      { value: '94%', label: 'Auto-Matched Incoming Payments' },
      { value: '2.4x', label: 'Faster Invoice Settlement' },
      { value: '18 hrs/wk', label: 'Saved by Finance Operations' },
      { value: '100%', label: 'Audit-Ready Receipt Trail' }
    ],
    deliverables: [
      {
        title: 'Interactive Multi-Currency Invoices',
        description: 'Hosted invoice pages supporting NGN, USD, and GBP with instant bank transfer details and embedded card payment options.'
      },
      {
        title: 'Automated Virtual Account Matching',
        description: 'Each invoice maps to a unique reference so incoming transfers automatically mark the exact invoice as paid.'
      },
      {
        title: 'Smart Dunning & Reminder Engine',
        description: 'Scheduled pre-due and overdue reminders with instant pause the moment a payment webhook clears.'
      },
      {
        title: 'Live Cashflow & Tax Ledger',
        description: 'Real-time treasury dashboard displaying collected revenue, outstanding receivables, and downloadable CSV ledger exports.'
      }
    ],
    stack: ['TypeScript', 'Node.js', 'PostgreSQL', 'Flutterwave', 'Paystack', 'Resend']
  },
  {
    slug: 'propledger',
    aliases: ['propledger', 'phopet', 'sweepify'],
    index: '05',
    name: 'PropLedger Estates',
    headline: 'Property Management, Lease Ledger & Resident Portal',
    division: 'Websites & Platforms',
    sector: 'Real Estate & Facility Management',
    role: 'Web Portal, Resident Billing & Visitor Access System',
    year: '2026',
    timeline: '3.5 Weeks',
    coverImage: propledgerImg,
    fallbackImage: '/site/assets/work/portfolio-propledger.jpg',
    summary:
      'PropLedger gives property managers and estate committees a single platform to automate rent and service-charge collection, track utility budgets, and manage resident maintenance tickets.',
    challenge:
      'Facility managers were tracking hundreds of units across disconnected spreadsheets, chasing overdue service charges on WhatsApp, and losing track of maintenance requests and visitor access codes.',
    approach:
      'We built a dedicated resident and facility management portal with automated renewal notices, transparent unit-by-unit ledger tracking, digital visitor passes, and SLA-tracked maintenance dispatch.',
    bookingContextNote: 'Interested in building a similar platform to PropLedger Estates (Property & Resident Management Portal).',
    metrics: [
      { value: '+46%', label: 'On-Time Service Charge Collection' },
      { value: '1,200+', label: 'Units & Leases Managed' },
      { value: '3.5x', label: 'Faster Maintenance Resolution' },
      { value: '15 hrs/wk', label: 'Saved on Estate Admin Work' }
    ],
    deliverables: [
      {
        title: 'Unit & Lease Management Dashboard',
        description: 'Visual directory of every property unit showing occupancy status, lease expiration countdowns, and payment history.'
      },
      {
        title: 'Automated Rent & Levy Billing',
        description: 'Scheduled renewal invoices and service-charge statements with one-click payment links and instant receipt generation.'
      },
      {
        title: 'Maintenance Ticket Workflow',
        description: 'Resident issue reporting with photo uploads, technician assignment, and status tracking from open to resolved.'
      },
      {
        title: 'Digital Visitor Access Passes',
        description: 'Time-bound guest access codes generated by residents and verified cleanly at the estate gatehouse.'
      }
    ],
    stack: ['React', 'TypeScript', 'Supabase', 'Paystack', 'Resend', 'WhatsApp Cloud API']
  },
  {
    slug: 'workverify',
    aliases: ['workverify', 'hq', 'mintng'],
    index: '06',
    name: 'WorkVerify & MintNG',
    headline: 'Employee Onboarding & KYC Verification Portal',
    division: 'Websites & Platforms',
    sector: 'HR Tech & Compliance',
    role: 'Compliance Portal, Document Vault & Approval Workflows',
    year: '2026',
    timeline: '2.5 Weeks',
    coverImage: workverifyImg,
    fallbackImage: '/site/assets/work/portfolio-workverify.jpg',
    summary:
      'WorkVerify & MintNG replaces scattered email attachment chains with a structured onboarding portal that verifies identity documents, collects signed agreements, and provisions team access.',
    challenge:
      'HR and operations teams were onboarding new hires and contractors over scattered email threads—manually checking ID cards, chasing guarantor forms, and forgetting to revoke access when contracts ended.',
    approach:
      'We designed a guided verification portal where candidates upload credentials once, automated checks validate identity and tax records, and HR approves ready-to-work profiles in a single click.',
    bookingContextNote: 'Interested in building a similar platform to WorkVerify & MintNG (Onboarding & Verification Portal).',
    metrics: [
      { value: '14 min', label: 'End-to-End Onboarding Time' },
      { value: '100%', label: 'Audit-Ready Compliance Files' },
      { value: '-85%', label: 'Manual HR Document Chasing' },
      { value: '0', label: 'Unverified Active Contractors' }
    ],
    deliverables: [
      {
        title: 'Guided Candidate Intake Portal',
        description: 'Step-by-step onboarding checklist with real-time validation for government ID, bank details, and guarantor forms.'
      },
      {
        title: 'Automated KYC & Reference Checks',
        description: 'Instant identity verification and automated reference request links sent directly to listed guarantors.'
      },
      {
        title: 'Role-Based Document Vault',
        description: 'Encrypted compliance repository with expiration alerts for renewable certifications and contractor agreements.'
      },
      {
        title: 'One-Click Workspace Provisioning',
        description: 'Automated onboarding triggers that issue welcome packs and team credentials the moment compliance is approved.'
      }
    ],
    stack: ['React', 'TypeScript', 'Node.js', 'Supabase', 'Identity Verification APIs', 'Resend']
  }
];

export function resolveCaseStudyByPath(pathname: string): FeyronCaseStudy | null {
  const match = pathname.match(/^\/work\/([^/?#]+)/i);
  if (!match) return null;
  const key = match[1].toLowerCase().trim();
  return (
    FEYRON_CASE_STUDIES.find(
      (cs) => cs.slug === key || cs.aliases.includes(key)
    ) || FEYRON_CASE_STUDIES[0]
  );
}

export interface FeyronCaseStudyViewProps {
  study: FeyronCaseStudy;
  onNavigate: (pathname: string, hash?: string) => void;
  onBookWithContext: (study: FeyronCaseStudy) => void;
}

export const FeyronCaseStudyView: React.FC<FeyronCaseStudyViewProps> = ({
  study,
  onNavigate,
  onBookWithContext
}) => {
  const currentIdx = FEYRON_CASE_STUDIES.findIndex((s) => s.slug === study.slug);
  const prevStudy =
    FEYRON_CASE_STUDIES[(currentIdx - 1 + FEYRON_CASE_STUDIES.length) % FEYRON_CASE_STUDIES.length];
  const nextStudy =
    FEYRON_CASE_STUDIES[(currentIdx + 1) % FEYRON_CASE_STUDIES.length];

  return (
    <div style={{ display: 'grid', gap: '48px' }}>
      {/* Top Quick Project Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap'
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate('/', '#selected-work')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg, #D4F534)',
            color: 'var(--ink, #1E1E1E)',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '100px',
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 3px 0 var(--ink, #1E1E1E)'
          }}
        >
          <span>&larr;</span>
          <span>All Portfolio Work</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {FEYRON_CASE_STUDIES.map((item) => {
            const active = item.slug === study.slug;
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => onNavigate(`/work/${item.slug}`)}
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '8px 14px',
                  borderRadius: '100px',
                  border: '2px solid var(--ink, #1E1E1E)',
                  background: active ? 'var(--ink, #1E1E1E)' : 'var(--paper, #E7E7E7)',
                  color: active ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease, color 0.2s ease'
                }}
              >
                {item.index} · {item.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Product Showcase Photograph */}
      <section
        style={{
          position: 'relative',
          background: 'var(--ink, #1E1E1E)',
          border: '2.5px solid var(--ink, #1E1E1E)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 10px 0 var(--ink, #1E1E1E)'
        }}
      >
        <img
          className="cs-portfolio-img"
          src={study.coverImage}
          alt={`${study.name} — ${study.headline}`}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== window.location.origin + study.fallbackImage) {
              target.src = study.fallbackImage;
            }
          }}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '620px',
            objectFit: 'cover',
            display: 'block'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--ink, #1E1E1E)',
            color: 'var(--accent, #D4F534)',
            border: '2px solid var(--accent, #D4F534)',
            borderRadius: '100px',
            padding: '6px 14px',
            fontFamily: "'Geist Mono', monospace",
            fontSize: '11.5px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}
        >
          <span>{study.index}</span>
          <span>·</span>
          <span>{study.division}</span>
        </div>
      </section>

      {/* Project Metadata Strip */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px'
        }}
      >
        {[
          { label: 'Client / Sector', value: study.sector },
          { label: 'Role & Scope', value: study.role },
          { label: 'Delivery Timeline', value: study.timeline },
          { label: 'Year', value: study.year }
        ].map((meta, idx) => (
          <div
            key={idx}
            style={{
              background: idx === 0 ? 'var(--bg, #D4F534)' : '#FFFFFF',
              border: '2.5px solid var(--ink, #1E1E1E)',
              borderRadius: '18px',
              padding: '18px 20px',
              boxShadow: '0 4px 0 var(--ink, #1E1E1E)'
            }}
          >
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ink-soft, #2c301c)',
                marginBottom: '6px'
              }}
            >
              {meta.label}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.35, color: 'var(--ink, #1E1E1E)' }}>
              {meta.value}
            </div>
          </div>
        ))}
      </section>

      {/* Overview: The Challenge & Our Solution */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 6px 0 var(--ink, #1E1E1E)'
          }}
        >
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-mute, #6e7552)',
              marginBottom: '12px'
            }}
          >
            01 · The Challenge
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 14px 0', color: 'var(--ink, #1E1E1E)' }}>
            What needed to be solved
          </h2>
          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.65,
              color: 'var(--ink-soft, #2c301c)',
              margin: 0
            }}
          >
            {study.challenge}
          </p>
        </div>

        <div
          style={{
            background: 'var(--accent, #D4F534)',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 6px 0 var(--ink, #1E1E1E)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ink, #1E1E1E)',
                marginBottom: '12px'
              }}
            >
              02 · The Solution
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 14px 0', color: 'var(--ink, #1E1E1E)' }}>
              What we designed &amp; shipped
            </h2>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.65,
                color: 'var(--ink, #1E1E1E)',
                margin: 0,
                fontWeight: 500
              }}
            >
              {study.approach}
            </p>
          </div>

          <div>
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ink, #1E1E1E)',
                marginBottom: '10px'
              }}
            >
              Built With
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {study.stack.map((tech) => (
                <span
                  key={tech}
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '100px',
                    background: 'var(--paper, #E7E7E7)',
                    color: 'var(--ink, #1E1E1E)',
                    border: '2px solid var(--ink, #1E1E1E)'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables Grid */}
      <section>
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-mute, #6e7552)',
              marginBottom: '6px'
            }}
          >
            03 · Deliverables
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.65rem, 3vw, 2.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--ink, #1E1E1E)'
            }}
          >
            Key features &amp; modules delivered
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}
        >
          {study.deliverables.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '2.5px solid var(--ink, #1E1E1E)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 5px 0 var(--ink, #1E1E1E)'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'var(--accent, #D4F534)',
                  color: 'var(--ink, #1E1E1E)',
                  border: '2px solid var(--ink, #1E1E1E)',
                  borderRadius: '100px',
                  padding: '3px 10px',
                  marginBottom: '14px'
                }}
              >
                0{idx + 1}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--ink, #1E1E1E)' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--ink-soft, #2c301c)', margin: 0 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Results & Outcomes */}
      <section>
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-mute, #6e7552)',
              marginBottom: '6px'
            }}
          >
            04 · Outcomes
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.65rem, 3vw, 2.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--ink, #1E1E1E)'
            }}
          >
            Results after launch
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          {study.metrics.map((metric, idx) => (
            <div
              key={idx}
              style={{
                background: idx === 0 ? 'var(--ink, #1E1E1E)' : 'var(--bg, #D4F534)',
                color: idx === 0 ? '#FFFFFF' : 'var(--ink, #1E1E1E)',
                border: '2.5px solid var(--ink, #1E1E1E)',
                borderRadius: '20px',
                padding: '26px 24px',
                boxShadow: '0 5px 0 var(--ink, #1E1E1E)'
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: idx === 0 ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
                  marginBottom: '10px'
                }}
              >
                {metric.value}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: idx === 0 ? 'var(--paper, #E7E7E7)' : 'var(--ink-soft, #2c301c)'
                }}
              >
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Simple Project Inquiry CTA */}
      <section
        style={{
          background: 'var(--ink, #1E1E1E)',
          color: '#FFFFFF',
          border: '2.5px solid var(--ink, #1E1E1E)',
          borderRadius: '26px',
          padding: 'clamp(28px, 4.5vw, 44px)',
          boxShadow: '0 8px 0 var(--accent, #D4F534)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent, #D4F534)',
              marginBottom: '8px',
              fontWeight: 700
            }}
          >
            Start a Project
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.3rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              margin: '0 0 10px 0'
            }}
          >
            Want to build something similar to {study.name}?
          </h2>
          <p style={{ fontSize: '15.5px', lineHeight: 1.6, color: 'var(--paper, #E7E7E7)', margin: 0 }}>
            Book a 20-minute call or send us a message to scope your timeline and deliverables.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            onClick={() =>
              window.openBooking?.({
                notes: study.bookingContextNote,
                source: `portfolio-${study.slug}`
              })
            }
            style={{
              background: 'var(--accent, #D4F534)',
              color: 'var(--ink, #1E1E1E)',
              border: '2.5px solid var(--accent, #D4F534)',
              borderRadius: '100px',
              padding: '14px 26px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Book a 20-min Call &rarr;
          </button>
          <button
            type="button"
            onClick={() => onBookWithContext(study)}
            style={{
              background: 'transparent',
              color: 'var(--accent, #D4F534)',
              border: '2px solid var(--accent, #D4F534)',
              borderRadius: '100px',
              padding: '14px 22px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Send Project Brief
          </button>
        </div>
      </section>

      {/* Previous / Next Project Switcher */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate(`/work/${prevStudy.slug}`)}
          style={{
            textAlign: 'left',
            background: 'var(--bg, #D4F534)',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '20px',
            padding: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 0 var(--ink, #1E1E1E)'
          }}
        >
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-soft, #2c301c)',
              marginBottom: '6px'
            }}
          >
            &larr; Previous Project ({prevStudy.index})
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink, #1E1E1E)' }}>
            {prevStudy.name}
          </div>
          <div style={{ fontSize: '13.5px', color: 'var(--ink-soft, #2c301c)', marginTop: '4px' }}>
            {prevStudy.headline}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate(`/work/${nextStudy.slug}`)}
          style={{
            textAlign: 'right',
            background: 'var(--bg, #D4F534)',
            border: '2.5px solid var(--ink, #1E1E1E)',
            borderRadius: '20px',
            padding: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 0 var(--ink, #1E1E1E)'
          }}
        >
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-soft, #2c301c)',
              marginBottom: '6px'
            }}
          >
            Next Project ({nextStudy.index}) &rarr;
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink, #1E1E1E)' }}>
            {nextStudy.name}
          </div>
          <div style={{ fontSize: '13.5px', color: 'var(--ink-soft, #2c301c)', marginTop: '4px' }}>
            {nextStudy.headline}
          </div>
        </button>
      </section>
    </div>
  );
};
