// Writes assets/data/semantics-explorer.json: a SYNTHETIC 8-dimensional
// authorization state space for the Geometric Semantics Explorer.
// The explorer only reads this file. Replace it with observed results from
// the research engine without changing the page.
//   node scripts/semantics-explorer-data.mjs          write the file
//   node scripts/semantics-explorer-data.mjs --check  fail if it is stale
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = new URL('../assets/data/semantics-explorer.json', import.meta.url);
const SEED = 20261030;

export const DIMENSIONS = [
  { key: 'x0', name: 'operation', zero: 'read', one: 'write' },
  { key: 'x1', name: 'location', zero: 'outside root', one: 'inside root' },
  { key: 'x2', name: 'target', zero: 'regular file', one: 'symlink' },
  { key: 'x3', name: 'identity', zero: 'unauthorized', one: 'authorized' },
  { key: 'x4', name: 'traversal', zero: 'no dot-dot', one: 'has dot-dot' },
  { key: 'x5', name: 'existence', zero: 'missing', one: 'exists' },
  { key: 'x6', name: 'environment', zero: 'trusted', one: 'untrusted' },
  { key: 'x7', name: 'route', zero: 'direct', one: 'delegated' },
];

export function build() {
  let s = SEED >>> 0;
  const rand = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  const b = (i, k) => (i >> k) & 1;
  // Reference policy: read a regular file inside the root, as an authorized
  // identity, with no traversal, in a trusted environment.
  const P = i => !b(i, 0) && b(i, 1) && !b(i, 2) && b(i, 3) && !b(i, 4) && !b(i, 6);
  // Enforcer 1 ignores the environment and refuses delegated requests.
  const E1 = i => !b(i, 0) && b(i, 1) && !b(i, 2) && b(i, 3) && !b(i, 4) && !b(i, 7);
  // Enforcer 2 follows symlinks without checking where they lead, and also
  // ignores the environment. This is the injected defect.
  const E2 = i => !b(i, 0) && b(i, 3) && !b(i, 4) && ((b(i, 1) && !b(i, 2)) || b(i, 2));
  // An unauthorized identity in an untrusted environment needs a second uid.
  const reachable = i => !(!b(i, 3) && b(i, 6));
  const unobserved = new Set();
  while (unobserved.size < 10) {
    const i = Math.floor(rand() * 256);
    if (reachable(i)) unobserved.add(i);
  }
  const decision = v => (v ? 'ALLOW' : 'DENY');
  const states = [];
  for (let i = 0; i < 256; i++) {
    const r = reachable(i), seen = r && !unobserved.has(i);
    let outcome = null;
    if (seen) outcome = E2(i) ? (b(i, 5) ? (b(i, 0) ? 'write ok' : 'read ok') : 'ENOENT') : 'blocked';
    states.push({
      id: 's-' + i.toString(16).padStart(2, '0'),
      coords: DIMENSIONS.map((_, k) => b(i, k)),
      reachability: r ? 'REACHABLE' : 'UNREACHABLE',
      observed: seen,
      policy: r ? decision(P(i)) : null,
      e1: seen ? decision(E1(i)) : null,
      e2: seen ? decision(E2(i)) : null,
      outcome,
      test_case: r ? 'tc-' + String(i).padStart(3, '0') : null,
      trace: seen ? 'tr-' + String(i).padStart(3, '0') + '-synthetic' : null,
    });
  }
  return {
    schema: 'geometric-semantics/state-space@0.1',
    provenance: { kind: 'SYNTHETIC', generator: 'scripts/semantics-explorer-data.mjs', seed: SEED },
    dimensions: DIMENSIONS,
    views: [
      { id: 'U1', label: 'Operator A, direct requests', enforcer: 'e1', member: { x7: 0 } },
      { id: 'U2', label: 'Operator B, trusted environment', enforcer: 'e2', member: { x6: 0 } },
    ],
    states,
  };
}

export function serialize(data) { return JSON.stringify(data) + '\n'; }

if (import.meta.url === `file://${process.argv[1]}`) {
  const text = serialize(build());
  if (process.argv.includes('--check')) {
    if (readFileSync(OUT, 'utf8') !== text) { console.error('semantics-explorer.json is stale'); process.exit(1); }
  } else writeFileSync(OUT, text);
}
