const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('nav err', e.message));
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return { error: 'no footer' };
    const links = Array.from(footer.querySelectorAll('a')).map(a => ({ t: a.textContent.trim(), c: getComputedStyle(a).color }));
    const h4s = Array.from(footer.querySelectorAll('h4')).map(h => ({ t: h.textContent.trim(), c: getComputedStyle(h).color }));
    const spans = Array.from(footer.querySelectorAll('span')).map(s => ({ t: s.textContent.trim().slice(0,30), c: getComputedStyle(s).color }));
    return { links, h4s, spans };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
