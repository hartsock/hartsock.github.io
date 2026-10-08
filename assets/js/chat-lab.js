import { BROWSER_MODELS, DEFAULT_BROWSER_MODEL, WEBLLM, WASM_REVISION } from './browser-models.js';
import { BrowserSession } from './browser-session.js';
import { CASES, SYSTEM, pageContext } from './lab-protocol.js';

export function mount(root, { conn, openSettings }) {
  const $ = selector => root.querySelector(selector), events = new AbortController();
  const session = new BrowserSession();
  const chip = document.querySelector('#connChip');
  conn.unload(); conn.emit();
  chip.disabled = true;
  const evidence = { runtime: WEBLLM, wasmRevision: WASM_REVISION, protocol: 'plain-page-full-replay-v1',
    temperature: 0, seed: 42, started: new Date().toISOString(), runs: [] };
  let disposed = false, busy = false, epoch = 0, context = null, history = [], run = null, exportUrl = null;
  const on = (element, event, fn) => element.addEventListener(event, fn, { signal: events.signal });
  const status = text => { if (!disposed) $('[data-status]').textContent = text; };
  const model = () => BROWSER_MODELS.find(m => m.id === $('[data-model]').value);
  const seconds = n => n == null ? '—' : n.toFixed(2) + ' s';
  function controls() {
    const selected = model();
    if (selected) $('[data-model-note]').textContent = `${selected.label}: ${selected.mb} MB weights; estimated GPU memory ${(selected.vram / 1000).toFixed(2)} GB, plus browser and session-cache overhead. ${selected.finding}.`;
    for (const name of ['model', 'storage', 'load', 'smoke', 'grounded', 'clear']) $(`[data-${name}]`).disabled = busy;
    for (const button of root.querySelectorAll('[data-try]')) button.disabled = busy;
    $('[data-send]').disabled = busy || !session.engine || (!$('[data-grounded]').checked ? false : !context);
    $('[data-stop]').disabled = !busy && !session.engine;
  }
  function message(target, role, text) {
    const entry = document.createElement('div'), label = document.createElement('small'), body = document.createElement('p');
    entry.className = 'lab-message'; label.textContent = role; body.textContent = text;
    entry.append(label, body); target.append(entry);
    target.scrollTop = target.scrollHeight;
    return { entry, body };
  }
  function resetConversation() { history = []; $('[data-chat]').replaceChildren(); }
  function stop(text = 'Stopped. Model worker released; results retained until you leave.') {
    epoch++; session.stop(); busy = false; history = [];
    $('[data-progress]').hidden = true; controls(); status(text);
  }
  function errorText(error) {
    if (/quota/i.test(String(error))) return 'Browser storage refused the model download. Try session-only mode or a smaller model. The displayed quota is not a guarantee.';
    return error.name === 'AbortError' ? 'Stopped.' : String(error.message || error);
  }
  async function work(task) {
    if (busy || disposed) return;
    const token = ++epoch;
    busy = true; controls();
    try { await task(token); }
    catch (error) {
      if (token === epoch && !disposed) {
        if (run) run.error = String(error);
        session.stop(); history = []; status(errorText(error));
      }
    } finally {
      if (token === epoch && !disposed) { busy = false; $('[data-progress]').hidden = true; controls(); }
    }
  }
  function check(token) { if (disposed || token !== epoch) throw new DOMException('Stopped', 'AbortError'); }
  async function load(token) {
    if (!navigator.gpu) throw new Error('WebGPU is unavailable. Try desktop Chrome or Edge, or choose another source in Model settings.');
    const selected = model();
    // The site's normal connection may have been used through the alternatives dialog.
    conn.unload(); conn.emit();
    resetConversation();
    run = { model: selected.id, revision: selected.revision, storage: $('[data-storage]').value,
      started: new Date().toISOString(), replies: [] };
    evidence.runs.push(run);
    // Bound retained data on long test visits. Export before running more trials.
    if (evidence.runs.length > 20) evidence.runs.shift();
    const start = performance.now();
    status('Starting ' + selected.label + '…');
    $('[data-progress]').hidden = false;
    await session.load(selected.id, { storage: run.storage, progress: p => {
      if (token !== epoch || disposed) return;
      status(selected.label + ': ' + (p.text || 'Loading…'));
      $('[data-progress]').value = p.progress || 0;
    } });
    check(token);
    run.loadSeconds = (performance.now() - start) / 1000;
    $('[data-progress]').hidden = true;
    status(selected.label + ' ready in ' + seconds(run.loadSeconds) + '. Answers are experimental; check them against the page.');
  }
  async function reply(messages, question, target, token, maxTokens = 400, expected = null) {
    message(target, 'You', question);
    const view = message(target, model().label, '…');
    const result = await session.complete(messages, { maxTokens, onText: text => {
      if (!disposed && token === epoch) view.body.textContent = text || '…';
    } });
    check(token);
    view.body.textContent = result.answer || '[No usable answer returned]';
    const timing = document.createElement('small'); timing.className = 'lab-timing';
    timing.textContent = `First token ${seconds(result.firstTokenSeconds)} · total ${seconds(result.seconds)}${result.finishReason === 'length' ? ' · token limit reached' : ''}`;
    view.entry.append(timing);
    if (expected) message(target, 'Review guide · not an automatic score', expected);
    run.replies.push({ question, grounded: messages[0]?.content === SYSTEM,
      expected, ...result });
    if (run.replies.length > 60) run.replies.shift();
    return result;
  }

  $('[data-model]').replaceChildren(); $('[data-cards]').replaceChildren();
  for (const m of BROWSER_MODELS) {
    const option = document.createElement('option'); option.value = m.id; option.textContent = `${m.label} · ${m.note}`;
    $('[data-model]').append(option);
    const card = document.createElement('article'); card.className = 'lab-card';
    const heading = document.createElement('h3'); heading.textContent = m.label;
    const finding = document.createElement('p'); finding.className = 'lab-finding'; finding.textContent = m.finding;
    const stats = document.createElement('dl');
    for (const [label, value] of [
      ['Weight download / estimated GPU memory', `${m.mb} MB / ~${(m.vram / 1000).toFixed(2)} GB`],
      ['Observed load', seconds(m.load)], ['Median first token / complete reply', `${seconds(m.firstToken)} / ${seconds(m.reply)}`],
      ['Median decode speed', m.tokensPerSecond == null ? 'Invalid output; no useful speed score' : m.tokensPerSecond.toFixed(1) + ' tokens/s'],
    ]) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = label; dd.textContent = value; stats.append(dt, dd); }
    const review = document.createElement('p'); review.textContent = m.review;
    const footer = document.createElement('div'); footer.className = 'lab-card-footer';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'btn ghost'; button.dataset.try = m.id; button.textContent = 'Try this model';
    on(button, 'click', () => {
      stop('Selected ' + m.label + '. Press Load model to begin.'); resetConversation();
      $('[data-model]').value = m.id; $('#lab-workbench').scrollIntoView({ block: 'start' }); $('[data-load]').focus({ preventScroll: true });
      controls();
    });
    const link = document.createElement('a'); link.href = `https://huggingface.co/mlc-ai/${m.id}/tree/${m.revision}`; link.textContent = 'Pinned build ↗';
    footer.append(button, link); card.append(heading, finding, stats, review, footer); $('[data-cards]').append(card);
  }
  $('[data-model]').value = DEFAULT_BROWSER_MODEL;
  on($('[data-load]'), 'click', () => work(load));
  on($('[data-stop]'), 'click', () => stop());
  for (const name of ['model', 'storage']) on($(`[data-${name}]`), 'change', () => { stop('Selection changed. Press Load model to begin.'); resetConversation(); });
  for (const [name, event] of [['clear', 'click'], ['grounded', 'change']]) on($(`[data-${name}]`), event, () => { resetConversation(); controls(); status('New conversation.'); });
  on($('[data-form]'), 'submit', event => {
    event.preventDefault();
    const prompt = $('[data-prompt]').value.trim();
    if (!prompt || !session.engine || busy) return;
    if (history.length >= 13) { status('Start a new conversation to keep this small model’s context bounded.'); return; }
    work(async token => {
      const grounded = $('[data-grounded]').checked;
      if (grounded && !context) throw new Error('The sample article has not loaded.');
      if (!history.length) history = [{ role: 'system', content: grounded ? SYSTEM : 'You are a helpful concise assistant.' }];
      const content = history.length === 1 && grounded ? context + '\n\nQUESTION: ' + prompt : prompt;
      history.push({ role: 'user', content }); $('[data-prompt]').value = '';
      const result = await reply(history, prompt, $('[data-chat]'), token);
      history.push({ role: 'assistant', content: result.answer });
      status('Reply complete. Compare factual claims with the source; use New conversation if context fills up.');
    });
  });
  on($('[data-smoke]'), 'click', () => work(async token => {
    if (!context) throw new Error('The sample article has not loaded.');
    await load(token); check(token);
    const target = $('[data-tests]'); target.replaceChildren(); target.closest('details').open = true;
    let conversation = [{ role: 'system', content: 'You are a helpful concise assistant.' }];
    for (const test of CASES) {
      check(token); status(model().label + ' · ' + test.id);
      if (test.id === 'metadata') conversation = [{ role: 'system', content: SYSTEM }, { role: 'user', content: context + '\n\nQUESTION: ' + test.question }];
      else conversation.push({ role: 'user', content: test.question });
      const result = await reply(conversation, test.question, target, token, test.tokens, test.expected);
      conversation.push({ role: 'assistant', content: result.answer });
    }
    status('Six replies recorded. Read the answers against the review guide—completion is not a passing score.');
  }));
  on($('[data-export]'), 'click', () => {
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    exportUrl = URL.createObjectURL(new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' }));
    const a = $('[data-save]'); a.href = exportUrl; a.hidden = false; a.click();
    status('JSON export prepared. If the download did not start, choose Save prepared JSON. It includes your prompts and replies.');
  });
  on($('[data-settings]'), 'click', () => { stop('Lab stopped. Use Model settings to choose another source for the site.'); openSettings(); });
  // Back/forward snapshots must not persist a visitor's conversation in HTMX storage.
  on(document.body, 'htmx:beforeHistorySave', () => { $('[data-chat]').replaceChildren(); $('[data-tests]').replaceChildren(); $('[data-prompt]').value = ''; });
  fetch(root.dataset.contextUrl, { signal: events.signal }).then(async response => {
    if (!response.ok) throw new Error('Article context HTTP ' + response.status);
    const page = await response.json();
    if (!page.content || !page.title) throw new Error('Article context is missing.');
    if (disposed) return;
    evidence.page = page; context = pageContext(page); $('[data-context]').textContent = context;
    status(navigator.gpu ? 'Ready. Choose Load model or Run smoke test. Nothing has downloaded.' : 'WebGPU is unavailable. Try desktop Chrome or Edge, or another source.');
    controls();
  }).catch(error => { if (!disposed) status(errorText(error)); });
  controls();
  return () => {
    disposed = true; epoch++; events.abort(); session.stop();
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    chip.disabled = false;
    history = []; evidence.runs.length = 0;
  };
}
