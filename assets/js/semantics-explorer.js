import { copyText, putCopy, putText } from './copy.js?v=prose-scripts-1';
// Geometric Semantics Explorer: an 8-dimensional authorization state space,
// drawn on a 2D canvas with its own orbit camera. The page consumes evidence
// from assets/data/semantics-explorer.json and never computes a decision.
// All sentences come from the page's copy.explorer front matter.

export const SCHEMA = 'geometric-semantics/state-space@0.1';
export const CLASSES = ['unsafe', 'shared', 'restrict', 'allow', 'deny', 'unobs', 'ghost'];
const DISAGREE = new Set(['unsafe', 'shared', 'restrict']);
const classKey = c => 'explorer.class_' + c;
const projectionKey = p => 'explorer.proj_' + p;

// ---------- pure structure (tested in scripts/semantics-explorer.test.mjs) ----------
export function classify(st) {
  if (st.reachability === 'UNREACHABLE') return 'ghost';
  if (!st.observed || st.e1 == null || st.e2 == null || st.policy == null) return 'unobs';
  const p = st.policy === 'ALLOW', a = st.e1 === 'ALLOW', c = st.e2 === 'ALLOW';
  if (!p && a && c) return 'shared';
  if (!p && (a || c)) return 'unsafe';
  if (p && (!a || !c)) return 'restrict';
  return p ? 'allow' : 'deny';
}

export function derive(data) {
  if (data?.schema !== SCHEMA) throw new Error('schema');
  const S = data.states, N = S.length, D = data.dimensions.length;
  if (N !== 2 ** D || S.some(s => s.coords.length !== D)) throw new Error('shape');
  const index = s => s.coords.reduce((acc, x, k) => acc | (x << k), 0);
  S.forEach((s, i) => { if (index(s) !== i) throw new Error('order'); });
  const cls = S.map(classify);
  const reach = i => S[i].reachability === 'REACHABLE';
  const neighbors = i => data.dimensions.map((_, k) => i ^ (1 << k));
  const edges = [];
  for (let i = 0; i < N; i++) for (let k = 0; k < D; k++) { const j = i ^ (1 << k); if (j > i) edges.push([i, j, k]); }
  function components(pred) {
    const comp = new Array(N).fill(-1); let n = 0;
    for (let i = 0; i < N; i++) {
      if (!pred(i) || comp[i] >= 0) continue;
      const stack = [i]; comp[i] = n;
      while (stack.length) { const v = stack.pop(); for (const w of neighbors(v)) if (pred(w) && comp[w] < 0) { comp[w] = n; stack.push(w); } }
      n++;
    }
    return { comp, n };
  }
  const unsafe = components(i => cls[i] === 'unsafe' || cls[i] === 'shared');
  const restrictive = components(i => cls[i] === 'restrict');
  const bit = v => (v == null ? null : v === 'ALLOW' ? 1 : 0);
  function edgeKind([a, b], who) {
    if (!reach(a) || !reach(b)) return null;
    const pa = bit(S[a].policy), pb = bit(S[b].policy), ea = bit(S[a][who]), eb = bit(S[b][who]);
    const boundary = pa !== pb;
    return { boundary, broken: ea == null || eb == null ? null : (pb - pa) !== (eb - ea) };
  }
  const counts = Object.fromEntries(CLASSES.map(c => [c, cls.filter(x => x === c).length]));
  let boundary = 0, brokenE1 = 0, brokenE2 = 0;
  for (const e of edges) {
    const k1 = edgeKind(e, 'e1'), k2 = edgeKind(e, 'e2');
    if (k1?.boundary) boundary++;
    if (k1?.broken) brokenE1++;
    if (k2?.broken) brokenE2++;
  }
  return { data, S, N, D, cls, reach, neighbors, edges, unsafe, restrictive, edgeKind,
    counts, boundary, brokenE1, brokenE2, reachable: S.filter(s => s.reachability === 'REACHABLE').length };
}

function fibonacciDirections(n) {
  const out = [], golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i + 0.5) * 2 / n, r = Math.sqrt(1 - y * y), t = golden * i + 0.35;
    out.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  return out;
}
export function projectStar(model, scale = 2.1) {
  const dirs = fibonacciDirections(model.D);
  return model.S.map(s => {
    const p = [0, 0, 0];
    s.coords.forEach((x, k) => { for (let c = 0; c < 3; c++) p[c] += (x - 0.5) * dirs[k][c] * scale; });
    return p;
  });
}
export function projectAxes(model, axes) {
  const shadow = projectStar(model, 0.22);
  return model.S.map((s, i) => {
    const p = shadow[i].slice();
    axes.forEach((k, c) => { p[c] = (s.coords[k] - 0.5) * 2.4 + p[c] * 0.6; });
    return p;
  });
}
export function projectForce(model) {
  const { N } = model;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
  const pos = projectStar(model, 1.4).map(p => p.map(v => v + rnd() * 0.2));
  const springs = model.edges.filter(([a, b]) => model.reach(a) && model.reach(b));
  for (let it = 0; it < 220; it++) {
    const f = pos.map(() => [0, 0, 0]);
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const d0 = pos[i][0] - pos[j][0], d1 = pos[i][1] - pos[j][1], d2 = pos[i][2] - pos[j][2];
      const k = 0.012 / (d0 * d0 + d1 * d1 + d2 * d2 + 0.01);
      f[i][0] += d0 * k; f[i][1] += d1 * k; f[i][2] += d2 * k;
      f[j][0] -= d0 * k; f[j][1] -= d1 * k; f[j][2] -= d2 * k;
    }
    for (const [a, b] of springs) {
      const d = [pos[b][0] - pos[a][0], pos[b][1] - pos[a][1], pos[b][2] - pos[a][2]];
      const r = Math.hypot(...d) + 1e-6, k = (r - 0.55) * 0.06 / r;
      for (let c = 0; c < 3; c++) { f[a][c] += d[c] * k; f[b][c] -= d[c] * k; }
    }
    const cool = 1 - it / 240;
    for (let i = 0; i < N; i++) for (let c = 0; c < 3; c++) pos[i][c] += Math.max(-0.2, Math.min(0.2, f[i][c])) * cool;
  }
  const mean = [0, 0, 0];
  pos.forEach(p => { for (let c = 0; c < 3; c++) mean[c] += p[c] / N; });
  let R = 0;
  pos.forEach(p => { for (let c = 0; c < 3; c++) p[c] -= mean[c]; R = Math.max(R, Math.hypot(...p)); });
  return pos.map(p => p.map(v => v * 2.2 / R));
}
// Overlaps and the Spearman correlation between Hamming and drawn 3D distance.
export function integrity(pos) {
  const keys = new Map();
  pos.forEach(p => { const k = p.map(v => Math.round(v * 200)).join(','); keys.set(k, (keys.get(k) || 0) + 1); });
  let overlapping = 0;
  keys.forEach(c => { if (c > 1) overlapping += c; });
  const hd = [], ed = [], N = pos.length;
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    let x = i ^ j, h = 0; while (x) { h += x & 1; x >>= 1; }
    hd.push(h); ed.push(Math.hypot(pos[i][0] - pos[j][0], pos[i][1] - pos[j][1], pos[i][2] - pos[j][2]));
  }
  const rank = a => {
    const idx = a.map((_, i) => i).sort((p, q) => a[p] - a[q]), r = new Array(a.length);
    for (let i = 0; i < idx.length;) {
      let j = i; while (j + 1 < idx.length && a[idx[j + 1]] === a[idx[i]]) j++;
      for (let t = i; t <= j; t++) r[idx[t]] = (i + j) / 2;
      i = j + 1;
    }
    return r;
  };
  const ra = rank(hd), rb = rank(ed), n = ra.length;
  const ma = ra.reduce((x, y) => x + y, 0) / n, mb = rb.reduce((x, y) => x + y, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { const x = ra[i] - ma, y = rb[i] - mb; num += x * y; da += x * x; db += y * y; }
  return { overlapping, rho: num / Math.sqrt(da * db) };
}

// ---------- drawing ----------
const COLOUR = {
  allow: '#7cc8ff', deny: '#5b6386', unsafe: '#ff4d6d', shared: '#c86bff',
  restrict: '#ffa23d', ghost: '#3a4166', unobs: '#c9cfee', u1: '#3df5d0', u2: '#ff6ad5',
};
const SHAPE = { allow: 'disc', deny: 'disc', unsafe: 'diamond', shared: 'square', restrict: 'triangle', ghost: 'ring', unobs: 'ring' };
const SIZE = { allow: 1.25, deny: 0.75, unsafe: 1.6, shared: 1.6, restrict: 1.45, ghost: 0.7, unobs: 1.0 };
const dimHue = (k, D) => Math.round(k / D * 324);
const dimColour = (k, D, l = 62) => `hsl(${dimHue(k, D)} 90% ${l}%)`;

function drawShape(ctx, shape, x, y, r) {
  ctx.beginPath();
  if (shape === 'diamond') { ctx.moveTo(x, y - r * 1.25); ctx.lineTo(x + r * 1.25, y); ctx.lineTo(x, y + r * 1.25); ctx.lineTo(x - r * 1.25, y); ctx.closePath(); ctx.fill(); }
  else if (shape === 'square') { ctx.rect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8); ctx.fill(); }
  else if (shape === 'triangle') { ctx.moveTo(x, y - r * 1.2); ctx.lineTo(x + r * 1.1, y + r * 0.8); ctx.lineTo(x - r * 1.1, y + r * 0.8); ctx.closePath(); ctx.fill(); }
  else if (shape === 'ring') { ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); }
  else { ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
}
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
function icon(shape, colour) {
  const c = el('canvas', 'explorer-icon'); c.width = c.height = 32;
  const x = c.getContext('2d'); x.fillStyle = colour; x.strokeStyle = colour; x.lineWidth = 3;
  if (shape === 'line') { x.fillRect(2, 14, 28, 4); } else drawShape(x, shape, 16, 16, 9);
  c.setAttribute('aria-hidden', 'true');
  return c;
}

export async function mount(root) {
  const $ = s => root.querySelector(s);
  const status = $('[data-explorer-status]');
  let model;
  try {
    const res = await fetch(root.dataset.src);
    model = derive(await res.json());
  } catch (_) {
    putCopy(status, 'explorer.load_error'); status.hidden = false;
    return () => {};
  }
  if (!root.isConnected) return () => {};
  const { S, N, D, cls, reach, neighbors, edges, edgeKind } = model;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const st = {
    proj: 'star', axes: [1, 2, 6], colour: 'class', slice: new Array(D).fill(null), who: 'e2',
    edges: true, boundary: false, broken: true, ghost: true, onlyDisagree: false, views: false,
    size: 1, sel: null, spin: !reduceMotion,
  };
  const pointers = new Map();
  let drag = false, moved = 0, pinch = 0;
  const canvas = $('canvas.explorer-canvas'), ctx = canvas.getContext('2d');
  const cam = { yaw: 0.7, pitch: 0.42, dist: 7.2 };
  let cur = projectStar(model), from = cur, target = cur, morph = 1, force = null;
  let width = 0, height = 0, dpr = 1, raf = 0, visible = true, last = performance.now(), time = 0;
  const screen = new Float32Array(N * 3);

  const inSlice = i => st.slice.every((v, k) => v === null || S[i].coords[k] === v);
  const shown = i => (cls[i] !== 'ghost' || st.ghost) && (!st.onlyDisagree || DISAGREE.has(cls[i]));
  function colourOf(i) {
    const s = S[i], c = cls[i];
    if (c === 'ghost') return COLOUR.ghost;
    if (st.colour === 'class') return COLOUR[c];
    if (st.colour === 'policy' || st.colour === 'e1' || st.colour === 'e2') {
      const v = s[st.colour];
      return v == null ? COLOUR.unobs : v === 'ALLOW' ? COLOUR.allow : COLOUR.deny;
    }
    if (st.colour === 'weight') return `hsl(${Math.round(s.coords.reduce((a, b) => a + b, 0) / D * 306)} 90% 62%)`;
    if (st.colour === 'component') {
      if (c === 'unsafe' || c === 'shared') return `hsl(${(model.unsafe.comp[i] * 137 + 350) % 360} 85% 62%)`;
      if (c === 'restrict') return `hsl(${(model.restrictive.comp[i] * 137 + 35) % 360} 85% 62%)`;
      return COLOUR.deny;
    }
    if (!s.outcome) return COLOUR.unobs;
    return { 'read ok': COLOUR.allow, 'write ok': '#6dffb0', ENOENT: '#ffe66d', blocked: COLOUR.deny }[s.outcome];
  }
  const memberOf = (view, i) => Object.entries(view.member).every(([k, v]) => S[i].coords[+k.slice(1)] === v);

  // Starfield: fixed directions on a far sphere, for depth only.
  const stars = [];
  { let s = 3; const r = () => { s = (s * 48271) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 260; i++) { const t = r() * Math.PI * 2, u = r() * 2 - 1, q = Math.sqrt(1 - u * u); stars.push([Math.cos(t) * q * 16, u * 16, Math.sin(t) * q * 16, 0.3 + r() * 0.7]); } }

  function toScreen(p, out, o) {
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    const x = p[0] * cy + p[2] * sy, z0 = -p[0] * sy + p[2] * cy;
    const y = p[1] * cp - z0 * sp, z = p[1] * sp + z0 * cp;
    const depth = cam.dist - z, f = Math.min(width, height) * 0.9 / Math.max(depth, 0.3);
    out[o] = width / 2 + x * f; out[o + 1] = height / 2 - y * f; out[o + 2] = depth;
    return f;
  }
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
    if (st.spin) cam.yaw += dt * 0.18;
    if (morph < 1) {
      morph = Math.min(1, morph + dt / 1.3);
      const t = morph < 0.5 ? 4 * morph ** 3 : 1 - (-2 * morph + 2) ** 3 / 2;
      cur = from.map((p, i) => [p[0] + (target[i][0] - p[0]) * t, p[1] + (target[i][1] - p[1]) * t, p[2] + (target[i][2] - p[2]) * t]);
    }
    draw();
    if (visible && (st.spin || morph < 1 || drag)) raf = requestAnimationFrame(frame);
  }
  function request() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = ctx.createRadialGradient(width / 2, height * 0.45, 0, width / 2, height * 0.45, Math.max(width, height) * 0.75);
    bg.addColorStop(0, '#121733'); bg.addColorStop(1, '#06070f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
    const tmp = [0, 0, 0];
    ctx.fillStyle = '#8890c0';
    for (const s of stars) { toScreen(s, tmp, 0); if (tmp[2] > 0.3) { ctx.globalAlpha = s[3] * 0.5; ctx.fillRect(tmp[0], tmp[1], 1.2, 1.2); } }
    ctx.globalAlpha = 1;
    const scale = new Float32Array(N);
    for (let i = 0; i < N; i++) scale[i] = toScreen(cur[i], screen, i * 3);

    // Adjacency edges, batched by dimension and brightness.
    ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1;
    if (st.edges) {
      const batches = new Map();
      for (const [a, b, k] of edges) {
        if (!shown(a) || !shown(b)) continue;
        const slice = inSlice(a) && inSlice(b), ghost = !reach(a) || !reach(b);
        let level = !slice ? 0.04 : ghost ? 0.12 : 0.5;
        if (st.onlyDisagree) level *= 0.4;
        const key = k + ':' + level;
        if (!batches.has(key)) batches.set(key, []);
        batches.get(key).push(a, b);
      }
      for (const [key, list] of batches) {
        const [k, level] = key.split(':');
        ctx.strokeStyle = dimColour(+k, D); ctx.globalAlpha = +level; ctx.beginPath();
        for (let n = 0; n < list.length; n += 2) { const a = list[n] * 3, b = list[n + 1] * 3; ctx.moveTo(screen[a], screen[a + 1]); ctx.lineTo(screen[b], screen[b + 1]); }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    for (const kind of ['boundary', 'broken']) {
      if (!st[kind]) continue;
      ctx.strokeStyle = kind === 'boundary' ? '#ffffff' : st.who === 'e2' ? COLOUR.unsafe : COLOUR.restrict;
      ctx.lineWidth = kind === 'boundary' ? 1.5 : 2.2; ctx.globalAlpha = 0.9; ctx.beginPath();
      for (const e of edges) {
        const [a, b] = e, k = edgeKind(e, st.who);
        if (!k || !k[kind] || !inSlice(a) || !inSlice(b) || !shown(a) || !shown(b)) continue;
        ctx.moveTo(screen[a * 3], screen[a * 3 + 1]); ctx.lineTo(screen[b * 3], screen[b * 3 + 1]);
      }
      ctx.stroke();
    }
    if (st.sel != null) {
      ctx.lineWidth = 2.5; ctx.globalAlpha = 1;
      neighbors(st.sel).forEach((j, k) => {
        ctx.strokeStyle = dimColour(k, D, 70); ctx.beginPath();
        ctx.moveTo(screen[st.sel * 3], screen[st.sel * 3 + 1]); ctx.lineTo(screen[j * 3], screen[j * 3 + 1]); ctx.stroke();
      });
    }
    ctx.globalCompositeOperation = 'source-over';

    // States, far to near.
    const order = [...Array(N).keys()].filter(shown).sort((a, b) => screen[b * 3 + 2] - screen[a * 3 + 2]);
    const pulse = reduceMotion ? 1 : 1 + 0.18 * Math.sin(time * 3.2);
    for (const i of order) {
      const c = cls[i], x = screen[i * 3], y = screen[i * 3 + 1];
      if (screen[i * 3 + 2] <= 0.3) continue;
      const slice = inSlice(i), hot = (c === 'unsafe' || c === 'shared') && slice;
      const r = Math.max(1.2, (st.colour === 'class' ? SIZE[c] : c === 'ghost' ? 0.7 : 1.1) * 0.06 * scale[i] * st.size * (hot ? pulse : 1));
      const colour = colourOf(i);
      ctx.globalAlpha = slice ? (c === 'ghost' ? 0.6 : 1) : 0.08;
      if (hot) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, COLOUR[c] + '88'); g.addColorStop(1, COLOUR[c] + '00');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = colour; ctx.strokeStyle = colour; ctx.lineWidth = 1.6;
      drawShape(ctx, st.colour === 'class' || c === 'ghost' || c === 'unobs' ? SHAPE[c] : 'disc', x, y, r);
      if (st.views && slice && reach(i)) {
        model.data.views.forEach((v, n) => {
          if (!memberOf(v, i)) return;
          ctx.setLineDash([3, 3]); ctx.strokeStyle = n ? COLOUR.u2 : COLOUR.u1; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(x, y, r + 3.5 + n * 3, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        });
      }
    }
    ctx.globalAlpha = 1;
    if (st.sel != null) {
      const x = screen[st.sel * 3], y = screen[st.sel * 3 + 1];
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // ---------- panels ----------
  function setProjection(p) {
    st.proj = p;
    from = cur; morph = reduceMotion ? 1 : 0;
    target = p === 'star' ? projectStar(model) : p === 'axes' ? projectAxes(model, st.axes) : (force ||= projectForce(model));
    if (reduceMotion) cur = target;
    root.querySelectorAll('[data-proj]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.proj === p)));
    $('[data-axes]').hidden = p !== 'axes';
    putCopy($('[data-proj-note]'), projectionKey(p));
    const I = integrity(target), out = $('[data-integrity]');
    out.replaceChildren();
    const hidden = p === 'axes' ? model.data.dimensions.map((d, k) => k).filter(k => !st.axes.includes(k)).map(k => 'x' + k).join(' ') : 'none, all 8 mixed';
    for (const [k, v] of [['method', { star: 'fixed linear', axes: 'coordinate pick', force: 'force-directed graph' }[p]],
      ['overlapping', I.overlapping + ' of ' + N + ' states'], ['rank corr.', 'ρ = ' + I.rho.toFixed(2)],
      ['hidden dims', hidden], ['edges', 'true 1-coordinate adjacency']]) out.append(el('dt', null, k), el('dd', null, v));
    request();
  }
  function metrics() {
    const m = $('[data-metrics]'); m.replaceChildren();
    const add = (label, value, colour) => { const d = el('span', 'explorer-metric'); const b = el('b', null, String(value)); if (colour) b.style.color = colour; d.append(b, ' ' + label); m.append(d); };
    add('reachable', model.reachable); add('unreachable', model.counts.ghost); add('unobserved', model.counts.unobs);
    add('unsafe', model.counts.unsafe, COLOUR.unsafe); add('shared defect', model.counts.shared, COLOUR.shared);
    add('restrictive', model.counts.restrict, COLOUR.restrict); add('unsafe components', model.unsafe.n);
    add('policy boundary edges', model.boundary); add('broken by E1', model.brokenE1, COLOUR.restrict); add('broken by E2', model.brokenE2, COLOUR.unsafe);
    const inView = S.filter((_, i) => inSlice(i) && shown(i)).length;
    $('[data-in-view]').textContent = inView + ' of ' + N + ' states in view';
  }
  function legend() {
    const L = $('[data-legend]'); L.replaceChildren();
    const item = (ic, key) => { const row = el('div', 'explorer-legend-item'); const t = el('span'); putCopy(t, key); row.append(ic, t); L.append(row); };
    if (st.colour === 'class') CLASSES.forEach(c => item(icon(SHAPE[c], COLOUR[c]), classKey(c)));
    else if (st.colour === 'weight') item(icon('disc', 'hsl(150 90% 62%)'), 'explorer.legend_weight');
    else if (st.colour === 'component') item(icon('disc', 'hsl(350 85% 62%)'), 'explorer.legend_component');
    else if (st.colour === 'outcome') item(icon('disc', '#ffe66d'), 'explorer.legend_outcome');
    else { item(icon('disc', COLOUR.allow), 'explorer.legend_allow'); item(icon('disc', COLOUR.deny), 'explorer.legend_deny'); item(icon('ring', COLOUR.unobs), 'explorer.class_unobs'); }
    item(icon('line', COLOUR.unsafe), 'explorer.legend_broken');
    item(icon('line', '#ffffff'), 'explorer.legend_boundary');
  }
  function views() {
    const box = $('[data-views]'); box.hidden = !st.views;
    if (!st.views) return;
    const [U1, U2] = model.data.views;
    let overlap = 0, observed = 0, agree = 0, wrong = 0;
    for (let i = 0; i < N; i++) {
      if (!reach(i) || !memberOf(U1, i) || !memberOf(U2, i)) continue;
      overlap++;
      if (!S[i].observed) continue;
      observed++;
      if (S[i].e1 === S[i].e2) { agree++; if (S[i].e1 !== S[i].policy) wrong++; }
    }
    const dl = $('[data-views-kv]'); dl.replaceChildren();
    for (const [k, v] of [['U₁', U1.label + ', E1'], ['U₂', U2.label + ', E2'], ['overlap', overlap + ' states, ' + observed + ' observed'],
      ['agree', agree + ' of ' + observed], ['agree, wrong', String(wrong)]]) dl.append(el('dt', null, k), el('dd', null, v));
    putCopy($('[data-views-note]'), 'explorer.views_note');
  }
  function decisionTag(v) {
    const t = el('span', 'explorer-tag', v == null ? 'UNOBSERVED' : v);
    t.style.color = v === 'ALLOW' ? COLOUR.allow : 'var(--explorer-dim)';
    return t;
  }
  function select(i) {
    st.sel = i;
    const box = $('[data-inspector]');
    if (i == null) { box.replaceChildren(); const p = el('p', 'explorer-note'); putCopy(p, 'explorer.empty_selection'); box.append(p); request(); return; }
    const s = S[i], c = cls[i], dims = model.data.dimensions;
    const bits = el('div', 'explorer-bits');
    s.coords.forEach((x, k) => { const b = el('span', 'explorer-bit', String(x)); b.style.borderColor = dimColour(k, D); b.title = dims[k].name + ': ' + (x ? dims[k].one : dims[k].zero); b.append(el('small', null, 'x' + k)); bits.append(b); });
    const desc = el('p', 'explorer-note', s.coords.map((x, k) => (x ? dims[k].one : dims[k].zero)).join(' · '));
    const tag = el('span', 'explorer-tag'); tag.style.color = COLOUR[c]; putCopy(tag, classKey(c));
    const kv = el('dl', 'explorer-kv');
    const unreachable = s.reachability === 'UNREACHABLE';
    const rows = [['state', s.id], ['reachability', s.reachability], ['policy', unreachable ? '—' : decisionTag(s.policy)],
      ['enforcer E1', unreachable ? '—' : decisionTag(s.e1)], ['enforcer E2', unreachable ? '—' : decisionTag(s.e2)],
      ['execution', s.outcome || (unreachable ? 'UNREACHABLE' : 'UNOBSERVED')],
      ['source', model.data.provenance.kind + ' · seed ' + model.data.provenance.seed], ['test case', s.test_case || '—'], ['trace', s.trace || '—']];
    for (const [k, v] of rows) { const dd = el('dd'); dd.append(v); kv.append(el('dt', null, k), dd); }
    const nb = el('div', 'explorer-neighbours');
    neighbors(i).forEach((j, k) => {
      const t = S[j], kind = edgeKind([i, j, k], 'e2');
      const b = el('button', 'explorer-neighbour'); b.type = 'button';
      const sw = el('span', 'explorer-swatch'); sw.style.background = dimColour(k, D);
      const text = el('span', null, dims[k].name + ' → ' + (t.coords[k] ? dims[k].one : dims[k].zero));
      text.append(el('small', null, 'P ' + (s.policy || '—') + '→' + (t.policy || '—') + ' · E2 ' + (s.e2 || '—') + '→' + (t.e2 || '—')));
      b.append(sw, text);
      if (kind?.broken) b.append(el('span', 'explorer-flag', 'E2 breaks this boundary'));
      b.addEventListener('click', () => select(j));
      nb.append(b);
    });
    const head = el('p', 'explorer-label'); putCopy(head, 'explorer.neighbours');
    box.replaceChildren(bits, desc, tag, kv, head, nb);
    request();
  }
  function refresh() { metrics(); views(); request(); }

  // ---------- controls (labels are short UI names; sentences live in copy) ----------
  const projButtons = $('[data-proj-buttons]');
  for (const [value, label] of [['star', 'Linear star'], ['axes', 'Pick 3 axes'], ['force', 'Graph layout']]) {
    const b = el('button', null, label); b.type = 'button'; b.dataset.proj = value; b.setAttribute('aria-pressed', String(value === 'star'));
    projButtons.append(b);
  }
  for (const [value, label] of [['class', 'Disagreement class'], ['policy', 'Reference policy'], ['e1', 'Enforcer 1'], ['e2', 'Enforcer 2'],
    ['weight', 'Rainbow by Hamming weight'], ['component', 'Disagreement component'], ['outcome', 'Execution outcome under E2']]) $('[data-colour]').append(new Option(label, value));
  const toggles = $('[data-toggles]');
  const check = (key, label) => {
    const row = el('label', 'explorer-check'), input = el('input'); input.type = 'checkbox'; input.dataset.toggle = key; input.checked = st[key];
    row.append(input, ' ' + label); toggles.append(row);
  };
  check('edges', 'Adjacency edges'); check('boundary', 'Policy boundary edges'); check('broken', 'Boundaries the enforcer breaks');
  { const row = el('label', 'explorer-check', 'Enforcer '), who = el('select'); who.dataset.who = '';
    who.append(new Option('E2', 'e2'), new Option('E1', 'e1')); row.append(who); toggles.append(row); }
  check('ghost', 'Unreachable states'); check('onlyDisagree', 'Only disagreements'); check('views', 'Local views U₁ and U₂');
  { const row = el('label', 'explorer-check', 'Point size '), range = el('input');
    Object.assign(range, { type: 'range', min: '0.5', max: '2', step: '0.05', value: '1' }); range.dataset.size = ''; row.append(range); toggles.append(row); }
  const dimBox = $('[data-dims]');
  model.data.dimensions.forEach((d, k) => {
    const row = el('div', 'explorer-dim');
    const sw = el('span', 'explorer-swatch'); sw.style.background = dimColour(k, D);
    const name = el('span', 'explorer-dim-name', 'x' + k + ' ' + d.name); name.title = '0 = ' + d.zero + ', 1 = ' + d.one;
    const tri = el('span', 'explorer-tri');
    for (const v of [null, 0, 1]) {
      const b = el('button', null, v == null ? '·' : String(v)); b.type = 'button';
      b.setAttribute('aria-pressed', String(v == null)); b.setAttribute('aria-label', d.name + (v == null ? ' free' : ' = ' + (v ? d.one : d.zero)));
      b.addEventListener('click', () => { st.slice[k] = v; tri.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); refresh(); });
      tri.append(b);
    }
    row.append(sw, name, tri); dimBox.append(row);
    for (const sel of root.querySelectorAll('[data-axis]')) sel.append(new Option('x' + k + ' ' + d.name, k));
  });
  root.querySelectorAll('[data-axis]').forEach((sel, c) => { sel.value = st.axes[c]; sel.addEventListener('change', () => { st.axes[c] = +sel.value; setProjection('axes'); }); });
  $('[data-clear]').addEventListener('click', () => { st.slice.fill(null); dimBox.querySelectorAll('.explorer-tri').forEach(t => t.querySelectorAll('button').forEach((b, n) => b.setAttribute('aria-pressed', String(n === 0)))); refresh(); });
  root.querySelectorAll('[data-proj]').forEach(b => b.addEventListener('click', () => setProjection(b.dataset.proj)));
  $('[data-colour]').addEventListener('change', e => { st.colour = e.target.value; legend(); request(); });
  root.querySelectorAll('[data-toggle]').forEach(input => input.addEventListener('change', () => { st[input.dataset.toggle] = input.checked; refresh(); }));
  $('[data-who]').addEventListener('change', e => { st.who = e.target.value; if (st.sel != null) select(st.sel); request(); });
  $('[data-size]').addEventListener('input', e => { st.size = +e.target.value; request(); });
  const spin = $('[data-spin]');
  const setSpin = on => { st.spin = on; spin.setAttribute('aria-pressed', String(on)); request(); };
  spin.addEventListener('click', () => setSpin(!st.spin));
  const zoom = f => { cam.dist = Math.max(3, Math.min(14, cam.dist * f)); request(); };
  $('[data-zoom-in]').addEventListener('click', () => zoom(0.85));
  $('[data-zoom-out]').addEventListener('click', () => zoom(1 / 0.85));

  // Drag rotates. Pinch, or ctrl/cmd + wheel (a trackpad pinch), zooms; a plain wheel scrolls the page.
  function down(e) { canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, [e.clientX, e.clientY]); drag = true; moved = 0; setSpin(false); request(); }
  function move(e) {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId); pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) zoom(pinch / d); pinch = d; moved += 10; return;
    }
    const dx = e.clientX - prev[0], dy = e.clientY - prev[1];
    moved += Math.abs(dx) + Math.abs(dy);
    cam.yaw += dx * 0.008; cam.pitch = Math.max(-1.4, Math.min(1.4, cam.pitch + dy * 0.008));
    request();
  }
  function up(e) {
    pointers.delete(e.pointerId); if (pointers.size < 2) pinch = 0;
    if (pointers.size) return;
    drag = false;
    if (moved < 6) pick(e);
  }
  function pick(e) {
    const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    let best = null, bd = 16;
    for (let i = 0; i < N; i++) {
      if (!shown(i) || !inSlice(i) || screen[i * 3 + 2] <= 0.3) continue;
      const d = Math.hypot(screen[i * 3] - px, screen[i * 3 + 1] - py);
      if (d < bd) { bd = d; best = i; }
    }
    if (best != null) select(best);
  }
  function wheel(e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoom(e.deltaY > 0 ? 1.06 : 1 / 1.06); }
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', wheel, { passive: false });
  canvas.addEventListener('keydown', e => {
    const step = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[e.key];
    if (step) { e.preventDefault(); setSpin(false); cam.yaw += step[0]; cam.pitch = Math.max(-1.4, Math.min(1.4, cam.pitch + step[1])); request(); }
    else if (e.key === '+' || e.key === '=') zoom(0.85);
    else if (e.key === '-') zoom(1 / 0.85);
  });

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2); width = r.width; height = r.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    request(); if (!raf) draw();
  }
  const sizer = new ResizeObserver(resize); sizer.observe(canvas);
  const seen = new IntersectionObserver(entries => { visible = entries.some(e => e.isIntersecting); request(); });
  seen.observe(canvas);

  setProjection('star'); cur = target; morph = 1;
  legend(); metrics(); views(); setSpin(st.spin);
  const first = cls.indexOf('unsafe');
  select(first < 0 ? null : first);
  resize();
  status.hidden = true;
  return () => {
    cancelAnimationFrame(raf); raf = 0; visible = false;
    sizer.disconnect(); seen.disconnect();
    putText(status);
  };
}
