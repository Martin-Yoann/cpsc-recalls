const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const url = process.argv[2] || 'http://localhost:3000';
  const out = process.argv[3] || 'preview.png';
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('nav err', e.message));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: out, fullPage: true });
  console.log('SAVED', out);
  await browser.close();
})();
