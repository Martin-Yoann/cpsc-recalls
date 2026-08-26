const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('nav err', e.message));
  await page.waitForTimeout(2000);
  const info = await page.evaluate(async () => {
    const footer = document.querySelector('footer');
    const home = Array.from(footer.querySelectorAll('a')).find(a => a.textContent.trim() === 'Home');
    if (!home) return { error: 'no home link' };
    // Test: apply various classes and check computed color
    const results = {};
    // Check if the .text-footer-muted rule exists and applies by forcing it
    const test1 = getComputedStyle(home).color;
    results.original = test1;
    // Check what a div with text-footer-muted gives
    const div = document.createElement('div');
    div.className = 'text-footer-muted';
    div.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(div);
    results.divColor = getComputedStyle(div).color;
    document.body.removeChild(div);
    // Check neutral-400
    home.classList.add('text-neutral-400');
    results.afterNeutral = getComputedStyle(home).color;
    home.classList.remove('text-neutral-400');
    // Check text-brand (custom color) on the anchor
    home.classList.add('text-brand');
    results.afterBrand = getComputedStyle(home).color;
    home.classList.remove('text-brand');
    return results;
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
