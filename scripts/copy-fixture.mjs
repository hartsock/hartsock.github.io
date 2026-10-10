// Tiny text DOM for unit tests; rendered-template parity is checked with Jekyll.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export const sharedCopy = JSON.parse(execFileSync('ruby', ['-ryaml', '-rjson', '-e',
  'puts JSON.generate(YAML.load_file(ARGV[0])["copy"])',
  fileURLToPath(new URL('../_copy/site.md', import.meta.url))], {encoding:'utf8'}));
export const labCopy = Object.fromEntries(['browser-chat', 'model-comparison'].map(slug => [slug,
  JSON.parse(execFileSync('ruby', ['-ryaml', '-rjson', '-e',
    'puts JSON.generate(YAML.load_file(ARGV[0])["copy"])',
    fileURLToPath(new URL('../labs/' + slug + '/index.md', import.meta.url))], {encoding:'utf8'}))]));
export const copy = Object.assign({}, sharedCopy, ...Object.values(labCopy));
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
export function installCopyDocument(slug) {
  const available = slug ? {...sharedCopy, ...labCopy[slug]} : copy;
  globalThis.document = {
    querySelector(selector) {
      const key = selector.match(/data-copy="([a-z_.]+)"/)?.[1];
      const [group, name] = (key || '').split('.');
      if (typeof available[group]?.[name] !== 'string') return null;
      return {content:new Fragment(available[group][name]), dataset:{md:sharedCopy[group] ? '_copy/site.md' : 'labs/' + (Object.keys(labCopy).find(slug => labCopy[slug][group])) + '/index.md', mdKey:'copy.' + key}};
    },
    createDocumentFragment: () => new Fragment(),
  };
}
