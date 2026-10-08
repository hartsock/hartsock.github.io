export const PAGE_SIZE = 6;

export function selectPages(pages, { topics, topic, kind, query = "", offset = 0 } = {}) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = pages.filter(page =>
    (!topics || page.topics.some(t => topics.includes(t))) &&
    (!topic || page.topics.includes(topic)) &&
    (!kind || page.kind === kind) &&
    words.every(word => `${page.title} ${page.description} ${page.topics.join(" ").replaceAll("-", " ")}`.toLowerCase().includes(word))
  ).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title) || a.url.localeCompare(b.url));
  return { total: matches.length, pages: matches.slice(offset, offset + PAGE_SIZE) };
}

export function mount(root) {
  const controller = new AbortController();
  root.querySelector("[data-results-count]").textContent = "Loading page index…";
  (async () => {
    try {
      let archive = [];
      if (root.dataset.corpusUrl) {
        const response = await fetch(root.dataset.corpusUrl, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load archive index");
        archive = await response.json();
      }
      if (!controller.signal.aborted) renderMap(root, archive, controller);
    } catch (error) {
      if (controller.signal.aborted) return;
      root.querySelector("[data-results-count]").textContent = `${error.message}. Reload to retry.`;
    }
  })();
  return () => controller.abort();
}

function renderMap(root, archive, controller) {
  const pages = [...root.querySelector(".topic-source").content.querySelectorAll(".topic-node")].map(node => ({
    node, title: node.querySelector(".topic-title").textContent,
    url: node.getAttribute("href"), topics: JSON.parse(node.dataset.topics),
    date: node.dataset.date || "", description: node.dataset.description, kind: node.dataset.kind,
  })).concat(archive);
  const groups = JSON.parse(root.dataset.groups);
  const known = new Set(groups.flatMap(g => g.topics));
  const other = [...new Set(pages.flatMap(p => p.topics))].filter(t => !known.has(t));
  if (other.length) groups.push({ title: "More ideas", topics: other });
  const pretty = text => text.replaceAll("-", " ").replace(/^ai\b/, "AI");
  const results = root.querySelector(".topic-pages"), preview = root.querySelector(".topic-preview");
  const groupBox = root.querySelector(".topic-groups"), narrow = root.querySelector(".topic-subtopics");
  const newer = root.querySelector("[data-newer]"), older = root.querySelector("[data-older]");
  let group = null, topic = "", kind = "", query = "", offset = 0;
  const listen = (node, event, fn) => node.addEventListener(event, fn, { signal: controller.signal });

  function show(page) {
    root.querySelector("[data-preview-kind]").textContent = page.kind;
    root.querySelector("[data-preview-title]").textContent = page.title;
    root.querySelector("[data-preview-date]").textContent = page.date.slice(0, 10) || "Publication date not recorded";
    root.querySelector("[data-preview-description]").textContent = page.description;
    root.querySelector("[data-preview-topics]").textContent = page.topics.map(pretty).join(" · ");
    root.querySelector("[data-preview-link]").setAttribute("href", page.url);
    for (const link of results.children) link.classList.toggle("active", link.getAttribute("href") === page.url);
    preview.hidden = false;
  }
  function render() {
    const found = selectPages(pages, { topics: group?.topics, topic, kind, query, offset });
    results.replaceChildren(); preview.hidden = true;
    for (const page of found.pages) {
      const node = document.createElement("a");
      node.className = "topic-node";
      node.setAttribute("href", page.url);
      node.innerHTML = '<span class="topic-kind"></span><span class="topic-title"></span><time class="topic-date"></time><span class="topic-summary"></span>';
      node.querySelector(".topic-kind").textContent = page.kind;
      node.querySelector(".topic-title").textContent = page.title;
      node.querySelector(".topic-date").textContent = page.date.slice(0, 10);
      node.querySelector(".topic-summary").textContent = page.description;
      node.addEventListener("pointerenter", () => show(page));
      node.addEventListener("focus", () => show(page));
      results.append(node);
    }
    root.querySelector("[data-results-title]").textContent = topic ? pretty(topic) : group?.title || "Recent pages";
    root.querySelector("[data-results-count]").textContent = found.total ? `${offset + 1}–${offset + found.pages.length} of ${found.total} · newest first` : "No matching pages";
    newer.disabled = offset === 0;
    older.disabled = offset + PAGE_SIZE >= found.total;
    root.querySelector(".topic-pagination").hidden = found.total <= PAGE_SIZE;
    if (found.pages.length) show(found.pages[0]);
    for (const button of groupBox.children) button.setAttribute("aria-pressed", String(button.dataset.title === (group?.title || "All topics")));
  }
  const searchLabel = document.createElement("label");
  searchLabel.textContent = "Find a page";
  const search = document.createElement("input");
  search.type = "search"; search.placeholder = "Title, description, or topic";
  searchLabel.append(search);
  const topicLabel = document.createElement("label");
  topicLabel.textContent = "Within this topic";
  const select = document.createElement("select");
  topicLabel.append(select); topicLabel.hidden = true;
  const kindLabel = document.createElement("label");
  kindLabel.textContent = "Format";
  const kindSelect = document.createElement("select");
  kindSelect.add(new Option("All formats", ""));
  for (const format of [...new Set(pages.map(p => p.kind))].sort()) kindSelect.add(new Option(format, format));
  kindLabel.append(kindSelect);
  narrow.replaceChildren(searchLabel, kindLabel, topicLabel);
  listen(kindSelect, "change", () => { kind = kindSelect.value; offset = 0; render(); });
  listen(search, "input", () => { query = search.value; offset = 0; render(); });
  listen(select, "change", () => { topic = select.value; offset = 0; render(); });
  groupBox.replaceChildren();
  const ordered = groups.filter(g => selectPages(pages, { topics: g.topics }).total).sort((a, b) =>
    (selectPages(pages, { topics: b.topics }).pages[0]?.date || "").localeCompare(selectPages(pages, { topics: a.topics }).pages[0]?.date || ""));
  for (const item of [null, ...ordered]) {
    const button = document.createElement("button");
    button.type = "button"; button.className = "topic-group"; button.dataset.title = item?.title || "All topics";
    const count = selectPages(pages, { topics: item?.topics }).total;
    const title = document.createElement("strong"); title.textContent = button.dataset.title;
    const detail = document.createElement("span"); detail.textContent = `${count} ${count === 1 ? "page" : "pages"}`;
    button.append(title, detail);
    listen(button, "click", () => {
      group = item; topic = ""; offset = 0;
      select.replaceChildren(new Option("All subtopics", ""));
      for (const tag of (group?.topics || []).filter(t => pages.some(p => p.topics.includes(t)))) select.add(new Option(pretty(tag), tag));
      topicLabel.hidden = !group; render();
    });
    groupBox.append(button);
  }
  listen(newer, "click", () => { offset = Math.max(0, offset - PAGE_SIZE); render(); });
  listen(older, "click", () => { offset += PAGE_SIZE; render(); });
  render();
}
