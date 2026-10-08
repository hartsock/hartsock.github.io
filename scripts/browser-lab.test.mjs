import test from 'node:test';
import assert from 'node:assert/strict';
import { BROWSER_MODELS, DEFAULT_BROWSER_MODEL, appConfig, chatRequest, cleanReply } from '../assets/js/browser-models.js';
import { SessionCacheStorage } from '../assets/js/session-cache.js';
import { BrowserSession } from '../assets/js/browser-session.js';

test('six builds ordered by size, independent Qwen default, all revisions pinned', () => {
  assert.equal(BROWSER_MODELS.length, 6);
  assert.equal(new Set(BROWSER_MODELS.map(m => m.id)).size, 6);
  assert.equal(BROWSER_MODELS[0].mb, Math.min(...BROWSER_MODELS.map(m => m.mb)));
  assert.deepEqual(BROWSER_MODELS.map(m => m.mb), BROWSER_MODELS.map(m => m.mb).sort((a,b) => a-b));
  assert.equal(DEFAULT_BROWSER_MODEL, 'Qwen3.5-0.8B-q4f16_1-MLC');
  const presets = { model_list: BROWSER_MODELS.map(m => ({ model_id: m.id,
    model_lib: 'https://example.org/main/model.wasm', overrides: { context_window_size: 4096 } })) };
  const config = appConfig(presets);
  for (const record of config.model_list) {
    assert.match(record.model, /\/resolve\/[a-f0-9]{40}\/$/);
    assert.doesNotMatch(record.model_lib, /\/main\//);
    assert.equal(record.overrides.context_window_size, 4096);
  }
  assert.equal(config.model_list[3].overrides.sliding_window_size, -1);
  assert.equal(presets.model_list[3].overrides.sliding_window_size, undefined);
  assert.throws(() => appConfig({ model_list: [] }), /Missing/);
});

test('tested chat formatting handles Gemma roles, Qwen thinking and streaming thought fragments', () => {
  const messages = [{ role: 'system', content: 'Use evidence' }, { role: 'user', content: 'Hi' }];
  const gemma = chatRequest(BROWSER_MODELS[3].id, messages);
  assert.deepEqual(gemma.messages, [{ role: 'user', content: 'Use evidence\n\nHi' }]);
  assert.equal(messages.length, 2);
  for (const model of BROWSER_MODELS.filter(m => m.id.startsWith('Qwen'))) {
    assert.equal(chatRequest(model.id, messages).extra_body.enable_thinking, false);
  }
  assert.equal(cleanReply('<think>scratch</think>Hello'), 'Hello');
  assert.equal(cleanReply('<think>partial'), '');
  assert.equal(cleanReply('<thi'), '');
});

test('RAM adapter returns repeatable responses and isolates cache scopes', async () => {
  const caches = new SessionCacheStorage();
  const a = await caches.open('a'), b = await caches.open('b');
  await a.put('https://example.org/weight', new Response('weights', { headers: { 'x-test': 'yes' } }));
  for (let i = 0; i < 2; i++) {
    const response = await a.match(new Request('https://example.org/weight'));
    assert.equal(await response.text(), 'weights');
    assert.equal(response.headers.get('x-test'), 'yes');
  }
  assert.equal(await b.match('https://example.org/weight'), undefined);
  assert.equal((await a.keys()).length, 1);
  assert.equal(await a.delete('https://example.org/weight'), true);
  assert.equal(await caches.delete('a'), true);
  assert.deepEqual(await caches.keys(), ['b']);
});

function fakeRuntime(create) {
  return { prebuiltAppConfig: { model_list: BROWSER_MODELS.map(m => ({ model_id: m.id,
    model_lib: 'https://example.org/main/model.wasm' })) }, CreateWebWorkerMLCEngine: create };
}
test('stop while importing prevents late workers and model resurrection', async () => {
  let resolve, workers = 0;
  const session = new BrowserSession({ runtime: () => new Promise(r => { resolve = r; }),
    worker: () => { workers++; return new EventTarget(); } });
  const pending = session.load(BROWSER_MODELS[0].id);
  session.stop();
  resolve(fakeRuntime(() => ({})));
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(workers, 0);
  assert.equal(session.engine, null);
});

test('stop rejects an in-flight load and terminates its worker', async () => {
  let terminated = 0;
  const worker = Object.assign(new EventTarget(), { terminate() { terminated++; } });
  const session = new BrowserSession({ runtime: async () => fakeRuntime(() => new Promise(() => {})),
    worker: () => worker });
  const pending = session.load(BROWSER_MODELS[0].id);
  await new Promise(r => setTimeout(r, 0));
  session.stop();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(terminated, 1);
  assert.equal(session.engine, null);
});

test('worker failure rejects promptly and releases resources', async () => {
  let terminated = 0;
  const worker = Object.assign(new EventTarget(), { terminate() { terminated++; } });
  const session = new BrowserSession({ runtime: async () => fakeRuntime(() => new Promise(() => {})),
    worker: () => worker });
  const pending = session.load(BROWSER_MODELS[0].id);
  await new Promise(r => setTimeout(r, 0));
  worker.dispatchEvent(Object.assign(new Event('error'), { message: 'broken runtime' }));
  await assert.rejects(pending, /broken runtime/);
  assert.equal(terminated, 1);
});

test('streaming replays the conversation, reports measurements and stops cleanly', async () => {
  let request, resets = 0, terminated = 0;
  const engine = { async resetChat() { resets++; }, chat: { completions: {
    async *create(value) {
      request = value;
      yield { choices: [{ delta: { content: 'Hello' } }] };
      yield { choices: [{ delta: { content: ', Rowan.' }, finish_reason: 'stop' }], usage: { completion_tokens: 4 } };
    },
  } } };
  const session = new BrowserSession({ runtime: async () => fakeRuntime(async () => engine),
    worker: () => Object.assign(new EventTarget(), { terminate() { terminated++; } }) });
  await session.load(DEFAULT_BROWSER_MODEL);
  const messages = [{ role: 'user', content: 'Hello. My name is Rowan.' }];
  const result = await session.complete(messages);
  assert.equal(request.messages, messages);
  assert.equal(request.extra_body.enable_thinking, false);
  assert.equal(resets, 1);
  assert.equal(result.answer, 'Hello, Rowan.');
  assert.equal(result.finishReason, 'stop');
  assert.equal(result.usage.completion_tokens, 4);
  assert.ok(result.firstTokenSeconds >= 0);
  session.stop();
  assert.equal(terminated, 1);
  assert.equal(session.engine, null);
});

test('new visitors get Qwen; previously saved choices and remote settings survive', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let stored = null;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => stored } });
  try {
    const fresh = (await import('../assets/js/inference.js?test=fresh')).connection;
    assert.equal(fresh.settings.browserModel, DEFAULT_BROWSER_MODEL);
    assert.equal(fresh.settings.browserStorage, 'memory');
    stored = JSON.stringify({ browserModel: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', backend: 'custom', customUrl: 'https://example.org/v1' });
    const existing = (await import('../assets/js/inference.js?test=existing')).connection;
    assert.equal(existing.settings.browserModel, 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC');
    assert.equal(existing.settings.backend, 'custom');
    assert.equal(existing.settings.customUrl, 'https://example.org/v1');
    const config = appConfig({ model_list: [...BROWSER_MODELS.map(m => ({ model_id: m.id, model_lib: '/main/model.wasm' })),
      { model_id: existing.settings.browserModel, model_lib: '/legacy.wasm' }] });
    assert.ok(config.model_list.some(m => m.model_id === existing.settings.browserModel));
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});
