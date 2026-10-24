// Newt-Agent step-throughs: shared stepper, node/edge diagram, context-compaction scene, and
// boot. One file so a boosted (htmx) page swap cannot run the boot before the parts it needs.

// ---- stepper
// Shared step player: Stepper({stages, labels, onShow(i, prev)}). Stages carry title + cap;
// labels come from page copy: play, pause, step_of ({i}, {n}), step_label ({i}, {title}).
// Owns the controls, dots, keyboard, autoplay and reduced-motion handling so each
// animation page only supplies what a step looks like.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.Stepper = function (o) {
    var S = o.stages, L = o.labels, fill = function (t, v) { return t.replace(/\{(\w+)\}/g, function (m, k) { return v[k]; }); }, cur = -1, timer = null, $ = function (id) { return document.getElementById(id); };
    var nav = $('dots-nav'), playBtn = $('play');
    S.forEach(function (st, i) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = i;
      b.setAttribute('aria-label', fill(L.step_label, { i: i, title: st.title }));
      b.addEventListener('click', function () { pause(); show(i); });
      nav.appendChild(b);
    });
    function show(i) {
      i = Math.max(0, Math.min(S.length - 1, i));
      var prev = cur; cur = i;
      $('stage-title').textContent = S[i].title;
      $('stage-count').textContent = fill(L.step_of, { i: i + 1, n: S.length });
      $('caption').textContent = S[i].cap;
      Array.prototype.forEach.call(nav.children, function (b, k) {
        if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      $('prev').disabled = i === 0;
      $('next').disabled = i === S.length - 1;
      o.onShow(i, prev, reduce);
    }
    function gone() { return !document.body.contains(nav); }
    function pause() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = L.play; playBtn.setAttribute('aria-pressed', 'false'); }
    function play() {
      if (cur >= S.length - 1) show(0);
      playBtn.textContent = L.pause; playBtn.setAttribute('aria-pressed', 'true');
      timer = setInterval(function () { if (gone()) { pause(); return; } if (cur >= S.length - 1) pause(); else show(cur + 1); }, 5200);
    }
    playBtn.addEventListener('click', function () { timer ? pause() : play(); });
    $('prev').addEventListener('click', function () { pause(); show(cur - 1); });
    $('next').addEventListener('click', function () { pause(); show(cur + 1); });
    document.addEventListener('keydown', function (e) {
      if (gone()) return;
      if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') { pause(); show(cur + 1); }
      else if (e.key === 'ArrowLeft') { pause(); show(cur - 1); }
      else if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); timer ? pause() : play(); }
    });
    show(0);
    if (!reduce) setTimeout(function () { if (cur === 0 && !timer) play(); }, 1200);
    return { show: show, current: function () { return cur; } };
  };
})();

// ---- diagram
// Node/edge scene for Stepper. spec = {nodes:[{id,label,sub,x,y,kind}], stages:[{title,cap,show:[ids],hot:[ids],
// state:{id:'ok'|'deny'}, tag:{id:text}, edges:[[from,to,label,dash?]], note}]}. x,y are percentages.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  window.Diagram = function (scene, spec) {
    var els = {};
    var svg = document.createElementNS(NS, 'svg');
    svg.innerHTML = '<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>';
    svg.style.color = 'var(--ink)';
    scene.appendChild(svg);
    spec.nodes.forEach(function (n) {
      var d = document.createElement('div');
      d.className = 'nd hide' + (n.kind ? ' kind-' + n.kind : '');
      d.style.left = n.x + '%'; d.style.top = n.y + '%';
      var b = document.createElement('b'); b.textContent = n.label; d.appendChild(b);
      if (n.sub) { var s = document.createElement('small'); s.textContent = n.sub; d.appendChild(s); }
      scene.appendChild(d); els[n.id] = d;
    });
    var last = 0;
    function center(id) {
      var r = els[id].getBoundingClientRect(), p = scene.getBoundingClientRect();
      return { x: r.left - p.left + r.width / 2, y: r.top - p.top + r.height / 2, w: r.width / 2, h: r.height / 2 };
    }
    function edgePt(a, b) { // point on a's box boundary toward b
      var dx = b.x - a.x, dy = b.y - a.y, k = Math.max(Math.abs(dx) / a.w, Math.abs(dy) / a.h) || 1;
      return { x: a.x + dx / k, y: a.y + dy / k };
    }
    function draw(i) {
      Array.prototype.slice.call(svg.querySelectorAll('.edge,.elabel')).forEach(function (e) { e.remove(); });
      var all = spec.stages[i].edges || [];
      all.forEach(function (e) {
        if (els[e[0]].classList.contains('hide') || els[e[1]].classList.contains('hide')) return;
        var a = center(e[0]), b = center(e[1]), p = edgePt(a, b), q = edgePt(b, a);
        var twin = all.some(function (o) { return o[0] === e[1] && o[1] === e[0]; });
        if (twin) { // opposite-direction pair: shift each to its own side
          var len = Math.hypot(q.x - p.x, q.y - p.y) || 1, s = (e[0] < e[1] ? -1 : 1) * 9;
          var ox = -(q.y - p.y) / len * s, oy = (q.x - p.x) / len * s;
          p = { x: p.x + ox, y: p.y + oy }; q = { x: q.x + ox, y: q.y + oy };
        }
        var l = document.createElementNS(NS, 'line');
        l.setAttribute('class', 'edge' + (e[3] ? ' dash' : ''));
        l.setAttribute('x1', p.x); l.setAttribute('y1', p.y); l.setAttribute('x2', q.x); l.setAttribute('y2', q.y);
        l.setAttribute('marker-end', 'url(#arr)'); svg.appendChild(l);
        if (e[2]) {
          var t = document.createElementNS(NS, 'text'); t.setAttribute('class', 'elabel');
          t.setAttribute('x', (p.x + q.x) / 2); t.setAttribute('y', (p.y + q.y) / 2 - 5); t.textContent = e[2]; svg.appendChild(t);
        }
      });
    }
    window.addEventListener('resize', function () { draw(last); });
    return function onShow(i) {
      last = i; var st = spec.stages[i];
      spec.nodes.forEach(function (n) {
        var el = els[n.id];
        el.classList.toggle('hide', (st.show || []).indexOf(n.id) < 0);
        el.classList.toggle('hot', (st.hot || []).indexOf(n.id) >= 0);
        var s = (st.state || {})[n.id];
        el.classList.toggle('ok', s === 'ok'); el.classList.toggle('deny', s === 'deny');
        var old = el.querySelector('.tag'); if (old) old.remove();
        if ((st.tag || {})[n.id]) { var t = document.createElement('span'); t.className = 'tag'; t.textContent = st.tag[n.id]; el.appendChild(t); }
      });
      draw(i);
      var z = document.getElementById('zones'); if (z) z.textContent = st.note || '';
    };
  };
})();

// ---- context
// The context-compaction step-through. spec = {budget, trigger, blocks, stages} from
// _data/newt/context.json with its words filled in from the page copy (see boot.js).
window.NewtContext = function (spec, copy) {
  var BUDGET = spec.budget, TRIGGER = spec.trigger, B = spec.blocks, S = spec.stages;
  var win = document.getElementById('window'), store = document.getElementById('store');
  var fill = document.getElementById('fill'), tick = document.getElementById('tick');
  var els = {}, PX = 15, MIN = 24;
  tick.style.left = (TRIGGER / BUDGET * 100) + '%';
  function tpl(t, v) { return t.replace(/\{(\w+)\}/g, function (m, k) { return v[k]; }); }
  B.forEach(function (b) {
    var d = document.createElement('div');
    d.className = 'blk role-' + b.role + ' hide';
    d.innerHTML = '<span class="name"><span class="lbl"></span></span><span class="t"></span>';
    d.querySelector('.lbl').textContent = b.label;
    var s = document.createElement('span'); s.className = 'tag'; d.querySelector('.name').appendChild(s);
    win.appendChild(d); els[b.id] = d;
  });
  Stepper({ stages: S, labels: copy, onShow: function (i, prev, reduce) {
    var total = 0, st = S[i];
    B.forEach(function (b, idx) {
      var el = els[b.id], t = b.t[i], was = b.t[prev];
      if (t == null) { el.classList.add('hide'); el.style.height = ''; }
      else {
        total += t;
        el.classList.remove('hide');
        el.style.height = Math.max(MIN, t * PX) + 'px';
        el.querySelector('.t').textContent = t.toFixed(1) + 'k';
        el.style.transitionDelay = (!reduce && prev === 0 && i === 1) ? (idx * 90) + 'ms' : '';
        if (was == null && prev >= 0 && !reduce) { el.classList.remove('fresh'); void el.offsetWidth; el.classList.add('fresh'); }
      }
      // b.mid: the stages at which this block is in the compactable middle;
      // b.tag_at: per-stage overrides of b.tag (null hides it).
      var mid = (b.mid || []).indexOf(i) >= 0, tag = b.tag_at && (i in b.tag_at) ? b.tag_at[i] : b.tag;
      el.classList.toggle('mid', mid);
      el.classList.toggle('ghost', mid && i === spec.ghost);
      var tg = el.querySelector('.tag'); tg.textContent = tag || ''; tg.hidden = !tag;
    });
    fill.style.width = Math.min(100, total / BUDGET * 100) + '%';
    fill.classList.toggle('over', total > TRIGGER);
    var used = { used: total.toFixed(1), budget: BUDGET };
    document.getElementById('meter-text').textContent = tpl(copy.meter_text, used) + (total > TRIGGER ? copy.meter_over : '');
    document.getElementById('meter').setAttribute('aria-label', copy.meter_aria + ' ' + tpl(copy.meter_text, used));
    document.getElementById('zones').textContent = st.zones;
    store.innerHTML = '';
    if (!st.store.length) { var e = document.createElement('div'); e.className = 'empty'; e.textContent = copy.store_empty; store.appendChild(e); }
    st.store.forEach(function (en, k) {
      if (k === 1 && st.link) { var l = document.createElement('div'); l.className = 'link'; l.textContent = copy.store_link; store.appendChild(l); }
      var d = document.createElement('div'); d.className = 'entry' + (en.hot ? ' hot' : '');
      var n = document.createElement('div'); n.className = 'mono'; n.textContent = en.name;
      var p = document.createElement('div'); p.textContent = en.body;
      d.appendChild(n); d.appendChild(p); store.appendChild(d);
    });
    document.querySelectorAll('#dots .dot').forEach(function (d) { d.classList.remove('on'); });
    document.getElementById('strike-text').textContent = copy.strike_text;
    document.getElementById('strike-note').textContent = i === S.length - 1 ? copy.strike_note : '';
  } });
};

// ---- boot
// Starts a Newt-Agent step-through. The structure comes from _data/newt/<page>.json and the
// words from the page's copy.newt; placeholders ("@") are filled by path (see key()).
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var skel = JSON.parse($('newt-skeleton').textContent), copy = JSON.parse($('newt-copy').textContent);
  function key(path) { return path.map(function (p) { return p === 'hd' ? 'title' : p; }).join('_').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }
  function fillIn(node, path) {
    if (node === '@') return copy[key(path)];
    if (Array.isArray(node)) return node.map(function (v, i) { return fillIn(v, path.concat(i)); });
    if (node && typeof node === 'object') {
      var o = {}; Object.keys(node).forEach(function (k) { o[k] = fillIn(node[k], path.concat(k)); }); return o;
    }
    return node;
  }
  var spec = fillIn(skel, []);
  // the data file calls a stage's title "hd" so its key is not mistaken for site prose
  spec.stages.forEach(function (st) { st.title = st.hd; });
  window.NewtDemo = { spec: spec, copy: copy };
  if (spec.kind === 'diagram') {
    var onShow = Diagram($('scene'), spec);
    Stepper({ stages: spec.stages, labels: copy, onShow: onShow });
  } else {
    NewtContext(spec, copy);
  }
})();
