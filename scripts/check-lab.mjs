// Grounds the mocked catalog tests in the real Jekyll output, without inference.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { pageContext, CASES } from '../assets/js/lab-protocol.js';
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
const page = readFileSync('_site/lab/index.html', 'utf8');
assert.match(page, /data-app="chat-lab"/);
assert.match(page, /hx-history="false"/);
assert.match(page, /<meta name="robots" content="noindex">/);
assert.match(page, /href="\/lab\/"/);
console.log('Lab build checks passed: real public context, metadata, abstention and history privacy.');
