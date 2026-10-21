import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Site #32: Liquid treats '' as truthy, so `a.model or a.harness` marked a human
// author (model: '', harness: '') as AI. The byline must test the joined text.
const tpl = readFileSync(new URL('../_includes/byline.html', import.meta.url), 'utf8');

test('byline never branches on bare a.model / a.harness truthiness', () => {
  assert.doesNotMatch(tpl, /\{%-?\s*if\s+a\.(model|harness)\s*(or|-?%\})/);
  assert.doesNotMatch(tpl, /a\.(model|harness)\s+or\s+a\./);
});

test('byline derives the AI mark from the joined model+harness text', () => {
  assert.match(tpl, /capture ai_detail[\s\S]*?\{\{ a\.model \}\}\{\{ a\.harness \}\}/);
  assert.match(tpl, /ai_detail != ''/);
});
