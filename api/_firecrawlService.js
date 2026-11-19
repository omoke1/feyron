import FirecrawlApp from '@mendable/firecrawl-js';

function getFirecrawlConfig() {
  const apiKey = (process.env.FIRECRAWL_API_KEY || '').trim();
  const apiUrl = (process.env.FIRECRAWL_API_URL || '').trim();
  return {
    apiKey: apiKey || 'fc-local-default',
    apiUrl: apiUrl || (apiKey ? 'https://api.firecrawl.dev' : 'http://localhost:3002'),
    hasKey: Boolean(apiKey),
    hasCustomUrl: Boolean(apiUrl),
  };
}

export function isFirecrawlAvailable() {
  const cfg = getFirecrawlConfig();
  return Boolean(cfg.hasKey || cfg.hasCustomUrl);
}

/**
 * Clean URL helper to ensure http/https protocol
 */
export function normalizeUrl(rawUrl) {
  let url = String(rawUrl || '').trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

/**
 * Fallback lightweight native scraper when Firecrawl instance is not running
 */
async function fallbackScrape(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        ok: false,
        error: `HTTP ${res.status}: ${res.statusText}`,
        url,
      };
    }

    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract emails
    const emails = Array.from(
      new Set(
        (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])
          .map((e) => e.toLowerCase())
          .filter((e) => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.includes('example.com') && !e.includes('sentry.io'))
      )
    ).slice(0, 5);

    // Extract phone numbers
    const phones = Array.from(
      new Set(
        (html.match(/(?:\+?234|0)[789][01]\d{8}|(?:\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) || [])
          .map((p) => p.trim())
      )
    ).slice(0, 5);

    // Look for friction signals
    const signals = [];
    if (/forms\.gle|docs\.google\.com\/forms/i.test(html)) {
      signals.push('Uses Google Form for customer enquiries or bookings');
    }
    if (/wa\.me|api\.whatsapp\.com/i.test(html)) {
      signals.push('Routes customer intake or support directly to personal/business WhatsApp');
    }
    if (/call to order|phone\s*order|manual\s*quote/i.test(html)) {
      signals.push('Requires manual phone calls for quote generation or ordering');
    }
    if (/\.pdf|download\s*form/i.test(html)) {
      signals.push('Requires customers to download manual PDF documents or paper forms');
    }

    // Convert basic HTML to plain readable text
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);

    return {
      ok: true,
      engine: 'native-fallback',
      url,
      title,
      description,
      markdown: `# ${title || url}\n\n${description ? `> ${description}\n\n` : ''}${text}`,
      emails,
      phones,
      signals,
    };
  } catch (err) {
    return {
      ok: false,
      engine: 'native-fallback',
      url,
      error: err.message,
    };
  }
}

/**
 * Scrapes a target company website using Firecrawl or fallback
 */
export async function scrapeCompanyWithFirecrawl(targetUrl) {
  const url = normalizeUrl(targetUrl);
  if (!url) {
    return { ok: false, error: 'Target URL is required.' };
  }

  const cfg = getFirecrawlConfig();

  // If Firecrawl key or custom URL is configured, use the official SDK
  if (cfg.hasKey || cfg.hasCustomUrl) {
    try {
      const app = new FirecrawlApp({
        apiKey: cfg.apiKey,
        apiUrl: cfg.apiUrl,
      });

      const scrapeResult = await app.scrapeUrl(url, {
        formats: ['markdown', 'html'],
      });

      if (scrapeResult && (scrapeResult.markdown || scrapeResult.data?.markdown)) {
        const md = scrapeResult.markdown || scrapeResult.data?.markdown || '';
        const metadata = scrapeResult.metadata || scrapeResult.data?.metadata || {};
        const html = scrapeResult.html || scrapeResult.data?.html || '';

        // Extract emails from markdown and html
        const combined = `${md} ${html}`;
        const emails = Array.from(
          new Set(
            (combined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])
              .map((e) => e.toLowerCase())
              .filter((e) => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.includes('example.com') && !e.includes('sentry.io'))
          )
        ).slice(0, 5);

        // Look for operational friction signals
        const signals = [];
        if (/forms\.gle|docs\.google\.com\/forms/i.test(combined)) {
          signals.push('Customer intake handled through manual Google Form');
        }
        if (/wa\.me|api\.whatsapp\.com/i.test(combined)) {
          signals.push('Public enquiries route to WhatsApp chat without automated dispatch');
        }
        if (/call to order|phone\s*order|manual\s*quote/i.test(combined)) {
          signals.push('Requires manual phone call coordination for quotations');
        }
        if (/\.pdf|download\s*form/i.test(combined)) {
          signals.push('Requires manual PDF download for order processing');
        }

        return {
          ok: true,
          engine: 'firecrawl',
          url,
          title: metadata.title || '',
          description: metadata.description || '',
          markdown: md.slice(0, 5000),
          emails,
          signals,
          statusCode: metadata.statusCode || 200,
        };
      }
    } catch (err) {
      console.warn('Firecrawl SDK scrape failed, falling back to native scraper:', err.message);
    }
  }

  // Fallback to native HTTP scraper
  return await fallbackScrape(url);
}

/**
 * Maps a website's link architecture using Firecrawl mapUrl
 */
export async function mapWebsiteWithFirecrawl(targetUrl) {
  const url = normalizeUrl(targetUrl);
  if (!url) return { ok: false, error: 'Target URL is required.' };

  const cfg = getFirecrawlConfig();
  if (cfg.hasKey || cfg.hasCustomUrl) {
    try {
      const app = new FirecrawlApp({
        apiKey: cfg.apiKey,
        apiUrl: cfg.apiUrl,
      });

      const mapResult = await app.mapUrl(url, { limit: 20 });
      if (mapResult && Array.isArray(mapResult.links || mapResult.data?.links)) {
        return {
          ok: true,
          engine: 'firecrawl',
          url,
          links: mapResult.links || mapResult.data?.links || [],
        };
      }
    } catch (err) {
      console.warn('Firecrawl mapUrl failed:', err.message);
    }
  }

  return {
    ok: true,
    engine: 'native-fallback',
    url,
    links: [url, `${url}/about`, `${url}/services`, `${url}/contact`],
  };
}
