// HTMX swap, settle and history events may overlap. Own one page mount, and
// retire delayed imports/async mounts before they can replace a newer owner.
export class PageLifecycle {
  version = 0;
  root = null;
  cleanup = null;
  leave() {
    this.version++;
    const cleanup = this.cleanup;
    this.cleanup = null; this.root = null;
    cleanup?.();
  }
  async start(root, loadMount) {
    if (root === this.root) return;
    this.leave();
    if (!root?.isConnected) return;
    const version = this.version;
    this.root = root;
    const current = () => version === this.version && root.isConnected;
    const mount = await loadMount();
    if (!current()) return;
    const cleanup = await mount(root);
    if (current()) this.cleanup = cleanup;
    else cleanup?.();
  }
}
