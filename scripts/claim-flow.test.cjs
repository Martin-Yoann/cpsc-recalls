const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function harness() {
  const stored = new Map();
  global.window = {};
  global.sessionStorage = { getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), removeItem: (key) => stored.delete(key) };
  let draftCalls = 0;
  let finishUpload;
  const upload = new Promise((resolve) => { finishUpload = resolve; });
  const modules = {
    '@/lib/api-client': {
      submitClaimDraft: async () => { draftCalls++; return { ok: true, data: { draftId: 'fresh', draftToken: 'new-token', expiresAt: '2099-01-01T00:00:00Z' } }; },
      getUploadToken: async () => ({ ok: true, data: { documentId: 'photo', pathname: 'local', clientToken: 'local', expiresAt: '2099-01-01T00:00:00Z' } }),
    },
    '@/lib/blob-upload': { uploadPrivateObject: () => upload },
    '@/lib/disposal-access': { saveDisposalToken() {} },
    '@/lib/i18n/locale': { browserLocale: () => 'en-US', normalizeLocale: (locale) => locale },
  };
  const code = ts.transpileModule(fs.readFileSync(new URL('../src/lib/claim-flow.ts', `file:///${__filename.replaceAll('\\', '/')}`), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('require', 'exports', code)((id) => { assert.ok(modules[id], id); return modules[id]; }, exports);
  return { ...exports, stored, finishUpload, draftCalls: () => draftCalls };
}

test('expired, invalid and missing expiry never resume; valid drafts remain reusable', async () => {
  const h = harness();
  for (const expiresAt of ['2020-01-01T00:00:00Z', '', 'invalid']) {
    h.stored.set('koi_claim_flow:campaign', JSON.stringify({ draftId: 'old', draftToken: 'old-token', expiresAt }));
    assert.equal(h.claimFlowModule.resume('campaign'), null);
    assert.equal(h.claimFlowModule.hasExpiredDraft('campaign'), true);
    const result = await h.claimFlowModule.start('campaign');
    assert.equal(result.data.draftId, 'fresh');
    assert.equal(JSON.parse(h.stored.get('koi_claim_flow:campaign')).draftId, 'fresh');
  }
  assert.equal(h.draftCalls(), 3);
  await h.claimFlowModule.start('campaign');
  assert.equal(h.draftCalls(), 3);
});

test('successful async upload returns a receipt without overwriting newer stored fields', async () => {
  const h = harness();
  const session = (await h.claimFlowModule.start('campaign')).data;
  const pending = h.claimFlowModule.addDocument(session, { name: 'photo.jpg', type: 'image/jpeg', size: 4 }, 'product_photo');
  h.claimFlowModule.save({ ...session, remedyCode: 'changed-while-uploading', form: { ...session.form, product: { ...session.form.product, lotCode: 'NEW' } } });
  h.finishUpload();
  const result = await pending;
  assert.equal(result.ok, true);
  assert.equal(result.data.receipt.status, 'verifying');
  const saved = JSON.parse(h.stored.get('koi_claim_flow:campaign'));
  assert.equal(saved.remedyCode, 'changed-while-uploading');
  assert.equal(saved.form.product.lotCode, 'NEW');
});

test('renewal preserves in-memory input, discards old evidence, and changes idempotency key without writing stale state', async () => {
  const h = harness();
  const session = (await h.claimFlowModule.start('campaign')).data;
  session.form.consumer.firstName = 'Keep this input';
  session.documents = [{ documentId: 'expired-evidence' }];
  const storedBefore = h.stored.get('koi_claim_flow:campaign');
  const renewed = await h.claimFlowModule.renew(session);
  assert.equal(renewed.data.form.consumer.firstName, 'Keep this input');
  assert.deepEqual(renewed.data.documents, []);
  assert.notEqual(renewed.data.idempotencyKey, session.idempotencyKey);
  assert.equal(h.stored.get('koi_claim_flow:campaign'), storedBefore);
});
