/**
 * SEO Compliance Check
 *
 * Validates metadata, canonical URLs, FAQ schema placement, and crawlability.
 * Run with the app serving (e.g. npm run build && npm run start) or set BASE_URL
 * to a deployed URL (e.g. https://intrawebtech.com).
 *
 * Usage: BASE_URL=http://localhost:3000 node scripts/seo-compliance.js
 *   or: npm run seo:check
 */

const cheerio = require('cheerio');

const fetch =
  typeof globalThis.fetch === 'function'
    ? globalThis.fetch
    : (() => {
        try {
          return require('node-fetch');
        } catch (e) {
          throw new Error('Need Node 18+ (native fetch) or install node-fetch');
        }
      })();

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROUTES = [
  '/',
  '/about',
  '/contact',
  '/faq',
  '/process',
  '/careers',
  '/implementation',
  '/agent-readiness',
  '/privacy-policy',
  '/terms-of-service',
  '/accessibility',
];

const errors = [];
const failedUrls = new Set();

function fail(msg, url = null) {
  errors.push(msg);
  if (url) failedUrls.add(url);
}

function getJsonLdObjects($) {
  const objects = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).html();
    if (!text || !text.trim()) return;
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        data.forEach((item) => objects.push(item));
      } else if (data['@graph']) {
        data['@graph'].forEach((item) => objects.push(item));
      } else {
        objects.push(data);
      }
    } catch (e) {
      // ignore invalid JSON
    }
  });
  return objects;
}

function assertPageHtml(baseUrl, path, html) {
  const $ = cheerio.load(html);
  const url = path === '/' ? baseUrl : `${baseUrl}${path}`;

  const title = $('title').first().text().trim();
  if (!title) {
    fail(`Missing or empty <title>`, url);
  }
  const desc = $('meta[name="description"]').attr('content');
  if (!desc || !desc.trim()) {
    fail(`Missing or empty meta description`, url);
  }

  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical || !canonical.trim()) {
    fail(`Missing canonical link`, url);
  } else {
    const canonicalPath = path === '/' ? '/' : path;
    try {
      const canonicalUrl = new URL(canonical);
      const expectedPath = canonicalPath === '/' ? '/' : canonicalPath;
      const actualPath = canonicalUrl.pathname === '' ? '/' : canonicalUrl.pathname;
      if (actualPath !== expectedPath) {
        fail(`Canonical path mismatch: expected "${expectedPath}", got "${actualPath}"`, url);
      }
    } catch (e) {
      fail(`Invalid canonical URL: ${canonical}`, url);
    }
  }

  const ld = getJsonLdObjects($);

  if (path === '/faq') {
    const faqPages = ld.filter((o) => o['@type'] === 'FAQPage');
    if (faqPages.length !== 1) {
      fail(`/faq must have exactly one FAQPage schema, found ${faqPages.length}`, url);
    } else {
      const mainEntity = faqPages[0].mainEntity;
      if (!Array.isArray(mainEntity) || mainEntity.length === 0) {
        fail(`FAQPage mainEntity must be a non-empty array`, url);
      } else {
        mainEntity.forEach((item, i) => {
          if (!item.name || !item.acceptedAnswer?.text) {
            fail(`FAQPage mainEntity[${i}] must have name and acceptedAnswer.text`, url);
          }
        });
        const mainText = $('main').text().replace(/\s+/g, ' ').trim();
        mainEntity.forEach((item, i) => {
          const q = (item.name || '').trim();
          const a = (item.acceptedAnswer?.text || '').trim();
          if (q && mainText.toLowerCase().indexOf(q.toLowerCase()) === -1) {
            fail(`FAQ question not visible on page: "${q.slice(0, 50)}..."`, url);
          }
          if (a && mainText.toLowerCase().indexOf(a.toLowerCase()) === -1) {
            fail(`FAQ answer not visible on page: "${a.slice(0, 50)}..."`, url);
          }
        });
      }
    }
  }

  if (path === '/') {
    const faqPages = ld.filter((o) => o['@type'] === 'FAQPage');
    if (faqPages.length > 0) {
      fail(`Homepage must not have FAQPage schema (only /faq should)`, url);
    }
  }

  const org = ld.filter((o) => o['@type'] === 'Organization');
  if (path === '/' && org.length === 0) {
    fail(`Homepage (or root layout) must include Organization JSON-LD`, url);
  }
  if (org.length > 0 && (!org[0].name || !org[0].url)) {
    fail(`Organization schema must have name and url`, url);
  }
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function checkRobots(baseUrl) {
  try {
    const text = await fetchText(`${baseUrl}/robots.txt`);
    if (!/Sitemap\s*:/i.test(text)) {
      fail('robots.txt must contain Sitemap:');
    }
    if (!/User-agent\s*:\s*\x2A/mi.test(text)) {
      fail('robots.txt must contain User-agent: *');
    }
    if (!/Allow\s*:\s*\//.test(text)) {
      fail('robots.txt should allow / (Allow: /)');
    }
  } catch (e) {
    fail(`robots.txt fetch failed: ${e.message}`);
  }
}

async function checkSitemaps(baseUrl) {
  try {
    const indexXml = await fetchText(`${baseUrl}/sitemap.xml`);
    const $index = cheerio.load(indexXml, { xmlMode: true });
    const sitemapLocs = [];
    $index('sitemap loc').each((_, el) => {
      const loc = $index(el).text().trim();
      if (loc) sitemapLocs.push(loc);
    });
    const allUrls = [];
    if (sitemapLocs.length === 0) {
      $index('url loc').each((_, el) => {
        const u = $index(el).text().trim();
        if (u) allUrls.push(u);
      });
    } else {
      for (const loc of sitemapLocs) {
        const xml = await fetchText(loc);
        const $ = cheerio.load(xml, { xmlMode: true });
        $('url loc').each((_, el) => {
          const u = $(el).text().trim();
          if (u) allUrls.push(u);
        });
      }
    }
    for (const url of allUrls) {
      try {
        const res = await fetch(url, { method: 'GET', redirect: 'follow' });
        if (res.status === 404) {
          fail(`Sitemap lists URL that returns 404: ${url}`);
        } else if (res.status >= 400) {
          fail(`Sitemap URL returned ${res.status}: ${url}`);
        }
      } catch (e) {
        fail(`Sitemap URL fetch failed for ${url}: ${e.message}`);
      }
    }
  } catch (e) {
    fail(`Sitemap check failed: ${e.message}`);
  }
}

async function main() {
  console.log(`SEO compliance check: BASE_URL=${BASE_URL}\n`);

  for (const path of ROUTES) {
    const url = path === '/' ? BASE_URL : `${BASE_URL}${path}`;
    try {
      const html = await fetchText(url);
      assertPageHtml(BASE_URL, path, html);
      console.log(`OK ${path || '/'}`);
    } catch (e) {
      fail(`Fetch failed for ${path || '/'}: ${e.message}`, url);
      console.log(`FAIL ${path || '/'} (fetch error)`);
    }
  }

  await checkRobots(BASE_URL);
  console.log('OK robots.txt');

  await checkSitemaps(BASE_URL);
  console.log('OK sitemap(s)');

  if (errors.length > 0) {
    console.error('\n--- SEO compliance errors ---');
    errors.forEach((msg) => console.error(msg));
    process.exit(1);
  }
  console.log('\nAll SEO compliance checks passed.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
