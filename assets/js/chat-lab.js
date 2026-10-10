import { copyText, putCopy, putText } from './copy.js';
import { BROWSER_MODELS, DEFAULT_BROWSER_MODEL, WEBLLM, WASM_REVISION } from './browser-models.js?v=prose-labs-1';
import { BrowserSession } from './browser-session.js?v=prose-labs-2';
import { CASES, SYSTEM, pageContext, canSend } from './lab-protocol.js?v=lab-send-1';

export function mount(root, { conn, openSettings }) {
  const $ = selector => root.querySelector(selector), events = new AbortController();
  const session = new BrowserSession();
  const loading = $('[data-loading]');
  const chip = document.querySelector('#connChip');
  conn.unload(); conn.emit();
  chip.disabled = true;
  const evidence = { runtime: WEBLLM, wasmRevision: WASM_REVISION, protocol: 'plain-page-full-replay-v1',
    temperature: 0, seed: 42, started: new Date().toISOString(), runs: [] };
  let disposed = false, busy = false, epoch = 0, context = null, history = [], run = null, exportUrl = null;
  const on = (element, event, fn) => element.addEventListener(event, fn, { signal: events.signal });
  const status = (text, vars) => {
    if (disposed) return;
    if (text.startsWith('lab_chat.')) putCopy($('[data-status]'), text, vars);
    else putText($('[data-status]'), text);
    if (loading.open) {
      if (text.startsWith('lab_chat.')) putCopy($('[data-loading-status]'), text, vars);
      else putText($('[data-loading-status]'), text);
    }
  };
  const model = () => BROWSER_MODELS.find(m => m.id === $('[data-model]').value);
  const seconds = n => n == null ? '—' : n.toFixed(2) + ' s';
  const sendAllowed = () => canSend({ prompt: $('[data-prompt]').value, busy,
    grounded: $('[data-grounded]').checked, contextReady: !!context });
  function closeLoading() { if (loading.open) loading.close(); }
  function showLoading() {
    putText($('[data-loading-title]'), 'Loading ' + model().label);
    putCopy($('[data-loading-size]'), $('[data-storage]').value === 'memory'
      ? 'lab_chat.loading_memory' : 'lab_chat.loading_cache', {note:model().note});
    putText($('[data-loading-status]'), 'Preparing the model…');
    $('[data-loading-progress]').removeAttribute('value');
    loading.showModal();
  }
  function controls() {
    const selected = model();
    if (selected) putCopy($('[data-model-note]'), 'runtime_settings.model_size', {label:selected.label, mb:selected.mb,
      vram:(selected.vram / 1000).toFixed(2), finding:selected.finding});
    for (const name of ['model', 'storage', 'load', 'smoke', 'grounded', 'clear']) $(`[data-${name}]`).disabled = busy;
    for (const button of root.querySelectorAll('[data-try]')) button.disabled = busy;
    $('[data-send]').disabled = !sendAllowed();
    if (busy) putText($('[data-send]'), 'Please wait…');
    else putCopy($('[data-send]'), 'lab_chat.send');
    $('[data-stop]').disabled = !busy && !session.engine;
  }
  function message(target, role, text) {
    const entry = document.createElement('div'), label = document.createElement('small'), body = document.createElement('p');
    entry.className = 'lab-message'; body.dataset.evidence = 'lab-conversation';
    if (role === 'lab_chat.review_label') putCopy(label, role); else label.textContent = role;
    body.textContent = text;
    entry.append(label, body); target.append(entry);
    target.scrollTop = target.scrollHeight;
    return { entry, body };
  }
  function resetConversation() { history = []; $('[data-chat]').replaceChildren(); }
  function stop(text = 'lab_chat.stopped', vars) {
    epoch++; session.stop(); busy = false; history = [];
    $('[data-progress]').hidden = true; controls(); closeLoading(); status(text, vars);
  }
  function copyError(key, vars) {
    return Object.assign(new Error(copyText(key, vars)), {copyKey:key, copyVars:vars});
  }
  function errorText(error) {
    if (/quota/i.test(String(error))) return copyText('lab_chat.quota');
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
        session.stop(); history = [];
        if (/quota/i.test(String(error))) status('lab_chat.quota');
        else if (error.copyKey) status(error.copyKey, error.copyVars);
        else status(errorText(error));
      }
    } finally {
      if (token === epoch && !disposed) { busy = false; $('[data-progress]').hidden = true; controls(); closeLoading(); }
    }
  }
  function check(token) { if (disposed || token !== epoch) throw new DOMException('Stopped', 'AbortError'); }
  async function load(token) {
    if (!navigator.gpu) throw copyError('lab_chat.no_webgpu');
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
      if (Number.isFinite(p.progress)) $('[data-loading-progress]').value = Math.max(0, Math.min(1, p.progress));
    } });
    check(token);
    run.loadSeconds = (performance.now() - start) / 1000;
    $('[data-progress]').hidden = true;
    status('lab_chat.loaded', {label:selected.label, seconds:seconds(run.loadSeconds)});
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
    if (expected) message(target, 'lab_chat.review_label', expected);
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
    const heading = document.createElement('h3'); heading.textContent = m.label; heading.dataset.proseRole = 'microcopy';
    const finding = document.createElement('p'); finding.className = 'lab-finding'; putCopy(finding, 'model_findings.' + m.reviewKey);
    const stats = document.createElement('dl');
    for (const [label, value] of [
      ['lab_chat.weight_label', `${m.mb} MB / ~${(m.vram / 1000).toFixed(2)} GB`],
      ['Observed load', seconds(m.load)], ['lab_chat.timing_label', `${seconds(m.firstToken)} / ${seconds(m.reply)}`],
      ['Median decode speed', m.tokensPerSecond == null ? 'lab_chat.invalid_speed' : m.tokensPerSecond.toFixed(1) + ' tokens/s'],
    ]) {
      const dt = document.createElement('dt'), dd = document.createElement('dd');
      if (label.startsWith('lab_chat.')) putCopy(dt, label); else dt.textContent = label;
      if (value === 'lab_chat.invalid_speed') putCopy(dd, value); else dd.textContent = value;
      stats.append(dt, dd);
    }
    const review = document.createElement('p'); putCopy(review, 'reviews.' + m.reviewKey);
    const footer = document.createElement('div'); footer.className = 'lab-card-footer';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'btn ghost'; button.dataset.try = m.id; button.textContent = 'Try this model';
    on(button, 'click', () => {
      stop('lab_chat.selected', {label:m.label}); resetConversation();
      $('[data-model]').value = m.id; $('#lab-workbench').scrollIntoView({ block: 'start' }); $('[data-prompt]').focus({ preventScroll: true });
      controls();
    });
    const link = document.createElement('a'); link.href = `https://huggingface.co/mlc-ai/${m.id}/tree/${m.revision}`; link.textContent = 'Pinned build ↗';
    footer.append(button, link); card.append(heading, finding, stats, review, footer); $('[data-cards]').append(card);
  }
  $('[data-model]').value = DEFAULT_BROWSER_MODEL;
  on($('[data-load]'), 'click', () => work(load));
  on($('[data-stop]'), 'click', () => stop());
  on(document, 'site:chat-start', () => stop('lab_chat.site_chat'));
  const cancelLoad = () => stop('lab_chat.cancelled');
  on($('[data-cancel-load]'), 'click', cancelLoad);
  on(loading, 'cancel', event => { event.preventDefault(); cancelLoad(); });
  on($('[data-prompt]'), 'input', controls);
  for (const name of ['model', 'storage']) on($(`[data-${name}]`), 'change', () => { stop('lab_chat.selection_changed'); resetConversation(); });
  for (const [name, event] of [['clear', 'click'], ['grounded', 'change']]) on($(`[data-${name}]`), event, () => { resetConversation(); controls(); status('New conversation.'); });
  on($('[data-form]'), 'submit', event => {
    event.preventDefault();
    const prompt = $('[data-prompt]').value.trim();
    if (!sendAllowed()) return;
    if (history.length >= 13) { status('lab_chat.bounded'); return; }
    work(async token => {
      const grounded = $('[data-grounded]').checked;
      if (grounded && !context) throw copyError('lab_chat.missing_context');
      if (!session.engine) {
        showLoading();
        try { await load(token); check(token); }
        catch (error) {
          if (error.name === 'AbortError') throw error;
          throw copyError('lab_chat.not_sent', {error:errorText(error)});
        } finally { if (token === epoch) closeLoading(); }
      }
      check(token);
      if (!history.length) history = [{ role: 'system', content: grounded ? SYSTEM : copyText('lab_prompt.ungrounded') }];
      const content = history.length === 1 && grounded ? context + '\n\nQUESTION: ' + prompt : prompt;
      history.push({ role: 'user', content }); $('[data-prompt]').value = '';
      const result = await reply(history, prompt, $('[data-chat]'), token);
      history.push({ role: 'assistant', content: result.answer });
      status('lab_chat.complete');
    });
  });
  on($('[data-smoke]'), 'click', () => work(async token => {
    if (!context) throw copyError('lab_chat.missing_context');
    await load(token); check(token);
    const target = $('[data-tests]'); putText(target); target.closest('details').open = true;
    let conversation = [{ role: 'system', content: copyText('lab_prompt.ungrounded') }];
    for (const test of CASES) {
      check(token); status(model().label + ' · ' + test.id);
      if (test.id === 'metadata') conversation = [{ role: 'system', content: SYSTEM }, { role: 'user', content: context + '\n\nQUESTION: ' + test.question }];
      else conversation.push({ role: 'user', content: test.question });
      const result = await reply(conversation, test.question, target, token, test.tokens, test.expected);
      conversation.push({ role: 'assistant', content: result.answer });
    }
    status('lab_chat.smoke_complete');
  }));
  on($('[data-export]'), 'click', () => {
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    exportUrl = URL.createObjectURL(new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' }));
    const a = $('[data-save]'); a.href = exportUrl; a.hidden = false; a.click();
    status('lab_chat.exported');
  });
  on($('[data-settings]'), 'click', () => { stop('lab_chat.settings'); openSettings(); });
  // Back/forward snapshots must not persist a visitor's conversation in HTMX storage.
  on(document.body, 'htmx:beforeHistorySave', () => { $('[data-chat]').replaceChildren(); putText($('[data-tests]')); $('[data-prompt]').value = ''; });
  fetch(root.dataset.contextUrl, { signal: events.signal }).then(async response => {
    if (!response.ok) throw new Error('Article context HTTP ' + response.status);
    const page = await response.json();
    if (!page.content || !page.title) throw copyError('lab_chat.missing_article');
    if (disposed) return;
    evidence.page = page; context = pageContext(page); $('[data-context]').textContent = context;
    status(navigator.gpu ? 'lab_chat.ready' : 'lab_chat.unavailable');
    controls();
  }).catch(error => { if (!disposed) {
    if (error.copyKey) status(error.copyKey, error.copyVars); else status(errorText(error));
  } });
  controls();
  return () => {
    disposed = true; epoch++; events.abort(); session.stop(); closeLoading();
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    chip.disabled = false;
    history = []; evidence.runs.length = 0;
  };
}
