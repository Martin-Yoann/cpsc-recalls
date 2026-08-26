const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('nav err', e.message));
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    const links = Array.from(footer.querySelectorAll('a'));
    // find the "Home" link (column link)
    const home = links.find(a => a.textContent.trim() === 'Home');
    if (!home) return { error: 'no Home link' };
    const cls = home.className;
    const comp = getComputedStyle(home);
    return { className: cls, color: comp.color, textFooterMutedVar: getComputedStyle(document.documentElement).getPropertyValue('--color-footer-muted') };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
