import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const knowledge = process.argv[2];
const publishBlog = process.argv.includes('--publish-blog');
const out = path.join(root, publishBlog ? '_posts' : '_corpus_preview');
const rules = [
  ["ai-agents", /\b(ai|llm|agents?|neural|machine learning)\b/i],
  ["capability-security", /\b(security|ocap|capabilit|cryptograph|authentication)/i],
  ["testing", /\b(testing|unit tests?|tdd|fixtures?)\b/i],
  ["python", /\b(python|pyvmomi|pycon)\b/i],
  ["software-design", /\b(groovy|grails|java|programming|software|code|api|linux|database)\b/i],
  ["documentation", /\b(documentation|sphinx|technical writing)\b/i],
  ["organizations", /\b(team|management|conway|community|leadership|organization)\b/i],
  ["theology", /\b(theology|church|christian|pastor|god|faith)\b/i],
  ["philosophy", /\b(philosophy|consciousness|meaning|ethics|gödel|godel)\b/i],
  ["society", /\b(politic|election|government|president|democracy|society)/i],
  ["science", /\b(science|physics|biology|evolution|dinosaurs?|space|climate)\b/i],
];
const strip = text => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
const read = (archive, entry) => {
  if (path.basename(entry.file) !== entry.file) throw new Error("Unsafe manifest filename");
  return strip(fs.readFileSync(path.join(knowledge, archive, "posts", entry.file), "utf8"));
};
const plain = text => text.replace(/!\[[^\]]*\]\([^)]*\)/g, "[media]").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#*`_]/g, "").replace(/\s+/g, " ").trim();
const classify = text => { const found = rules.filter(([, rule]) => rule.test(text)).map(([tag]) => tag).slice(0, 3); return found.length ? found : ["personal-notes"]; };
const wrap = (front, body) => {
  front = { excerpt_separator: "", ...front };
  if (body.includes("{% endraw %}")) throw new Error("Unexpected Liquid delimiter in archive");
  return `---\n${Object.entries(front).map(([k,v]) => `${k}: ${JSON.stringify(v)}`).join("\n")}\n---\n{% raw %}\n${body}\n{% endraw %}\n`;
};
export function blogPage(p, body, publish = false) {
  const slug = p.file.replace(/\.md$/, "");
  const topics = classify(`${p.title} ${(p.labels || []).join(" ")} ${plain(body).slice(0, 500)}`);
  const url = `/posts/archive/${slug}/`;
  const date = new Date(p.published).toISOString();
  const description = plain(body).slice(0, 220);
  const front = publish
    ? {layout:'archive-post',title:p.title,date:p.published,description,topics,original_labels:p.labels || [],original_url:p.original_url,
       authors:[{name:'Shawn Hartsock',role:'author'}],ai:'none',republished:true,redirect_from:url}
    : {layout:'archive-preview',title:p.title,date,sitemap:false,noindex:true,permalink:url};
  return {body,front,catalog:{title:p.title,date,topics,description,url,kind:'Archive post'}};
}
function main() {
if (!knowledge) throw new Error('Usage: node scripts/build-preview-corpus.mjs /path/to/knowledge [--publish-blog]');
fs.mkdirSync(out, { recursive: true });
const catalog = [], seen = new Set();
const blogs = JSON.parse(fs.readFileSync(path.join(knowledge, "hartsock-blog-archive/manifest.json"), "utf8")).posts;
for (const p of blogs) {
  if (publishBlog && fs.existsSync(path.join(out,p.file))) throw new Error(`Refusing to overwrite ${p.file}`);
  const page = blogPage(p, read('hartsock-blog-archive',p).replace(/^\s*# [^\n]*\n/, ''), publishBlog);
  catalog.push(page.catalog);
  fs.writeFileSync(path.join(out,p.file),wrap(page.front,page.body));
}
if (publishBlog) { console.log(`Republished ${blogs.length} blog sources. Run scripts/page-id.py --write on the new posts before building.`); return; }
const tweets = JSON.parse(fs.readFileSync(path.join(knowledge, "hartsock-twitter-archive/manifest.json"), "utf8")).tweets;
const chunks = [];
let duplicates = 0;
for (const tweet of tweets) {
  if (!/^\d+$/.test(tweet.tweet_id)) throw new Error("Invalid tweet identity");
  if (seen.has(tweet.tweet_id)) { duplicates++; continue; }
  seen.add(tweet.tweet_id);
  const body = read("hartsock-twitter-archive", tweet);
  const text = plain(body);
  const date = new Date(tweet.published).toISOString();
  const kind = /^RT\s+@/i.test(body.trim()) ? "Retweet" : "Tweet";
  const record = { id: tweet.tweet_id, date, body, kind };
  const chunk = Math.floor((seen.size - 1) / 256);
  (chunks[chunk] ||= []).push(record);
  catalog.push({ title: text.slice(0, 100) || "Untitled tweet", date, topics: classify(body), description: text.slice(0, 220), kind,
    url: `/preview-corpus/read/?chunk=${chunk}&id=${tweet.tweet_id}` });
}
for (const [n, records] of chunks.entries()) fs.writeFileSync(path.join(out, `chunk-${n}.json`), wrap({ layout: null, sitemap: false, permalink: `/preview-corpus/chunk-${n}.json` }, JSON.stringify(records)));
catalog.sort((a,b) => b.date.localeCompare(a.date));
fs.writeFileSync(path.join(out, "catalog.json"), wrap({ layout: null, sitemap: false, permalink: "/preview-corpus/catalog.json" }, JSON.stringify(catalog)));
fs.writeFileSync(path.join(out, "reader.html"), wrap({ layout: "default", title: "Twitter archive preview", noindex: true, sitemap: false, permalink: "/preview-corpus/read/" }, '<article class="read" data-app="archive-reader"><p class="draft-banner">Twitter archive · local preview only</p><h1 data-archive-title>Loading archived tweet…</h1><p data-archive-date></p><p data-archive-note></p><div data-archive-body style="white-space:pre-wrap;overflow-wrap:anywhere"></div><p><a href="/">Explore topics</a></p></article>'));
fs.writeFileSync(path.join(root, "_config.preview.yml"), 'archive_preview: true\npreview_corpus_url: /preview-corpus/catalog.json\nurl: http://127.0.0.1:4173\ncollections:\n  corpus_preview:\n    output: true\n');
const report = { blogPosts: blogs.length, tweets: seen.size, duplicateIDsSkipped: duplicates, total: catalog.length, tweetChunks: chunks.length,
  catalogBytes: Buffer.byteLength(JSON.stringify(catalog)), retweets: catalog.filter(p=>p.kind === "Retweet").length,
  topicAssignment: "Provisional keyword rules for test coverage; not model-reviewed tags", bodies: "Sanitized Markdown only; no raw exports, media, or messages", earliest: catalog.at(-1).date, latest: catalog[0].date };
fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
