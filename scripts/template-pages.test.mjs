import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { allPageUrls, checkTemplatePages } from './check-template-pages.mjs';

test('all-page membership ignores chrome and duplicates but retains every main link', () => {
  assert.deepEqual(allPageUrls('<nav><a href="/chrome/">Nav</a></nav><main><a href="/b/">B</a><a href="/a/">A</a><a href="/b/">B</a></main>'), ['/a/', '/b/']);
  assert.throws(() => allPageUrls('<a href="/a/">A</a>'), /must contain main/);
});

test('the built-site guard fails when a layout migration drops a listed page', () => {
  const temp = mkdtempSync(new URL('./.template-membership-', import.meta.url).pathname);
  try {
    mkdirSync(join(temp, 'all'));
    const baseline = JSON.parse(readFileSync(new URL('./testdata/template-page-urls.json', import.meta.url)));
    writeFileSync(join(temp, 'all/index.html'), '<main>' + baseline.filter(url => url !== '/posts/').map(url => `<a href="${url}">Page</a>`).join('') + '</main>');
    assert.throws(() => checkTemplatePages(temp), /URL set differs/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test('template bodies contain prose and layouts select pages by properties', () => {
  for (const path of ['index.md', 'explore.md', 'all.md', 'posts/index.md', 'series/index.md', 'wiki/index.md']) {
    const body = readFileSync(new URL('../' + path, import.meta.url), 'utf8').split(/^---\s*$/m).slice(2).join('---');
    assert.doesNotMatch(body, /\{[{%]|<\/?[A-Za-z]|<!--/, path);
    assert.ok(body.trim(), path);
  }
  const listing = readFileSync(new URL('../_layouts/listing.html', import.meta.url), 'utf8');
  assert.match(listing, /where_exp:/);
  assert.doesNotMatch(listing, /where:\s*["']layout["']/);
});
