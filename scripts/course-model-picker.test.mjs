import test from 'node:test';
import assert from 'node:assert/strict';
import { modelChoices, chooseModel } from '../courses/app/views/session3.js';
import { BROWSER_MODELS } from '../assets/js/browser-models.js';

test('inline model choices reuse the size-ordered catalog and preserve older choices', () => {
  const current = { backend: 'browser', browserModel: BROWSER_MODELS[0].id };
  const options = modelChoices(current, 'current');
  assert.deepEqual(options.slice(0, 6).map(o => o.value), BROWSER_MODELS.map(m => m.id));
  assert.ok(options.slice(0, 6).every(o => /MB download/.test(o.label)));
  assert.equal(options.at(-1).value, '@settings');
  assert.ok(modelChoices({ ...current, browserModel: 'older-model' }, 'Older model')
    .some(o => o.value === 'older-model'));
});

test('a configured remote source is represented honestly and settings remain reachable', () => {
  const options = modelChoices({ backend: 'custom' }, 'My endpoint');
  assert.equal(options[0].value, '@current');
  assert.equal(options[0].label, 'My endpoint (current source)');
  let opened = 0, updates = 0;
  chooseModel({ update() { updates++; } }, '@settings', () => { opened++; });
  chooseModel({ update() { updates++; } }, '@current', () => { opened++; });
  assert.equal(opened, 1); assert.equal(updates, 0);
});

test('selecting a browser model updates the shared connection without downloading', () => {
  let patch;
  const conn = { settings: { backend: 'browser' }, update(value) { patch = value; },
    load() { assert.fail('Selection must wait for Ask the model before loading'); } };
  chooseModel(conn, BROWSER_MODELS[1].id, () => assert.fail('No settings dialog needed'));
  assert.deepEqual(patch, { backend: 'browser', browserModel: BROWSER_MODELS[1].id });
  conn.settings.backend = 'openrouter';
  chooseModel(conn, BROWSER_MODELS[0].id, () => {});
  assert.equal(patch.apiKey, ''); // match the existing source-switch control
});
