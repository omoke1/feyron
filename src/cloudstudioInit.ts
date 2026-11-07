import {
  CS_STYLES,
  CS_XDC_INNER,
  CS_DC_DATA_PROPS,
  CS_DC_SCRIPT_CODE,
} from './cloudstudioTemplate';

declare global {
  interface Window {
    __CS_BOOTED?: boolean;
    __CS_RAW_XDC_INNER?: string;
    __resources?: Record<string, string>;
    __csPlayLottieSound?: (kind?: string, isClick?: boolean) => void;
    openBooking?: (opts?: { name?: string; notes?: string; lang?: string; source?: string }) => void;
  }
}

interface ScoreEntry {
  player: string;
  score: number;
  character?: string | null;
}

const INITIAL_LEADERBOARD: ScoreEntry[] = [
  { player: 'GNG', score: 500 },
  { player: 'TON', score: 500 },
  { player: 'DIH', score: 500 },
  { player: 'XYI', score: 500 },
  { player: 'ELO', score: 500 },
  { player: 'DML', score: 500 },
  { player: 'RDL', score: 500 },
  { player: 'GMG', score: 500 },
  { player: 'ALL', score: 500 },
  { player: 'DLL', score: 500 },
];

function getLeaderboard(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem('cs-leaderboard-entries');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return [...INITIAL_LEADERBOARD];
}

function saveLeaderboard(list: ScoreEntry[]) {
  try {
    localStorage.setItem('cs-leaderboard-entries', JSON.stringify(list));
  } catch {
    // ignore
  }
}

function installFetchInterceptor() {
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.pathname + input.search
          : input.url;

    try {
      const u = new URL(urlStr, window.location.origin);

      // 1. Raw DC template source
      if (u.pathname === '/site/dc-source.html') {
        const html = `<x-dc>${CS_XDC_INNER}</x-dc><script type="text/x-dc" data-dc-script="" data-props="${CS_DC_DATA_PROPS}">${CS_DC_SCRIPT_CODE}</script>`;
        return new Response(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      // 2. Legacy /contact POST -> forward to real /api/contact endpoint
      if (u.pathname === '/contact' && init?.method?.toUpperCase() === 'POST') {
        return nativeFetch('/api/contact', init);
      }

      // 3. Leaderboard top scores
      if (u.pathname === '/api/leaderboard/top') {
        const list = getLeaderboard()
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        return new Response(JSON.stringify({ success: true, data: list }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 4. Submit score to leaderboard
      if (u.pathname === '/api/leaderboard' && init?.method?.toUpperCase() === 'POST') {
        const body = init.body ? JSON.parse(String(init.body)) : {};
        const player = String(body.player || 'YOU').slice(0, 3).toUpperCase();
        const score = Math.min(500, Math.max(0, Number(body.score) || 0));
        const list = getLeaderboard();
        list.push({ player, score, character: body.character || null });
        list.sort((a, b) => b.score - a.score);
        const rank = list.findIndex((r) => r.player === player && r.score === score) + 1;
        saveLeaderboard(list.slice(0, 25));
        return new Response(JSON.stringify({ success: true, data: { rank } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 5. Legacy /bookings/slots -> forward to real /api/bookings
      if (u.pathname === '/bookings/slots') {
        const dateParam = u.searchParams.get('date') || '';
        return nativeFetch(`/api/bookings?date=${encodeURIComponent(dateParam)}`, init);
      }

      // 6. Legacy /bookings POST -> forward to real /api/bookings
      if (u.pathname === '/bookings' && init?.method?.toUpperCase() === 'POST') {
        return nativeFetch('/api/bookings', init);
      }
    } catch {
      // fall through to nativeFetch
    }

    return nativeFetch(input, init);
  };
}

function loadExternalScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

function setupPostMountEnhancements() {
  // 1. Hero headline binary-search fitter
  let raf = 0;
  function fitHeroHeadline() {
    const h1 = document.querySelector('#top h1') as HTMLElement | null;
    const top = document.getElementById('top');
    if (!h1 || !top) return;
    const cs = getComputedStyle(top);
    const contW =
      top.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const label = top.querySelector('div[data-reveal]') as HTMLElement | null;
    const tail = h1.nextElementSibling as HTMLElement | null;
    const frame = Math.min(top.clientHeight, window.innerHeight);
    const avail =
      frame -
      parseFloat(cs.paddingTop) -
      parseFloat(cs.paddingBottom) -
      (label ? label.offsetHeight : 0) -
      (tail ? tail.offsetHeight : 0) -
      48;
    if (avail < 100 || contW < 100) return;
    let lo = 30;
    let hi = 420;
    let best = 30;
    for (let i = 0; i < 10; i++) {
      const mid = (lo + hi) / 2;
      h1.style.setProperty('font-size', mid + 'px', 'important');
      if (h1.scrollWidth <= contW + 1 && h1.offsetHeight <= avail) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    if (window.innerWidth > 640) {
      best *= 0.85 * 0.9;
      best = Math.min(best, Math.min(window.innerWidth * 0.11, 176));
    }
    h1.style.setProperty('font-size', Math.floor(best) + 'px', 'important');
  }

  function queueFit() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fitHeroHeadline);
  }

  window.addEventListener('resize', queueFit);
  window.addEventListener('orientationchange', queueFit);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(queueFit);
  }
  queueFit();
  setTimeout(queueFit, 300);

  // 2. Work cards parallax + floating data chips
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    const tickParallax = () => {
      const cards = Array.from(document.querySelectorAll('.cs-wgrid > *'));
      const vh = window.innerHeight;
      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        const mid = (r.top + r.height / 2 - vh / 2) / vh;
        const img = c.querySelector('.wimg') as HTMLElement | null;
        if (img) img.style.setProperty('--py', (mid * -6).toFixed(2) + '%');
        Array.from(c.querySelectorAll('[data-wfloat]')).forEach((f) => {
          const factor = parseFloat(f.getAttribute('data-wfloat') || '0');
          (f as HTMLElement).style.setProperty(
            '--fy',
            (mid * vh * factor).toFixed(1) + 'px'
          );
        });
      });
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(tickParallax);
        }
      },
      { passive: true }
    );
    window.addEventListener('resize', tickParallax);
    tickParallax();
  }

  // 3. Interactive Lottie & Physics Pill harmonic sound triggers
  document.querySelectorAll('#cs-physics-box [data-pill]').forEach((pill, i) => {
    pill.addEventListener('pointerdown', () => {
      if (window.__csPlayLottieSound) {
        window.__csPlayLottieSound('pill-' + i, true);
      }
    });
  });

  // 4. Cookie notice
  try {
    if (localStorage.getItem('cs-cookie-note') !== '1') {
      const note = document.getElementById('cs-cookie-note');
      if (note) {
        note.hidden = false;
        setTimeout(() => note.classList.add('is-in'), 1400);
        const okBtn = note.querySelector('[data-cookie-ok]');
        if (okBtn) {
          okBtn.addEventListener('click', () => {
            note.classList.remove('is-in');
            try {
              localStorage.setItem('cs-cookie-note', '1');
            } catch {
              // ignore
            }
            setTimeout(() => note.remove(), 450);
          });
        }
      }
    }
  } catch {
    // ignore
  }

  // 5. Mobile hamburger menu & drawer navigation
  setupMainMobileMenu();

  // 6. Connect FAQ "Ask the chatbot" CTA button
  document.querySelectorAll('[data-faq-chat]').forEach((btn) => {
    (btn as HTMLElement).onclick = (e) => {
      e.preventDefault();
      const win = window as any;
      if (typeof win.csOpenChat === 'function') {
        win.csOpenChat();
      } else {
        const mascot = document.querySelector('.cs-ai-mascot') as HTMLElement | null;
        if (mascot) mascot.click();
      }
    };
  });

  // 7. Add visible "Book a 20-min call" button in the #contact section on the homepage
  const contactSection = document.getElementById('contact');
  if (contactSection && !contactSection.querySelector('[data-book]')) {
    const primaryCta = contactSection.querySelector('[data-lead]') as HTMLElement | null;
    if (primaryCta && primaryCta.parentElement) {
      const bookBtn = document.createElement('button');
      bookBtn.type = 'button';
      bookBtn.setAttribute('data-book', '');
      bookBtn.textContent = 'Book a 20-min call';
      bookBtn.style.cssText =
        'cursor:pointer;font-family:inherit;font-weight:700;font-size:clamp(15px,1.2vw,18px);background:transparent;color:var(--accent,#fff48d);border:2px solid var(--accent,#fff48d);padding:18px 34px;border-radius:100px;margin-left:12px;margin-top:8px;transition:transform .25s ease';
      bookBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.openBooking) window.openBooking({ source: 'homepage-contact' });
      };
      primaryCta.parentElement.appendChild(bookBtn);
    }
  }

  // 8. Inject Interactive Workflow Estimator & Before/After Architecture on Homepage
  if (contactSection && !document.getElementById('cs-workflow-interactive')) {
    const interactiveSec = document.createElement('section');
    interactiveSec.id = 'cs-workflow-interactive';
    interactiveSec.style.cssText =
      'background:var(--paper,#E7E7E7);color:var(--ink,#1E1E1E);padding:clamp(48px,7vw,96px) clamp(18px,4vw,44px);border-top:2.5px solid var(--ink,#1E1E1E)';

    interactiveSec.innerHTML = `
      <div style="max-width:1160px;margin:0 auto;display:grid;gap:clamp(28px,4vw,44px)">
        <!-- Before & After Interactive Visualizer -->
        <div style="background:#fff;border:2.5px solid var(--ink,#1E1E1E);border-radius:24px;padding:clamp(24px,3.5vw,42px);box-shadow:6px 6px 0 rgba(30,30,30,0.88)">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:20px">
            <div>
              <div style="font-family:'Geist Mono',monospace;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:#5a5a48;margin-bottom:8px">Interactive Architecture · Before &amp; After</div>
              <h2 style="margin:0;font-weight:800;font-size:clamp(1.55rem,3vw,2.35rem);line-height:1.05;letter-spacing:-.025em">How work moves before and after Feyron</h2>
            </div>
            <div style="display:inline-flex;background:var(--paper,#E7E7E7);border:2px solid var(--ink,#1E1E1E);border-radius:100px;padding:4px;gap:4px">
              <button type="button" data-wf-mode="before" style="cursor:pointer;border:none;border-radius:100px;padding:9px 18px;font-family:'Geist Mono',monospace;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:transparent;color:var(--ink,#1E1E1E)">Manual (Before)</button>
              <button type="button" data-wf-mode="after" style="cursor:pointer;border:none;border-radius:100px;padding:9px 18px;font-family:'Geist Mono',monospace;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:var(--ink,#1E1E1E);color:var(--accent,#D4F534)">Feyron System (After)</button>
            </div>
          </div>

          <!-- Open customer workflow input + quick presets -->
          <div style="background:var(--paper,#E7E7E7);border:2px solid var(--ink,#1E1E1E);border-radius:16px;padding:16px 18px;margin-bottom:20px;display:grid;gap:12px">
            <label style="display:grid;gap:6px;font-weight:700;font-size:14px">
              <span>Describe any workflow or task your team handles (or choose an example below)</span>
              <input
                id="cs-wf-custom-input"
                type="text"
                placeholder="Type anything — e.g. Real estate tenant screening, Logistics dispatch, Hospital billing, Vendor payouts…"
                style="padding:11px 14px;border-radius:12px;border:2px solid var(--ink,#1E1E1E);background:#fff;font-family:inherit;font-size:14.5px;font-weight:600;color:var(--ink,#1E1E1E)"
              />
            </label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
              <span style="font-family:'Geist Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#5a5a48;margin-right:4px">Examples:</span>
              <button type="button" data-wf-preset="Customer Enquiries & Follow-ups" style="cursor:pointer;font-family:inherit;font-weight:700;font-size:12.5px;padding:6px 13px;border-radius:100px;border:1.5px solid var(--ink,#1E1E1E);background:#fff;color:var(--ink,#1E1E1E)">Customer Enquiries &amp; Follow-ups</button>
              <button type="button" data-wf-preset="Invoice & Document Processing" style="cursor:pointer;font-family:inherit;font-weight:700;font-size:12.5px;padding:6px 13px;border-radius:100px;border:1.5px solid var(--ink,#1E1E1E);background:#fff;color:var(--ink,#1E1E1E)">Invoice &amp; Document Processing</button>
              <button type="button" data-wf-preset="Client Onboarding & KYC Intake" style="cursor:pointer;font-family:inherit;font-weight:700;font-size:12.5px;padding:6px 13px;border-radius:100px;border:1.5px solid var(--ink,#1E1E1E);background:#fff;color:var(--ink,#1E1E1E)">Client Onboarding &amp; KYC Intake</button>
              <button type="button" data-wf-preset="Weekly Reporting & Operations Sync" style="cursor:pointer;font-family:inherit;font-weight:700;font-size:12.5px;padding:6px 13px;border-radius:100px;border:1.5px solid var(--ink,#1E1E1E);background:#fff;color:var(--ink,#1E1E1E)">Weekly Reporting &amp; Operations Sync</button>
            </div>
          </div>

          <div id="cs-wf-steps" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px"></div>
        </div>

        <!-- Workflow Time & Capacity Estimator -->
        <div style="background:#fff;border:2.5px solid var(--ink,#1E1E1E);border-radius:24px;padding:clamp(24px,3.5vw,42px);box-shadow:6px 6px 0 rgba(30,30,30,0.88)">
          <div style="font-family:'Geist Mono',monospace;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:#5a5a48;margin-bottom:8px">Workflow Audit Estimator · Time &amp; Capacity</div>
          <h2 style="margin:0 0 18px;font-weight:800;font-size:clamp(1.55rem,3vw,2.35rem);line-height:1.05;letter-spacing:-.025em">Estimate what automating your workflow saves your team</h2>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px;align-items:stretch">
            <div style="background:var(--paper,#E7E7E7);border:2px solid var(--ink,#1E1E1E);border-radius:18px;padding:20px 22px;display:grid;gap:16px">
              <div style="display:grid;gap:8px">
                <label for="cs-roi-wf" style="font-weight:700;font-size:14.5px">
                  What workflow or process do you want to automate?
                </label>
                <input
                  id="cs-roi-wf"
                  type="text"
                  value="Customer enquiries & follow-ups"
                  placeholder="Type anything — e.g. Order fulfilment, Claims processing, HR onboarding…"
                  style="padding:11px 14px;border-radius:12px;border:2px solid var(--ink,#1E1E1E);background:#fff;font-family:inherit;font-size:14.5px;font-weight:600;color:var(--ink,#1E1E1E)"
                />
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <button type="button" data-roi-chip="Customer enquiries & follow-ups" style="cursor:pointer;font-family:'Geist Mono',monospace;font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:100px;border:1.5px solid var(--ink,#1E1E1E);background:var(--ink,#1E1E1E);color:var(--accent,#D4F534)">Customer enquiries &amp; follow-ups</button>
                  <button type="button" data-roi-chip="Invoice & document processing" style="cursor:pointer;font-family:'Geist Mono',monospace;font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:100px;border:1.5px solid var(--ink,#1E1E1E);background:#fff;color:var(--ink,#1E1E1E)">Invoice &amp; document processing</button>
                  <button type="button" data-roi-chip="Client onboarding & KYC intake" style="cursor:pointer;font-family:'Geist Mono',monospace;font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:100px;border:1.5px solid var(--ink,#1E1E1E);background:#fff;color:var(--ink,#1E1E1E)">Client onboarding &amp; KYC intake</button>
                  <button type="button" data-roi-chip="Inventory & order sync" style="cursor:pointer;font-family:'Geist Mono',monospace;font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:100px;border:1.5px solid var(--ink,#1E1E1E);background:#fff;color:var(--ink,#1E1E1E)">Inventory &amp; order sync</button>
                </div>
              </div>

              <label style="display:grid;gap:6px;font-weight:700;font-size:14.5px">
                <span>Tools or channels currently used (optional)</span>
                <input
                  id="cs-roi-tools"
                  type="text"
                  placeholder="e.g. WhatsApp, Gmail, Excel, Google Sheets, Paystack, Slack, Custom ERP…"
                  style="padding:10px 14px;border-radius:12px;border:2px solid var(--ink,#1E1E1E);background:#fff;font-family:inherit;font-size:14px;font-weight:500;color:var(--ink,#1E1E1E)"
                />
              </label>

              <label style="display:grid;gap:6px;font-weight:700;font-size:14.5px">
                <div style="display:flex;justify-content:space-between"><span>Team members involved</span><span id="cs-roi-team-val" style="font-family:'Geist Mono',monospace;font-size:13px">4 people</span></div>
                <input id="cs-roi-team" type="range" min="1" max="40" value="4" style="accent-color:#1E1E1E;width:100%;cursor:pointer" />
              </label>

              <label style="display:grid;gap:6px;font-weight:700;font-size:14.5px">
                <div style="display:flex;justify-content:space-between"><span>Hours spent per person / week</span><span id="cs-roi-hrs-val" style="font-family:'Geist Mono',monospace;font-size:13px">8 hrs / wk</span></div>
                <input id="cs-roi-hrs" type="range" min="2" max="30" value="8" style="accent-color:#1E1E1E;width:100%;cursor:pointer" />
              </label>

              <label style="display:grid;gap:6px;font-weight:700;font-size:14.5px">
                <div style="display:flex;justify-content:space-between"><span>Hourly operational cost (USD)</span><span id="cs-roi-rate-val" style="font-family:'Geist Mono',monospace;font-size:13px">$35 / hr</span></div>
                <input id="cs-roi-rate" type="range" min="15" max="150" step="5" value="35" style="accent-color:#1E1E1E;width:100%;cursor:pointer" />
              </label>
            </div>

            <div style="background:var(--bg,#D4F534);border:2px solid var(--ink,#1E1E1E);border-radius:18px;padding:22px 24px;display:flex;flex-direction:column;justify-content:space-between;gap:16px">
              <div>
                <div id="cs-roi-out-kicker" style="font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;margin-bottom:14px">Estimated Monthly Impact · Customer enquiries &amp; follow-ups</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:14px">
                  <div style="background:#fff;border:2px solid var(--ink,#1E1E1E);border-radius:14px;padding:14px">
                    <div style="font-family:'Geist Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#5a5a48">Time Reclaimed</div>
                    <div id="cs-roi-out-hrs" style="font-size:28px;font-weight:800;line-height:1.1;margin-top:4px">100 hrs</div>
                    <div style="font-family:'Geist Mono',monospace;font-size:11px;color:#555;margin-top:2px">per month</div>
                  </div>
                  <div style="background:#fff;border:2px solid var(--ink,#1E1E1E);border-radius:14px;padding:14px">
                    <div style="font-family:'Geist Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#5a5a48">Capacity Unlocked</div>
                    <div id="cs-roi-out-val" style="font-size:28px;font-weight:800;line-height:1.1;margin-top:4px">$3,500</div>
                    <div style="font-family:'Geist Mono',monospace;font-size:11px;color:#555;margin-top:2px">monthly value</div>
                  </div>
                </div>
                <div id="cs-roi-out-pkg" style="padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.65);border:1.5px solid var(--ink,#1E1E1E);font-size:13.5px;font-weight:600">
                  Recommended scope: Function Agent — begins with a fixed-scope workflow audit.
                </div>
              </div>
              <div>
                <button type="button" id="cs-roi-book-btn" style="cursor:pointer;font-family:inherit;font-weight:800;font-size:15px;background:var(--ink,#1E1E1E);color:var(--accent,#D4F534);border:2px solid var(--ink,#1E1E1E);padding:14px 24px;border-radius:100px">Book a 20-min call for this workflow →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    contactSection.parentElement?.insertBefore(interactiveSec, contactSection);

    const wfStepsContainer = document.getElementById('cs-wf-steps');
    const wfCustomInput = document.getElementById('cs-wf-custom-input') as HTMLInputElement | null;
    let currentWfMode: 'before' | 'after' = 'after';

    const getDynamicSteps = (mode: 'before' | 'after', customTopic: string) => {
      const cleaned = customTopic.trim();
      if (!cleaned) {
        return mode === 'after'
          ? [
              { num: '01', title: 'Structured instant capture', text: 'The Feyron system captures incoming requests or documents immediately, extracts fields and logs every detail.' },
              { num: '02', title: 'Policy check & preparation', text: 'Your rules are verified automatically, replies or records are drafted, and exceptions are flagged cleanly.' },
              { num: '03', title: 'Human approval & execution', text: 'Your team approves key actions in one click while calendar invites, meeting links and updates run automatically.' },
            ]
          : [
              { num: '01', title: 'Scattered manual intake', text: 'Messages, documents and forms arrive across email, WhatsApp and spreadsheets. Staff copy and paste details by hand.' },
              { num: '02', title: 'Repetitive verification', text: 'Team members spend hours cross-checking rules, chasing missing fields and updating disconnected tools.' },
              { num: '03', title: 'Slow follow-ups', text: 'Clients wait hours or days for next steps while critical tasks depend on manual memory.' },
            ];
      }
      return mode === 'after'
        ? [
            { num: '01', title: `Automated intake for ${cleaned}`, text: `Feyron captures every incoming request, document or trigger for "${cleaned}" and structures the data automatically.` },
            { num: '02', title: 'Rules check & system preparation', text: `Your business rules for "${cleaned}" are verified in seconds, records are updated across your tools, and next actions are prepared.` },
            { num: '03', title: 'One-click human approval & completion', text: `Your team approves edge cases in one click while confirmations, notifications and audit logs run automatically.` },
          ]
        : [
            { num: '01', title: `Manual intake for ${cleaned}`, text: `Requests and files for "${cleaned}" arrive across scattered messages, emails or spreadsheets and require manual entry.` },
            { num: '02', title: 'Manual cross-checking & follow-up', text: `Team members spend hours verifying details for "${cleaned}", chasing missing information and updating separate tools by hand.` },
            { num: '03', title: 'Delays & handoff bottlenecks', text: `Progress on "${cleaned}" stalls whenever key staff are busy, leading to slow turnaround and missed updates.` },
          ];
    };

    const renderWfMode = (m: 'before' | 'after') => {
      currentWfMode = m;
      if (!wfStepsContainer) return;
      const customText = wfCustomInput?.value || '';
      const list = getDynamicSteps(m, customText);
      wfStepsContainer.innerHTML = list
        .map(
          (st) => `
          <div style="background:${m === 'after' ? 'var(--bg,#D4F534)' : 'var(--paper,#E7E7E7)'};border:2px solid var(--ink,#1E1E1E);border-radius:18px;padding:20px 22px">
            <div style="font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;margin-bottom:8px">${m === 'after' ? 'Automated Step ' : 'Manual Step '}${st.num}</div>
            <h3 style="margin:0 0 8px;font-size:18.5px;font-weight:800">${st.title}</h3>
            <p style="margin:0;font-size:14.5px;line-height:1.55;font-weight:500">${st.text}</p>
          </div>
        `
        )
        .join('');

      interactiveSec.querySelectorAll('[data-wf-mode]').forEach((btn) => {
        const bMode = btn.getAttribute('data-wf-mode');
        const el = btn as HTMLElement;
        if (bMode === m) {
          el.style.background = 'var(--ink,#1E1E1E)';
          el.style.color = m === 'after' ? 'var(--accent,#D4F534)' : '#fff';
        } else {
          el.style.background = 'transparent';
          el.style.color = 'var(--ink,#1E1E1E)';
        }
      });
    };

    renderWfMode('after');
    interactiveSec.querySelectorAll('[data-wf-mode]').forEach((btn) => {
      (btn as HTMLElement).onclick = () => {
        renderWfMode((btn.getAttribute('data-wf-mode') as 'before' | 'after') || 'after');
      };
    });

    const wfSel = document.getElementById('cs-roi-wf') as HTMLInputElement | null;
    const wfTools = document.getElementById('cs-roi-tools') as HTMLInputElement | null;
    const outKicker = document.getElementById('cs-roi-out-kicker');
    const teamInput = document.getElementById('cs-roi-team') as HTMLInputElement | null;
    const hrsInput = document.getElementById('cs-roi-hrs') as HTMLInputElement | null;
    const rateInput = document.getElementById('cs-roi-rate') as HTMLInputElement | null;
    const teamVal = document.getElementById('cs-roi-team-val');
    const hrsVal = document.getElementById('cs-roi-hrs-val');
    const rateVal = document.getElementById('cs-roi-rate-val');
    const outHrs = document.getElementById('cs-roi-out-hrs');
    const outVal = document.getElementById('cs-roi-out-val');
    const outPkg = document.getElementById('cs-roi-out-pkg');
    const roiBookBtn = document.getElementById('cs-roi-book-btn');

    if (wfCustomInput) {
      wfCustomInput.addEventListener('input', () => {
        renderWfMode(currentWfMode);
        if (wfSel && wfCustomInput.value.trim()) {
          wfSel.value = wfCustomInput.value.trim();
          updateRoi();
        }
      });
    }

    interactiveSec.querySelectorAll('[data-wf-preset]').forEach((btn) => {
      (btn as HTMLElement).onclick = () => {
        const preset = btn.getAttribute('data-wf-preset') || '';
        if (wfCustomInput) wfCustomInput.value = preset;
        if (wfSel && preset) wfSel.value = preset;
        renderWfMode(currentWfMode);
        updateRoi();
      };
    });

    const updateRoi = () => {
      const wfText = (wfSel?.value || '').trim() || 'Custom business workflow';
      const t = Number(teamInput?.value || 4);
      const h = Number(hrsInput?.value || 8);
      const r = Number(rateInput?.value || 35);
      if (outKicker) outKicker.textContent = `Estimated Monthly Impact · ${wfText}`;
      if (teamVal) teamVal.textContent = `${t} ${t === 1 ? 'person' : 'people'}`;
      if (hrsVal) hrsVal.textContent = `${h} hrs / wk`;
      if (rateVal) rateVal.textContent = `$${r} / hr`;
      const monthlyHrs = Math.round(Math.round(t * h * 0.72) * 4.33);
      const monthlyUsd = Math.round(monthlyHrs * r);
      const pkg =
        monthlyHrs <= 65
          ? 'Workflow Sprint (2 to 4 weeks)'
          : monthlyHrs <= 180
            ? 'Function Agent (Dedicated workflow owner)'
            : 'Business Agent Suite (3 to 5 connected workflows)';
      if (outHrs) outHrs.textContent = `${monthlyHrs} hrs`;
      if (outVal) outVal.textContent = `$${monthlyUsd.toLocaleString()}`;
      if (outPkg) outPkg.textContent = `Recommended scope: ${pkg} — begins with a fixed-scope workflow audit.`;

      interactiveSec.querySelectorAll('[data-roi-chip]').forEach((chip) => {
        const val = chip.getAttribute('data-roi-chip') || '';
        const el = chip as HTMLElement;
        const active = (wfSel?.value || '').trim().toLowerCase() === val.toLowerCase();
        el.style.background = active ? 'var(--ink,#1E1E1E)' : '#fff';
        el.style.color = active ? 'var(--accent,#D4F534)' : 'var(--ink,#1E1E1E)';
      });
    };

    interactiveSec.querySelectorAll('[data-roi-chip]').forEach((chip) => {
      (chip as HTMLElement).onclick = () => {
        const val = chip.getAttribute('data-roi-chip') || '';
        if (wfSel) wfSel.value = val;
        updateRoi();
      };
    });

    [wfSel, wfTools, teamInput, hrsInput, rateInput].forEach((el) => {
      el?.addEventListener('input', updateRoi);
      el?.addEventListener('change', updateRoi);
    });
    updateRoi();

    if (roiBookBtn) {
      roiBookBtn.onclick = () => {
        const wf = (wfSel?.value || '').trim() || 'Custom business workflow';
        const tools = (wfTools?.value || '').trim();
        const t = Number(teamInput?.value || 4);
        const h = Number(hrsInput?.value || 8);
        const r = Number(rateInput?.value || 35);
        const monthlyHrs = Math.round(Math.round(t * h * 0.72) * 4.33);
        const monthlyUsd = Math.round(monthlyHrs * r);
        const toolsPart = tools ? ` | Current tools: ${tools}` : '';
        const summary = `Workflow Audit Estimate — Focus: ${wf}${toolsPart} | Team size: ${t} | Est. time saved: ${monthlyHrs} hrs/month ($${monthlyUsd.toLocaleString()}/mo capacity)`;
        if (window.openBooking) {
          window.openBooking({ notes: summary, source: 'homepage-roi-calculator' });
        }
      };
    }
  }
}

function setupMainMobileMenu() {
  const tryAttach = () => {
    const nav = document.getElementById('cs-nav');
    if (!nav) return false;

    const logo = (nav.querySelector('a[href="#top"]') || nav.querySelector('a:first-child') || nav.querySelector('a')) as HTMLElement | null;
    if (logo) {
      logo.classList.add('cs-nav-logo');
    }

    const desktopDiv = nav.querySelector('div:not(.cs-nav-burger):not(.cs-mobile-menu)');
    if (desktopDiv && !desktopDiv.classList.contains('cs-nav-desktop')) {
      desktopDiv.classList.add('cs-nav-desktop');
    }

    let burger = document.getElementById('cs-nav-burger');
    if (!burger) {
      burger = document.createElement('button');
      burger.id = 'cs-nav-burger';
      burger.className = 'cs-nav-burger';
      burger.setAttribute('type', 'button');
      burger.setAttribute('aria-label', 'Toggle navigation menu');
      burger.setAttribute('aria-expanded', 'false');
      burger.innerHTML = `
        <span class="cs-burger-bar"></span>
        <span class="cs-burger-bar"></span>
        <span class="cs-burger-bar"></span>
      `;
      nav.appendChild(burger);
    }

  let menu = document.getElementById('cs-mobile-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'cs-mobile-menu';
    menu.className = 'cs-mobile-menu';
    menu.setAttribute('aria-hidden', 'true');
    menu.innerHTML = `
      <div class="cs-mobile-menu-backdrop" data-close-mobile-menu></div>
      <div class="cs-mobile-menu-panel">
        <div class="cs-mobile-menu-header">
          <span class="cs-mobile-menu-brand" style="display:inline-flex;align-items:center;gap:10px"><svg width="26" height="26" viewBox="0 0 100 100" aria-hidden="true" style="display:block;flex-shrink:0"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M14.5,0.0H85.5A14.5,14.5 0 0 1 100.0,14.5V85.5A14.5,14.5 0 0 1 85.5,100.0H14.5A14.5,14.5 0 0 1 0.0,85.5V14.5A14.5,14.5 0 0 1 14.5,0.0Z M21.2,16.2H33.1A8.2,8.2 0 0 1 41.3,24.4V59.4A8.2,8.2 0 0 1 33.1,67.6H21.2A8.2,8.2 0 0 1 13.0,59.4V24.4A8.2,8.2 0 0 1 21.2,16.2Z M66.9,16.2H78.8A8.2,8.2 0 0 1 87.0,24.4V59.4A8.2,8.2 0 0 1 78.8,67.6H66.9A8.2,8.2 0 0 1 58.7,59.4V24.4A8.2,8.2 0 0 1 66.9,16.2Z M45.1,76.0H54.9A4.9,4.9 0 0 1 59.8,80.9V80.9A4.9,4.9 0 0 1 54.9,85.8H45.1A4.9,4.9 0 0 1 40.2,80.9V80.9A4.9,4.9 0 0 1 45.1,76.0Z"/></svg><span>Feyron</span></span>
          <button type="button" class="cs-mobile-menu-close" aria-label="Close navigation" data-close-mobile-menu>
            ✕
          </button>
        </div>
        <div class="cs-mobile-menu-body">
          <div class="cs-mobile-nav-group">
            <span class="cs-mobile-nav-kicker">Navigation</span>
            <a href="#top" class="cs-mobile-link" data-mobile-nav>Home</a>
            <a href="/solutions" class="cs-mobile-link" data-mobile-nav>Solutions</a>
            <a href="/products" class="cs-mobile-link" data-mobile-nav>Products</a>
            <a href="/about" class="cs-mobile-link" data-mobile-nav>About</a>
            <a href="/contact" class="cs-mobile-link" data-mobile-nav>Contact</a>
          </div>
          <div class="cs-mobile-nav-group">
            <span class="cs-mobile-nav-kicker">More</span>
            <a href="/how-we-work" class="cs-mobile-link" data-mobile-nav>How we work</a>
            <a href="/who-we-serve" class="cs-mobile-link" data-mobile-nav>Who we serve</a>
            <a href="/responsible-ai" class="cs-mobile-link" data-mobile-nav>Responsible AI</a>
            <a href="#faq" class="cs-mobile-link" data-mobile-nav>FAQ</a>
          </div>
          <div class="cs-mobile-nav-actions">
            <a href="#contact" data-lead="" class="cs-mobile-cta" data-mobile-nav>Let's talk</a>
            <button type="button" data-book="" class="cs-mobile-cta" data-mobile-nav style="background:transparent;color:var(--accent,#fff48d);border:1.5px solid var(--accent,#fff48d);margin-top:8px">Book a 20-min call</button>
            <a href="mailto:hello@feyron.site" class="cs-mobile-contact-line">hello@feyron.site · feyron.site · Lagos, Nigeria</a>
          </div>
          <div class="cs-mobile-nav-footer">
            <a href="/privacy" class="cs-mobile-sublink" data-mobile-nav>Privacy Policy</a>
            <a href="/terms" class="cs-mobile-sublink" data-mobile-nav>Terms of Service</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(menu);
  }

  const openDrawer = () => {
    menu?.classList.add('is-open');
    menu?.setAttribute('aria-hidden', 'false');
    burger?.classList.add('is-active');
    burger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    menu?.classList.remove('is-open');
    menu?.setAttribute('aria-hidden', 'true');
    burger?.classList.remove('is-active');
    burger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  burger.onclick = (e) => {
    e.stopPropagation();
    if (menu?.classList.contains('is-open')) closeDrawer();
    else openDrawer();
  };

  menu.querySelectorAll('[data-close-mobile-menu]').forEach((el) => {
    (el as HTMLElement).onclick = (e) => {
      e.stopPropagation();
      closeDrawer();
    };
  });

  menu.querySelectorAll('[data-mobile-nav]').forEach((el) => {
    (el as HTMLElement).onclick = (e) => {
      const href = el.getAttribute('href') || '';
      closeDrawer();
      if (href.startsWith('#')) {
        e.preventDefault();
        setTimeout(() => {
          if (href === '#' || href === '#top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          if (href === '#contact') {
            if (window.__feyronOpenLeadModal) {
              window.__feyronOpenLeadModal();
              return;
            }
          }
          const targetEl = document.querySelector(href);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    };
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  return true;
};

  if (!tryAttach()) {
    const timer = setInterval(() => {
      if (tryAttach()) clearInterval(timer);
    }, 120);
    setTimeout(() => clearInterval(timer), 8000);
  }
}

export async function bootCloudstudio() {
  if (window.__CS_BOOTED) return;
  window.__CS_BOOTED = true;

  installFetchInterceptor();

  // Inject styles immediately
  const styleEl = document.createElement('style');
  styleEl.id = 'cs-master-styles';
  styleEl.textContent = CS_STYLES;
  document.head.appendChild(styleEl);

  // Also add link marker so mascot.js ensureStyleLink knows mascot.css is present
  if (!document.querySelector('link[href="/mascot.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/mascot.css';
    document.head.appendChild(link);
  }

  // Store raw template so dc-runtime.js uses exact original casing
  window.__CS_RAW_XDC_INNER = CS_XDC_INNER;

  // Inject <x-dc>
  const xdcEl = document.createElement('x-dc');
  xdcEl.style.display = 'none';
  xdcEl.innerHTML = CS_XDC_INNER;
  document.body.insertBefore(xdcEl, document.getElementById('root'));

  // Inject mobile quote chip
  const quoteChip = document.createElement('a');
  quoteChip.className = 'cs-quote-chip';
  quoteChip.setAttribute('data-lead', '');
  quoteChip.href = '#contact';
  quoteChip.textContent = 'Talk to our team';
  document.body.insertBefore(quoteChip, document.getElementById('root'));

  // Inject data-dc-script
  const dcScript = document.createElement('script');
  dcScript.type = 'text/x-dc';
  dcScript.setAttribute('data-dc-script', '');
  dcScript.setAttribute(
    'data-props',
    CS_DC_DATA_PROPS.replace(/&quot;/g, '"')
  );
  dcScript.textContent = CS_DC_SCRIPT_CODE;
  document.body.insertBefore(dcScript, document.getElementById('root'));

  // Inject cookie note
  const cookieNote = document.createElement('div');
  cookieNote.id = 'cs-cookie-note';
  cookieNote.setAttribute('role', 'region');
  cookieNote.setAttribute('aria-label', 'Cookie notice');
  cookieNote.hidden = true;
  cookieNote.innerHTML = `
    <span class="cs-cookie-kicker">( Cookies )</span>
    No tracking cookies here — just your driver, your theme and your high score, stored on your device.
    <div class="cs-cookie-row">
      <a href="/cookies">The details</a>
      <button type="button" data-cookie-ok>OK</button>
    </div>
  `;
  document.body.insertBefore(cookieNote, document.getElementById('root'));

  // Load runtime dependencies in exact order
  await loadExternalScript('/site/js/react.js');
  await loadExternalScript('/site/js/react-dom.js');
  await loadExternalScript('/site/js/lenis.js');
  await loadExternalScript('/site/js/lottie.js');
  await loadExternalScript('/site/js/matter.js');
  await loadExternalScript('/site/js/three.js');
  await loadExternalScript('/site/js/organism.js');
  await loadExternalScript('/site/js/dc-runtime.js');
  await loadExternalScript('/mascot.js');
  await loadExternalScript('/game.js');
  await loadExternalScript('/site/js/booking.js');

  // Wait for #cs-root to appear then run post-mount enhancements,
  // and re-run if dc-runtime.js replaces #cs-root after fetching dc-source.html
  const checkMounted = () => {
    const csRoot = document.getElementById('cs-root');
    if (csRoot) {
      setupPostMountEnhancements();
      const dcRoot = document.getElementById('dc-root') || document.body;
      const obs = new MutationObserver(() => {
        if (document.getElementById('cs-root') && !document.getElementById('cs-workflow-interactive')) {
          setupPostMountEnhancements();
        }
      });
      obs.observe(dcRoot, { childList: true, subtree: true });
    } else {
      setTimeout(checkMounted, 60);
    }
  };
  checkMounted();
}
