import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {copy, Fragment, installCopyDocument} from './copy-fixture.mjs';
import {copyText, copyNodes, putCopy, putText} from '../assets/js/copy.js';
import {chatMessages} from '../assets/js/site-chat.js';
import {Connection} from '../assets/js/inference.js';
installCopyDocument();

test('all script copy keys exist in the Markdown source', () => {
  for (const directory of ['assets/js', 'courses/app']) {
    for (const file of readdirSync(directory, {recursive:true}).filter(f => /\.m?js$/.test(f))) {
      const source = readFileSync(directory + '/' + file, 'utf8');
      const keys = new Set([...source.matchAll(/['"]((?:runtime_[a-z]+|prompt)\.[a-z_]+)['"]/g)].map(m => m[1]));
      for (const match of source.matchAll(/\b(?:copyText|copyNodes|putCopy|setCopyStatus)\([^;\n]*?['"]([a-z_]+\.[a-z_]+)['"]/g)) keys.add(match[1]);
      for (const key of keys) {
        const [group, name] = key.split('.');
        assert.equal(typeof copy[group]?.[name], 'string', file + ': ' + key);
      }
    }
  }
});
test('missing copy is empty, logs a key, and clears stale addresses', () => {
  const original = console.error, errors = [];
  console.error = key => errors.push(key);
  try {
    assert.equal(copyText('missing.key'), '');
    const target = new Fragment();
    putCopy(target, 'runtime_chat.stopped');
    assert.equal(target['data-md-key'], 'copy.runtime_chat.stopped');
    putCopy(target, 'missing.key');
    assert.equal(target.textContent, '');
    assert.equal(target['data-md-key'], undefined);
    assert.equal(errors.length, 2);
  } finally { console.error = original; }
});
test('copy interpolates text once and stamps only the current source', () => {
  const target = new Fragment();
  putCopy(target, 'runtime_chat.failed', {error:'<img src=x> {error} & "literal"'});
  assert.equal(target.textContent, '<img src=x> {error} & "literal" Your draft is kept.');
  assert.equal(target['data-md'], '_copy/site.md');
  assert.equal(copyNodes('runtime_chat.stopped').textContent, copy.runtime_chat.stopped);
  putText(target, 'external reply');
  assert.equal(target.textContent, 'external reply');
  assert.equal(target['data-md-key'], undefined);
});
test('chat request prompts match the captured base bytes', async () => {
  const golden = JSON.parse(readFileSync(new URL('./fixtures/chat-prompts.json', import.meta.url)));
  for (const item of golden.cases) {
    const conn = new Connection(); conn.settings.backend = 'custom';
    let captured;
    conn.post = async (_path, body) => { captured = body.messages; return {choices:[{message:{content:'fixture'}}]}; };
    await conn.chat(chatMessages(item.history, item.prompt, item.page)); conn.unload();
    assert.deepEqual(captured, item.messages);
    assert.equal(Buffer.compare(Buffer.from(captured[0].content), Buffer.from(item.messages[0].content)), 0);
  }
});

test('runtime messages match captured base expressions byte for byte', () => {
  const golden = JSON.parse(readFileSync(new URL('./fixtures/script-messages.json', import.meta.url)));
  for (const item of golden.cases) assert.equal(copyText(item.key, item.vars), item.text, item.key);
});
test('placeholder drift renders nothing rather than undefined or unresolved tokens', () => {
  const original = console.error, errors = [];
  console.error = value => errors.push(value);
  try {
    assert.equal(copyText('runtime_chat.failed'), '');
    assert.equal(copyText('runtime_chat.stopped', {unexpected:'value'}), '');
    assert.equal(errors.length, 2);
  } finally {console.error = original;}
});
