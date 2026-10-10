import { copyText } from './copy.js?v=prose-scripts-1';
// One model connection for the whole course app.
//
// The visitor chooses where answers come from: a small model running in this
// browser (default, free, private), their own OpenRouter account, or any
// OpenAI-compatible endpoint. The choice is remembered in this browser, so they
// set it up once. No key ever ships with the page.

import { BROWSER_MODELS, DEFAULT_BROWSER_MODEL, WEBLLM, appConfig } from './browser-models.js';
import { BrowserSession } from './browser-session.js?v=model-comparison-1';
import { parseTop } from './next-word.js';
export { BROWSER_MODELS } from './browser-models.js';

const STORE = "courses.inference.v1";
const IDLE_UNLOAD_MS = 20 * 60 * 1000;   // free GPU memory after 20 minutes unused
export const OPENROUTER_DEFAULT_MODEL = "google/gemma-4-31b-it:free";

const DEFAULTS = { backend: "browser", browserModel: DEFAULT_BROWSER_MODEL, browserStorage: 'memory',
  openrouterModel: OPENROUTER_DEFAULT_MODEL, customUrl: "", customModel: "", apiKey: "", remember: true };

function readStore() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORE) || "{}") }; }
  catch (_) { return { ...DEFAULTS }; }
}

export class Connection extends EventTarget {
  constructor() {
    super();
    this.settings = readStore();
    this.status = { state: "idle", text: "", progress: 0 };
    this.engine = null;          // in-browser engine, kept loaded across views
    this.engineModel = null;
    this.browserSession = new BrowserSession();
    this.loadVersion = 0;
  }

  // ---- settings ----
  update(patch) {
    const switching = ("backend" in patch && patch.backend !== this.settings.backend) ||
      ("browserModel" in patch && patch.browserModel !== this.settings.browserModel) ||
      ("browserStorage" in patch && patch.browserStorage !== this.settings.browserStorage);
    Object.assign(this.settings, patch);
    if (switching) { this.unload(); this.status = { state: "idle", text: "", progress: 0 }; }
    this.save();
    this.emit();
  }
  save() {
    const s = { ...this.settings };
    if (!s.remember) s.apiKey = "";          // keys persist only when asked
    try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (_) {}
  }
  forget() {
    try { localStorage.removeItem(STORE); } catch (_) {}
    this.settings = { ...DEFAULTS };
    this.unload();
    this.emit();
  }
  describe() {
    const s = this.settings;
    if (s.backend === "browser") return (BROWSER_MODELS.find(m => m.id === s.browserModel)?.label || s.browserModel) + ", in this browser";
    if (s.backend === "openrouter") return s.openrouterModel + ", via OpenRouter";
    return (s.customModel || "model") + " at " + (s.customUrl || "(no address yet)");
  }
  ready() {
    const s = this.settings;
    if (s.backend === "browser") return this.status.state === "ready";
    if (s.backend === "openrouter") return !!s.apiKey;
    return !!s.customUrl;
  }
  setStatus(state, text = "", progress = 0) { this.status = { state, text, progress }; this.emit(); }
  setCopyStatus(state, key, vars = {}) {
    this.status = {state, text: copyText(key, vars), progress: 0, copyKey: key, copyVars: vars}; this.emit();
  }
  emit() { this.dispatchEvent(new Event("change")); }

  // ---- in-browser model (WebLLM in a worker, so the page stays responsive) ----
  async load() {
    const s = this.settings;
    if (s.backend !== "browser") { this.setStatus("ready"); return; }
    if (this.engine && this.engineModel === s.browserModel) { this.setStatus("ready"); return; }
    if (!("gpu" in navigator)) {
      this.setCopyStatus('error', 'runtime_inference.no_webgpu');
      throw new Error("no-webgpu");
    }
    if (this.loading) return this.loading;
    const version = ++this.loadVersion;
    this.loading = this.loadBrowser(s.browserModel, version);
    try { await this.loading; } finally { if (version === this.loadVersion) this.loading = null; }
  }
  async loadBrowser(model, version) {
    this.setStatus("loading", "Starting…", 0);
    try {
      const engine = await this.browserSession.load(model, {
        storage: this.settings.browserStorage,
        progress: p => this.setStatus("loading", p.text || "Loading…", p.progress || 0),
      });
      if (version !== this.loadVersion) return;
      this.engine = engine;
      this.engineModel = model;
      this.setStatus("ready", "Loaded");
      this.touch();
    } catch (e) {
      if (version !== this.loadVersion) throw e;
      this.engine = null;
      if (e?.name === "QuotaExceededError" || /quota/i.test(e?.message || "")) {
        this.setCopyStatus('error', 'runtime_inference.quota');
      } else {
        this.setCopyStatus('error', 'runtime_inference.load_failed', {error: e.message || e});
      }
      throw e;
    }
  }
  // How much of the browser's allowance this site is using.
  async storage() {
    try { const { usage = 0, quota = 0 } = await navigator.storage.estimate(); return { usage, quota }; }
    catch (_) { return null; }
  }
  // Delete every downloaded model (including partial downloads) for this site.
  async removeDownloads() {
    this.unload();
    try {
      const webllm = await import(WEBLLM);
      const config = appConfig(webllm.prebuiltAppConfig);
      for (const m of BROWSER_MODELS) { try { await webllm.deleteModelAllInfoInCache(m.id, config); } catch (_) {} }
    } catch (_) {}
    try { for (const k of await caches.keys()) if (k.startsWith("webllm")) await caches.delete(k); } catch (_) {}
    this.status = { state: "idle", text: "", progress: 0 };
    this.emit();
  }
  unload() {
    ++this.loadVersion;
    this.loading = null;
    clearTimeout(this.idleTimer);
    this.browserSession.stop();
    this.engine = null; this.engineModel = null;
    if (this.status.state !== "error") this.status = { state: "idle", text: "", progress: 0 };
  }

  // ---- remote endpoints ----
  remote() {
    const s = this.settings;
    if (s.backend === "openrouter") return {
      base: "https://openrouter.ai/api/v1", model: s.openrouterModel,
      headers: { Authorization: "Bearer " + s.apiKey, "HTTP-Referer": location.origin, "X-Title": "Hartsock courses" },
    };
    const h = s.apiKey ? { Authorization: "Bearer " + s.apiKey } : {};
    return { base: s.customUrl.replace(/\/+$/, ""), model: s.customModel, headers: h };
  }
  async post(path, body, signal) {
    const r = this.remote();
    const res = await fetch(r.base + path, { method: "POST", signal,
      headers: { "Content-Type": "application/json", ...r.headers }, body: JSON.stringify({ model: r.model, ...body }) });
    if (!res.ok) throw new Error(res.status + " " + (await res.text()).slice(0, 200));
    return res.json();
  }

  // An in-browser model holds GPU memory while the reader browses; let it go
  // after a long idle stretch. Session-only mode downloads again on next use;
  // saved-download mode reuses the artifact cache when the browser allows it.
  touch() {
    clearTimeout(this.idleTimer);
    if (this.settings.backend === "browser") this.idleTimer = setTimeout(() => { this.unload(); this.emit(); }, IDLE_UNLOAD_MS);
  }

  // ---- the two things the course pages ask for ----
  async chat(messages, { maxTokens = 400, temperature = 0.7, signal, onText } = {}) {
    if (this.chatPending) throw Object.assign(new Error(copyText('runtime_inference.busy')), {code: 'busy'});
    signal?.throwIfAborted();
    this.chatPending = true;
    const local = this.settings.backend === 'browser';
    const cancel = () => { if (local) { this.unload(); this.emit(); } };
    signal?.addEventListener('abort', cancel, { once: true });
    try {
      this.touch();
      let answer;
      if (local) {
        await this.load();
        signal?.throwIfAborted();
        const result = await this.browserSession.complete(messages, { maxTokens, temperature, onText });
        answer = result.answer;
      } else {
        const r = await this.post('/chat/completions', { messages, max_tokens: maxTokens, temperature }, signal);
        answer = r.choices[0].message.content;
        onText?.(answer);
      }
      signal?.throwIfAborted();
      return answer;
    } catch (error) {
      if (local && !this.browserSession.engine) {
        this.engine = null; this.engineModel = null;
        if (!signal?.aborted && this.status.state !== 'error') this.setStatus('error', error.message);
      }
      throw error;
    } finally {
      this.chatPending = false;
      signal?.removeEventListener('abort', cancel);
    }
  }

  // Odds for the next word after `prompt`: [{token, logprob}] strongest first,
  // or null when the backend does not share its odds.
  async nextWord(prompt) {
    this.touch();
    if (this.settings.backend === "browser") {
      await this.load();
      try { return await this.browserSession.nextWord(prompt); }
      catch (error) {
        if (!this.browserSession.engine) { this.unload(); this.setStatus('error', error.message); }
        throw error;
      }
    }
    try {
      const r = await this.post("/completions", { prompt, max_tokens: 1, temperature: 1, top_p: 1, logprobs: 10 });
      return parseTop(r);
    } catch (e) {
      if (/logprob|not supported|404|400/i.test(e.message)) return null;
      throw e;
    }
  }
}

// ---- OpenRouter sign-in (OAuth PKCE): the visitor gets their own key ----
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
export async function startOpenRouterSignIn() {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)));
  const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  try { sessionStorage.setItem("courses.or.verifier", verifier); sessionStorage.setItem("courses.or.return", location.hash); } catch (_) {}
  const back = location.origin + location.pathname;
  location.href = "https://openrouter.ai/auth?callback_url=" + encodeURIComponent(back) +
    "&code_challenge=" + challenge + "&code_challenge_method=S256";
}
export async function finishOpenRouterSignIn(conn) {
  const code = new URLSearchParams(location.search).get("code");
  if (!code) return false;
  let verifier = "", ret = "";
  try { verifier = sessionStorage.getItem("courses.or.verifier") || ""; ret = sessionStorage.getItem("courses.or.return") || ""; } catch (_) {}
  history.replaceState(null, "", location.pathname + ret);
  const res = await fetch("https://openrouter.ai/api/v1/auth/keys", { method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, code_verifier: verifier, code_challenge_method: "S256" }) });
  if (!res.ok) throw new Error("OpenRouter sign-in failed (" + res.status + ")");
  const { key } = await res.json();
  conn.update({ backend: "openrouter", apiKey: key });
  return true;
}

export const connection = new Connection();
