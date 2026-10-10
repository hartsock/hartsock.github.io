// Pin the pre-migration /all/ membership; layout changes must not hide pages.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function allPageUrls(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/);
  assert.ok(main, '/all/ must contain main');
  return [...new Set([...main[1].matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(match => match[1]))].sort();
}

export function checkTemplatePages(site = '_site') {
  const expected = JSON.parse(readFileSync(new URL('./testdata/template-page-urls.json', import.meta.url), 'utf8'));
  const actual = allPageUrls(readFileSync(join(site, 'all/index.html'), 'utf8'));
  assert.deepEqual(actual, expected, '/all/ URL set differs from the reviewed template migration baseline');
  for (const [output, source] of [
    ['index.html', 'index.md'], ['explore/index.html', 'explore.md'],
    ['all/index.html', 'all.md'], ['posts/index.html', 'posts/index.md'],
    ['series/index.html', 'series/index.md'], ['wiki/index.html', 'wiki/index.md'],
  ]) {
    const html = readFileSync(join(site, output), 'utf8');
    assert.ok(html.includes(`<div data-md="${source}">`), `${source}: whole-body address missing`);
    assert.doesNotMatch(html, /<p>\{widget\s/, `${source}: unresolved widget`);
  }
  console.log(`Template build checks passed: ${actual.length} unchanged /all/ URLs; six body addresses.`);
}
