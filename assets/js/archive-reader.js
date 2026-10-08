export function mount(root) {
  const controller = new AbortController();
  const params = new URLSearchParams(location.search);
  const chunk = params.get("chunk"), id = params.get("id");
  (async () => {
    try {
      if (!/^\d+$/.test(chunk || "") || !/^\d+$/.test(id || "")) throw new Error("Invalid archive link");
      const response = await fetch(`/preview-corpus/chunk-${chunk}.json`, { signal: controller.signal });
      if (!response.ok) throw new Error("Archive data is unavailable");
      const record = (await response.json()).find(record => record.id === id);
      if (!record) throw new Error("Tweet not found in this archive");
      root.querySelector("[data-archive-title]").textContent = record.kind === "Retweet" ? "Retweeted by @hartsock" : "From @hartsock";
      root.querySelector("[data-archive-date]").textContent = new Date(record.date).toLocaleString();
      root.querySelector("[data-archive-note]").textContent = "Preserved text from the Twitter export. Media and external links are not loaded.";
      root.querySelector("[data-archive-body]").textContent = record.body;
    } catch (error) {
      if (controller.signal.aborted) return;
      root.querySelector("[data-archive-title]").textContent = error.message;
    }
  })();
  return () => controller.abort();
}
