// Experimental worker-local artifact cache. No model weights are persisted by
// this adapter; terminating the worker releases them. This is not a quota fix.
export class SessionCacheStorage {
  stores = new Map();
  async open(scope) {
    if (!this.stores.has(scope)) {
      const entries = new Map();
      const key = request => typeof request === 'string' ? request : request.url;
      const cache = {
        async match(request) {
          const entry = entries.get(key(request));
          return entry ? new Response(entry.body.slice(0), entry.init) : undefined;
        },
        async put(request, response) {
          if (!response.ok) throw new Error('Cannot cache HTTP ' + response.status);
          entries.set(key(request), { body: await response.arrayBuffer(), init: {
            status: response.status, statusText: response.statusText, headers: [...response.headers],
          } });
        },
        async add(request) { await cache.put(request, await fetch(request, { cache: 'no-store' })); },
        async keys() { return [...entries.keys()].map(url => new Request(url)); },
        async delete(request) { return entries.delete(key(request)); },
      };
      this.stores.set(scope, cache);
    }
    return this.stores.get(scope);
  }
  async keys() { return [...this.stores.keys()]; }
  async delete(scope) { return this.stores.delete(scope); }
}
