import test from "node:test";
import assert from "node:assert/strict";
import { selectPages, PAGE_SIZE } from "../assets/js/topic-map.js";

const pages = Array.from({ length: 1000 }, (_, i) => ({
  title: `Post ${i}`, url: `/posts/${i}/`, description: "Archived writing",
  date: new Date(Date.UTC(2006, 0, i + 1)).toISOString().slice(0, 10),
  topics: [i % 2 ? "testing" : "philosophy"],
}));
test("a thousand entries stay bounded and page through newest first without loss", () => {
  const seen = [];
  for (let offset = 0; offset < pages.length; offset += PAGE_SIZE) {
    const result = selectPages(pages, { offset });
    assert.equal(result.total, 1000);
    assert(result.pages.length <= 6);
    seen.push(...result.pages);
  }
  assert.equal(new Set(seen.map(p => p.url)).size, 1000);
  assert.equal(seen[0].url, "/posts/999/");
  assert.equal(seen.at(-1).url, "/posts/0/");
});
test("topic filtering and search reach older material", () => {
  assert.equal(selectPages(pages, { topics: ["testing"] }).total, 500);
  assert.equal(selectPages(pages, { topics: ["testing"], topic: "philosophy" }).total, 0);
  const result = selectPages(pages, { query: "Post 123" });
  assert.equal(result.total, 1);
  assert.equal(result.pages[0].url, "/posts/123/");
});
test("import time cannot outrank original dates; undated entries sort last", () => {
  const result = selectPages([
    { ...pages[0], date: "2015-05-05", imported: "2026-10-07", url: "/archive/" },
    { ...pages[0], date: "2026-10-02", url: "/new/" },
    { ...pages[0], date: "", url: "/undated/" },
  ]);
  assert.deepEqual(result.pages.map(p => p.url), ["/new/", "/archive/", "/undated/"]);
});
