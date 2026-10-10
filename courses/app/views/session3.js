// Making Minds? Session 3: What an engine can represent.
// Captured plates are the reproducible baseline the course cites; "Try your own"
// and "Question the model" use whatever model the visitor connected.
import { draftNotice } from "../draft.js";
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
const SYSTEM = "You are a careful assistant in a seminar where pastors and Christian educators are learning how AI systems work. Answer briefly and plainly. Say when you are unsure. Do not claim feelings, beliefs or religious authority. Do not tell people what to believe; describe positions fairly.";

export async function mount(el, { conn, openSettings }) {
  const [NEXT, MAP] = await Promise.all([
    fetch(new URL("next_word.json", DATA)).then(r => r.json()),
    fetch(new URL("meaning_map.json", DATA)).then(r => r.json()),
  ]);
  const lovelace = NEXT.prompts.find(p => p.kind === "lovelace");
  const lovelaceOdds = Math.round(Math.exp(lovelace.steps[0].candidates[0].logprob) * 100);

  el.innerHTML = `
  <section class="plate">
    <span class="eyebrow">Ada Lovelace, Note G, 1843 · completed by a 2026 language model</span>
    <p class="quote">“The Analytical Engine has no pretensions whatever to <span class="gen">${esc(lovelace.steps.slice(0, 3).map(s => s.chosen).join("").trim())}</span>”</p>
    <p class="muted">The black words are Lovelace’s. The blue words were written by a language model given only the black ones. It chose “originate” over every other word in its vocabulary with odds of <b class="mono">${lovelaceOdds}%</b>.</p>
    <div class="caption">
      <div><h3>What this shows</h3><p>The model has absorbed this famous sentence from text it was trained on, and reproduces it with near certainty.</p></div>
      <div class="not"><h3>What this does not show</h3><p>It does not show that the model agrees with Lovelace, understands her, or refutes her. Reciting a claim about originality is not evidence for or against it.</p></div>
    </div>
  </section>

  <section class="plate">
    <span class="eyebrow">Plate 1 · Next-word odds</span>
    <h2>Writing is choosing, one word at a time</h2>
    <p>At each step a model scores every word it knows and one is picked. The bars show its strongest candidates.</p>
    <div class="figure">
      <div class="tabs" role="tablist">
        <button role="tab" id="tabCaptured" aria-selected="true" type="button">Captured examples</button>
        <button role="tab" id="tabLive" aria-selected="false" type="button">Try your own words</button>
      </div>
      <div class="controls" id="capturedControls">
        <label for="promptSel">Opening words <select id="promptSel"></select></label>
      </div>
      <div id="liveControls" hidden>
        <div class="controls model-compare">
          <p>Try the same opening with different models. Keep the opening words and temperature fixed, change the model, then ask again. Compare the favourite next word and the alternatives—not just the finished sentence.</p>
          <p><a href="/labs/model-comparison/">Compare three models side by side in Labs →</a></p>
          <label for="liveModel">Model for this experiment <select id="liveModel" aria-describedby="liveModelHelp"></select></label>
          <p class="note" id="liveModelHelp">Browser models are listed by download size; GPU memory needs vary. This changes the site-wide choice. Selecting here unloads the previous browser model; downloading waits until you press Ask the model. Previous results keep their original model label.</p>
        </div>
        <div class="controls">
        <label for="livePrompt">Opening words <input id="livePrompt" type="text" value="The soul is" autocomplete="off"></label>
        <button class="btn primary" id="liveRun" type="button">Ask the model</button>
        <span class="muted mono" id="liveStatus" role="status"></span>
        </div>
      </div>
      <div class="controls">
        <label for="temp">Temperature <input id="temp" type="range" min="0" max="2" step="0.1" value="1"> <span id="tempVal" class="mono">1.0</span></label>
      </div>
      <div class="sentence" id="sentence" aria-live="polite"></div>
      <div class="bars" id="bars" role="list" aria-label="Candidate next words and their odds"></div>
      <div class="stepper">
        <button class="btn" id="back" type="button">← Previous word</button>
        <button class="btn primary" id="fwd" type="button">Next word →</button>
        <button class="btn" id="draw" type="button">Roll the dice</button>
        <span class="where" id="where"></span>
      </div>
      <p class="note" id="sourceNote"></p>
    </div>
    <div class="caption">
      <div><h3>What this shows</h3><p>Familiar texts produce one overwhelming candidate. Open questions spread the odds across many plausible words. “Temperature” is a dial a person sets: low makes the strongest word win, high gives weaker words a real chance.</p></div>
      <div class="not"><h3>What this does not show</h3><p>Odds are not intentions, beliefs, or understanding. Only the strongest candidates are drawn, rescaled to add up to 100%. Different models give different odds for the same words.</p></div>
    </div>
  </section>

  <section class="plate">
    <span class="eyebrow">Plate 2 · A meaning map</span>
    <h2>To a model, a word is a place</h2>
    <p>An embedding model turns each word into ${MAP.dimensions} numbers. Words used in similar ways in its training text end up with similar numbers. Here those numbers are flattened onto a page. Pick a word to see its three closest neighbours.</p>
    <div class="figure">
      <div class="legend">${Object.entries(GROUP).map(([g, n]) => `<span><i style="background:var(--g-${g})"></i>${n}</span>`).join("")}</div>
      <div class="maplayout">
        <div class="mapbox"><svg class="map" id="mapSvg" viewBox="0 0 720 520" role="img" aria-label="Map of ${MAP.words.length} words placed by similarity"></svg></div>
        <div class="panel" aria-live="polite">
          <span class="eyebrow">Closest in all ${MAP.dimensions} numbers</span>
          <div class="pick" id="pickWord"></div>
          <ol id="pickList"></ol>
          <p class="note"><b>Look at “conscience.”</b> Its nearest neighbour is “consciousness.” The model places them together because the words look and are used alike, not because it holds a view on how conscience and awareness relate.</p>
        </div>
      </div>
      <details class="table"><summary>Show the map as a table</summary>
        <div class="tablebox"><table><thead><tr><th>Word</th><th>Group</th><th>Nearest three (similarity, 0 to 1)</th></tr></thead>
        <tbody>${MAP.words.map(w => `<tr><td>${esc(w.word)}</td><td>${GROUP[w.group]}</td><td>${w.nearest.map(n => `${esc(n.word)} (${n.similarity.toFixed(2)})`).join(", ")}</td></tr>`).join("")}</tbody></table></div>
      </details>
    </div>
    <div class="caption">
      <div><h3>What this shows</h3><p>Usage in text has a shape. Grace sits near mercy and salvation; machine sits near computer and engine. Some neighbours are surprising, and the surprises are good discussion material.</p></div>
      <div class="not"><h3>What this does not show</h3><p>Nearness means “used alike in text,” not “the same meaning” or “theologically related.” Flattening ${MAP.dimensions} numbers onto a page distorts distances, so trust the neighbour list over the picture.</p></div>
    </div>
  </section>

  <section class="plate">
    <span class="eyebrow">Plate 3 · Question the model</span>
    <h2>Ask, then examine the answer</h2>
    <div class="figure ask">
      <label for="askBox" class="muted">Your question</label>
      <textarea id="askBox">Could a machine ever originate an idea, or only recombine what it was given?</textarea>
      <div class="row"><button class="btn primary" id="askBtn" type="button">Ask</button><span class="muted mono" id="askStatus"></span></div>
      <div class="answer" id="answer" aria-live="polite"><span class="who">The answer will appear here.</span></div>
    </div>
    <div class="caption">
      <div><h3>What this shows</h3><p>How one model, with these instructions, answers your question today. Ask the same thing twice, or switch models, and compare.</p></div>
      <div class="not"><h3>What this does not show</h3><p>An answer is generated text, not a source. It can be confident and wrong, and it carries no authority. Check anything that matters against the readings.</p></div>
    </div>
  </section>

  <section class="plate">
    <span class="eyebrow">For discussion</span>
    <h2>Rules, representation, origination</h2>
    <ol class="questions">
      <li><p>When the model finishes Lovelace’s sentence with ${lovelaceOdds}% odds, is it following rules, representing her idea, or neither? What would change your answer?</p></li>
      <li><p>Turn the temperature up on “The most important thing a pastor does is.” If a surprising word appears, who originated it: the model, the person who set the dial, or the thousands of writers in its training text?</p></li>
      <li><p>The map puts “conscience” next to “consciousness.” What does a pastor mean by conscience that this geometry cannot hold?</p></li>
    </ol>
  </section>

  <section class="plate">
    <span class="eyebrow">Where the captured figures come from</span>
    <div class="prov">
      <div>Plate 1 (captured): <code>${esc(NEXT.model)}</code>, an open-weight model on local hardware. Temperature 0, top ${NEXT.method.top_candidates} candidates, ${NEXT.method.steps} words per opening. Captured ${esc(NEXT.captured_at)}. Capture id <code>${esc(NEXT.capture_id)}</code>.</div>
      <div>Plate 2: <code>${esc(MAP.model)}</code>, ${MAP.dimensions} numbers per word. Layout: ${esc(MAP.layout)}. Captured ${esc(MAP.captured_at)}. Capture id <code>${esc(MAP.capture_id)}</code>.</div>
      <div>A capture id is a content address: change any number in the capture and the id changes.</div>
    </div>
  </section>`;
  el.prepend(await draftNotice("ai-theology/session-3"));
  const $ = s => el.querySelector(s);

  // Make sure a model is ready before a button uses it. An in-browser model the
  // visitor already chose is started here, with progress, instead of sending
  // them back to the settings dialog.
  async function ensureModel(statusEl) {
    if (conn.ready()) return true;
    if (conn.settings.backend !== "browser") { openSettings(); return false; }
    const show = () => {
      if (conn.status.state === "loading") statusEl.textContent = "Starting the model… " + Math.round(conn.status.progress * 100) + "%";
    };
    conn.addEventListener("change", show);
    statusEl.textContent = "Starting the model. The first time, this includes a one-time download.";
    try { await conn.load(); return true; }
    catch (e) {
      statusEl.textContent = e.message === "no-webgpu"
        ? "This browser cannot run a model locally. Use the model button at the top to choose another source."
        : conn.status.text || ("Could not start the model: " + e.message);
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
      $('#liveStatus').textContent = `Selected ${source}. Press Ask the model to compare the same opening.`;
    }
  }
  conn.addEventListener('change', syncModel);
  picker.addEventListener('change', () => { chooseModel(conn, picker.value, openSettings); syncModel(); });
  syncModel();
  const sel = $("#promptSel");
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
    $("#where").textContent = atEnd ? "End of these words" : `Word ${st.step + 1} of ${steps.length}`;
    $("#back").disabled = st.step === 0;
    $("#fwd").disabled = atEnd; $("#draw").disabled = atEnd;
    $("#tempVal").textContent = st.T.toFixed(1);
    $("#sourceNote").textContent = run.source + (st.T === 1 ? ". Temperature 1.0: relative odds among the displayed candidates." : st.T <= 0.001 ? ". Temperature 0: the strongest word always wins." : st.T < 1 ? ". Below 1, the strongest word pulls ahead." : ". Above 1, weaker words get a bigger share.");
  }
  sel.addEventListener("change", () => useCaptured(+sel.value));
  $("#temp").addEventListener("input", e => { st.T = +e.target.value; paint(); });
  $("#fwd").addEventListener("click", () => { st.step++; paint(); });
  $("#back").addEventListener("click", () => { st.step = Math.max(0, st.step - 1); st.drawn.length = st.step; paint(); });
  $("#draw").addEventListener("click", () => {
    const cur = st.run.steps[st.step];
    const odds = oddsAt(cur.candidates, st.T);
    let r = Math.random(), i = 0;
    while (i < odds.length - 1 && (r -= odds[i]) > 0) i++;
    const t = cur.candidates[i].token;
    st.step++;
    if (t !== cur.chosen) {
      st.drawn[st.step - 1] = t; paint();
      $("#where").textContent = "Rolled a different word. The odds after it were never computed, so this path stops here.";
      $("#fwd").disabled = true; $("#draw").disabled = true;
    } else paint();
  });

  function showTab(live) {
    runVersion++;
    st.live = live;
    $("#tabCaptured").setAttribute("aria-selected", String(!live));
    $("#tabLive").setAttribute("aria-selected", String(live));
    $("#capturedControls").hidden = live; $("#liveControls").hidden = !live;
    if (!live) useCaptured(+sel.value); else { st.run = null; paint(); $("#where").textContent = ""; $("#sourceNote").textContent = "Type an opening and ask the connected model."; }
  }
  $("#tabCaptured").addEventListener("click", () => showTab(false));
  $("#tabLive").addEventListener("click", () => showTab(true));

  $("#liveRun").addEventListener("click", async () => {
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
        status.textContent = conn.status.state === "loading" ? "Loading model…" : `Word ${i + 1} of 8…`;
        const cands = await conn.nextWord(text);
        if (!current()) return;
        if (!cands) { status.textContent = "This model does not share its odds. Try the in-browser model."; break; }
        run.steps.push({ chosen: cands[0].token, candidates: cands });
        text += cands[0].token;
        st.run = run; st.step = 0; st.drawn = []; paint();
      }
      if (current() && run.steps.length) status.textContent = "Done. Step through the words below, then try another model with the same opening.";
    } catch (e) {
      if (current()) status.textContent = e.message === "no-webgpu" ? "This browser cannot run a model locally. Use the model selector to connect another source." : "Error: " + e.message;
    } finally { btn.disabled = false; picker.disabled = false; }
  });

  useCaptured(4);

  // ---------- Plate 2 ----------
  const svg = $("#mapSvg"), NS = "http://www.w3.org/2000/svg", W = 720, H = 520, PAD = 70;
  const sx = x => PAD + (x + 1) / 2 * (W - 2 * PAD), sy = y => PAD + (1 - (y + 1) / 2) * (H - 2 * PAD);
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
    g.addEventListener("click", pick); g.addEventListener("mouseenter", pick);
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
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

  // ---------- Plate 3 ----------
  $("#askBtn").addEventListener("click", async () => {
    const q = $("#askBox").value.trim();
    if (!q) return;
    const btn = $("#askBtn"); btn.disabled = true;
    if (!(await ensureModel($("#askStatus")))) { btn.disabled = false; return; }
    const who = conn.describe();
    $("#askStatus").textContent = conn.status.state === "ready" || conn.settings.backend !== "browser" ? "Thinking…" : "Loading model…";
    try {
      const text = await conn.chat([{ role: "system", content: SYSTEM }, { role: "user", content: q }]);
      const box = $("#answer"); box.replaceChildren();
      const label = document.createElement("span"); label.className = "who"; label.textContent = "Answered by " + who;
      box.append(label, document.createTextNode(text));
      $("#askStatus").textContent = "";
    } catch (e) {
      $("#askStatus").textContent = e.message === "no-webgpu" ? "This browser cannot run a model locally. Use the model button at the top to connect another source." : "Error: " + e.message;
    } finally { btn.disabled = false; }
  });

  return () => { alive = false; runVersion++; conn.removeEventListener('change', syncModel); };
}
