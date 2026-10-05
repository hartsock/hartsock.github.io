// The app shell: hash routing between course views, the connection chip, and
// the settings dialog. The page never reloads, so a loaded model stays loaded
// as the visitor moves between sessions.
import { connection as conn, BROWSER_MODELS, startOpenRouterSignIn, finishOpenRouterSignIn } from "./inference.js";

const ROUTES = {
  "": { title: null, load: () => import("./views/home.js") },
  "ai-theology/session-3": { title: ["Making Minds?", "Session 3"], load: () => import("./views/session3.js") },
};

const $ = s => document.querySelector(s);
const view = $("#view");
let unmount = null;

async function route() {
  const key = location.hash.replace(/^#\/?/, "").replace(/\/+$/, "");
  const r = ROUTES[key] || ROUTES[""];
  if (unmount) { try { unmount(); } catch (_) {} unmount = null; }
  view.replaceChildren();
  $("#crumbs").innerHTML = r.title ? r.title.map(t => `<span>${t}</span>`).join(" · ") : "";
  document.title = r.title ? r.title.join(" · ") + " · Hartsock Courses" : "Hartsock Courses";
  const mod = await r.load();
  unmount = await mod.mount(view, { conn, openSettings }) || null;
  view.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

// ---- connection chip ----
function paintChip() {
  const st = conn.status.state;
  const dot = $("#connDot");
  dot.className = "dot " + (conn.ready() ? "ready" : st === "loading" ? "loading" : st === "error" ? "error" : "");
  const label = conn.settings.backend === "browser" && st === "loading"
    ? "Loading model " + Math.round(conn.status.progress * 100) + "%"
    : "Model: " + conn.describe();
  $("#connText").textContent = label;
}

// ---- settings dialog ----
const dlg = $("#settings");
function openSettings() { paintSettings(); dlg.showModal(); }
$("#connChip").addEventListener("click", openSettings);

const sel = $("#browserModel");
BROWSER_MODELS.forEach(m => { const o = document.createElement("option"); o.value = m.id; o.textContent = `${m.label} (${m.note})`; sel.append(o); });

function paintSettings() {
  const s = conn.settings;
  $("#b" + s.backend[0].toUpperCase() + s.backend.slice(1)).checked = true;
  $("#paneBrowser").hidden = s.backend !== "browser";
  $("#paneOpenrouter").hidden = s.backend !== "openrouter";
  $("#paneCustom").hidden = s.backend !== "custom";
  sel.value = s.browserModel;
  $("#orModel").value = s.openrouterModel;
  $("#orSignedIn").hidden = !(s.backend === "openrouter" && s.apiKey);
  $("#orSignedOut").hidden = !$("#orSignedIn").hidden;
  $("#customUrl").value = s.customUrl; $("#customModel").value = s.customModel;
  $("#customKey").value = s.backend === "custom" ? s.apiKey : "";
  $("#remember").checked = s.remember;
  const st = conn.status;
  const box = $("#progressBox");
  box.hidden = !(s.backend === "browser" && st.state === "loading");
  $("#progressBar").style.width = Math.round(st.progress * 100) + "%";
  $("#progressText").textContent = st.text;
  $("#loadBtn").textContent = conn.ready() ? "Loaded" : st.state === "loading" ? "Loading…" : "Download and start";
  $("#loadBtn").disabled = conn.ready() || st.state === "loading";
  const status = $("#connStatus");
  status.classList.toggle("error", st.state === "error");
  status.textContent = st.state === "error" ? st.text : conn.ready() ? "Ready: " + conn.describe() : "";
}

document.querySelectorAll('input[name="backend"]').forEach(r =>
  r.addEventListener("change", () => conn.update({ backend: r.value, apiKey: r.value === conn.settings.backend ? conn.settings.apiKey : "" })));
sel.addEventListener("change", () => conn.update({ browserModel: sel.value }));
$("#loadBtn").addEventListener("click", () => conn.load().catch(() => {}));
$("#orConnect").addEventListener("click", () => startOpenRouterSignIn());
$("#orDisconnect").addEventListener("click", () => conn.update({ apiKey: "" }));
$("#orModel").addEventListener("change", e => conn.update({ openrouterModel: e.target.value.trim() }));
$("#customUrl").addEventListener("change", e => conn.update({ customUrl: e.target.value.trim() }));
$("#customModel").addEventListener("change", e => conn.update({ customModel: e.target.value.trim() }));
$("#customKey").addEventListener("change", e => conn.update({ apiKey: e.target.value }));
$("#remember").addEventListener("change", e => conn.update({ remember: e.target.checked }));
$("#forgetBtn").addEventListener("click", () => conn.forget());

conn.addEventListener("change", () => { paintChip(); if (dlg.open) paintSettings(); });

// ---- light / dark: system by default; a choice here is remembered site-wide ----
const THEMES = ["system", "light", "dark"];
function paintTheme() {
  const t = document.documentElement.dataset.theme || "system";
  $("#themeBtn").textContent = "Theme: " + t;
}
$("#themeBtn").addEventListener("click", () => {
  const cur = document.documentElement.dataset.theme || "system";
  const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
  if (next === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = next;
  try { next === "system" ? localStorage.removeItem("site.theme") : localStorage.setItem("site.theme", next); } catch (_) {}
  paintTheme();
});
paintTheme();

// ---- start ----
window.addEventListener("hashchange", route);
(async () => {
  try { if (await finishOpenRouterSignIn(conn)) openSettings(); }
  catch (e) { conn.setStatus("error", e.message); }
  paintChip();
  await route();
  // Returning visitor with an in-browser model already downloaded: start it
  // quietly so it is ready when they need it. Never start a first download unasked.
  if (conn.settings.backend === "browser" && "gpu" in navigator) {
    try {
      const { hasModelInCache } = await import("https://esm.run/@mlc-ai/web-llm@0.2.85");
      if (await hasModelInCache(conn.settings.browserModel)) {
        (window.requestIdleCallback || setTimeout)(() => conn.load().catch(() => {}));
      }
    } catch (_) {}
  }
})();
