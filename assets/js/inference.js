// One model connection for the whole course app.
//
// The visitor chooses where answers come from: a small model running in this
// browser (default, free, private), their own OpenRouter account, or any
// OpenAI-compatible endpoint. The choice is remembered in this browser, so they
// set it up once. No key ever ships with the page.

const STORE = "courses.inference.v1";
const IDLE_UNLOAD_MS = 20 * 60 * 1000;   // free GPU memory after 20 minutes unused
const WEBLLM = "https://esm.run/@mlc-ai/web-llm@0.2.85";

export const BROWSER_MODELS = [
  { id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC", label: "Qwen 2.5, 1.5B", note: "about 1 GB, one-time download" },
  { id: "Llama-3.2-1B-Instruct-q4f16_1-MLC", label: "Llama 3.2, 1B", note: "about 0.9 GB, one-time download" },
  { id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC", label: "Qwen 2.5, 0.5B", note: "about 0.4 GB, fastest, weakest" },
];
export const OPENROUTER_DEFAULT_MODEL = "google/gemma-4-31b-it:free";

const DEFAULTS = { backend: "browser", browserModel: BROWSER_MODELS[0].id,
  openrouterModel: OPENROUTER_DEFAULT_MODEL, customUrl: "", customModel: "", apiKey: "", remember: true };

function readStore() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORE) || "{}") }; }
  catch (_) { return { ...DEFAULTS }; }
}

class Connection extends EventTarget {
  constructor() {
    super();
    this.settings = readStore();
    this.status = { state: "idle", text: "", progress: 0 };
    this.engine = null;          // in-browser engine, kept loaded across views
    this.engineModel = null;
  }

  // ---- settings ----
  update(patch) {
    const before = this.describe();
    Object.assign(this.settings, patch);
    if (this.describe() !== before) this.engine && this.engineModel !== this.settings.browserModel && this.unload();
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
  emit() { this.dispatchEvent(new Event("change")); }

  // ---- in-browser model (WebLLM in a worker, so the page stays responsive) ----
  async load() {
    const s = this.settings;
    if (s.backend !== "browser") { this.setStatus("ready"); return; }
    if (this.engine && this.engineModel === s.browserModel) { this.setStatus("ready"); return; }
    if (!("gpu" in navigator)) {
      this.setStatus("error", "This browser cannot run a model locally (no WebGPU). Try desktop Chrome or Edge, or connect OpenRouter.");
      throw new Error("no-webgpu");
    }
    this.setStatus("loading", "Starting…", 0);
    try {
      const webllm = await import(WEBLLM);
      const worker = new Worker(new URL("./webllm-worker.js", import.meta.url), { type: "module" });
      this.engine = await webllm.CreateWebWorkerMLCEngine(worker, s.browserModel, {
        initProgressCallback: p => this.setStatus("loading", p.text || "Loading…", p.progress || 0),
      });
      this.engineModel = s.browserModel;
      this.setStatus("ready", "Loaded");
      this.touch();
    } catch (e) {
      this.engine = null;
      this.setStatus("error", "Could not load the model: " + (e.message || e));
      throw e;
    }
  }
  unload() {
    try { this.engine?.unload?.(); } catch (_) {}
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
  async post(path, body) {
    const r = this.remote();
    const res = await fetch(r.base + path, { method: "POST",
      headers: { "Content-Type": "application/json", ...r.headers }, body: JSON.stringify({ model: r.model, ...body }) });
    if (!res.ok) throw new Error(res.status + " " + (await res.text()).slice(0, 200));
    return res.json();
  }

  // An in-browser model holds GPU memory while the reader browses; let it go
  // after a long idle stretch. Weights stay cached, so the next use reloads
  // without downloading.
  touch() {
    clearTimeout(this.idleTimer);
    if (this.settings.backend === "browser") this.idleTimer = setTimeout(() => { this.unload(); this.emit(); }, IDLE_UNLOAD_MS);
  }

  // ---- the two things the course pages ask for ----
  async chat(messages, { maxTokens = 400, temperature = 0.7 } = {}) {
    this.touch();
    if (this.settings.backend === "browser") {
      await this.load();
      const r = await this.engine.chat.completions.create({ messages, max_tokens: maxTokens, temperature });
      return r.choices[0].message.content;
    }
    const r = await this.post("/chat/completions", { messages, max_tokens: maxTokens, temperature });
    return r.choices[0].message.content;
  }

  // Odds for the next word after `prompt`: [{token, logprob}] strongest first,
  // or null when the backend does not share its odds.
  async nextWord(prompt) {
    this.touch();
    if (this.settings.backend === "browser") {
      await this.load();
      const r = await this.engine.completions.create({ prompt, max_tokens: 1, temperature: 0, logprobs: true, top_logprobs: 5 });
      return parseTop(r);
    }
    try {
      const r = await this.post("/completions", { prompt, max_tokens: 1, temperature: 0, logprobs: 10 });
      return parseTop(r);
    } catch (e) {
      if (/logprob|not supported|404|400/i.test(e.message)) return null;
      throw e;
    }
  }
}

function parseTop(r) {
  const lp = r?.choices?.[0]?.logprobs;
  if (!lp) return null;
  const first = lp.content?.[0]?.top_logprobs;              // OpenAI chat shape (WebLLM)
  if (first?.length) return first.map(c => ({ token: c.token, logprob: c.logprob }));
  const legacy = lp.top_logprobs?.[0];                       // OpenAI completions shape
  if (legacy) return Object.entries(legacy).map(([token, logprob]) => ({ token, logprob })).sort((a, b) => b.logprob - a.logprob);
  return null;
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
