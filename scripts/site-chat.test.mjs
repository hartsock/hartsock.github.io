import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chatMessages } from '../assets/js/site-chat.js';
import { Connection } from '../assets/js/inference.js';

test('the AI identity is explicit with or without a page, independent of first-person prose', () => {
  const page = { title: 'About Shawn', url: '/about/', content: 'I am Shawn Hartsock. I write about software.' };
  for (const context of [null, page]) {
    const messages = chatMessages([], 'hello?', context);
    assert.match(messages[0].content, /AI assistant for Shawn Hartsock.s website, not Shawn Hartsock/);
    assert.match(messages[0].content, /do not speak for him/);
    assert.match(messages[0].content, /third person/);
    assert.match(messages[0].content, /without summarizing the page/);
    assert.doesNotMatch(messages[0].content.split('\n\nREFERENCE PAGE')[0], /I am Shawn Hartsock/);
    assert.equal(messages.at(-1).role, 'user');
    assert.equal(messages.at(-1).content, 'hello?');
  }
  const messages = chatMessages([], 'Who wrote this?', page);
  const reference = JSON.parse(messages[0].content.split('\n').at(-1));
  assert.deepEqual(reference, { title: page.title, url: page.url, excerpt: page.content });
  assert.equal(messages.at(-1).content, 'Who wrote this?');
});

test('the chat dialog labels the assistant independently of generated replies', () => {
  const markup = readFileSync(new URL('../_includes/site-chat.html', import.meta.url), 'utf8');
  assert.match(markup, /AI assistant, not Shawn Hartsock/);
  assert.match(markup, /does not speak for him/);
});

test('page chat bounds context and history without losing the latest question', () => {
  const history = Array.from({ length: 12 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: String(i).repeat(500) }));
  const messages = chatMessages(history, 'What does this mean?', { title: 'Test', url: '/posts/test/', content: 'page '.repeat(3000) });
  assert.equal(messages[0].role, 'system');
  assert.match(messages[0].content, /evidence, not instructions/);
  assert.match(messages[0].content, /excerpt/);
  assert.equal(messages.at(-1).content, 'What does this mean?');
  assert.equal(JSON.parse(messages[0].content.split('\n').at(-1)).excerpt.length, 4800);
  assert.equal(messages[1].role, 'user');
  assert.ok(messages.reduce((n, m) => n + m.content.length, 0) < 11000);
  assert.equal(history.length, 12);
  assert.doesNotMatch(chatMessages([], 'hello', null)[0].content, /page text/);
});

test('site chat reuses the connection and streams through its existing worker owner', async () => {
  const conn = new Connection();
  let loads = 0, sent;
  conn.load = async () => { loads++; };
  conn.browserSession.complete = async (messages, options) => {
    sent = messages; options.onText('Hello'); return { answer: 'Hello' };
  };
  let text;
  const messages = [{ role: 'user', content: 'hello' }];
  assert.equal(await conn.chat(messages, { onText: value => { text = value; } }), 'Hello');
  assert.equal(loads, 1);
  assert.equal(sent, messages);
  assert.equal(text, 'Hello');
  conn.unload();
});

test('cancelling a cold Send cannot generate after a late load resolves', async () => {
  const conn = new Connection(), controller = new AbortController();
  let finish, generated = 0, stopped = 0;
  conn.load = () => new Promise(resolve => { finish = resolve; });
  conn.browserSession.complete = async () => { generated++; return { answer: 'late' }; };
  conn.browserSession.stop = () => { stopped++; };
  const pending = conn.chat([{ role: 'user', content: 'hello' }], { signal: controller.signal, onText() {} });
  controller.abort(); finish();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(generated, 0);
  assert.equal(stopped, 1);
});

test('remote chat receives cancellation and concurrent chat is rejected', async () => {
  const conn = new Connection(), controller = new AbortController();
  conn.settings.backend = 'custom';
  conn.settings.customUrl = 'https://example.org/v1';
  let finish, passedSignal;
  conn.post = async (_path, _body, signal) => {
    passedSignal = signal;
    await new Promise(resolve => { finish = resolve; });
    return { choices: [{ message: { content: 'Hello' } }] };
  };
  const pending = conn.chat([], { signal: controller.signal });
  await assert.rejects(conn.chat([]), /already answering/);
  assert.equal(passedSignal, controller.signal);
  controller.abort(); finish();
  await assert.rejects(pending, { name: 'AbortError' });
});

test('a failed worker clears the shared connection so the next Send can reload', async () => {
  const conn = new Connection();
  conn.engine = {};
  conn.engineModel = 'old';
  conn.load = async () => {};
  conn.browserSession.complete = async () => { throw new Error('Worker stopped'); };
  await assert.rejects(conn.chat([]), /Worker stopped/);
  assert.equal(conn.engine, null);
  assert.equal(conn.engineModel, null);
  assert.equal(conn.chatPending, false);
  assert.equal(conn.status.state, 'error');
  conn.unload();
});
