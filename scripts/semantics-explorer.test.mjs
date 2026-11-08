// Pure structure of the Geometric Semantics Explorer, and its copy contract.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classify, derive, projectStar, projectAxes, projectForce, integrity, CLASSES, SCHEMA } from '../assets/js/semantics-explorer.js';
import { build, serialize } from './semantics-explorer-data.mjs';

const data = JSON.parse(readFileSync('assets/data/semantics-explorer.json', 'utf8'));

test('the committed dataset is exactly what the generator writes', () => {
  assert.equal(readFileSync('assets/data/semantics-explorer.json', 'utf8'), serialize(build()));
  assert.equal(data.schema, SCHEMA);
  assert.equal(data.provenance.kind, 'SYNTHETIC');
});

test('classification keeps missing evidence apart from decisions', () => {
  assert.equal(classify({ reachability: 'UNREACHABLE' }), 'ghost');
  assert.equal(classify({ reachability: 'REACHABLE', observed: false, policy: 'DENY', e1: null, e2: null }), 'unobs');
  const s = (policy, e1, e2) => ({ reachability: 'REACHABLE', observed: true, policy, e1, e2 });
  assert.equal(classify(s('DENY', 'ALLOW', 'ALLOW')), 'shared');
  assert.equal(classify(s('DENY', 'DENY', 'ALLOW')), 'unsafe');
  assert.equal(classify(s('ALLOW', 'DENY', 'ALLOW')), 'restrict');
  assert.equal(classify(s('ALLOW', 'ALLOW', 'ALLOW')), 'allow');
  assert.equal(classify(s('DENY', 'DENY', 'DENY')), 'deny');
});

test('derived counts match the synthetic rules', () => {
  const m = derive(data);
  assert.deepEqual(m.counts, { unsafe: 17, shared: 2, restrict: 2, allow: 2, deny: 159, unobs: 10, ghost: 64 });
  assert.equal(m.reachable, 192);
  assert.equal(m.edges.length, 1024);
  assert.equal(m.unsafe.n, 1, 'the planted symlink bug is one connected region');
  assert.deepEqual([m.boundary, m.brokenE1, m.brokenE2], [24, 23, 61]);
});

test('malformed data is refused instead of drawn', () => {
  assert.throws(() => derive({ ...data, schema: 'other' }), /schema/);
  assert.throws(() => derive({ ...data, states: data.states.slice(1) }), /shape/);
  const swapped = [...data.states]; [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  assert.throws(() => derive({ ...data, states: swapped }), /order/);
});

test('projections place every state and report their distortion', () => {
  const m = derive(data);
  for (const pos of [projectStar(m), projectAxes(m, [1, 2, 6]), projectForce(m)]) {
    assert.equal(pos.length, 256);
    assert.ok(pos.every(p => p.length === 3 && p.every(Number.isFinite)));
  }
  // Measured values, pinned so a projection change is a visible decision.
  const rho = p => Number(integrity(p).rho.toFixed(2));
  assert.deepEqual([rho(projectStar(m)), rho(projectAxes(m, [1, 2, 6])), rho(projectForce(m))], [0.43, 0.57, 0.31]);
  assert.equal(integrity(projectStar(m)).overlapping, 0);
});

test('every copy key the explorer uses exists in the post that hosts it', () => {
  const source = readFileSync('assets/js/semantics-explorer.js', 'utf8');
  const markup = readFileSync('_includes/semantics-explorer.html', 'utf8');
  const post = readFileSync('_posts/2026-11-08-geometric-semantics-explorer.md', 'utf8');
  const front = post.split('---')[1];
  const block = front.slice(front.indexOf('  explorer:'));
  const defined = new Set([...block.matchAll(/^ {4}([a-z_]+):/gm)].map(x => x[1]));
  const used = new Set([...source.matchAll(/'explorer\.([a-z_]+)'/g)].map(x => x[1]).filter(k => !k.endsWith('_')));
  for (const c of CLASSES) used.add('class_' + c);
  for (const p of ['star', 'axes', 'force']) used.add('proj_' + p);
  for (const x of markup.matchAll(/copy\.explorer\.([a-z_]+)/g)) used.add(x[1]);
  for (const key of used) assert.ok(defined.has(key), 'missing copy.explorer.' + key);
  assert.match(markup, /data-app="semantics-explorer"/);
  assert.match(readFileSync('assets/js/site.js', 'utf8'), /\[data-app="semantics-explorer"\]', '\.\/semantics-explorer\.js\?v=explorer-1'/);
  assert.match(readFileSync('_data/widgets.yml', 'utf8'), /semantics-explorer:\n  include: semantics-explorer\.html/);
});
