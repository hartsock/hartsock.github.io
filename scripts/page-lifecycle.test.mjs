import test from 'node:test';
import assert from 'node:assert/strict';
import { PageLifecycle } from '../assets/js/page-lifecycle.js';

test('a delayed module cannot mount over a newer page', async () => {
  const lifecycle = new PageLifecycle();
  let finishImport, oldMounts = 0, newMounts = 0;
  const old = lifecycle.start({ isConnected: true }, () => new Promise(resolve => { finishImport = resolve; }));
  const root = { isConnected: true };
  await lifecycle.start(root, async () => () => { newMounts++; return () => {}; });
  finishImport(() => { oldMounts++; });
  await old;
  assert.equal(oldMounts, 0);
  assert.equal(newMounts, 1);
  await lifecycle.start(root, async () => () => { newMounts++; });
  assert.equal(newMounts, 1);
});

test('leaving while async mount finishes runs its cleanup, not the new page cleanup', async () => {
  const lifecycle = new PageLifecycle();
  let finishMount, cleaned = 0, newCleaned = 0;
  const pending = lifecycle.start({ isConnected: true }, async () => () => new Promise(resolve => { finishMount = resolve; }));
  await new Promise(resolve => setTimeout(resolve, 0));
  lifecycle.leave();
  await lifecycle.start({ isConnected: true }, async () => () => () => { newCleaned++; });
  finishMount(() => { cleaned++; });
  await pending;
  assert.equal(cleaned, 1);
  assert.equal(newCleaned, 0);
  lifecycle.leave();
  assert.equal(newCleaned, 1);
});

test('a detached root is never initialized, and repeated settle events are harmless', async () => {
  const lifecycle = new PageLifecycle();
  const root = { isConnected: false };
  let mounts = 0;
  await lifecycle.start(root, async () => () => { mounts++; });
  assert.equal(mounts, 0);
});
