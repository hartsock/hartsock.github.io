// Tiny text DOM for unit tests; rendered-template parity is checked with Jekyll.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export const copy = JSON.parse(execFileSync('ruby', ['-ryaml', '-rjson', '-e',
  'puts JSON.generate(YAML.load_file(ARGV[0])["copy"])',
  fileURLToPath(new URL('../_copy/site.md', import.meta.url))], {encoding:'utf8'}));
class Text {
  constructor(text) { this.nodeType = 3; this.textContent = text; }
  cloneNode() { return new Text(this.textContent); }
}
export class Fragment {
  constructor(text = '') { this.childNodes = [new Text(text)]; this.dataset = {}; }
  get textContent() { return this.childNodes.map(n => n.textContent).join(''); }
  set textContent(text) { this.childNodes = [new Text(text)]; }
  cloneNode() { return new Fragment(this.textContent); }
  replaceChildren(...children) { this.childNodes = children; }
  setAttribute(key, value) { this[key] = value; }
  removeAttribute(key) { delete this[key]; }
}
export function installCopyDocument() {
  globalThis.document = {
    querySelector(selector) {
      const key = selector.match(/data-copy="([a-z_.]+)"/)?.[1];
      const [group, name] = (key || '').split('.');
      if (typeof copy[group]?.[name] !== 'string') return null;
      return {content:new Fragment(copy[group][name]), dataset:{md:'_copy/site.md', mdKey:'copy.' + key}};
    },
    createDocumentFragment: () => new Fragment(),
  };
}
