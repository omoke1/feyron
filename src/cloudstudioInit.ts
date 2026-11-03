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
    openBooking?: (opts?: { name?: string; lang?: string; source?: string }) => void;
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

function getTakenSlots(dateStr: string): string[] {
  const defaultTaken = ['10:40', '12:00', '15:20', '16:40'];
  try {
    const raw = localStorage.getItem(`cs-booked-slots-${dateStr}`);
    if (raw) {
      const custom = JSON.parse(raw);
      if (Array.isArray(custom)) {
        return Array.from(new Set([...defaultTaken, ...custom]));
      }
    }
  } catch {
    // ignore
  }
  return defaultTaken;
}

function addTakenSlot(dateStr: string, slot: string) {
  try {
    const existing = getTakenSlots(dateStr);
    if (!existing.includes(slot)) {
      existing.push(slot);
    }
    localStorage.setItem(`cs-booked-slots-${dateStr}`, JSON.stringify(existing));
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

      // 2. Contact / Lead submission
      if (u.pathname === '/contact' && init?.method?.toUpperCase() === 'POST') {
        try {
          const body = init.body ? JSON.parse(String(init.body)) : {};
          const leads = JSON.parse(localStorage.getItem('cs-leads') || '[]');
          leads.push({ ...body, createdAt: new Date().toISOString() });
          localStorage.setItem('cs-leads', JSON.stringify(leads));
        } catch {
          // ignore
        }
        return new Response(JSON.stringify({ ok: true, success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
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

      // 5. Booking slots
      if (u.pathname === '/bookings/slots') {
        const dateParam = u.searchParams.get('date') || '';
        const taken = getTakenSlots(dateParam);
        return new Response(JSON.stringify({ taken }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 6. Create booking
      if (u.pathname === '/bookings' && init?.method?.toUpperCase() === 'POST') {
        try {
          const body = init.body ? JSON.parse(String(init.body)) : {};
          if (body.date && body.time) {
            addTakenSlot(String(body.date), String(body.time));
          }
          const bookings = JSON.parse(localStorage.getItem('cs-bookings') || '[]');
          bookings.push({ ...body, createdAt: new Date().toISOString() });
          localStorage.setItem('cs-bookings', JSON.stringify(bookings));
        } catch {
          // ignore
        }
        return new Response(JSON.stringify({ ok: true, success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
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
}

function setupMainMobileMenu() {
  const tryAttach = () => {
    const nav = document.getElementById('cs-nav');
    if (!nav) return false;

    const logo = nav.querySelector('a[href="#top"]');
    if (logo) logo.classList.add('cs-nav-logo');

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
          <span class="cs-mobile-menu-brand">Feyron</span>
          <button type="button" class="cs-mobile-menu-close" aria-label="Close navigation" data-close-mobile-menu>
            ✕
          </button>
        </div>
        <div class="cs-mobile-menu-body">
          <div class="cs-mobile-nav-group">
            <span class="cs-mobile-nav-kicker">Navigation</span>
            <a href="#work" class="cs-mobile-link" data-mobile-nav>Work</a>
            <a href="#how" class="cs-mobile-link" data-mobile-nav>How we work</a>
            <a href="#faq" class="cs-mobile-link" data-mobile-nav>FAQ</a>
          </div>
          <div class="cs-mobile-nav-group">
            <span class="cs-mobile-nav-kicker">Explore</span>
            <a href="/solutions" class="cs-mobile-link" data-mobile-nav>Solutions</a>
            <a href="/who-we-serve" class="cs-mobile-link" data-mobile-nav>Who we serve</a>
            <a href="/products" class="cs-mobile-link" data-mobile-nav>Products</a>
            <a href="/responsible-ai" class="cs-mobile-link" data-mobile-nav>Responsible AI</a>
            <a href="/about" class="cs-mobile-link" data-mobile-nav>About</a>
          </div>
          <div class="cs-mobile-nav-actions">
            <a href="#contact" data-lead="" class="cs-mobile-cta" data-mobile-nav>Talk to our team</a>
            <a href="mailto:hello@feyron.co" class="cs-mobile-contact-line">hello@feyron.co · Lagos, Nigeria</a>
          </div>
          <div class="cs-mobile-nav-footer">
            <a href="/privacy" class="cs-mobile-sublink" data-mobile-nav>Privacy policy</a>
            <a href="/terms" class="cs-mobile-sublink" data-mobile-nav>Terms of service</a>
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

  // Wait for #cs-root to appear then run post-mount enhancements
  const checkMounted = () => {
    if (document.getElementById('cs-root')) {
      setupPostMountEnhancements();
    } else {
      setTimeout(checkMounted, 60);
    }
  };
  checkMounted();
}
