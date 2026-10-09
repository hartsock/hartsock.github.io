// Site-wide app layer. Loaded once: with hx-boost the page never unloads, so
// the header controls, the settings dialog and a loaded model persist while
// the reader moves between posts and course sessions.
import { connection as conn, BROWSER_MODELS, startOpenRouterSignIn, finishOpenRouterSignIn } from "./inference.js?v=model-comparison-1";
import { WEBLLM, appConfig } from './browser-models.js';
import { PageLifecycle } from './page-lifecycle.js';
import { mountChat } from './site-chat.js?v=chat-identity-1';

const $ = s => document.querySelector(s);

// ---------- theme: system by default; a choice is remembered site-wide ----------
const THEMES = ["system", "light", "dark"];
function paintTheme() { $("#themeBtn").textContent = "Theme: " + (document.documentElement.dataset.theme || "system"); }
$("#themeBtn").addEventListener("click", () => {
  const cur = document.documentElement.dataset.theme || "system";
  const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
  if (next === "system") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = next;
  try { next === "system" ? localStorage.removeItem("site.theme") : localStorage.setItem("site.theme", next); } catch (_) {}
  paintTheme();
});

// ---------- model chip + settings dialog ----------
const dlg = $("#settings");
export function openSettings() { paintSettings(); dlg.showModal(); }
$("#connChip").addEventListener("click", openSettings);

function paintChip() {
  const st = conn.status.state;
  $("#connDot").className = "dot " + (conn.ready() ? "ready" : st === "loading" ? "loading" : st === "error" ? "error" : "");
  $("#connText").textContent = conn.settings.backend === "browser" && st === "loading"
    ? "Loading model " + Math.round(conn.status.progress * 100) + "%"
    : "Model: " + conn.describe();
}

const sel = $("#browserModel");
BROWSER_MODELS.forEach(m => { const o = document.createElement("option"); o.value = m.id; o.textContent = `${m.label} (${m.note})`; sel.append(o); });

function paintSettings() {
  const s = conn.settings, st = conn.status;
  $("#b" + s.backend[0].toUpperCase() + s.backend.slice(1)).checked = true;
  $("#paneBrowser").hidden = s.backend !== "browser";
  $("#paneOpenrouter").hidden = s.backend !== "openrouter";
  $("#paneCustom").hidden = s.backend !== "custom";
  // Preserve an older saved model instead of silently replacing the choice.
  if (![...sel.options].some(o => o.value === s.browserModel)) {
    const option = new Option(s.browserModel + ' (previously selected)', s.browserModel);
    sel.append(option);
  }
  sel.value = s.browserModel;
  const selected = BROWSER_MODELS.find(m => m.id === s.browserModel);
  $('#browserModelSize').textContent = selected
    ? `${selected.label}: ${selected.mb} MB weights; estimated GPU memory ${(selected.vram / 1000).toFixed(2)} GB, plus browser and session-cache overhead. ${selected.finding}.`
    : 'Previously saved model. See its model card for memory requirements.';
  $('#browserMemory').checked = s.browserStorage === 'memory';
  $("#orModel").value = s.openrouterModel;
  $('#orPricing').textContent = s.openrouterModel.endsWith(':free')
    ? 'Free variant selected. Confirm it is still available; rate limits apply.'
    : 'This is not a :free model selection. Requests may incur charges.';
  $("#orSignedIn").hidden = !(s.backend === "openrouter" && s.apiKey);
  $("#orSignedOut").hidden = !$("#orSignedIn").hidden;
  $("#customUrl").value = s.customUrl; $("#customModel").value = s.customModel;
  $("#customKey").value = s.backend === "custom" ? s.apiKey : "";
  $("#remember").checked = s.remember;
  // Other sources stay folded away unless one is in use.
  if (s.backend !== "browser") $("#moreSources").open = true;
  $("#rememberRow").hidden = s.backend === "browser";
  $("#progressBox").hidden = !(s.backend === "browser" && st.state === "loading");
  $("#progressBar").style.width = Math.round(st.progress * 100) + "%";
  $("#progressText").textContent = st.text;
  $("#loadBtn").textContent = conn.ready() ? "Ready" : st.state === "loading" ? "Starting…" : "Use this model";
  $("#loadBtn").disabled = conn.ready() || st.state === "loading";
  paintStorage();
  const status = $("#connStatus");
  status.classList.toggle("error", st.state === "error");
  status.textContent = st.state === "error" ? st.text : conn.ready() ? "Ready: " + conn.describe() : "";
}

document.querySelectorAll('input[name="backend"]').forEach(r =>
  r.addEventListener("change", () => conn.update({ backend: r.value, apiKey: r.value === conn.settings.backend ? conn.settings.apiKey : "" })));
// Choosing a model is the go-ahead: start it, close the dialog, show progress in
// the chip. If it fails, reopen the dialog with the reason.
function startChosen() {
  dlg.close();
  conn.load().catch(error => { if (error.name !== 'AbortError') openSettings(); });
}
sel.addEventListener("change", () => { conn.update({ browserModel: sel.value }); startChosen(); });
$("#loadBtn").addEventListener("click", startChosen);
$('#browserMemory').addEventListener('change', e => conn.update({ browserStorage: e.target.checked ? 'memory' : 'cache' }));

const gb = n => (n / 1e9).toFixed(n < 1e9 ? 2 : 1) + " GB";
async function paintStorage() {
  const st = await conn.storage();
  $("#storageText").textContent = st && st.quota ? `Estimated storage: ${gb(st.usage)} used; ${gb(st.quota)} reported quota. Actual writable space may be much smaller.` : "";
}
$("#clearBtn").addEventListener("click", async () => {
  if (!confirm("Remove every downloaded model for this site? You can download again any time.")) return;
  $("#clearBtn").disabled = true;
  await conn.removeDownloads();
  $("#clearBtn").disabled = false;
  paintStorage();
});
$("#orConnect").addEventListener("click", () => startOpenRouterSignIn());
$("#orDisconnect").addEventListener("click", () => conn.update({ apiKey: "" }));
$("#orModel").addEventListener("change", e => conn.update({ openrouterModel: e.target.value.trim() }));
$("#customUrl").addEventListener("change", e => conn.update({ customUrl: e.target.value.trim() }));
$("#customModel").addEventListener("change", e => conn.update({ customModel: e.target.value.trim() }));
$("#customKey").addEventListener("change", e => conn.update({ apiKey: e.target.value }));
$("#remember").addEventListener("change", e => conn.update({ remember: e.target.checked }));
$("#forgetBtn").addEventListener("click", () => conn.forget());
conn.addEventListener("change", () => { paintChip(); if (dlg.open) paintSettings(); });
mountChat($('#siteChat'), { conn, openSettings });

// ---------- page hooks: run after the first load and after every swap ----------
const pages = new PageLifecycle();
async function onPage() {
  // Keep the header's "current page" mark honest after a swap.
  const here = location.pathname;
  document.querySelectorAll(".site-nav a").forEach(a => {
    const path = new URL(a.href).pathname;
    if (path === here || (path !== "/" && here.startsWith(path))) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  const apps = [
    ['#view[data-app="courses"]', '../../courses/app/router.js?v=labs-index-1', 'start'],
    ['#topic-map', './topic-map.js', 'mount'],
    ['[data-app="similarity-map"]', './similarity-map.js', 'mount'],
    ['[data-app="archive-reader"]', './archive-reader.js', 'mount'],
    ['[data-app="chat-lab"]', './chat-lab.js?v=site-chat-1', 'mount'],
    ['[data-app="model-comparison"]', './model-comparison.js?v=model-comparison-1', 'mount'],
  ];
  for (const [selector, source, method] of apps) {
    const root = document.querySelector(selector);
    if (root) return pages.start(root, async () => {
      const module = await import(source);
      return element => module[method](element, { conn, openSettings });
    });
  }
  pages.leave();
}
function leavePage() { pages.leave(); }
document.body.addEventListener("htmx:beforeSwap", leavePage);
document.body.addEventListener("htmx:afterSwap", onPage);
document.body.addEventListener("htmx:afterSettle", onPage);
document.body.addEventListener("htmx:historyRestore", onPage);
// Only pages are swapped in. Feeds, media and downloads load the ordinary way.
document.body.addEventListener("htmx:beforeRequest", e => {
  const path = e.detail.pathInfo?.requestPath || "";
  if (e.detail.boosted && /\.(xml|json|pdf|mp4|webm|mp3|png|jpe?g|gif|svg|zip|txt|ipynb)(\?|#|$)/i.test(path)) {
    e.preventDefault();
    location.href = path;
  }
});

// ---------- start ----------
paintTheme();
paintChip();
(async () => {
  try { if (await finishOpenRouterSignIn(conn)) openSettings(); }
  catch (e) { conn.setStatus("error", e.message); }
  await onPage();
  // A returning reader whose in-browser model is already downloaded: start it
  // quietly so it is ready when needed. Never start a first download unasked.
  const mayAutoload = () => conn.settings.backend === 'browser' && conn.settings.browserStorage !== 'memory' &&
    !document.querySelector('[data-inference-lab]') && 'gpu' in navigator;
  if (mayAutoload()) {
    try {
      const webllm = await import(WEBLLM);
      if (await webllm.hasModelInCache(conn.settings.browserModel, appConfig(webllm.prebuiltAppConfig))) {
        (window.requestIdleCallback || setTimeout)(() => { if (mayAutoload()) conn.load().catch(() => {}); });
      }
    } catch (_) {}
  }
})();
