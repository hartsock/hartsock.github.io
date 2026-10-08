// The draft notice shown at the top of every view, read from content/manifest.json.
let manifest = null;
export async function loadManifest() {
  if (!manifest) manifest = await (await fetch(new URL("../content/manifest.json", import.meta.url))).json();
  return manifest;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function draftNotice(pageKey) {
  const m = await loadManifest();
  const p = m.pages[pageKey];
  const el = document.createElement("aside");
  el.className = "draft";
  el.setAttribute("aria-label", "Draft status");
  if (!p) { el.textContent = "Draft. No record for this page yet."; return el; }
  const reviewed = p.reviewed.length
    ? p.reviewed.map(r => `${esc(r.by)} reviewed ${esc(r.scope)} on ${esc(r.date)}`).join("; ")
    : "Not reviewed by any person yet.";
  el.innerHTML = `
    <div class="draft-line">
      <span class="badge">${esc(p.status)}</span>
      <span>Revision <b class="mono">${esc(p.revision)}</b> · ${esc(p.date)}</span>
      <span class="${p.reviewed.length ? "" : "warn"}">${reviewed}</span>
    </div>
    <details>
      <summary>Who made what</summary>
      <p class="muted">${esc(m.about)}</p>
      <ul>${p.authored.map(a => `<li><b>${esc(a.who)}</b>: ${esc(a.what)}</li>`).join("")}</ul>
      ${p.not_yet ? `<p class="muted">${esc(p.not_yet)}</p>` : ""}
    </details>`;
  return el;
}
