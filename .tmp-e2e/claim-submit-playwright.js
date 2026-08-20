const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function resolveBaseUrl(browser) {
  for (const port of [3000, 3001]) {
    const url = `http://localhost:${port}/recalls/music-lollipop-demo-2026`;
    const probe = await browser.newPage();
    try {
      await probe.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const text = await probe.locator('body').innerText().catch(() => '');
      if (!/Page Not Found/i.test(text || '')) {
        await probe.close();
        return url;
      }
    } catch {}
    await probe.close().catch(() => {});
  }

  return 'http://localhost:3000/recalls/music-lollipop-demo-2026';
}

async function setFilesForEvidence(page, labelText, filePath) {
  const label = page.locator('label').filter({ hasText: labelText }).first();
  await label.waitFor({ state: 'visible', timeout: 15000 });

  const fileInput = label.locator('input[type="file"]');
  if (!await fileInput.count()) {
    throw new Error(`No file input found for ${labelText}`);
  }

  await fileInput.setInputFiles(filePath);
}

(async () => {
  const productPhoto = path.resolve('O:/cc项目/KOL/koi-recall-web/.tmp-e2e/product-photo.png');
  const receiptPhoto = path.resolve('O:/cc项目/KOL/koi-recall-web/.tmp-e2e/receipt.png');
  const outPath = path.resolve('O:/cc项目/KOL/koi-recall-web/.tmp-e2e/claim-submit-result.json');

  const events = [];
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const baseUrl = await resolveBaseUrl(browser);
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/upload-tokens') || url.includes('/claims')) {
      events.push({ type: 'request', url, method: req.method(), headers: req.headers(), postData: req.postData() });
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/upload-tokens') || url.includes('/claims')) {
      let body = '';
      try { body = await res.text(); } catch {}
      events.push({ type: 'response', url, status: res.status(), body });
    }
  });

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.getByText('Preparing secure claim session...', { exact: false }).waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

    const bodyTextAfterLoad = await page.locator('body').innerText().catch(() => '');
    if (/Page Not Found/i.test(bodyTextAfterLoad || '')) {
      throw new Error(`Recall page resolved to not-found: ${baseUrl}`);
    }

    const refundButton = page.getByRole('button', { name: /refund/i }).first();
    const replacementButton = page.getByRole('button', { name: /replacement/i }).first();
    if (await refundButton.isVisible().catch(() => false)) {
      await refundButton.click();
    } else if (await replacementButton.isVisible().catch(() => false)) {
      await replacementButton.click();
    } else {
      const continueButton = page.getByRole('button', { name: /Continue with Selected Remedy/i });
      if (!await continueButton.count()) {
        throw new Error('No remedy button found');
      }
    }

    await page.getByRole('button', { name: /Continue with Selected Remedy/i }).click();
    await page.getByRole('heading', { name: /Requested resolution captured/i }).waitFor({ timeout: 15000 });

    await page.getByLabel('First name').fill('Auto');
    await page.getByLabel('Last name').fill('Tester');
    await page.getByLabel('Email').fill(`auto.${Date.now()}@example.com`);
    await page.getByLabel('Phone').fill('5550102042');
    await page.getByLabel('Address line 1').fill('123 Test Street');
    await page.getByLabel('City').fill('Boston');
    await page.getByLabel('State / Province').fill('MA');
    await page.getByLabel('Postal code').fill('02110');
    await page.getByLabel('Country code').fill('US');

    const purchaseChannel = page.locator('#purchase-channel');
    if (await purchaseChannel.count()) await purchaseChannel.selectOption('other');
    const purchaseDate = page.locator('#purchase-date');
    if (await purchaseDate.count()) await purchaseDate.fill('2026-08-01');
    const orderNumber = page.locator('#order-number');
    if (await orderNumber.count()) await orderNumber.fill('TEST-ORDER-001');
    const lotCode = page.locator('#lot-code');
    if (await lotCode.count()) await lotCode.fill('ML-2406-A');
    const dateCode = page.locator('#date-code');
    if (await dateCode.count()) await dateCode.fill('06/2024');

    await setFilesForEvidence(page, 'Add Proof of purchase', receiptPhoto);
    await setFilesForEvidence(page, 'Add Product photo', productPhoto);

    await page.waitForTimeout(4000);

    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    for (let i = 0; i < checkboxCount; i += 1) {
      await checkboxes.nth(i).check().catch(() => {});
    }

    await page.getByRole('button', { name: 'Submit Through API' }).click();
    await page.waitForTimeout(8000);

    const session = await page.evaluate(() => {
      const raw = sessionStorage.getItem('koi_claim_flow:music-lollipop-demo-2026');
      return raw ? JSON.parse(raw) : null;
    });

    const bodyText = await page.locator('body').innerText();
    const result = { ok: /Claim Submitted/i.test(bodyText || ''), session, events, bodyText };
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
    console.log(JSON.stringify({ ok: result.ok, outPath }, null, 2));
  } catch (error) {
    const session = await page.evaluate(() => {
      const raw = sessionStorage.getItem('koi_claim_flow:music-lollipop-demo-2026');
      return raw ? JSON.parse(raw) : null;
    }).catch(() => null);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const result = { ok: false, error: String(error), session, events, bodyText };
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
    console.error(String(error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
