import { WEBLLM, appConfig, chatRequest, cleanReply } from './browser-models.js';

// Own the worker as well as the proxy. A stopped import/load must never revive
// a model after navigation. Injection keeps the lifecycle tests network-free.
export class BrowserSession {
  constructor({ runtime = () => import(WEBLLM), worker = url => new Worker(url, { type: 'module' }) } = {}) {
    this.runtime = runtime; this.createWorker = worker;
    this.engine = null; this.worker = null; this.controller = null;
  }
  stop() {
    this.controller?.abort();
    this.worker?.terminate();
    this.worker = null; this.engine = null; this.model = null;
  }
  async bounded(promise, signal, ms) {
    signal.throwIfAborted();
    let timer, abort;
    try {
      return await Promise.race([promise, new Promise((_, reject) => {
        abort = () => reject(signal.reason);
        signal.addEventListener('abort', abort, { once: true });
        timer = setTimeout(() => reject(new Error('Operation timed out; stop and try again.')), ms);
      })]);
    } finally { clearTimeout(timer); signal.removeEventListener('abort', abort); }
  }
  async load(id, { storage = 'cache', progress = () => {} } = {}) {
    this.stop();
    const controller = this.controller = new AbortController(), { signal } = controller;
    try {
      const webllm = await this.bounded(this.runtime(), signal, 30000);
      signal.throwIfAborted();
      const url = new URL('./webllm-worker.js', import.meta.url);
      url.searchParams.set('storage', storage);
      const worker = this.worker = this.createWorker(url);
      worker.addEventListener('error', e => controller.abort(new Error(e.message || 'Model worker failed.')), { once: true });
      const config = { ...appConfig(webllm.prebuiltAppConfig), cacheBackend: 'cache' };
      const engine = await this.bounded(webllm.CreateWebWorkerMLCEngine(worker, id, {
        appConfig: config, initProgressCallback: p => { if (!signal.aborted) progress(p); },
      }), signal, 240000);
      signal.throwIfAborted();
      this.model = id; this.engine = engine;
      return engine;
    } catch (error) {
      if (this.controller === controller) this.stop();
      throw error;
    }
  }
  async complete(messages, { maxTokens = 400, onText = () => {} } = {}) {
    if (!this.engine) throw new Error('Load a model first.');
    const controller = this.controller, { signal } = controller, engine = this.engine;
    const start = performance.now();
    let first = null, raw = '', usage, finishReason;
    try {
      return await this.bounded((async () => {
        await engine.resetChat();
        signal.throwIfAborted();
        const stream = await engine.chat.completions.create(chatRequest(this.model, messages, {
          max_tokens: maxTokens, stream: true, stream_options: { include_usage: true },
        }));
        for await (const chunk of stream) {
          signal.throwIfAborted();
          const delta = chunk.choices?.[0]?.delta?.content || '';
          if (delta && first === null) first = performance.now();
          raw += delta;
          onText(cleanReply(raw));
          if (chunk.usage) usage = chunk.usage;
          if (chunk.choices?.[0]?.finish_reason) finishReason = chunk.choices[0].finish_reason;
        }
        return { raw, answer: cleanReply(raw), firstTokenSeconds: first === null ? null : (first - start) / 1000,
          seconds: (performance.now() - start) / 1000, usage, finishReason };
      })(), signal, 90000);
    } catch (error) {
      if (this.controller === controller) this.stop();
      throw error;
    }
  }
}
