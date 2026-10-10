// Course views inside the site: hash routes under /courses/ swap the view in
// place. Started by assets/js/site.js whenever a page with #view[data-app=courses]
// is on screen; returns a function that stops it when the reader leaves.
import { loadManifest } from "./draft.js";

export function resolveRoute(courses, key) {
  if (!key) return { title: "Courses", view: "home" };
  const course = courses.find(c => c.slug === key.split("/")[0]);
  if (!course) return null;
  if (key === course.slug) return { title: course.title, view: "course", course };
  const session = course.sessions.find(s => `${course.slug}/${s.slug}` === key);
  return session ? { title: `${course.title} · ${session.title}`, view: session.view, course, session } : null;
}

export async function start(view, ctx) {
  let unmountView = null;
  let generation = 0;
  const { courses } = await loadManifest();
  async function route() {
    const current = ++generation;
    const key = (location.hash ? location.hash.replace(/^#\/?/, "") : location.pathname.split("/courses/")[1] || "").replace(/\/+$/, "");
    const match = resolveRoute(courses, key);
    if (unmountView) { try { unmountView(); } catch (_) {} unmountView = null; }
    view.replaceChildren();
    document.title = (match?.title || "Page not found") + " · " + (document.querySelector(".site-name")?.textContent.trim() || "");
    if (!match || !/^[a-zA-Z0-9-]+$/.test(match.view)) {
      view.innerHTML = '<h1>Page not found</h1><p><a href="/courses/">Browse courses</a></p>';
      return;
    }
    try {
      const mod = await import(`./views/${match.view}.js?v=prose-labs-2`);
      if (current !== generation) return;
      const content = document.createElement("div");
      const cleanup = (await mod.mount(content, { ...ctx, ...match })) || null;
      if (current !== generation) { cleanup?.(); return; }
      if (match.session) {
        const back = document.createElement("a");
        back.href = "/courses/" + match.course.slug + "/";
        back.textContent = match.course.title + " — all sessions";
        content.prepend(back);
      }
      view.replaceChildren(content);
      unmountView = cleanup;
    } catch (_) {
      if (current !== generation) return;
      view.innerHTML = '<h1>Could not load this page</h1><p><a href="/courses/">Back to courses</a></p>';
    }
    view.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", route);
  await route();
  return () => { ++generation; window.removeEventListener("hashchange", route); if (unmountView) unmountView(); };
}
