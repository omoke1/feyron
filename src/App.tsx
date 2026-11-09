/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { bootCloudstudio } from './cloudstudioInit';
import { FEYRON_PAGES, FeyronPageData } from './feyronPages';
import {
  FeyronCaseStudy,
  FeyronCaseStudyView,
  resolveCaseStudyByPath,
} from './feyronCaseStudies';
import {
  TeamDashboardSection,
  WorkflowRoiCalculatorCard,
  WorkflowVisualizerCard,
} from './FeyronInteractiveTools';

declare global {
  interface Window {
    __feyronOpenLeadModal?: () => void;
    openBooking?: (opts?: { name?: string; notes?: string; lang?: string; source?: string }) => void;
  }
}

const FEYRON_MARK_PATH =
  'M14.5,0.0H85.5A14.5,14.5 0 0 1 100.0,14.5V85.5A14.5,14.5 0 0 1 85.5,100.0H14.5A14.5,14.5 0 0 1 0.0,85.5V14.5A14.5,14.5 0 0 1 14.5,0.0Z M21.2,16.2H33.1A8.2,8.2 0 0 1 41.3,24.4V59.4A8.2,8.2 0 0 1 33.1,67.6H21.2A8.2,8.2 0 0 1 13.0,59.4V24.4A8.2,8.2 0 0 1 21.2,16.2Z M66.9,16.2H78.8A8.2,8.2 0 0 1 87.0,24.4V59.4A8.2,8.2 0 0 1 78.8,67.6H66.9A8.2,8.2 0 0 1 58.7,59.4V24.4A8.2,8.2 0 0 1 66.9,16.2Z M45.1,76.0H54.9A4.9,4.9 0 0 1 59.8,80.9V80.9A4.9,4.9 0 0 1 54.9,85.8H45.1A4.9,4.9 0 0 1 40.2,80.9V80.9A4.9,4.9 0 0 1 45.1,76.0Z';

function FeyronLogo({ size = 26, fontSize = 22 }: { size?: number; fontSize?: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: 800,
        fontSize: `${fontSize}px`,
        letterSpacing: '-.035em',
        lineHeight: 1,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0, display: 'block' }}
        aria-hidden="true"
      >
        <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d={FEYRON_MARK_PATH} />
      </svg>
      <span>Feyron</span>
    </span>
  );
}

function resolveFeyronPage(pathname: string): FeyronPageData | null {
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (clean === 'admin' || clean === 'dashboard') {
    return FEYRON_PAGES.admin || FEYRON_PAGES.dashboard;
  }
  if (clean && FEYRON_PAGES[clean]) {
    return FEYRON_PAGES[clean];
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const pageParam = (params.get('page') || '').trim().toLowerCase();
    if (pageParam === 'admin' || pageParam === 'dashboard') {
      return FEYRON_PAGES.admin || FEYRON_PAGES.dashboard;
    }
    if (pageParam && FEYRON_PAGES[pageParam]) {
      return FEYRON_PAGES[pageParam];
    }
    const hashClean = (window.location.hash || '').replace(/^#+|\/+$/g, '').toLowerCase();
    if (hashClean === 'admin' || hashClean === 'dashboard') {
      return FEYRON_PAGES.admin || FEYRON_PAGES.dashboard;
    }
    if (hashClean && FEYRON_PAGES[hashClean]) {
      return FEYRON_PAGES[hashClean];
    }
  } catch {
    // ignore URL parsing errors
  }
  return null;
}

export default function App() {
  const [activeCaseStudy, setActiveCaseStudy] = useState<FeyronCaseStudy | null>(() =>
    resolveCaseStudyByPath(window.location.pathname)
  );
  const [feyronPage, setFeyronPage] = useState<FeyronPageData | null>(() =>
    resolveFeyronPage(window.location.pathname)
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Products page email list state
  const [productEmail, setProductEmail] = useState('');
  const [productJoined, setProductJoined] = useState(false);

  // Contact page form state
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactTime, setContactTime] = useState('');
  const [contactInterest, setContactInterest] = useState('AI Automation');
  const [contactHoneypot, setContactHoneypot] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [contactErrorMsg, setContactErrorMsg] = useState('');

  const navigateToPath = (pathname: string, hash?: string) => {
    setMobileNavOpen(false);
    const clean = pathname.replace(/\/+$/, '') || '/';
    if (clean === '/') {
      window.history.pushState({}, '', '/' + (hash || ''));
      setActiveCaseStudy(null);
      setFeyronPage(null);
      document.title = 'Feyron | AI Productivity & Technology';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Feyron builds AI agents, websites, software platforms and integrations that help businesses and individuals work more productively.'
        );
      }
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const page = resolveFeyronPage(clean);
    if (page) {
      window.history.pushState({ feyronSlug: page.slug }, '', `/${page.slug}`);
      setActiveCaseStudy(null);
      setFeyronPage(page);
      setContactStatus('idle');
      document.title = page.metaTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', page.metaDescription);
      return;
    }

    const cs = resolveCaseStudyByPath(clean);
    if (cs) {
      window.history.pushState({ caseStudy: cs.slug }, '', `/work/${cs.slug}`);
      setFeyronPage(null);
      setActiveCaseStudy(cs);
      document.title = `${cs.name} — Case Study | Feyron`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', cs.summary);
      return;
    }
  };

  useEffect(() => {
    bootCloudstudio();

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.hasAttribute('data-lead')) return;

      const href = anchor.getAttribute('href') || '';
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      try {
        const u = new URL(href, window.location.origin);
        if (u.origin !== window.location.origin) return;

        const page = resolveFeyronPage(u.pathname);
        if (page) {
          e.preventDefault();
          e.stopPropagation();
          navigateToPath(u.pathname);
          return;
        }

        const cs = resolveCaseStudyByPath(u.pathname);
        if (cs) {
          e.preventDefault();
          e.stopPropagation();
          navigateToPath(`/work/${cs.slug}`);
          return;
        }
      } catch {
        // ignore invalid URLs
      }
    };

    const onMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'CS_CLOSE_SUBPAGE') {
        navigateToPath('/', data.scrollWork ? '#work' : undefined);
      } else if (data.type === 'CS_OPEN_SUBPAGE' && typeof data.path === 'string') {
        navigateToPath(data.path);
      }
    };

    const onPopState = () => {
      setMobileNavOpen(false);
      const cs = resolveCaseStudyByPath(window.location.pathname);
      setActiveCaseStudy(cs);
      const p = resolveFeyronPage(window.location.pathname);
      setFeyronPage(p);
      if (cs) {
        document.title = `${cs.name} — Case Study | Feyron`;
      } else {
        document.title = p ? p.metaTitle : 'Feyron | AI Productivity & Technology';
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileNavOpen) {
          setMobileNavOpen(false);
          return;
        }
        if (activeCaseStudy || feyronPage) {
          navigateToPath('/');
        }
      }
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('message', onMessage);
    window.addEventListener('popstate', onPopState);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('message', onMessage);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeCaseStudy, feyronPage, mobileNavOpen]);

  useEffect(() => {
    const syncOverlayLock = () => {
      const gate = document.querySelector('.cs-guide-gate') as HTMLElement | null;
      if (feyronPage || activeCaseStudy) {
        document.documentElement.classList.remove('cs-guide-locked');
        document.body.style.position = '';
        document.body.style.overflow = '';
        if (gate) {
          gate.style.display = 'none';
        }
      } else if (gate && !gate.classList.contains('is-hidden')) {
        gate.style.display = '';
      }
    };
    syncOverlayLock();
    const timer1 = setTimeout(syncOverlayLock, 120);
    const timer2 = setTimeout(syncOverlayLock, 500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [feyronPage, activeCaseStudy]);

  // Suppress intrusive animated mascot & canvas overlays on Admin Dashboard
  useEffect(() => {
    if (feyronPage?.isDashboardPage) {
      document.body.classList.add('feyron-admin-mode');
      const hideMascot = () => {
        const mascot = document.querySelector('.cs-ai-mascot') as HTMLElement | null;
        if (mascot) {
          mascot.style.display = 'none';
          mascot.style.opacity = '0';
          mascot.style.pointerEvents = 'none';
        }
      };
      hideMascot();
      const iv = setInterval(hideMascot, 250);
      return () => {
        clearInterval(iv);
        document.body.classList.remove('feyron-admin-mode');
        const mascot = document.querySelector('.cs-ai-mascot') as HTMLElement | null;
        if (mascot) {
          mascot.style.display = '';
          mascot.style.opacity = '';
          mascot.style.pointerEvents = '';
        }
      };
    }
  }, [feyronPage?.isDashboardPage]);

  const handleCtaAction = (action?: string) => {
    if (!action) return;
    if (action === 'contact' || action === 'audit' || action === '#contact') {
      if (window.__feyronOpenLeadModal) {
        window.__feyronOpenLeadModal();
      } else {
        navigateToPath('/contact');
      }
      return;
    }
    if (action.startsWith('#')) {
      const el = document.getElementById(action.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      navigateToPath('/', action);
      return;
    }
    navigateToPath(action);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = contactName.trim();
    const trimmedContact = contactInfo.trim();
    const trimmedTime = contactTime.trim();

    if (!trimmedName || !trimmedContact || !trimmedTime) {
      setContactErrorMsg('Please fill in your name, email address, and project details.');
      setContactStatus('error');
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact);
    if (!isEmail) {
      setContactErrorMsg('Please enter a valid email address (e.g. you@company.com).');
      setContactStatus('error');
      return;
    }

    setContactStatus('sending');
    setContactErrorMsg('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedContact,
          contact: trimmedContact,
          company: contactCompany.trim(),
          interest: contactInterest,
          description: trimmedTime,
          website: contactHoneypot,
          source: 'contact-page',
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Your message could not be sent right now.');
      }

      try {
        const existing = JSON.parse(localStorage.getItem('feyron-enquiries') || '[]');
        existing.push({
          name: trimmedName,
          contact: trimmedContact,
          company: contactCompany.trim(),
          bottleneck: trimmedTime,
          interest: contactInterest,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('feyron-enquiries', JSON.stringify(existing));
      } catch {
        // ignore storage errors
      }
      setContactStatus('sent');
    } catch (err: any) {
      setContactErrorMsg(
        err?.message || 'Could not send your enquiry right now. Please try again or email hello@feyron.site.'
      );
      setContactStatus('error');
    }
  };

  const handleProductJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = productEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    try {
      const list = JSON.parse(localStorage.getItem('feyron-product-waitlist') || '[]');
      list.push({ email: trimmed, createdAt: new Date().toISOString() });
      localStorage.setItem('feyron-product-waitlist', JSON.stringify(list));
    } catch {
      // ignore
    }
    setProductJoined(true);
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: 'Products Early-Access Subscriber',
        contact: trimmed,
        interest: 'Products Waitlist',
        description: `Joined the Feyron Products early-access waitlist (${trimmed}).`,
        source: 'products-waitlist',
      }),
    }).catch(() => {});
  };

  const renderMobileDrawer = () => {
    if (!mobileNavOpen) return null;
    return (
      <div
        className="cs-mobile-menu is-open"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div
          className="cs-mobile-menu-backdrop"
          onClick={() => setMobileNavOpen(false)}
        />
        <div className="cs-mobile-menu-panel">
          <div className="cs-mobile-menu-header">
            <span className="cs-mobile-menu-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
              <FeyronLogo size={24} fontSize={20} />
            </span>
            <button
              type="button"
              className="cs-mobile-menu-close"
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="cs-mobile-menu-body">
            <div className="cs-mobile-nav-group">
              <span className="cs-mobile-nav-kicker">Navigation</span>
              <button
                type="button"
                className="cs-mobile-link"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/');
                }}
              >
                Home
              </button>
              <button
                type="button"
                className="cs-mobile-link"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/solutions');
                }}
              >
                Solutions
              </button>
              <button
                type="button"
                className="cs-mobile-link"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/products');
                }}
              >
                Products
              </button>
              <button
                type="button"
                className="cs-mobile-link"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/about');
                }}
              >
                About
              </button>
              <button
                type="button"
                className="cs-mobile-link"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/contact');
                }}
              >
                Contact
              </button>
            </div>
            <div className="cs-mobile-nav-group">
              <span className="cs-mobile-nav-kicker">More</span>
              <button
                type="button"
                className="cs-mobile-link"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/how-we-work');
                }}
              >
                How we work
              </button>
              <button
                type="button"
                className="cs-mobile-link"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/who-we-serve');
                }}
              >
                Who we serve
              </button>
              <button
                type="button"
                className="cs-mobile-link"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/responsible-ai');
                }}
              >
                Responsible AI
              </button>
              <button
                type="button"
                className="cs-mobile-link"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/', '#faq');
                }}
              >
                FAQ
              </button>
            </div>
            <div className="cs-mobile-nav-actions">
              <button
                type="button"
                className="cs-mobile-cta"
                onClick={() => {
                  setMobileNavOpen(false);
                  handleCtaAction('contact');
                }}
              >
                Let&apos;s talk
              </button>
              <a href="mailto:hello@feyron.site" className="cs-mobile-contact-line">
                hello@feyron.site · feyron.site · Lagos, Nigeria
              </a>
            </div>
            <div className="cs-mobile-nav-footer">
              <button
                type="button"
                className="cs-mobile-sublink"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/privacy');
                }}
              >
                Privacy policy
              </button>
              <button
                type="button"
                className="cs-mobile-sublink"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/terms');
                }}
              >
                Terms of service
              </button>
              <button
                type="button"
                className="cs-mobile-sublink"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToPath('/admin');
                }}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (activeCaseStudy) {
    return (
      <div
        key={activeCaseStudy.slug}
        data-lenis-prevent=""
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2147483150,
          background: 'var(--paper, #E7E7E7)',
          color: 'var(--ink, #1E1E1E)',
          overflowY: 'auto',
          overflowX: 'hidden',
          fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
        }}
      >
        {/* Top Bar */}
        <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            padding: '18px clamp(18px, 4vw, 44px)',
            background: 'var(--bg, #D4F534)',
            borderBottom: '2.5px solid var(--ink, #1E1E1E)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigateToPath('/')}
              style={{
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                padding: 0,
                fontWeight: 800,
                fontSize: '22px',
                letterSpacing: '-.03em',
                color: 'var(--ink, #1E1E1E)',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <FeyronLogo size={28} fontSize={22} />
            </button>
            <button
              type="button"
              onClick={() => navigateToPath('/', '#selected-work')}
              style={{
                cursor: 'pointer',
                background: 'rgba(30,30,30,0.08)',
                border: '1.5px solid var(--ink, #1E1E1E)',
                borderRadius: '100px',
                padding: '5px 13px',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--ink, #1E1E1E)',
              }}
            >
              ← All Selected Work
            </button>
          </div>

          <div
            className="cs-nav-desktop"
            style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 2.2vw, 32px)', flexWrap: 'wrap' }}
          >
            <button
              type="button"
              onClick={() => navigateToPath('/')}
              style={{
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '6px 0',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: '15px',
                color: 'var(--ink, #1E1E1E)',
              }}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigateToPath('/solutions')}
              style={{
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '6px 0',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: '15px',
                color: 'var(--ink, #1E1E1E)',
              }}
            >
              Solutions
            </button>
            <button
              type="button"
              onClick={() => navigateToPath('/how-we-work')}
              style={{
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '6px 0',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: '15px',
                color: 'var(--ink, #1E1E1E)',
              }}
            >
              How we work
            </button>
            <button
              type="button"
              onClick={() => navigateToPath('/contact')}
              style={{
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '6px 0',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: '15px',
                color: 'var(--ink, #1E1E1E)',
              }}
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() =>
                window.openBooking?.({
                  notes: activeCaseStudy.bookingContextNote,
                  source: `case-study-${activeCaseStudy.slug}`,
                })
              }
              style={{
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '15px',
                background: 'var(--ink, #1E1E1E)',
                color: 'var(--accent, #D4F534)',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '100px',
              }}
            >
              Book a 20-min call
            </button>
          </div>

          <button
            type="button"
            className={`cs-nav-burger ${mobileNavOpen ? 'is-active' : ''}`}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <span className="cs-burger-bar" />
            <span className="cs-burger-bar" />
            <span className="cs-burger-bar" />
          </button>
        </nav>
        {renderMobileDrawer()}

        {/* Hero Header */}
        <header
          style={{
            background: 'var(--bg, #D4F534)',
            color: 'var(--ink, #1E1E1E)',
            padding: 'clamp(48px, 7vw, 96px) clamp(18px, 4vw, 44px)',
            borderBottom: '2.5px solid var(--ink, #1E1E1E)',
          }}
        >
          <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gap: '20px' }}>
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '12px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                fontWeight: 700,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span>Case Study {activeCaseStudy.index}</span>
              <span aria-hidden="true">·</span>
              <span>{activeCaseStudy.division}</span>
              <span aria-hidden="true">·</span>
              <span>{activeCaseStudy.sector}</span>
              <span aria-hidden="true">·</span>
              <span>{activeCaseStudy.timeline}</span>
            </div>

            <h1
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: 'clamp(2.3rem, 5.4vw, 4.6rem)',
                lineHeight: 0.95,
                letterSpacing: '-.035em',
                maxWidth: '20ch',
              }}
            >
              {activeCaseStudy.name}: {activeCaseStudy.headline}
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: '72ch',
                fontSize: 'clamp(16px, 1.3vw, 19.5px)',
                lineHeight: 1.55,
                fontWeight: 500,
              }}
            >
              {activeCaseStudy.summary}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() =>
                  window.openBooking?.({
                    notes: activeCaseStudy.bookingContextNote,
                    source: `case-study-${activeCaseStudy.slug}`,
                  })
                }
                style={{
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                  fontSize: '15.5px',
                  background: 'var(--ink, #1E1E1E)',
                  color: 'var(--accent, #D4F534)',
                  border: '2px solid var(--ink, #1E1E1E)',
                  padding: '14px 28px',
                  borderRadius: '100px',
                }}
              >
                Start a similar project →
              </button>
              <button
                type="button"
                onClick={() => {
                  setContactInterest(`${activeCaseStudy.division} (${activeCaseStudy.name})`);
                  setContactTime(
                    `We would like to build a project similar to ${activeCaseStudy.name} (${activeCaseStudy.headline}).`
                  );
                  navigateToPath('/contact');
                }}
                style={{
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: '15.5px',
                  background: 'transparent',
                  color: 'var(--ink, #1E1E1E)',
                  border: '2px solid var(--ink, #1E1E1E)',
                  padding: '14px 26px',
                  borderRadius: '100px',
                }}
              >
                Send project inquiry
              </button>
              {activeCaseStudy.liveUrl && (
                <a
                  href={activeCaseStudy.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    fontSize: '15.5px',
                    background: '#fff',
                    color: 'var(--ink, #1E1E1E)',
                    border: '2px solid var(--ink, #1E1E1E)',
                    padding: '14px 24px',
                    borderRadius: '100px',
                    textDecoration: 'none',
                  }}
                >
                  Visit live site ↗
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Main Case Study Body */}
        <main
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            padding: 'clamp(40px, 5.5vw, 80px) clamp(18px, 4vw, 44px)',
          }}
        >
          <FeyronCaseStudyView
            study={activeCaseStudy}
            onNavigate={navigateToPath}
            onBookWithContext={(cs) => {
              setContactInterest(`${cs.division} (${cs.name})`);
              setContactTime(
                `We would like to build a project similar to ${cs.name} (${cs.headline}).`
              );
              navigateToPath('/contact');
            }}
          />
        </main>

        {/* Site-wide Footer */}
        <footer
          style={{
            background: 'var(--ink, #1E1E1E)',
            color: 'var(--accent, #D4F534)',
            padding: 'clamp(40px, 6vw, 72px) clamp(18px, 4vw, 44px) clamp(24px, 3vw, 38px)',
          }}
        >
          <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px',
                marginBottom: '40px',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '12px',
                letterSpacing: '.06em',
              }}
            >
              <div style={{ lineHeight: 1.7, maxWidth: '420px' }}>
                <strong
                  style={{
                    color: 'var(--accent, #D4F534)',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '9px',
                    marginBottom: '4px',
                  }}
                >
                  <svg viewBox="0 0 100 100" style={{ width: '20px', height: '20px', flexShrink: 0 }} aria-hidden="true">
                    <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d={FEYRON_MARK_PATH} />
                  </svg>
                  <span>Feyron · Technology that moves work forward.</span>
                </strong>
                <br />
                <span style={{ color: '#cfcfc4' }}>
                  We build AI agents, digital platforms and connected systems that help people and businesses work better.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { slug: '', label: 'Home' },
                  { slug: 'solutions', label: 'Solutions' },
                  { slug: 'products', label: 'Products' },
                  { slug: 'about', label: 'About' },
                  { slug: 'contact', label: 'Contact' },
                  { slug: 'how-we-work', label: 'How we work' },
                  { slug: 'who-we-serve', label: 'Who we serve' },
                  { slug: 'responsible-ai', label: 'Responsible AI' },
                  { slug: 'privacy', label: 'Privacy Policy' },
                  { slug: 'terms', label: 'Terms of Service' },
                { slug: 'admin', label: 'Admin' },
                ].map((l) => (
                  <button
                    key={l.slug}
                    type="button"
                    onClick={() => navigateToPath(`/${l.slug}`)}
                    style={{
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontFamily: 'inherit',
                      fontSize: '12px',
                      color: 'var(--accent, #D4F534)',
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.14)',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11px',
                color: '#9a9a8c',
              }}
            >
              <span>© 2026 Feyron. All rights reserved.</span>
              <span>
                <a href="https://feyron.site" style={{ color: 'var(--accent, #D4F534)', textDecoration: 'none' }}>
                  feyron.site
                </a>{' '}
                ·{' '}
                <a href="mailto:hello@feyron.site" style={{ color: 'var(--accent, #D4F534)', textDecoration: 'none' }}>
                  hello@feyron.site
                </a>{' '}
                · Lagos, Nigeria
              </span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (!feyronPage) return null;

  return (
    <div
      data-lenis-prevent=""
      data-feyron-dashboard={feyronPage.isDashboardPage ? 'true' : undefined}
      className={feyronPage.isDashboardPage ? 'feyron-admin-page' : ''}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483150,
        background: 'var(--paper, #E7E7E7)',
        color: 'var(--ink, #1E1E1E)',
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
      }}
    >
      {/* Top Bar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '18px clamp(18px, 4vw, 44px)',
          background: 'var(--bg, #D4F534)',
          borderBottom: '2.5px solid var(--ink, #1E1E1E)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={() => navigateToPath('/')}
            style={{
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontWeight: 800,
              fontSize: '22px',
              letterSpacing: '-.03em',
              color: 'var(--ink, #1E1E1E)',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <FeyronLogo size={28} fontSize={22} />
          </button>
          <button
            type="button"
            onClick={() => navigateToPath('/')}
            style={{
              cursor: 'pointer',
              background: 'rgba(30,30,30,0.08)',
              border: '1.5px solid var(--ink, #1E1E1E)',
              borderRadius: '100px',
              padding: '5px 13px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11.5px',
              fontWeight: 600,
              color: 'var(--ink, #1E1E1E)',
            }}
          >
            ← Home
          </button>
        </div>

        <div className="cs-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 2.2vw, 32px)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigateToPath('/')}
            style={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '6px 0',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '15px',
              color: 'var(--ink, #1E1E1E)',
            }}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => navigateToPath('/solutions')}
            style={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '6px 0',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '15px',
              color: 'var(--ink, #1E1E1E)',
            }}
          >
            Solutions
          </button>
          <button
            type="button"
            onClick={() => navigateToPath('/products')}
            style={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '6px 0',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '15px',
              color: 'var(--ink, #1E1E1E)',
            }}
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => navigateToPath('/about')}
            style={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '6px 0',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '15px',
              color: 'var(--ink, #1E1E1E)',
            }}
          >
            About
          </button>
          <button
            type="button"
            onClick={() => navigateToPath('/contact')}
            style={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '6px 0',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '15px',
              color: 'var(--ink, #1E1E1E)',
            }}
          >
            Contact
          </button>
          <button
            type="button"
            onClick={() => handleCtaAction('contact')}
            style={{
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: '15px',
              background: 'var(--ink, #1E1E1E)',
              color: 'var(--accent, #D4F534)',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '100px',
            }}
          >
            Let&apos;s talk
          </button>
        </div>

        <button
          type="button"
          className={`cs-nav-burger ${mobileNavOpen ? 'is-active' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((o) => !o)}
        >
          <span className="cs-burger-bar" />
          <span className="cs-burger-bar" />
          <span className="cs-burger-bar" />
        </button>
      </nav>
      {renderMobileDrawer()}

      {/* Hero Header */}
      <header
        style={{
          background: 'var(--bg, #D4F534)',
          color: 'var(--ink, #1E1E1E)',
          padding: 'clamp(52px, 8vw, 110px) clamp(18px, 4vw, 44px)',
          borderBottom: '2.5px solid var(--ink, #1E1E1E)',
        }}
      >
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'clamp(28px, 4vw, 52px)',
          }}
        >
          <div style={{ flex: '1 1 540px', minWidth: '280px' }}>
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '12px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                marginBottom: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--ink, #1E1E1E)',
                }}
              />
              {feyronPage.kicker}
            </div>

            <h1
              style={{
                margin: '0 0 22px',
                fontWeight: 800,
                fontSize: 'clamp(2.4rem, 6vw, 5.2rem)',
                lineHeight: 0.94,
                letterSpacing: '-.035em',
                maxWidth: '18ch',
              }}
            >
              {feyronPage.headline}
            </h1>

            {feyronPage.subheading && (
              <p
                style={{
                  margin: 0,
                  maxWidth: '680px',
                  fontSize: 'clamp(16px, 1.35vw, 20px)',
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                {feyronPage.subheading}
              </p>
            )}

            {feyronPage.primaryCta && !feyronPage.isContactPage && !feyronPage.isDashboardPage && (
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={() => handleCtaAction(feyronPage.primaryCta.action)}
                  style={{
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    fontSize: '16px',
                    background: 'var(--ink, #1E1E1E)',
                    color: 'var(--accent, #D4F534)',
                    border: '2px solid var(--ink, #1E1E1E)',
                    padding: '15px 28px',
                    borderRadius: '100px',
                  }}
                >
                  {feyronPage.primaryCta.label}
                </button>
                <button
                  type="button"
                  onClick={() => navigateToPath('/solutions')}
                  style={{
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    fontSize: '16px',
                    background: 'transparent',
                    color: 'var(--ink, #1E1E1E)',
                    border: '2px solid var(--ink, #1E1E1E)',
                    padding: '15px 28px',
                    borderRadius: '100px',
                  }}
                >
                  Explore what we build
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main
        style={{
          maxWidth: feyronPage.isDashboardPage ? '1440px' : '1160px',
          width: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
          margin: '0 auto',
          padding: feyronPage.isDashboardPage
            ? 'clamp(20px, 3.5vw, 44px) clamp(14px, 2.8vw, 36px)'
            : 'clamp(44px, 6vw, 90px) clamp(18px, 4vw, 44px)',
          display: 'flex',
          flexDirection: 'column',
          gap: feyronPage.isDashboardPage ? '28px' : 'clamp(36px, 4.5vw, 56px)',
        }}
      >
        {/* Dedicated Products Early-Access Waitlist Section on /products */}
        {feyronPage.isProductsPage && (
          <section
            style={{
              background: '#fff',
              border: '2.5px solid var(--ink, #1E1E1E)',
              borderRadius: '24px',
              padding: 'clamp(28px, 4vw, 44px)',
              boxShadow: '8px 8px 0 rgba(30,30,30,0.9)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: '#15803d',
                marginBottom: '10px',
                background: '#dcfce7',
                border: '1.5px solid #86efac',
                padding: '4px 12px',
                borderRadius: '100px',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
              Early Access Waitlist · Feyron Products
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 800 }}>
              Join the Products Early-Access Waitlist
            </h2>
            <p style={{ margin: '0 0 22px', fontSize: '15.5px', lineHeight: 1.6, maxWidth: '640px', color: '#2c301c', fontWeight: 500 }}>
              We build technology that moves work forward. Join our early-access list to receive private test flight invites, previews of our upcoming workflow platforms, and direct founder updates before public release.
            </p>
            {productJoined ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 22px',
                  borderRadius: '14px',
                  background: 'var(--bg, #D4F534)',
                  border: '2px solid var(--ink, #1E1E1E)',
                  fontWeight: 700,
                  fontSize: '15px',
                }}
              >
                ✓ You are on the early-access list. We have sent a confirmation to your email.
              </div>
            ) : (
              <form
                onSubmit={handleProductJoin}
                style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', maxWidth: '580px' }}
              >
                <input
                  type="email"
                  required
                  value={productEmail}
                  onChange={(e) => setProductEmail(e.target.value)}
                  placeholder="Enter your email (e.g. you@company.com)"
                  style={{
                    flex: '1 1 280px',
                    padding: '14px 18px',
                    borderRadius: '100px',
                    border: '2px solid var(--ink, #1E1E1E)',
                    background: 'var(--paper, #E7E7E7)',
                    fontFamily: 'inherit',
                    fontSize: '15px',
                    color: 'var(--ink, #1E1E1E)',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    cursor: 'pointer',
                    background: 'var(--ink, #1E1E1E)',
                    color: 'var(--accent, #D4F534)',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '14px 28px',
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  Join Waitlist →
                </button>
              </form>
            )}
            <div style={{ marginTop: '14px', fontFamily: "'Geist Mono', monospace", fontSize: '11.5px', color: '#666' }}>
              Zero noise policy · No spam · Unsubscribe anytime · Direct founder updates
            </div>
          </section>
        )}

        {/* Dedicated Contact Form on /contact */}
        {feyronPage.isContactPage && (
          <section
            style={{
              background: '#fff',
              border: '2.5px solid var(--ink, #1E1E1E)',
              borderRadius: '24px',
              padding: 'clamp(24px, 3.5vw, 44px)',
              boxShadow: '8px 8px 0 rgba(30,30,30,0.9)',
            }}
          >
            {contactStatus === 'sent' ? (
              <div style={{ padding: '20px 0' }}>
                <div
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    color: '#15803d',
                    marginBottom: '10px',
                  }}
                >
                  ✓ Enquiry received
                </div>
                <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700 }}>
                  Thanks for reaching out.
                </h2>
                <p style={{ margin: '0 0 18px', fontSize: '16px', lineHeight: 1.55, fontWeight: 500, color: '#2c301c' }}>
                  Your enquiry has been received. We&apos;ll review the details and get back to you.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => window.openBooking?.({ name: contactName, source: 'contact-page' })}
                    style={{
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 700,
                      fontSize: '14.5px',
                      background: 'var(--accent, #D4F534)',
                      color: 'var(--ink, #1E1E1E)',
                      border: '2px solid var(--ink, #1E1E1E)',
                      padding: '12px 24px',
                      borderRadius: '100px',
                    }}
                  >
                    Book a 20-min call →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setContactName('');
                      setContactInfo('');
                      setContactCompany('');
                      setContactTime('');
                      setContactStatus('idle');
                    }}
                    style={{
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 700,
                      fontSize: '14.5px',
                      background: 'var(--ink, #1E1E1E)',
                      color: 'var(--accent, #D4F534)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '100px',
                    }}
                  >
                    Send another enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} noValidate style={{ display: 'grid', gap: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    padding: '14px 18px',
                    background: 'var(--paper, #E7E7E7)',
                    border: '2px solid var(--ink, #1E1E1E)',
                    borderRadius: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '14.5px', fontWeight: 600 }}>
                    <button
                      type="button"
                      onClick={() => window.openBooking?.({ name: contactName, source: 'contact-page' })}
                      style={{
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        background: 'var(--ink, #1E1E1E)',
                        color: 'var(--accent, #D4F534)',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: '100px',
                      }}
                    >
                      Book a 20-min call →
                    </button>
                    <span style={{ fontSize: '13.5px' }}>
                      or email{' '}
                      <a
                        href="mailto:hello@feyron.site"
                        style={{
                          color: 'var(--ink, #1E1E1E)',
                          fontWeight: 700,
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                        }}
                      >
                        hello@feyron.site
                      </a>
                    </span>
                  </div>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '12px', color: '#555' }}>
                    Lagos, Nigeria · 20-min video call
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '18px',
                  }}
                >
                  <label style={{ display: 'grid', gap: '7px', fontWeight: 700, fontSize: '14.5px' }}>
                    Full name
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name"
                      required
                      style={{
                        padding: '13px 15px',
                        borderRadius: '12px',
                        border: '2px solid var(--ink, #1E1E1E)',
                        background: 'var(--paper, #E7E7E7)',
                        fontFamily: 'inherit',
                        fontSize: '15px',
                      }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '7px', fontWeight: 700, fontSize: '14.5px' }}>
                    Work email
                    <input
                      type="email"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="you@company.com"
                      required
                      style={{
                        padding: '13px 15px',
                        borderRadius: '12px',
                        border: '2px solid var(--ink, #1E1E1E)',
                        background: 'var(--paper, #E7E7E7)',
                        fontFamily: 'inherit',
                        fontSize: '15px',
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  name="website"
                  value={contactHoneypot}
                  onChange={(e) => setContactHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-5000px', width: '1px', height: '1px', opacity: 0 }}
                />

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '18px',
                  }}
                >
                  <label style={{ display: 'grid', gap: '7px', fontWeight: 700, fontSize: '14.5px' }}>
                    Company or organisation
                    <input
                      type="text"
                      value={contactCompany}
                      onChange={(e) => setContactCompany(e.target.value)}
                      placeholder="Company name (optional)"
                      style={{
                        padding: '13px 15px',
                        borderRadius: '12px',
                        border: '2px solid var(--ink, #1E1E1E)',
                        background: 'var(--paper, #E7E7E7)',
                        fontFamily: 'inherit',
                        fontSize: '15px',
                      }}
                    />
                  </label>

                  <div style={{ display: 'grid', gap: '7px', fontWeight: 700, fontSize: '14.5px' }}>
                    <label htmlFor="feyron-contact-interest">
                      What workflow, system or project do you want to automate or build?
                    </label>
                    <input
                      id="feyron-contact-interest"
                      type="text"
                      value={contactInterest}
                      onChange={(e) => setContactInterest(e.target.value)}
                      placeholder="Type anything — e.g. AI workflow automation, custom portal, payment sync…"
                      style={{
                        padding: '13px 15px',
                        borderRadius: '12px',
                        border: '2px solid var(--ink, #1E1E1E)',
                        background: 'var(--paper, #E7E7E7)',
                        fontFamily: 'inherit',
                        fontSize: '15px',
                        color: 'var(--ink, #1E1E1E)',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                      {[
                        'AI Automation',
                        'Custom Workflow Agent',
                        'Website Development',
                        'Software & Platform Development',
                        'API & Systems Integration',
                        'Payment & Fintech Integration',
                      ].map((tag) => {
                        const active = contactInterest.trim().toLowerCase() === tag.toLowerCase();
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setContactInterest(tag)}
                            style={{
                              cursor: 'pointer',
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '100px',
                              border: '1.5px solid var(--ink, #1E1E1E)',
                              background: active ? 'var(--ink, #1E1E1E)' : '#fff',
                              color: active ? 'var(--accent, #D4F534)' : 'var(--ink, #1E1E1E)',
                            }}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <label style={{ display: 'grid', gap: '7px', fontWeight: 700, fontSize: '14.5px' }}>
                  Tell us about your project
                  <textarea
                    rows={4}
                    value={contactTime}
                    onChange={(e) => setContactTime(e.target.value)}
                    placeholder="What are you trying to build, improve or solve?"
                    required
                    style={{
                      padding: '13px 15px',
                      borderRadius: '12px',
                      border: '2px solid var(--ink, #1E1E1E)',
                      background: 'var(--paper, #E7E7E7)',
                      fontFamily: 'inherit',
                      fontSize: '15px',
                      resize: 'vertical',
                    }}
                  />
                </label>

                {contactStatus === 'error' && (
                  <p
                    style={{
                      margin: 0,
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      fontWeight: 600,
                      fontSize: '14.5px',
                    }}
                  >
                    {contactErrorMsg || 'Your message did not send. Please check your details and try again.'}
                  </p>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={contactStatus === 'sending'}
                    style={{
                      cursor: contactStatus === 'sending' ? 'default' : 'pointer',
                      opacity: contactStatus === 'sending' ? 0.65 : 1,
                      fontFamily: 'inherit',
                      fontWeight: 700,
                      fontSize: '16px',
                      background: 'var(--ink, #1E1E1E)',
                      color: 'var(--accent, #D4F534)',
                      border: 'none',
                      padding: '16px 34px',
                      borderRadius: '100px',
                    }}
                  >
                    {contactStatus === 'sending' ? 'Sending enquiry…' : 'Send enquiry'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* Team Operations Dashboard on /dashboard */}
        {feyronPage.isDashboardPage && <TeamDashboardSection />}

        {/* Interactive Before & After Workflow Visualizer */}
        {(feyronPage.slug === 'solutions' ||
          feyronPage.slug === 'ai-automation' ||
          feyronPage.slug === 'how-we-work') && <WorkflowVisualizerCard />}

        {/* Interactive Workflow ROI & Time-Saved Calculator */}
        {(feyronPage.slug === 'solutions' ||
          feyronPage.slug === 'ai-automation' ||
          feyronPage.slug === 'how-we-work' ||
          feyronPage.isContactPage) && (
          <WorkflowRoiCalculatorCard
            onBookWithContext={(summary) => {
              setContactTime(summary);
              if (!feyronPage.isContactPage) {
                navigateToPath('/contact');
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        )}

        {feyronPage.sections.map((sec, idx) => (
          <section
            key={idx}
            style={{
              background: '#fff',
              border: '2.5px solid var(--ink, #1E1E1E)',
              borderRadius: '24px',
              padding: 'clamp(24px, 3.5vw, 42px)',
              boxShadow: '6px 6px 0 rgba(30,30,30,0.88)',
            }}
          >
            {sec.kicker && (
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
                {sec.kicker}
              </div>
            )}
            <h2
              style={{
                margin: '0 0 16px',
                fontWeight: 800,
                fontSize: 'clamp(1.55rem, 3vw, 2.35rem)',
                lineHeight: 1.05,
                letterSpacing: '-.025em',
              }}
            >
              {sec.heading}
            </h2>

            {sec.body?.map((p, pIdx) => (
              <p
                key={pIdx}
                style={{
                  margin: '0 0 14px',
                  fontSize: 'clamp(15.5px, 1.2vw, 17.5px)',
                  lineHeight: 1.6,
                  fontWeight: 500,
                  color: '#2c301c',
                  maxWidth: '76ch',
                }}
              >
                {p}
              </p>
            ))}

            {sec.bullets && sec.bullets.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    sec.bullets.length > 2 ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr',
                  gap: '16px',
                  marginTop: '18px',
                }}
              >
                {sec.bullets.map((b, bIdx) => (
                  <div
                    key={bIdx}
                    style={{
                      background: 'var(--paper, #E7E7E7)',
                      border: '2px solid var(--ink, #1E1E1E)',
                      borderRadius: '18px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div>
                      {b.title && (
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: '17.5px',
                            marginBottom: '6px',
                            letterSpacing: '-.015em',
                          }}
                        >
                          {b.title}
                        </div>
                      )}
                      <div style={{ fontSize: '15px', lineHeight: 1.55, color: '#2c301c', fontWeight: 500 }}>
                        {b.text}
                      </div>
                    </div>
                    {b.linkHref && b.linkText && (
                      <div>
                        <button
                          type="button"
                          onClick={() => handleCtaAction(b.linkHref)}
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
                            letterSpacing: '.06em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {b.linkText}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {sec.steps && sec.steps.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '18px',
                  marginTop: '20px',
                }}
              >
                {sec.steps.map((st, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      background: 'var(--bg, #D4F534)',
                      border: '2px solid var(--ink, #1E1E1E)',
                      borderRadius: '18px',
                      padding: '20px 22px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: '11.5px',
                        letterSpacing: '.14em',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                        fontWeight: 700,
                      }}
                    >
                      Step {st.num}
                    </div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '19px', fontWeight: 800 }}>{st.title}</h3>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.55, fontWeight: 500 }}>{st.text}</p>
                  </div>
                ))}
              </div>
            )}

            {sec.note && (
              <div
                style={{
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop: '1.5px dashed rgba(30,30,30,0.25)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--ink, #1E1E1E)',
                }}
              >
                {sec.note}
              </div>
            )}

            {/* Early access email form on /products exploration section */}
            {feyronPage.isProductsPage && (sec.kicker === "Areas we are exploring" || sec.kicker === "What we're exploring") && (
              <div style={{ marginTop: '22px' }}>
                {productJoined ? (
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      background: 'var(--bg, #D4F534)',
                      border: '2px solid var(--ink, #1E1E1E)',
                      fontWeight: 700,
                    }}
                  >
                    Thank you. You are on the early access list.
                  </div>
                ) : (
                  <form
                    onSubmit={handleProductJoin}
                    style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', maxWidth: '520px' }}
                  >
                    <input
                      type="text"
                      required
                      value={productEmail}
                      onChange={(e) => setProductEmail(e.target.value)}
                      placeholder="Your contact details"
                      style={{
                        flex: '1 1 240px',
                        padding: '13px 16px',
                        borderRadius: '100px',
                        border: '2px solid var(--ink, #1E1E1E)',
                        background: 'var(--paper, #E7E7E7)',
                        fontFamily: 'inherit',
                        fontSize: '15px',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        cursor: 'pointer',
                        background: 'var(--ink, #1E1E1E)',
                        color: 'var(--accent, #D4F534)',
                        border: 'none',
                        borderRadius: '100px',
                        padding: '13px 26px',
                        fontFamily: 'inherit',
                        fontWeight: 700,
                        fontSize: '15px',
                      }}
                    >
                      Join the list
                    </button>
                  </form>
                )}
              </div>
            )}

            {sec.ctaText && sec.ctaAction && (
              <div style={{ marginTop: '22px' }}>
                <button
                  type="button"
                  onClick={() => handleCtaAction(sec.ctaAction)}
                  style={{
                    cursor: 'pointer',
                    background: 'var(--ink, #1E1E1E)',
                    color: 'var(--accent, #D4F534)',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '13px 26px',
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  {sec.ctaText}
                </button>
              </div>
            )}
          </section>
        ))}

        {/* Official Feyron Brand & Visual Identity Showcase on /about */}
        {feyronPage.slug === 'about' && (
          <section
            style={{
              background: '#1E1E1E',
              color: '#fff',
              border: '2.5px solid var(--ink, #1E1E1E)',
              borderRadius: '24px',
              padding: 'clamp(24px, 3.8vw, 46px)',
              boxShadow: '8px 8px 0 rgba(30,30,30,0.9)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11.5px',
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: '#D4F534',
                marginBottom: '12px',
              }}
            >
              <svg viewBox="0 0 100 100" style={{ width: '15px', height: '15px' }} aria-hidden="true">
                <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d={FEYRON_MARK_PATH} />
              </svg>
              <span>05 · Brand &amp; Visual Identity</span>
            </div>
            <h2
              style={{
                margin: '0 0 12px',
                fontWeight: 800,
                fontSize: 'clamp(1.65rem, 3.2vw, 2.5rem)',
                lineHeight: 1.05,
                letterSpacing: '-.025em',
                color: '#fff',
              }}
            >
              Designed for clarity across software, devices and culture
            </h2>
            <p
              style={{
                margin: '0 0 28px',
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#d4d4cc',
                maxWidth: '72ch',
              }}
            >
              The Feyron mark represents an intelligent, connected interface — engineered with clean geometry, warm high-contrast palettes and human-first simplicity across every product we ship.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '18px',
              }}
            >
              <div
                className="cs-brand-duotone"
                style={{
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(var(--accent-rgb, 254, 180, 123), 0.28)',
                  background: '#141414',
                }}
              >
                <img
                  src="/site/assets/brand/project_120.png"
                  alt="Feyron — The engine behind smarter business execution"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div
                style={{
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(var(--accent-rgb, 254, 180, 123), 0.28)',
                  background: '#141414',
                }}
              >
                <img
                  className="cs-brand-hue"
                  src="/site/assets/brand/mission_vision.png"
                  alt="Feyron Mission & Vision"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div
                style={{
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(var(--accent-rgb, 254, 180, 123), 0.28)',
                  background: '#141414',
                }}
              >
                <img
                  className="cs-brand-hue"
                  src="/site/assets/brand/jpg1.jpg"
                  alt="Feyron hardware and connected system interface"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div
                style={{
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(var(--accent-rgb, 254, 180, 123), 0.28)',
                  background: '#141414',
                }}
              >
                <img
                  className="cs-brand-hue"
                  src="/site/assets/brand/phone_mockup.png"
                  alt="Feyron OS mobile mockup"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div
                style={{
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(var(--accent-rgb, 254, 180, 123), 0.28)',
                  background: '#141414',
                }}
              >
                <img
                  className="cs-brand-hue"
                  src="/site/assets/brand/colour_palette.png"
                  alt="Feyron Official Brand Colour Palette"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div
                style={{
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(var(--accent-rgb, 254, 180, 123), 0.28)',
                  background: '#141414',
                }}
              >
                <img
                  className="cs-brand-hue"
                  src="/site/assets/brand/jpg2.jpg"
                  alt="Feyron studio apparel"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Closing Banner */}
        {(feyronPage.closingLine || (!feyronPage.isContactPage && !feyronPage.isProductsPage && !feyronPage.isDashboardPage)) && (
          <section
            style={{
              background: 'var(--bg, #D4F534)',
              border: '2.5px solid var(--ink, #1E1E1E)',
              borderRadius: '24px',
              padding: 'clamp(28px, 4vw, 52px)',
              boxShadow: '8px 8px 0 rgba(30,30,30,0.9)',
            }}
          >
            <h2
              style={{
                margin: '0 0 18px',
                fontWeight: 800,
                fontSize: 'clamp(1.7rem, 3.4vw, 2.7rem)',
                lineHeight: 1.05,
                letterSpacing: '-.03em',
                maxWidth: '28ch',
              }}
            >
              {feyronPage.closingLine || 'Tell us about the work that slows you down.'}
            </h2>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleCtaAction(feyronPage.primaryCta.action)}
                style={{
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: '15.5px',
                  background: 'var(--ink, #1E1E1E)',
                  color: 'var(--accent, #D4F534)',
                  border: '2px solid var(--ink, #1E1E1E)',
                  padding: '14px 28px',
                  borderRadius: '100px',
                }}
              >
                {feyronPage.primaryCta.label}
              </button>
              <button
                type="button"
                onClick={() => handleCtaAction('audit')}
                style={{
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: '15.5px',
                  background: 'transparent',
                  color: 'var(--ink, #1E1E1E)',
                  border: '2px solid var(--ink, #1E1E1E)',
                  padding: '14px 28px',
                  borderRadius: '100px',
                }}
              >
                Book a workflow audit
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Site-wide Footer */}
      <footer
        style={{
          background: 'var(--ink, #1E1E1E)',
          color: 'var(--accent, #D4F534)',
          padding: 'clamp(40px, 6vw, 72px) clamp(18px, 4vw, 44px) clamp(24px, 3vw, 38px)',
        }}
      >
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
              marginBottom: '40px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              letterSpacing: '.06em',
            }}
          >
            <div style={{ lineHeight: 1.7, maxWidth: '420px' }}>
              <strong
                style={{
                  color: 'var(--accent, #D4F534)',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '9px',
                  marginBottom: '4px',
                }}
              >
                <svg viewBox="0 0 100 100" style={{ width: '20px', height: '20px', flexShrink: 0 }} aria-hidden="true">
                  <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d={FEYRON_MARK_PATH} />
                </svg>
                <span>Feyron · Technology that moves work forward.</span>
              </strong>
              <br />
              <span style={{ color: '#cfcfc4' }}>
                We build AI agents, digital platforms and connected systems that help people and businesses work better.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { slug: '', label: 'Home' },
                { slug: 'solutions', label: 'Solutions' },
                { slug: 'products', label: 'Products' },
                { slug: 'about', label: 'About' },
                { slug: 'contact', label: 'Contact' },
                { slug: 'how-we-work', label: 'How we work' },
                { slug: 'who-we-serve', label: 'Who we serve' },
                { slug: 'responsible-ai', label: 'Responsible AI' },
                { slug: 'privacy', label: 'Privacy Policy' },
                { slug: 'terms', label: 'Terms of Service' },
              ].map((l) => (
                <button
                  key={l.slug}
                  type="button"
                  onClick={() =>
                    l.slug.startsWith('#') ? navigateToPath('/', l.slug) : navigateToPath(`/${l.slug}`)
                  }
                  style={{
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontFamily: 'inherit',
                    fontSize: '12px',
                    color: 'var(--accent, #D4F534)',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255,255,255,0.14)',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11px',
              color: '#9a9a8c',
            }}
          >
            <span>© 2026 Feyron. All rights reserved.</span>
            <span>
              <a
                href="https://feyron.site"
                style={{ color: 'var(--accent, #D4F534)', textDecoration: 'none' }}
              >
                feyron.site
              </a>{' '}
              ·{' '}
              <a
                href="mailto:hello@feyron.site"
                style={{ color: 'var(--accent, #D4F534)', textDecoration: 'none' }}
              >
                hello@feyron.site
              </a>{' '}
              · Lagos, Nigeria
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
