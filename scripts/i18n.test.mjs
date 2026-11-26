import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { translator, message } from '../src/lib/i18n/translate.ts';
import { normalizeLocale, browserLocale } from '../src/lib/i18n/locale.ts';

test('normalizes Spanish regions and uses English for unsupported languages', () => {
  for (const code of ['es', 'es-ES', 'es-MX', 'ES_us']) assert.equal(normalizeLocale(code), 'es-US');
  for (const code of [undefined, 'en', 'en-GB', 'fr-FR', '../es']) assert.equal(normalizeLocale(code), 'en-US');
  assert.equal(browserLocale(), 'en-US');
});

test('stable identifiers translate without interpreting user or API text', () => {
 const es = translator('es-US');
 assert.equal(es('claim.submit'), 'Presentar una solicitud');
 assert.equal(translator('en-US')('claim.submit'), 'Submit a Claim');
 assert.equal(es('Submit a Claim'), 'Submit a Claim');
 assert.equal(es('SKU-AB123'), 'SKU-AB123');
 const consumer = {name:'Home', reference:'KOI-ABCD-12345678'};
 assert.equal(es(consumer), consumer);
 assert.equal(es(null),null);
 assert.match(es(message('error.verification',{reference:'ABC123'})), /ABC123/);
 assert.match(es(message('validation.files.minimum',{count:2,category:message('ui.product.photo.6cf327')})), /2/);
});
test('catalogues have identical identifiers and parameter contracts', () => {
 const en=JSON.parse(fs.readFileSync(new URL('../src/lib/i18n/en.json',import.meta.url)));
 const es=JSON.parse(fs.readFileSync(new URL('../src/lib/i18n/es.json',import.meta.url)));
 assert.deepEqual(Object.keys(en).sort(),Object.keys(es).sort());
 for(const id of Object.keys(en)) {
  assert.ok(es[id].trim(),id);
  const params=s=>[...s.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map(m=>m[1]).sort();
  assert.deepEqual(params(en[id]),params(es[id]),id);
 }
});

test('every literal UI message has a Spanish catalogue entry', () => {
  const messages = JSON.parse(fs.readFileSync(new URL('../src/lib/i18n/es.json', import.meta.url), 'utf8'));
  const missing = new Set();
  function walk(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isDirectory()) walk(file);
      else if (file.endsWith('.tsx')) {
        const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        function visit(node) {
          if (ts.isCallExpression(node) && node.expression.getText(ast) === 't' && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
            const key = node.arguments[0].text.trim();
            if (/[A-Za-z]/.test(key) && !messages[key]) missing.add(key);
          }
          ts.forEachChild(node, visit);
        }
        visit(ast);
      }
    }
  }
  walk(fileURLToPath(new URL('../src', import.meta.url)));
  assert.deepEqual([...missing], []);
});
