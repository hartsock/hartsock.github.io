// Grounds the mocked catalog tests in the real Jekyll output, without inference.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { checkTemplatePages } from './check-template-pages.mjs';
checkTemplatePages();
import { pageContext, CASES } from '../assets/js/lab-protocol.js';
const directory = readFileSync('_site/labs/index.html', 'utf8');
assert.match(directory, /<h1>Labs<\/h1>/);
assert.doesNotMatch(directory, /data-app="(?:chat-lab|model-comparison)"/);
for (const slug of ['browser-chat', 'model-comparison']) {
  assert.match(directory, new RegExp('href="/labs/' + slug + '/"'));
  const old = readFileSync('_site/' + (slug === 'browser-chat' ? 'lab' : 'lab/model-comparison') + '/index.html', 'utf8');
  assert.match(old, new RegExp('http-equiv="refresh"[^>]+/labs/' + slug + '/'));
}
const context = JSON.parse(readFileSync('_site/lab/context.json', 'utf8'));
assert.equal(context.title, 'A by-line for every model');
assert.equal(context.authors[0].name, 'Shawn Hartsock');
assert.equal(context.authors[1].model, 'claude-sonnet-5-5');
assert.equal(context.status, 'draft');
assert.match(context.content, /slug, date, area and first\s+author/);
assert.match(context.content, /text itself is not hashed into the URL/);
assert.doesNotMatch(context.content, /<\/?(?:p|li|ul|h2|code)\b/);
assert.doesNotMatch(pageContext(context), /WebLLM/); // the abstention question really is unanswerable
assert.equal(CASES.length, 6);
const page = readFileSync('_site/labs/browser-chat/index.html', 'utf8');
assert.match(page, /data-app="chat-lab"/);
assert.match(page, /hx-history="false"/);
assert.match(page, /<meta name="robots" content="noindex">/);
assert.match(page, /href="\/labs\/"/);
for (const control of ['data-cards', 'data-chat', 'data-smoke', 'data-tests']) {
  assert.ok(page.includes(control), 'Original browser chat control survives: ' + control);
}
assert.match(page, /<button class="btn primary lab-send" type="submit" data-send/);
assert.match(page, /<dialog[^>]+data-loading[^>]+aria-labelledby="lab-loading-title"/);
assert.match(page, /data-cancel-load autofocus/);
// A returning visitor may still have every pre-Send asset in HTTP cache.
assert.match(page, /\/assets\/js\/site\.js\?v=chat-identity-1/);
assert.match(page, /\/assets\/css\/lab\.css\?v=labs-index-1/);
assert.match(readFileSync('_site/assets/js/site.js', 'utf8'), /\.\/chat-lab\.js\?v=site-chat-1/);
assert.match(readFileSync('_site/assets/js/site.js', 'utf8'), /\.\/site-chat\.js\?v=chat-identity-1/);
assert.match(readFileSync('_site/assets/js/chat-lab.js', 'utf8'), /\.\/lab-protocol\.js\?v=lab-send-1/);
for (const path of ['index.html', 'posts/index.html', 'wiki/index.html', 'series/index.html', 'courses/index.html', 'labs/index.html', 'labs/browser-chat/index.html', 'labs/model-comparison/index.html', 'posts/a-byline-for-every-model-sob4tsdi/index.html']) {
  const html = readFileSync('_site/' + path, 'utf8');
  assert.match(html, /id="chatBtn"[^>]+aria-controls="siteChat"/, path);
  assert.match(html, /<dialog id="siteChat"[^>]+aria-labelledby="site-chat-title"/, path);
  const chat = html.match(/<dialog id="siteChat"[^>]*>([\s\S]*?)<\/dialog>/)?.[1];
  assert.ok(chat, "Visible chat dialog is present: " + path);
  assert.match(chat, /<p\b[^>]*id="site-chat-identity"[^>]*data-md-key="copy\.chat\.identity"[^>]*>AI assistant, not Shawn Hartsock\. It does not speak for him\.<\/p>/, path);
  assert.ok(html.indexOf('id="siteChat"') < html.indexOf('id="page"'), 'Chat must stay outside HTMX page snapshots: ' + path);
}
console.log('Lab build checks passed: real public context, metadata, abstention and history privacy.');
const comparison = readFileSync('_site/labs/model-comparison/index.html', 'utf8');
assert.match(comparison, /data-app="model-comparison" data-inference-lab hx-boost="false" hx-history="false"/);
assert.equal((comparison.match(/data-comparison-card/g) || []).length, 3);
assert.match(comparison, /the seat of the divine spark within us/);
assert.match(comparison, /a concept that is both present and absent/);
assert.match(comparison, /is soul ↵ soul ↵ soul ↵ soul/);
assert.match(comparison, /<meta name="robots" content="noindex">/);
assert.match(comparison, /No usable odds were preserved/);
assert.match(page, /href="\/labs\/model-comparison\/"/);
assert.match(comparison, /href="\/labs\/"/);
console.log('Comparison build checks passed: three attributed observations, no invented odds, private history.');
