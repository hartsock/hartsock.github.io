// Course views inside the site: hash routes under /courses/ swap the view in
// place. Started by assets/js/site.js whenever a page with #view[data-app=courses]
// is on screen; returns a function that stops it when the reader leaves.
const ROUTES = {
  "": () => import("./views/home.js"),
  "ai-theology/session-3": () => import("./views/session3.js"),
};
const TITLES = { "": "Courses", "ai-theology/session-3": "Making Minds? Session 3" };

export async function start(view, ctx) {
  let unmountView = null;
  async function route() {
    const key = location.hash.replace(/^#\/?/, "").replace(/\/+$/, "");
    const load = ROUTES[key] || ROUTES[""];
    if (unmountView) { try { unmountView(); } catch (_) {} unmountView = null; }
    view.replaceChildren();
    document.title = (TITLES[key] || TITLES[""]) + " · " + (document.querySelector(".site-name")?.textContent.trim() || "");
    const mod = await load();
    unmountView = (await mod.mount(view, ctx)) || null;
    view.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", route);
  await route();
  return () => { window.removeEventListener("hashchange", route); if (unmountView) unmountView(); };
}
