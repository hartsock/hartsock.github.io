import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveRoute } from "../courses/app/router.js";

const { courses } = JSON.parse(readFileSync(new URL("../courses/content/manifest.json", import.meta.url)));
test("existing session links survive catalog routing", () => {
  assert.equal(resolveRoute(courses, "ai-theology/session-3").view, "session3");
});
test("two courses can use the same session slug without crossing courses", () => {
  const catalog = [...courses, { slug: "second-course", title: "Second", sessions: [
    { slug: "session-3", title: "Other session", view: "other" },
  ] }];
  assert.equal(resolveRoute(catalog, "second-course").course.title, "Second");
  assert.equal(resolveRoute(catalog, "second-course/session-3").view, "other");
  assert.equal(resolveRoute(catalog, "ai-theology/session-3").view, "session3");
  assert.equal(resolveRoute(catalog, "second-course/missing"), null);
  assert.equal(resolveRoute(catalog, "missing/session-3"), null);
});
