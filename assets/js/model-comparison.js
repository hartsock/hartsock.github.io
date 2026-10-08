import { BROWSER_MODELS, WEBLLM, WASM_REVISION } from './browser-models.js';
import { BrowserSession } from './browser-session.js?v=model-comparison-1';
import { isEndToken } from './next-word.js';

// One worker at a time, independent of the visitor's saved site model choice.
export async function compareModels(session, models, prompt, { signal = new AbortController().signal,
  steps = 8, storage = 'memory', onUpdate = () => {}, onProgress = () => {} } = {}) {
  const stop = () => session.stop();
  signal.addEventListener('abort', stop, { once: true });
  try {
    for (const [index, model] of models.entries()) {
      signal.throwIfAborted(); session.stop();
      const run = { index, model: model.id, label: model.label, revision: model.revision,
        prompt, completion: '', steps: [], storage, started: new Date().toISOString(), status: 'loading' };
      onUpdate(run);
      const start = performance.now();
      try {
        await session.load(model.id, { storage, progress: p => { if (!signal.aborted) onProgress(index, p); } });
        signal.throwIfAborted(); run.loadSeconds = (performance.now() - start) / 1000;
        run.status = 'running'; onUpdate(run);
        for (let i = 0; i < steps; i++) {
          signal.throwIfAborted();
          const context = prompt + run.completion, candidates = await session.nextWord(context);
          signal.throwIfAborted();
          if (!candidates?.length) throw new Error('This model did not return next-token odds.');
          const chosen = candidates[0].token;
          run.steps.push({ context, chosen, candidates });
          run.ended = isEndToken(chosen);
          if (!run.ended) run.completion += chosen;
          onUpdate(run);
          if (run.ended) break;
        }
        run.status = 'done';
      } catch (error) {
        signal.throwIfAborted();
        run.status = 'error'; run.error = String(error.message || error);
      } finally { session.stop(); }
      signal.throwIfAborted();
      run.seconds = (performance.now() - start) / 1000; onUpdate(run);
    }
  } finally { signal.removeEventListener('abort', stop); session.stop(); }
}

export function mount(root, { conn }) {
  const $ = s => root.querySelector(s), cards = [...root.querySelectorAll('[data-comparison-card]')];
  const events = new AbortController();
  const chip = document.querySelector('#connChip');
  const on = (el, event, action) => el.addEventListener(event, action, { signal: events.signal });
  let session, controller = null, disposed = false, runs = [], step = 0, exportUrl;
  const status = text => { $('[data-status]').textContent = text; };
  const tokenText = token => token.replace(/\n+/g, ' ↵ ') || '[empty token]';
  function controls() {
    for (const el of root.querySelectorAll('select, input, [data-run]')) el.disabled = !!controller;
    $('[data-run]').disabled = !!controller || !navigator.gpu || !$('[data-opening]').value.trim();
    $('[data-stop]').disabled = !controller;
    $('[data-export]').disabled = !runs.length || !!controller;
    const length = Math.max(0, ...runs.map(r => r?.steps.length || 0));
    $('[data-back]').disabled = step <= 0; $('[data-next]').disabled = step >= length - 1;
    $('[data-step]').textContent = length ? `Token ${step + 1} of ${length}` : 'Run a comparison to inspect the odds.';
  }
  function render(index) {
    const card = cards[index], run = runs[index];
    if (!run) return;
    card.querySelector('[data-result-title]').textContent = run.label;
    card.querySelector('[data-prefix]').textContent = run.prompt;
    card.querySelector('[data-completion]').textContent = tokenText(run.completion || ' …');
    card.querySelector('[data-provenance]').textContent = `${run.origin === 'recorded' ? 'Recorded Chrome trial · ' + run.started.slice(0, 10) : 'Live trial'} · ${run.status}${run.ended ? ' · end token' : ''}${run.error ? ': ' + run.error : ''}`;
    const odds = card.querySelector('[data-odds]'); odds.replaceChildren();
    const at = run.steps[step];
    if (at) {
      const context = document.createElement('p'); context.className = 'lab-note';
      context.textContent = 'Next token after: ' + at.context; odds.append(context);
      let mass = 0;
      const list = document.createElement('ul'); list.className = 'comparison-odds';
      for (const c of at.candidates) {
        const probability = Math.max(0, Math.min(1, Math.exp(c.logprob))); mass += probability;
        const row = document.createElement('li'), label = document.createElement('span'), track = document.createElement('span');
        const bar = document.createElement('span'), pct = document.createElement('span');
        label.textContent = tokenText(c.token); label.title = JSON.stringify(c.token);
        track.className = 'comparison-track'; bar.style.width = `${probability * 100}%`; track.append(bar);
        pct.textContent = probability < .001 ? '<0.1%' : (probability * 100).toFixed(1) + '%';
        row.append(label, track, pct); list.append(row);
      }
      const other = document.createElement('p'); other.className = 'lab-note';
      other.textContent = `Other tokens: ${(Math.max(0, 1 - mass) * 100).toFixed(1)}%. Bars are not rescaled to sum to 100%.`;
      odds.append(list, other);
    } else if (run.status === 'done') odds.textContent = 'This model ended before this step.';
    controls();
  }
  function stop(message = 'Stopped. Completed and partial results remain below.') {
    controller?.abort(); controller = null; session?.stop();
    for (const r of runs) if (['loading', 'running', 'queued'].includes(r.status)) { r.status = 'stopped'; render(r.index); }
    $('[data-progress]').hidden = true; controls(); status(message);
  }
  cards.forEach((card, index) => {
    const select = card.querySelector('select');
    select.replaceChildren(...BROWSER_MODELS.map(m => new Option(`${m.label} · ${m.note}`, m.id)));
    select.value = card.dataset.modelId;
    on(select, 'change', () => {
      card.querySelector('[data-selection-note]').textContent = 'Selected for the next run. The result below has not changed.';
    });
  });
  on($('[data-opening]'), 'input', controls);
  on($('[data-form]'), 'submit', async event => {
    event.preventDefault(); if (controller || !navigator.gpu) return;
    const prompt = $('[data-opening]').value.trim(); if (!prompt) return;
    const models = cards.map(c => BROWSER_MODELS.find(m => m.id === c.querySelector('select').value));
    const request = controller = new AbortController(); step = 0;
    const trial = session = new BrowserSession();
    conn.unload(); conn.emit(); chip.disabled = true;
    runs = models.map((m, index) => ({ index, label: m.label, model: m.id, revision: m.revision, prompt, completion: '', steps: [], status: 'queued' }));
    cards.forEach((c, index) => { c.querySelector('[data-selection-note]').textContent = ''; render(index); });
    $('[data-progress]').hidden = false;
    status('Running one model at a time. You can stop and keep partial results.'); controls();
    try {
      await compareModels(trial, models, prompt, { signal: request.signal,
        storage: $('[data-storage]').value,
        onUpdate: run => {
          if (disposed || controller !== request) return;
          runs[run.index] = structuredClone(run); render(run.index);
          status(`${run.index + 1} of 3 · ${run.label} · ${run.status}`);
        },
        onProgress: (index, p) => {
          if (disposed || controller !== request) return;
          $('[data-progress]').value = p.progress || 0;
          status(`${index + 1} of 3 · ${models[index].label}: ${p.text || 'Loading…'}`);
        },
      });
      if (!disposed && controller === request) status('Comparison finished. All model workers released. Inspect the results—not a quality ranking.');
    } catch (error) {
      if (!disposed && controller === request) status(error.message || 'Stopped.');
    } finally {
      if (controller === request) { controller = null; chip.disabled = false; $('[data-progress]').hidden = true; controls(); }
    }
  });
  on($('[data-stop]'), 'click', () => { stop(); chip.disabled = false; });
  on(document, 'site:chat-start', () => { stop('Comparison stopped so site Chat can use the GPU.'); chip.disabled = false; });
  for (const [selector, delta] of [['[data-back]', -1], ['[data-next]', 1]]) on($(selector), 'click', () => { step += delta; runs.forEach((_, i) => render(i)); });
  on($('[data-export]'), 'click', () => {
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    exportUrl = URL.createObjectURL(new Blob([JSON.stringify({ protocol: 'next-token-t1-greedy-v1',
      runtime: WEBLLM, wasmRevision: WASM_REVISION, measurementTemperature: 1, maxSteps: 8, runs }, null, 2)], { type: 'application/json' }));
    const a = $('[data-save]'); a.href = exportUrl; a.hidden = false; a.click();
  });
  on(document.body, 'htmx:beforeHistorySave', () => {
    $('[data-opening]').value = '';
    for (const el of root.querySelectorAll('[data-prefix], [data-completion], [data-odds]')) el.replaceChildren();
  });
  fetch(root.dataset.captureUrl, { signal: events.signal }).then(async response => {
    if (!response.ok) throw new Error('Capture unavailable');
    const capture = await response.json();
    if (disposed || runs.length || controller) return;
    runs = capture.runs;
    runs.forEach((run, index) => { run.origin = 'recorded'; render(index); });
    status('Recorded Chrome comparison loaded. Inspect the odds now—no model download needed. Run your own trial to compare on your hardware.');
  }).catch(() => { /* Keep the attributed, completion-only HTML fallback. */ });
  controls();
  if (!navigator.gpu) status('The earlier observations are readable here. Live comparison needs WebGPU in a compatible browser.');
  return () => {
    disposed = true; controller?.abort(); session?.stop(); events.abort(); chip.disabled = false;
    if (exportUrl) URL.revokeObjectURL(exportUrl); runs = [];
  };
}
