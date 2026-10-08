import test from 'node:test';
import assert from 'node:assert/strict';
import { BrowserSession } from '../assets/js/browser-session.js';
import { compareModels } from '../assets/js/model-comparison.js';
import { Connection } from '../assets/js/inference.js';
import { readFileSync } from 'node:fs';
import { BROWSER_MODELS } from '../assets/js/browser-models.js';

test('the bundled capture grounds the protocol in real Chrome results', () => {
  const capture = JSON.parse(readFileSync(new URL('../assets/data/model-comparison.json', import.meta.url)));
  assert.equal(capture.measurementTemperature, 1); assert.equal(capture.runs.length, 3);
  for (const run of capture.runs) {
    assert.equal(run.status, 'done'); assert.equal(run.steps.length, 8);
    assert.equal(run.revision, BROWSER_MODELS.find(m => m.id === run.model).revision);
    assert.equal(run.prompt, 'The soul is');
    assert.equal(run.completion, run.steps.map(s => s.chosen).join(''));
    const probability = Math.exp(run.steps[0].candidates[0].logprob);
    assert.ok(probability > .1 && probability < .4); // not the former collapsed 100%
    let context = run.prompt;
    for (const step of run.steps) {
      assert.equal(step.context, context); context += step.chosen;
      assert.ok(step.candidates.every(c => Number.isFinite(c.logprob)));
      assert.ok(step.candidates.reduce((sum, c) => sum + Math.exp(c.logprob), 0) <= 1.00001);
    }
  }
});

test('next-token measurement uses uncollapsed odds, resets context, and sorts the candidates', async () => {
  let request, resets = 0;
  const session = new BrowserSession();
  session.controller = new AbortController();
  session.engine = { resetChat: async () => { resets++; }, completions: { create: async r => {
    request = r;
    return { choices: [{ logprobs: { content: [{ top_logprobs: [
      { token: ' second', logprob: Math.log(.2) }, { token: ' first', logprob: Math.log(.4) },
    ] }] } }] };
  } } };
  const candidates = await session.nextWord('The soul is');
  assert.equal(request.temperature, 1); assert.equal(request.top_p, 1);
  assert.equal(request.repetition_penalty, 1); assert.equal(request.frequency_penalty, 0);
  assert.equal(resets, 1); assert.equal(request.prompt, 'The soul is');
  assert.equal(candidates[0].token, ' first');
  assert.equal(Math.exp(candidates[0].logprob), .4); // not rescaled to 100%
});

const models = ['a', 'b', 'c'].map(id => ({ id, label: id, revision: 'pinned-' + id }));
test('comparison loads sequentially, retains failures, and uses the same opening for each model', async () => {
  let loaded, active = 0, peak = 0;
  const prompts = [], records = [];
  const session = {
    stop() { loaded = null; active = 0; },
    async load(id) { loaded = id; active++; peak = Math.max(peak, active); if (id === 'b') throw Error('too big'); },
    async nextWord(prompt) { prompts.push([loaded, prompt]); return [{ token: ' word', logprob: Math.log(.3) }]; },
  };
  await compareModels(session, models, 'Same opening', { steps: 2, onUpdate: r => { records[r.index] = structuredClone(r); } });
  assert.equal(peak, 1); assert.equal(active, 0);
  assert.deepEqual(prompts, [['a', 'Same opening'], ['a', 'Same opening word'], ['c', 'Same opening'], ['c', 'Same opening word']]);
  assert.equal(records[0].completion, ' word word');
  assert.equal(records[1].status, 'error'); assert.match(records[1].error, /too big/);
  assert.equal(records[2].status, 'done'); assert.equal(records[2].revision, 'pinned-c');
});

test('stopping the comparison releases the model and never starts the next one', async () => {
  const controller = new AbortController(), loaded = [], records = [];
  let stopped = 0;
  const session = { stop() { stopped++; }, async load(id) { loaded.push(id); },
    async nextWord() { controller.abort(); return [{ token: ' stale', logprob: 0 }]; } };
  await assert.rejects(compareModels(session, models, 'Hi', { signal: controller.signal,
    onUpdate: r => records.push(structuredClone(r)) }), { name: 'AbortError' });
  assert.deepEqual(loaded, ['a']); assert.ok(stopped > 0);
  assert.ok(records.every(r => !r.completion.includes('stale')));
});

test('an end token is reported, not appended as prose', async () => {
  let calls = 0, result;
  const session = { stop() {}, async load() {}, async nextWord() {
    calls++; return [{ token: '<eos>', logprob: Math.log(.8) }];
  } };
  await compareModels(session, models.slice(0, 1), 'Hi', { onUpdate: r => { result = r; } });
  assert.equal(calls, 1); assert.equal(result.completion, '');
  assert.equal(result.steps[0].chosen, '<eos>'); assert.equal(result.ended, true);
});

test('a next-token worker failure clears the course connection for retry', async () => {
  const conn = new Connection();
  conn.engine = {}; conn.engineModel = 'test';
  conn.load = async () => {};
  conn.browserSession.nextWord = async () => { conn.browserSession.engine = null; throw Error('worker failed'); };
  try {
    await assert.rejects(conn.nextWord('Hi'), /worker failed/);
    assert.equal(conn.engine, null); assert.equal(conn.engineModel, null);
    assert.equal(conn.status.state, 'error');
  } finally { conn.unload(); }
});
