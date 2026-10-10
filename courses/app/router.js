// The page owns its server-rendered content; only lesson figures need mounting.
export function legacyPath(hash) {
  if (!hash.startsWith('#/')) return null;
  const key = hash.slice(2).replace(/\/+$/, '');
  if (key && !/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(key)) return null;
  return '/courses/' + (key ? key + '/' : '');
}
const views = { session3: () => import('./views/session3.js?v=prose-courses-1') };
export async function start(view, ctx) {
  const redirect = () => {
    const path = legacyPath(location.hash);
    if (path) { location.replace(path); return true; }
    return false;
  };
  if (redirect()) return () => {};
  const events = new AbortController();
  window.addEventListener('hashchange', redirect, {signal: events.signal});
  let cleanup;
  try {
    const load = views[view.dataset.view];
    if (load) cleanup = await (await load()).mount(view, ctx);
  } catch (error) {
    events.abort();
    throw error;
  }
  return () => { events.abort(); cleanup?.(); };
}
