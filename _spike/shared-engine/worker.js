// SPIKE: one WebLLM engine owned by a SharedWorker. Each connecting page gets
// its own WebLLM handler (so reply routing stays per-port) over the shared engine.
import { WebWorkerMLCEngineHandler, MLCEngine } from "https://esm.run/@mlc-ai/web-llm@0.2.85";

const shared = { engine: new MLCEngine(), loaded: null, loading: null, loads: 0, ports: new Set(), started: Date.now() };
shared.engine.setInitProgressCallback(report => {
  for (const port of shared.ports) port.postMessage({ kind: 'initProgressCallback', uuid: '', content: report });
});

class PortHandler extends WebWorkerMLCEngineHandler {
  constructor(port) { super(); this.engine = shared.engine; this.port = port; }
  postMessage(msg) { this.port.postMessage(msg); }
  onmessage(event, ...rest) {
    const msg = event.data ?? event;
    if (msg.kind === 'reload') {
      const { modelId } = msg.content;
      return this.handleTask(msg.uuid, async () => {
        const want = JSON.stringify(modelId);
        if (shared.loaded !== want) {
          shared.loading ??= (async () => {
            try { await shared.engine.reload(modelId, msg.content.chatOpts); shared.loaded = want; shared.loads++; }
            finally { shared.loading = null; }
          })();
          await shared.loading;
        }
        this.modelId = modelId; this.chatOpts = msg.content.chatOpts;
        return null;
      });
    }
    return super.onmessage(event, ...rest);
  }
}

onconnect = e => {
  const port = e.ports[0];
  shared.ports.add(port);
  const handler = new PortHandler(port);
  port.onmessage = ev => {
    if (ev.data?.kind === 'spike-bye') { shared.ports.delete(port); return; }
    if (ev.data?.kind === 'spike-status') {
      return port.postMessage({ kind: 'spike-status', uuid: ev.data.uuid, content:
        { loaded: shared.loaded, loads: shared.loads, ports: shared.ports.size, startedAt: shared.started,
          gpu: typeof navigator.gpu } });
    }
    handler.onmessage(ev);
  };
};
