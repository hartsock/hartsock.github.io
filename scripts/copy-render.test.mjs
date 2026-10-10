// Exercise the real stock-Jekyll templates with edited collection values.
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import test from 'node:test';

const ruby = String.raw`
require 'jekyll'
require 'json'
Jekyll::PluginManager.require_from_bundler
site = Jekyll::Site.new(Jekyll.configuration('quiet' => true, 'safe' => true))
site.reset
site.read
input = JSON.parse(STDIN.read)
doc = site.collections['copy'].docs.find { |d| d.relative_path == '_copy/site.md' }
input.fetch('edits', []).each { |group, key, value| doc.data['copy'][group][key] = value }
page = site.pages.find { |p| p.url == '/' }
input.fetch('page_edits', {}).each { |key, value| page.data[key] = value }
site.generate
site.render
page = site.pages.find { |p| p.url == '/' }
archive = site.collections['posts'].docs.find { |d| d.data['republished'] }
STDOUT.write("\nRENDERED_PAGE\n" + page.output + archive.output)
`;
function render(edits = [], page_edits = {}) {
  return spawnSync('bundle', ['exec', 'ruby', '-e', ruby], {
    encoding: 'utf8', input: JSON.stringify({ edits, page_edits }), maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, JEKYLL_ENV: 'production', PAGES_REPO_NWO: 'hartsock/hartsock.github.io' },
  });
}
test('editing the title preserves chat runtime wiring', () => {
  const result = render([['chat', 'title', 'Conversation']]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /<dialog id="siteChat"/);
  assert.match(result.stdout, /id="chatBtn"[^>]+aria-controls="siteChat"/);
  assert.match(result.stdout, /<h2 id="site-chat-title"[^>]*>Conversation<\/h2>/);
});
test('editing only link labels preserves every href and address', () => {
  const baseline = render();
  const labels = { source: 'repository', archive: 'Original journal', pricing: 'Model prices' };
  const result = render(Object.entries(labels).map(([key, value]) => ['links', key, value]), { noscript_link: 'Page directory' });
  assert.equal(baseline.status, 0, baseline.stderr);
  assert.equal(result.status, 0, result.stderr);
  for (const [key, label] of Object.entries(labels)) {
    const pattern = new RegExp('<a data-md="_copy/site.md" data-md-key="copy.links.' + key + '"([^>]*)>([^<]*)</a>');
    const before = baseline.stdout.match(pattern);
    const after = result.stdout.match(pattern);
    assert.ok(before, key + ' baseline anchor');
    assert.ok(after, key + ' edited anchor');
    assert.equal(after[1], before[1], key + ' keeps href and behavior');
    assert.equal(after[2], label);
  }
  const mapPattern = /<a data-md="index.md" data-md-key="noscript_link"([^>]*)>([^<]*)<\/a>/;
  const beforeMap = baseline.stdout.match(mapPattern);
  const afterMap = result.stdout.match(mapPattern);
  assert.ok(beforeMap, 'home page map link baseline');
  assert.ok(afterMap, 'home page map link edited');
  assert.equal(afterMap[1], beforeMap[1], 'map keeps href and behavior');
  assert.equal(afterMap[2], 'Page directory');
  assert.match(result.stdout, /Written in plain text; the source lives in <a[^>]+>repository<\/a>\./);
});
for (const value of ['Missing slot.', '{link.source} and {link.source}.']) {
  test(`invalid required link slot fails rendering: ${value}`, () => {
    const result = render([['footer', 'source', value]]);
    assert.notEqual(result.status, 0, 'Malformed copy must fail the build');
    assert.match(result.stderr, /invalid-copy-link-slot/);
  });
}
