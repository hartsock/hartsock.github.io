// Build-time templates own text; substitutions only touch text nodes.
function template(key) {
  const source = /^[a-z_]+\.[a-z_]+$/.test(key)
    ? globalThis.document?.querySelector(`template[data-copy="${key}"]`) : null;
  if (!source) console.error('copy:' + key);
  return source;
}
function fill(source, vars, key) {
  const fragment = source.content.cloneNode(true), names = new Set();
  function walk(node, replace) {
    if (node.nodeType === 3) {
      node.textContent = node.textContent.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (token, name) => {
        names.add(name);
        return replace ? String(vars[name]) : token;
      });
    } else for (const child of node.childNodes) walk(child, replace);
  }
  walk(fragment, false);
  if (names.size !== Object.keys(vars).length || [...names].some(name => !Object.hasOwn(vars, name))) {
    console.error('copy-vars:' + key); return null;
  }
  walk(fragment, true);
  return fragment;
}
export function copyNodes(key, vars = {}) {
  const source = template(key);
  return source ? fill(source, vars, key) : null;
}
export function copyText(key, vars = {}) {
  return copyNodes(key, vars)?.textContent || '';
}
export function putText(element, text = '') {
  element.removeAttribute('data-md'); element.removeAttribute('data-md-key');
  element.textContent = text;
}
export function putCopy(element, key, vars = {}) {
  const source = template(key), nodes = source && fill(source, vars, key);
  putText(element);
  if (!nodes) return;
  element.replaceChildren(nodes);
  element.setAttribute('data-md', source.dataset.md);
  element.setAttribute('data-md-key', source.dataset.mdKey);
}
