import { copyText, putCopy, putText } from './copy.js?v=prose-scripts-1';
import { canSend } from './lab-protocol.js?v=lab-send-1';

// Bound excerpts and retain complete recent turns for the small browser models.
export function chatMessages(history, prompt, page) {
  let instructions = copyText('prompt.chat_identity');
  if (page) {
    instructions += copyText('prompt.chat_page');
    // Quote the reference separately, keeping the visitor's message a plain question.
    const excerpt = { title: page.title.slice(0, 200), url: page.url.slice(0, 300), excerpt: page.content.slice(0, 4800) };
    instructions += copyText('prompt.chat_reference', {excerpt: JSON.stringify(excerpt)});
  }
  const recent = history.slice(-12).map(message => ({ ...message }));
  while (recent.length && recent.reduce((n, m) => n + m.content.length, prompt.length) > 4000) recent.splice(0, 2);
  return [{ role: 'system', content: instructions }, ...recent, { role: 'user', content: prompt }];
}

export function readPage(doc, location) {
  const main = doc.querySelector('#page main');
  const content = (main?.querySelector('article') || main)?.cloneNode(true);
  // Never include entered form values, chat transcripts, scripts or hidden data.
  content?.querySelectorAll('script, style, noscript, form, input, textarea, select, button, nav, svg, [hidden], [aria-hidden="true"], [data-chat], [data-tests], [data-context], #answer').forEach(node => node.remove());
  return { title: main?.querySelector('[data-app="courses"]') ? doc.title : main?.dataset.chatTitle || doc.title,
    url: location.origin + location.pathname + location.hash,
    content: (content?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 4800) };
}

export function mountChat(dialog, { conn, openSettings }) {
  const $ = selector => dialog.querySelector(selector), prompt = $('[data-chat-prompt]');
  let history = [], controller = null, page = null, identity = '', version = 0;
  const status = (key, vars) => putCopy($('[data-chat-status]'), key, vars);
  const modelKey = () => JSON.stringify([conn.settings.backend, conn.settings.browserModel, conn.settings.browserStorage, conn.settings.openrouterModel, conn.settings.customUrl, conn.settings.customModel]);
  function controls() {
    $('[data-chat-send]').disabled = !canSend({ prompt: prompt.value, busy: !!controller, grounded: false });
    $('[data-chat-send]').textContent = controller ? 'Please wait…' : 'Send';
    for (const name of ['reset', 'context', 'settings']) $(`[data-chat-${name}]`).disabled = !!controller;
    $('[data-chat-stop]').hidden = !controller;
    prompt.readOnly = !!controller;
  }
  function bubble(role, text) {
    const item = document.createElement('div'); item.className = 'site-chat-message ' + role;
    const label = document.createElement('strong'); label.textContent = role === 'user' ? 'You' : 'AI assistant';
    const body = document.createElement('p'); body.textContent = text;
    item.append(label, body); $('[data-chat-log]').append(item);
    return body;
  }
  function render() {
    $('[data-chat-log]').replaceChildren();
    for (const message of history) bubble(message.role, message.content);
    $('[data-chat-empty]').hidden = history.length > 0;
    scrollReply();
  }
  function scrollReply() {
    const transcript = $('.site-chat-transcript');
    transcript.scrollTop = transcript.scrollHeight;
  }
  function stop() {
    ++version; controller?.abort(); controller = null;
    $('[data-chat-progress]').hidden = true;
    render(); controls();
  }
  function reset() { stop(); history = []; render(); status('runtime_chat.new_conversation'); }
  function paintModel() {
    const key = modelKey();
    const changed = identity && identity !== key;
    identity = key;
    if (changed) reset();
    $('[data-chat-model]').textContent = conn.describe();
    putCopy($('[data-chat-privacy]'), conn.settings.backend === 'browser'
      ? 'runtime_chat.privacy_browser'
      : conn.settings.backend === 'openrouter'
        ? 'runtime_chat.privacy_openrouter'
        : 'runtime_chat.privacy_custom');
    if (controller && conn.status.state === 'loading') {
      status('runtime_chat.loading_progress', {progress: conn.status.text});
      $('[data-chat-progress]').hidden = false;
      $('[data-chat-progress]').value = conn.status.progress || 0;
    } else if (controller && conn.status.state === 'ready') {
      $('[data-chat-progress]').hidden = true; status('runtime_chat.thinking');
    }
  }
  function refreshPage() {
    const next = readPage(document, location);
    if (page && (page.url !== next.url || page.title !== next.title)) { reset(); prompt.value = ''; }
    page = next;
    $('[data-chat-page]').textContent = page.title;
    if (page.content) putText($('[data-chat-excerpt]'), page.content);
    else putCopy($('[data-chat-excerpt]'), 'runtime_chat.no_excerpt');
  }
  $('#site-chat-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (!canSend({ prompt: prompt.value, busy: !!controller, grounded: false })) return;
    if (conn.settings.backend !== 'browser' && !conn.ready()) {
      status('runtime_chat.setup'); return;
    }
    const question = prompt.value.trim(), token = ++version;
    const request = controller = new AbortController();
    // The Lab owns an independent experimental worker. Release it before the
    // shared site connection loads; do not consume GPU memory twice in this tab.
    document.dispatchEvent(new Event('site:chat-start'));
    controls(); $('[data-chat-empty]').hidden = true;
    bubble('user', question); const reply = bubble('assistant', '…');
    status(conn.ready() ? 'runtime_chat.thinking' : 'runtime_chat.waiting');
    const timer = setTimeout(() => request.abort(new Error(copyText('runtime_chat.timeout'))), 300000);
    try {
      const answer = await conn.chat(chatMessages(history, question, $('[data-chat-context]').checked ? page : null), {
        signal: request.signal, temperature: 0.3, maxTokens: 450,
        onText: text => {
          if (token !== version) return;
          reply.textContent = text || '…'; status('runtime_chat.replying');
          scrollReply();
        },
      });
      if (token !== version) return;
      if (!answer?.trim()) throw new Error(copyText('runtime_chat.empty_reply'));
      history.push({ role: 'user', content: question }, { role: 'assistant', content: answer });
      history = history.slice(-12); prompt.value = ''; render();
      status('runtime_chat.complete');
    } catch (error) {
      if (token === version) { render(); status('runtime_chat.failed', {error: conn.status.state === 'error' ? conn.status.text : error.message}); }
    } finally {
      clearTimeout(timer);
      if (token === version) { controller = null; $('[data-chat-progress]').hidden = true; controls(); prompt.focus(); }
    }
  });
  prompt.addEventListener('input', controls);
  $('[data-chat-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (controller) { stop(); status('runtime_chat.stopped'); } });
  $('[data-chat-stop]').addEventListener('click', () => { stop(); status('runtime_chat.stopped'); });
  $('[data-chat-reset]').addEventListener('click', reset);
  $('[data-chat-context]').addEventListener('change', reset);
  $('[data-chat-settings]').addEventListener('click', () => {
    dialog.close(); document.dispatchEvent(new Event('site:chat-start')); openSettings();
  });
  conn.addEventListener('change', paintModel);
  document.body.addEventListener('htmx:beforeSwap', () => { dialog.close(); reset(); prompt.value = ''; page = null; });
  window.addEventListener('hashchange', () => { dialog.close(); reset(); prompt.value = ''; page = null; });
  document.querySelector('#chatBtn').addEventListener('click', () => {
    refreshPage(); paintModel(); controls(); dialog.showModal(); prompt.focus();
  });
  paintModel(); controls();
}
