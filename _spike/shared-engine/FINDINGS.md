# SharedWorker-owned WebLLM engine: spike findings

Run: `CHROME=/path/to/chrome node drive.mjs` after `npm i puppeteer-core` in this folder.

Question: can one `SharedWorker` own the in-browser model so every tab and page
shares one loaded engine? Tested with WebLLM 0.2.85, `SmolLM2-135M-Instruct-q0f16`,
desktop Chrome on an Apple-silicon Mac, driven with puppeteer-core.

## Results
- **WebGPU works inside a SharedWorker** (`navigator.gpu` is an object there) and
  the engine loads and generates.
- **One engine across tabs.** A second tab attaches with a 0 ms "load", no
  progress events, and the engine's load counter stays at 1.
- **Survives navigation while any page stays open.** A reload of one tab,
  with a second tab open, reattached in 0 ms to the same worker.
- **Concurrent prompts from two tabs both completed.** The engine is shared, so
  requests interleave on one GPU queue; no correctness problem seen, latency
  not measured.
- **Limit: the worker dies when the last page disconnects.** The next page
  starts a fresh worker and re-reads the weights from Cache Storage (about 0.5 s
  for this 135M model; larger models take longer, with no network). It is not a
  persistent daemon.

## How it works (`worker.js`, `index.html`)
- WebLLM's `WebWorkerMLCEngineHandler` posts replies to the global scope, so each
  connecting port gets its own handler subclass that posts to that port, all
  over one shared `MLCEngine`.
- The handler's `reload` is intercepted: if the requested model is already
  loaded (compared as JSON, since WebLLM passes an array), skip the reload;
  concurrent loads of the same model share one promise.
- Progress reports are broadcast to every connected port.
- The client wraps `sharedWorker.port` in the `{postMessage, onmessage}` shape
  `CreateWebWorkerMLCEngine` expects, and filters its own control messages.
- Ports have no close event, so each page sends a `bye` on `pagehide`.

## What integrating would touch
- `BrowserSession.load` already takes an injectable `worker`; pass the port
  adapter. `stop()` must send `bye` instead of `worker.terminate()`.
- "Session-only loading" (`storage=memory`) needs its own worker name, or it
  would silently change every tab's cache mode.
- Two pages asking for different models make one engine thrash; either
  serialise per model or use one SharedWorker name per model.
- The worker's WebLLM version must match the page's (`browser-models.js`).
- `unload`/"Remove downloaded models" must tell the worker to drop the engine.
- Not tested: Firefox/Safari (WebGPU in workers is not Baseline), Edge,
  Android, a large model, or memory behaviour with many tabs.
