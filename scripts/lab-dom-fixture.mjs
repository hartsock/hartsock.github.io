// A minimal event-capable DOM for the lab mount/dispose contract. No inference or network.
import {Fragment, installCopyDocument} from './copy-fixture.mjs';
export class Element extends EventTarget {
  constructor(tag = 'div') { super(); this.tagName = tag; this.dataset = {}; this.children = []; this.attributes = {}; this.style = {}; this.value = ''; this.text = ''; }
  set textContent(value) { this.text = String(value); this.children = []; }
  get textContent() { return this.text + this.children.map(c => c.textContent).join(''); }
  setAttribute(key, value) { this.attributes[key] = value; }
  removeAttribute(key) { delete this.attributes[key]; }
  append(...nodes) { this.children.push(...nodes); for (const node of nodes) node.parent = this; }
  replaceChildren(...nodes) { this.text = ''; this.children = []; this.append(...nodes); }
  closest() { return this.parent || this; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  focus() {}
  scrollIntoView() {}
  click() { this.dispatchEvent(new Event('click')); }
  querySelector(selector) { return this.nodes?.[selector] || null; }
  querySelectorAll(selector) { return this.groups?.[selector] || []; }
}
function rootWith(names) {
  const root = new Element(); root.nodes = {}; root.groups = {};
  for (const name of names.split(' ')) root.nodes['[data-' + name + ']'] = new Element();
  return root;
}
export function labDOM(slug) {
  installCopyDocument(slug);
  const copyLookup = document.querySelector;
  const doc = new Element(), chip = new Element('button'); doc.body = new Element('body');
  doc.querySelector = selector => selector === '#connChip' ? chip : copyLookup(selector);
  doc.createElement = tag => new Element(tag); doc.createDocumentFragment = () => new Fragment();
  globalThis.document = doc;
  globalThis.Option = function(text, value) { const el = new Element('option'); el.textContent = text; el.value = value; return el; };
  const root = rootWith(slug === 'browser-chat'
    ? 'loading loading-title loading-size loading-status loading-progress model storage model-note send stop prompt grounded chat progress cards load smoke cancel-load clear form tests export save settings context status'
    : 'status step opening stop run export back next form storage progress save');
  root.nodes['[data-storage]'].value = 'memory';
  if (slug === 'browser-chat') {
    root.nodes['#lab-workbench'] = new Element(); root.nodes['[data-grounded]'].checked = false;
    root.nodes['[data-tests]'].parent = new Element('details'); root.groups['[data-try]'] = [];
  } else {
    root.groups['[data-comparison-card]'] = ['SmolLM2-360M-Instruct-q4f16_1-MLC','Qwen3-0.6B-q4f16_1-MLC','gemma3-1b-it-q4f16_1-MLC'].map(id => {
      const card = rootWith('selection-note result-title prefix completion provenance odds');
      card.dataset.modelId = id; card.nodes.select = new Element('select'); return card;
    });
    root.groups['select, input, [data-run]'] = [root.nodes['[data-opening]'],root.nodes['[data-run]'],root.nodes['[data-storage]'],...root.groups['[data-comparison-card]'].map(c => c.nodes.select)];
    root.groups['[data-prefix], [data-completion], [data-odds]'] = root.groups['[data-comparison-card]'].flatMap(c => ['prefix','completion','odds'].map(n => c.nodes['[data-'+n+']']));
  }
  return {root,chip,document:doc, $: name => root.nodes['[data-'+name+']']};
}
