const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pages = [
  '/',
  '/about',
  '/contact'
];

const siteUrl = 'https://intrawebtech.com'; // Change to your deployed site or localhost

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const port = (new URL(browser.wsEndpoint())).port;

  for (const page of pages) {
    const url = `${siteUrl}${page}`;
    const result = await lighthouse(url, {
      port,
      output: ['html', 'json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });

    const fileSafePage = page === '/' ? 'home' : page.replace(/\//g, '_');
    fs.writeFileSync(
      path.join(__dirname, `lighthouse-${fileSafePage}.html`),
      result.report[0]
    );
    fs.writeFileSync(
      path.join(__dirname, `lighthouse-${fileSafePage}.json`),
      result.report[1]
    );
    console.log(`Lighthouse report generated for ${url}`);
  }

  await browser.close();
})(); 