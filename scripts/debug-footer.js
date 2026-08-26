const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('nav err', e.message));
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return { error: 'no footer' };
    const bg = getComputedStyle(footer).backgroundColor;
    const h4 = footer.querySelector('h4');
    const link = footer.querySelector('a');
    const p = footer.querySelector('p');
    return {
      footerBg: bg,
      h4Color: h4 ? getComputedStyle(h4).color : null,
      linkColor: link ? getComputedStyle(link).color : null,
      pColor: p ? getComputedStyle(p).color : null,
      h4Text: h4 ? h4.textContent : null,
      linkText: link ? link.textContent : null,
      pText: p ? p.textContent : null,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
