// Making Minds? Session 3: What an engine can represent.
// Captured plates are the reproducible baseline the course cites; "Try your own"
// and "Question the model" use whatever model the visitor connected.
import { copyText, putCopy, putText } from "../../../assets/js/copy.js";
import { BROWSER_MODELS } from '../../../assets/js/browser-models.js?v=prose-labs-1';

export function modelChoices(settings, description) {
  const options = BROWSER_MODELS.map(m => ({ value: m.id, label: `${m.label} · ${m.note}` }));
  if (settings.backend !== 'browser') options.unshift({ value: '@current', label: description + ' (current source)' });
  else if (!options.some(o => o.value === settings.browserModel)) options.push({ value: settings.browserModel, label: description + ' (previously selected)' });
  return [...options, { value: '@settings', label: 'OpenRouter or another service…' }];
}

export function chooseModel(conn, value, openSettings) {
  if (value === '@settings') openSettings();
  else if (BROWSER_MODELS.some(m => m.id === value)) conn.update({ backend: 'browser', browserModel: value,
    ...(conn.settings.backend !== 'browser' ? { apiKey: '' } : {}) });
}

const DATA = new URL("../../content/ai-theology/session-3/", import.meta.url);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const plain = t => esc(t).replace(/\n+/g, " ⏎ ");
const showTok = t => {
  if (/^\n+$/.test(t)) return '<span class="meta">[new line]</span>';
  if (t.trim() === "") return '<span class="meta">[space]</span>';
  return t.startsWith(" ") || t.startsWith("Ġ") ? esc(t.trim().replace(/^Ġ/, "")) : esc(t.trim()) + ' <span class="meta">(joined)</span>';
};
function oddsAt(cands, T) {
  if (T <= 0.001) return cands.map((_, i) => (i === 0 ? 1 : 0));
  const m = Math.max(...cands.map(c => c.logprob));
  const w = cands.map(c => Math.exp((c.logprob - m) / T));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map(x => x / s);
}
const GROUP = { theology: "Theology", mind: "Mind", machine: "Machine", making: "Making & body" };


export function lessonValues(next, map) {
  const lovelace = next.prompts.find(p => p.kind === 'lovelace');
  return {
    dimensions: String(map.dimensions), nextModel: next.model,
    topCandidates: String(next.method.top_candidates), steps: String(next.method.steps),
    nextCaptured: next.captured_at, nextId: next.capture_id,
    mapModel: map.model, mapLayout: map.layout, mapCaptured: map.captured_at, mapId: map.capture_id,
    lovelaceOdds: String(Math.round(Math.exp(lovelace.steps[0].candidates[0].logprob) * 100)),
  };
}

export async function mount(el, { conn, openSettings }) {
  const [NEXT, MAP, MAP3D] = await Promise.all([
    fetch(new URL("next_word.json", DATA)).then(r => r.json()),
    fetch(new URL("meaning_map.json", DATA)).then(r => r.json()),
    fetch(new URL("meaning_map_3d.json", DATA)).then(r => r.json()),
  ]);

  const values = lessonValues(NEXT, MAP);
  for (const node of el.querySelectorAll('[data-value]')) {
    if (Object.hasOwn(values, node.dataset.value)) node.textContent = values[node.dataset.value];
  }
  const $ = s => el.querySelector(s);
  const events = new AbortController();
  const listen = (target, type, listener) => target.addEventListener(type, listener, {signal: events.signal});

  // Make sure a model is ready before a button uses it. An in-browser model the
  // visitor already chose is started here, with progress, instead of sending
  // them back to the settings dialog.
  async function ensureModel(statusEl) {
    if (conn.ready()) return true;
    if (conn.settings.backend !== "browser") { openSettings(); return false; }
    const show = () => {
      if (conn.status.state === "loading") putCopy(statusEl, "lesson_state.progress", {percent: Math.round(conn.status.progress * 100)});
    };
    listen(conn, "change", show);
    putCopy(statusEl, "lesson_state.starting");
    try { await conn.load(); return true; }
    catch (e) {
      if (e.message === "no-webgpu") putCopy(statusEl, "lesson_state.no_webgpu");
      else if (conn.status.text) putText(statusEl, conn.status.text);
      else putCopy(statusEl, "lesson_state.load_failed", {error: e.message});
      return false;
    } finally { conn.removeEventListener("change", show); }
  }

  // ---------- Plate 1 ----------
  const st = { run: null, step: 0, T: 1, drawn: [], live: false };
  let alive = true, runVersion = 0, source = conn.describe(), optionsKey = '';
  const picker = $('#liveModel');
  function syncModel() {
    const options = modelChoices(conn.settings, conn.describe()), key = JSON.stringify(options);
    if (key !== optionsKey) {
      picker.replaceChildren(...options.map(o => new Option(o.label, o.value)));
      optionsKey = key;
    }
    picker.value = conn.settings.backend === 'browser' ? conn.settings.browserModel : '@current';
    if (source !== conn.describe()) {
      source = conn.describe(); runVersion++;
      putCopy($('#liveStatus'), "lesson_state.selected", {source});
    }
  }
  listen(conn, 'change', syncModel);
  listen(picker, 'change', () => { chooseModel(conn, picker.value, openSettings); syncModel(); });
  syncModel();
  const sel = $("#promptSel");
  sel.replaceChildren();
  NEXT.prompts.forEach((p, i) => { const o = document.createElement("option"); o.value = i; o.textContent = "“" + p.prompt + " …”"; sel.append(o); });
  sel.value = 4;
  const useCaptured = i => { st.run = { ...NEXT.prompts[i], source: `Captured from ${NEXT.model}` }; st.step = 0; st.drawn = []; paint(); };

  function paint() {
    const run = st.run;
    if (!run) {
      $("#sentence").textContent = ""; $("#bars").replaceChildren();
      for (const id of ['back', 'fwd', 'draw']) $('#' + id).disabled = true;
      return;
    }
    const steps = run.steps;
    const sofar = steps.slice(0, st.step).map((s, i) => st.drawn[i] ?? s.chosen).join("");
    $("#sentence").innerHTML = esc(run.prompt) + '<span class="done">' + plain(sofar) + '</span><span class="cursor" aria-hidden="true"></span>';
    const atEnd = st.step >= steps.length;
    const cur = steps[Math.min(st.step, steps.length - 1)];
    const bars = $("#bars"); bars.replaceChildren();
    if (cur) {
      const odds = oddsAt(cur.candidates, st.T);
      cur.candidates.forEach((c, i) => {
        const row = document.createElement("div");
        row.className = "barrow" + (!atEnd && c.token === cur.chosen ? " chosen" : "");
        row.setAttribute("role", "listitem");
        const pct = odds[i] * 100;
        row.innerHTML = `<span class="tok">${showTok(c.token)}</span><span class="track"><span class="fill" style="width:${Math.max(pct, 0.3).toFixed(2)}%"></span></span><span class="pct">${pct >= 1 ? pct.toFixed(0) : pct >= 0.1 ? pct.toFixed(1) : "<0.1"}%</span>`;
        row.title = "Model probability: " + (Math.exp(c.logprob) * 100).toFixed(2) + "%";
        bars.append(row);
      });
    }
    putText($("#where"), atEnd ? "End of these words" : `Word ${st.step + 1} of ${steps.length}`);
    $("#back").disabled = st.step === 0;
    $("#fwd").disabled = atEnd; $("#draw").disabled = atEnd;
    $("#tempVal").textContent = st.T.toFixed(1);
    putCopy($("#sourceNote"), (st.T === 1 ? "lesson_state.temperature_normal" : st.T <= 0.001 ? "lesson_state.temperature_zero" : st.T < 1 ? "lesson_state.temperature_low" : "lesson_state.temperature_high"), {source: run.source});
  }
  listen(sel, "change", () => useCaptured(+sel.value));
  listen($("#temp"), "input", e => { st.T = +e.target.value; paint(); });
  listen($("#fwd"), "click", () => { st.step++; paint(); });
  listen($("#back"), "click", () => { st.step = Math.max(0, st.step - 1); st.drawn.length = st.step; paint(); });
  listen($("#draw"), "click", () => {
    const cur = st.run.steps[st.step];
    const odds = oddsAt(cur.candidates, st.T);
    let r = Math.random(), i = 0;
    while (i < odds.length - 1 && (r -= odds[i]) > 0) i++;
    const t = cur.candidates[i].token;
    st.step++;
    if (t !== cur.chosen) {
      st.drawn[st.step - 1] = t; paint();
      putCopy($("#where"), "lesson_state.rolled");
      $("#fwd").disabled = true; $("#draw").disabled = true;
    } else paint();
  });

  function showTab(live) {
    runVersion++;
    st.live = live;
    $("#tabCaptured").setAttribute("aria-selected", String(!live));
    $("#tabLive").setAttribute("aria-selected", String(live));
    $("#capturedControls").hidden = live; $("#liveControls").hidden = !live;
    if (!live) useCaptured(+sel.value); else { st.run = null; paint(); putText($("#where"), ""); putCopy($("#sourceNote"), "lesson_state.opening"); }
  }
  listen($("#tabCaptured"), "click", () => showTab(false));
  listen($("#tabLive"), "click", () => showTab(true));

  listen($("#liveRun"), "click", async () => {
    const prompt = $("#livePrompt").value.trim();
    if (!prompt) return;
    const version = ++runVersion, current = () => alive && version === runVersion;
    const btn = $("#liveRun"); btn.disabled = true; picker.disabled = true;
    const status = $("#liveStatus");
    try {
      if (!(await ensureModel(status)) || !current()) return;
      const run = { prompt, steps: [], source: `Live from ${conn.describe()}` };
      let text = prompt;
      for (let i = 0; i < 8 && current(); i++) {
        putText(status, conn.status.state === "loading" ? "Loading model…" : `Word ${i + 1} of 8…`);
        const cands = await conn.nextWord(text);
        if (!current()) return;
        if (!cands) { putCopy(status, "lesson_state.no_odds"); break; }
        run.steps.push({ chosen: cands[0].token, candidates: cands });
        text += cands[0].token;
        st.run = run; st.step = 0; st.drawn = []; paint();
      }
      if (current() && run.steps.length) putCopy(status, "lesson_state.done");
    } catch (e) {
      if (current()) { if (e.message === "no-webgpu") putCopy(status, "lesson_state.no_webgpu_live"); else putText(status, "Error: " + e.message); }
    } finally { btn.disabled = false; picker.disabled = false; }
  });

  useCaptured(4);

  // ---------- Plate 2 ----------
  const svg = $("#mapSvg"), NS = "http://www.w3.org/2000/svg", W = 720, H = 520, PAD = 70;
  const sx = x => PAD + (x + 1) / 2 * (W - 2 * PAD), sy = y => PAD + (1 - (y + 1) / 2) * (H - 2 * PAD);
  svg.replaceChildren();
  const byWord = Object.fromEntries(MAP.words.map(w => [w.word, w]));
  const links = document.createElementNS(NS, "g"); svg.append(links);
  const nodes = {};
  MAP.words.forEach(w => {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "word"); g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
    g.setAttribute("aria-label", `${w.word}, ${GROUP[w.group]}`);
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", sx(w.x)); c.setAttribute("cy", sy(w.y)); c.setAttribute("r", 6); c.setAttribute("fill", `var(--g-${w.group})`);
    const t = document.createElementNS(NS, "text"); const right = w.x < 0.55;
    t.setAttribute("x", sx(w.x) + (right ? 10 : -10)); t.setAttribute("y", sy(w.y) + 4);
    t.setAttribute("text-anchor", right ? "start" : "end"); t.textContent = w.word;
    g.append(c, t); svg.append(g); nodes[w.word] = g;
    const pick = () => pickWord(w.word);
    listen(g, "click", pick); listen(g, "mouseenter", pick);
    listen(g, "keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  function pickWord(word) {
    const w = byWord[word]; const near = new Set(w.nearest.map(n => n.word).concat(word));
    Object.entries(nodes).forEach(([k, g]) => g.classList.toggle("dim", !near.has(k)));
    links.replaceChildren(...w.nearest.map(n => {
      const o = byWord[n.word], l = document.createElementNS(NS, "line");
      l.setAttribute("class", "link");
      l.setAttribute("x1", sx(w.x)); l.setAttribute("y1", sy(w.y)); l.setAttribute("x2", sx(o.x)); l.setAttribute("y2", sy(o.y));
      return l;
    }));
    $("#pickWord").textContent = word;
    $("#pickList").innerHTML = w.nearest.map(n => `<li><span>${esc(n.word)}</span><span class="s">${n.similarity.toFixed(2)}</span></li>`).join("");
  }
  pickWord("grace");
  const table = $("#mapRows");
  table.innerHTML = MAP.words.map(w => `<tr><td>${esc(w.word)}</td><td>${GROUP[w.group]}</td><td>${w.nearest.map(n => `${esc(n.word)} (${n.similarity.toFixed(2)})`).join(", ")}</td></tr>`).join("");

  // ---------- Plate 2b ----------
  const cv = $("#map3dCanvas");
  if (cv) {
    const ctx = cv.getContext("2d");
    const byWord3d = Object.fromEntries(MAP3D.words.map(w => [w.word, w]));
    const style = getComputedStyle(document.documentElement);
    const groupColor = g => (style.getPropertyValue(`--g-${g}`) || "#888").trim();
    const inkColor = () => (style.getPropertyValue("--ink") || "#ddd").trim();
    const ink2Color = () => (style.getPropertyValue("--ink-2") || "#999").trim();
    const plateColor = () => (style.getPropertyValue("--plate") || "#111").trim();
    let rotY = 0.6, rotX = -0.3, zoom = 1, picked3d = null;
    let dragging = false, lastX = 0, lastY = 0, moved = false;

    function project(w) {
      const cy = Math.cos(rotY), sy = Math.sin(rotY), cx = Math.cos(rotX), sx = Math.sin(rotX);
      let x = w.x * cy + w.z * sy, z = -w.x * sy + w.z * cy;
      let y = w.y * cx - z * sx; z = w.y * sx + z * cx;
      const dist = 3.1 / zoom, scale = (cv.width / 2 - 70) / dist;
      const persp = dist / (dist - z);
      return { sx: cv.width / 2 + x * scale * persp, sy: cv.height / 2 + y * scale * persp, depth: z, persp };
    }

    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const near3d = picked3d ? new Set(byWord3d[picked3d].nearest.map(n => n.word).concat(picked3d)) : null;
      const points = MAP3D.words.map(w => ({ w, ...project(w) })).sort((a, b) => a.depth - b.depth);
      if (picked3d) {
        ctx.setLineDash([3, 3]); ctx.strokeStyle = ink2Color(); ctx.lineWidth = 1.5;
        const p0 = points.find(p => p.w.word === picked3d);
        byWord3d[picked3d].nearest.forEach(n => {
          const p1 = points.find(p => p.w.word === n.word);
          if (!p0 || !p1) return;
          ctx.beginPath(); ctx.moveTo(p0.sx, p0.sy); ctx.lineTo(p1.sx, p1.sy); ctx.stroke();
        });
        ctx.setLineDash([]);
      }
      points.forEach(p => {
        const dim = near3d && !near3d.has(p.w.word);
        ctx.globalAlpha = dim ? 0.18 : 1;
        const r = Math.max(3, 6 * p.persp * 0.85);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = groupColor(p.w.group); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = plateColor(); ctx.stroke();
        if (!dim) {
          ctx.font = "500 12.5px ui-monospace, monospace"; ctx.fillStyle = inkColor();
          ctx.textBaseline = "middle";
          const right = p.sx < cv.width * 0.72;
          ctx.textAlign = right ? "left" : "right";
          ctx.fillText(p.w.word, p.sx + (right ? r + 4 : -(r + 4)), p.sy);
        }
      });
      ctx.globalAlpha = 1;
    }

    function pickWord3d(word) {
      picked3d = word;
      const w = byWord3d[word];
      $("#pick3dWord").textContent = word;
      $("#pick3dList").innerHTML = w.nearest.map(n => `<li><span>${esc(n.word)}</span><span class="s">${n.similarity.toFixed(2)}</span></li>`).join("");
      draw();
    }

    listen(cv, "pointerdown", e => { dragging = true; moved = false; lastX = e.clientX; lastY = e.clientY; cv.setPointerCapture(e.pointerId); });
    listen(cv, "pointermove", e => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
      rotY += dx * 0.008; rotX = Math.max(-1.3, Math.min(1.3, rotX + dy * 0.008));
      lastX = e.clientX; lastY = e.clientY; draw();
    });
    listen(cv, "pointerup", e => {
      dragging = false;
      if (!moved) {
        const rect = cv.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (cv.width / rect.width), my = (e.clientY - rect.top) * (cv.height / rect.height);
        const points = MAP3D.words.map(w => ({ w, ...project(w) }));
        let best = null, bestD = 22;
        points.forEach(p => { const d = Math.hypot(p.sx - mx, p.sy - my); if (d < bestD) { bestD = d; best = p.w.word; } });
        if (best) pickWord3d(best);
      }
    });
    cv.addEventListener("wheel", e => { e.preventDefault(); zoom = Math.max(0.5, Math.min(2.5, zoom * (e.deltaY < 0 ? 1.08 : 0.93))); draw(); }, { passive: false, signal: events.signal });

    pickWord3d("grace");
  }

  // ---------- Plate 3 ----------
  listen($("#askBtn"), "click", async () => {
    const q = $("#askBox").value.trim();
    if (!q) return;
    const btn = $("#askBtn"); btn.disabled = true;
    if (!(await ensureModel($("#askStatus"))) || !alive) { btn.disabled = false; return; }
    const who = conn.describe();
    putText($("#askStatus"), conn.status.state === "ready" || conn.settings.backend !== "browser" ? "Thinking…" : "Loading model…");
    try {
      const text = await conn.chat([{ role: "system", content: copyText("lesson_prompt.assistant") }, { role: "user", content: q }]);
      if (!alive) return;
      const box = $("#answer"); box.replaceChildren();
      const label = document.createElement("span"); label.className = "who"; label.textContent = "Answered by " + who;
      box.append(label, document.createTextNode(text));
      putText($("#askStatus"), "");
    } catch (e) {
      if (!alive) return;
      if (e.message === "no-webgpu") putCopy($("#askStatus"), "lesson_state.no_webgpu_ask"); else putText($("#askStatus"), "Error: " + e.message);
    } finally { btn.disabled = false; }
  });

  return () => { events.abort(); alive = false; runVersion++; conn.removeEventListener('change', syncModel); };
}
