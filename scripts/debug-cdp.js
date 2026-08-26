const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('nav err', e.message));
  await page.waitForTimeout(2000);

  // Find the Home link in footer
  const handle = await page.evaluateHandle(() => {
    const footer = document.querySelector('footer');
    return Array.from(footer.querySelectorAll('a')).find(a => a.textContent.trim() === 'Home');
  });

  const cdp = await page.context().newCDPSession(page);
  const { backendNodeId } = await cdp.send('DOM.describeNode', { objectId: (await handle.asElement())._objectId });
  const styles = await cdp.send('CSS.getMatchedStylesForNode', { nodeId: undefined, backendNodeId });

  console.log('=== matched rules (selector, layer?, declarations) ===');
  for (const rule of (styles.matchedCSSRules || [])) {
    const sel = rule.rule.selectorList.text;
    const decls = rule.rule.style.cssProperties.filter(p => p.name === 'color').map(p => `${p.name}:${p.value}${p.important ? ' !important' : ''}`);
    if (decls.length) {
      console.log(`sel="${sel}" | ${decls.join(', ')}`);
    }
  }
  // Also print which rule is the winning one for 'color'
  console.log('=== inline style ===');
  console.log(styles.inlineStyle);
  await browser.close();
})();
