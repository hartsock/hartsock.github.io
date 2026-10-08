# hartsock.github.io

The canonical home for Shawn Hartsock's writing — built with Jekyll, served by
GitHub Pages at <https://hartsock.github.io>. Plain text, kept in git, no
platform lock-in. Where a piece is cross-posted to Substack or Medium, *this* is
the canonical copy (set a `rel=canonical` link back here on the mirror).

## How series work

A **series** is the unit of publishing. Each series has a banner, a landing
page, and an ordered set of "reads" (~5-minute parts).

```
_data/series.yml              # one block per series: slug, title, url, tagline, blurb
series/<slug>.md              # landing page  (layout: series, permalink: /series/<slug>/)
_reads/<slug>/NN-title.md     # the parts     (layout: read, front matter: series, part, dek, read_time, permalink)
```

The home page and every read's banner are generated from `_data/series.yml`, so
the title/tagline live in exactly one place.

### Add a new series

1. Add a block to `_data/series.yml`.
2. Create `series/<slug>.md` with `layout: series`, `series: <slug>`,
   `permalink: /series/<slug>/`.
3. Drop the parts in `_reads/<slug>/` — each with front matter:

   ```yaml
   ---
   title: "Part title"
   series: <slug>
   part: 1
   dek: "One-line standfirst."
   read_time: "~5 min"
   permalink: /series/<slug>/part-title/
   ---
   ```

Prev/next navigation and "Part N of M" are computed automatically from `part`.

### Unlisted series

Set `sitemap: false` on the series entry in `_data/series.yml` and on its
landing page and reads (front matter defaults in `_config.yml` can cover a
whole series). The series disappears from Home, Series, All pages, and the
sitemap; its pages retain direct access and carry `noindex`. Series are not
included in the blog feed. This is discoverability control, not privacy.
When moving a page, preserve its old URL with `redirect_from`.

## Topic navigation

The home page is the similarity map. `/explore/` collects listed posts, wiki entries, series landing pages, and
course landing pages at build time. Add `topics: [topic-slug, ...]` to front
matter; existing post `tags` are used when `topics` is absent. Course landing
pages also set `topic_kind: Course`. Hovering or focusing a page previews it;
the page and preview links navigate normally. Touch screens retain readable
descriptions without requiring hover. Unlisted and unpublished pages are
excluded. Pages without topics remain available through their area indexes.

Broad groups in `_data/topics.yml` reveal subtopics. Results are bounded to
six pages, newest first, with Older/Newer navigation and text search.
Posts use their original publication date; other pages can set `topic_date`.
Undated pages sort last. File modification and import dates are never used.
Unknown tags appear under More ideas, without multiplying top-level groups.

### Publication and map regeneration

The 314 original blog articles are republished in `_posts/`, with their original
dates, unchanged prose, original source links and stable content-addressed IDs.
The site timezone is explicitly America/New_York so a UTC build does not move
late-night originals onto the next calendar day.
They join current posts in the blog, topic browser, sitemap and feed. Import
dates never become publication dates. Old preview URLs redirect to their new
canonical URLs. The Twitter corpus is not published.

The one-time importer is `node scripts/build-preview-corpus.mjs /path/to/knowledge --publish-blog`.
It reads only the sanitized blog manifest and its referenced Markdown, refuses
to overwrite posts, and never reads the Twitter archive in publication mode.
Then assign IDs with `python scripts/page-id.py --write` and the new post paths.

Every content publication must refresh the committed map:

```sh
bundle exec jekyll build
python scripts/build-similarity-map.py
bundle exec jekyll build
python scripts/check-publication.py
python scripts/orphans.py
```

The generator reads the built, listed-page catalog and each page's main content,
not navigation or model settings. It includes posts, wiki, listed series/reads,
and course landing pages; unpublished and unlisted pages are excluded. A
`content-addressable` input ID lets CI reject stale map snapshots. Commit
`_data/concept_map.json` with content changes. Pages hosting needs no inference
service: embeddings are generated locally and served as static JSON. Incremental
embedding caches and stable alignment between publications are not implemented.

Install `content-addressable==0.1.1`, `PyYAML`, `spacy`, and
`sentence-transformers` in an isolated Python environment, plus the
`en_core_web_sm` model. This release used spaCy 3.8.16 / model 3.8.0 and
sentence-transformers 6.1.0. The CI build runs the site checks with the normal
`github-pages` Gemfile; extraction/model tests can also be run locally.

### Private corpus experiment

The local archive corpus lives in the gitignored `_corpus_preview/` collection.
Generate it with `node scripts/build-preview-corpus.mjs /path/to/knowledge`.
It is enabled only by the generated, gitignored `_config.preview.yml`:
`bundle exec jekyll build --config _config.yml,_config.preview.yml`.
Ordinary builds omit this collection. Samples retain the original prose and
publication dates, and use `/posts/archive/` URLs with a visible preview notice.
They are omitted from the sitemap and feed even in preview builds.
The importer preserves 314 blog posts and 15,546 tweet records; retweets stay
distinct. Archive topic assignments are provisional keyword rules, not reviewed
model suggestions. Search covers titles, excerpts, and tags, not complete bodies.

For the local spatial experiment, run `python scripts/build-similarity-map.py --preview` after the preview
build, then rebuild the preview. Open `/preview-corpus/map/`.
The private experiment reads all 314 archive articles. spaCy identifies nouns, noun phrases,
and named entities; explicit aliases preserve technical spelling (pyVmomi,
VMware, OpenStack) and merge obvious variants (test/tests/testing).
Common nouns are lemmatized even inside named phrases, so "VMware
administrators" shares a concept with "VMware administrator". Explicit aliases
merge capitalized or hyphenated "Domain Specific Language(s)"; protected names
such as Grails and Rails are resolved before lemmatization, never by stripping
a trailing `s`. This is a conservative technical vocabulary, not a guarantee
that every named-entity variant is resolved. Generic
terms, dates, fenced code, URLs, and markup are excluded. Candidate ranking
uses document frequency, mentions, title matches, and a name/phrase preference.
Membership includes every article where the selected concept was extracted;
it is not capped per article. The UI reports coverage: sparse or unusual posts
may have no retained concept and remain accessible in the full corpus browser.

MiniLM embeds up to two bounded passages around each concept per article,
averaging within articles first and then across articles. Repetition in a
long article cannot give it extra votes. Neighbors use cosine similarity in
384 dimensions; classical MDS provides an approximate 2D projection. These
positions represent the concept in this corpus, not dictionary-word distance.
Dot radius uses the square root of distinct article count (with a visual cap).
Frequency controls size, not the semantic anchors. D3 collision/repulsion forces
relax display positions around those anchors using soft position springs.
The bounded solver runs only when the visible set changes (or on explicit
replay); a 900ms ease-out shows the result and then stops. Hover only updates
highlights and the preview. Existing display positions seed subsequent solves.
Hovering, keyboard-focusing, or pinning a concept fades unrelated label leaders
while emphasizing the active connections; dots and labels retain their context.
Moving away restores the overview unless a concept is pinned. This is purely
visual: it does not alter positions or restart the simulation.
Labels avoid both dots and other labels; views over 100 concepts use smaller
labels. `Replay settling` demonstrates the motion; `Settle now` stops it at the
solved layout. Reduced-motion preferences skip animation. Navigation cancels
the animation and removes listeners. The original embedding data is never
mutated. Clicking pins a newest-first article list and adds neighbors without
removing previously revealed points. Search and reset can change visibility.
Article links use the existing HTMX navigation; an accessible concept list
and keyboard selection provide alternatives to pointing at the map.

These remain unreviewed concept suggestions, not accepted author tags.
Tweets are excluded from this first map. Topic colors do not determine distance.
Model files download from Hugging Face, but article text is processed locally.
Private experiment maps remain in the ignored collection; the public map is
generated separately from the listed-site inventory described above.
The locally served D3 bundle avoids a new runtime CDN dependency. Versions and
the ISC license are in `assets/js/vendor/D3-LICENSE.txt`. It bundles only
`forceSimulation`, `forceCollide`, `forceX`, `forceY`, and `forceManyBody` from
`d3-force@3.0.0`, using esbuild 0.25.12 (`--bundle --format=esm --minify`).
Test the concept extractor with
`python -m unittest discover -s scripts -p test_concepts.py` and map behavior
with `node --test scripts/similarity-map.test.mjs`.
Run `node --test scripts/topic-map.test.mjs` for bounded pagination, topic
search, and original-date ordering checks using 1,000 entries.

The initial topic assignments were generated by GPT-6 in Codex and are
editable suggestions. Browser-model suggestions inside the private editor
are planned; accepting suggestions must be an explicit author action before
they change saved metadata.

## Course catalog

`courses/content/manifest.json` holds a `courses` array. Each course has a
unique `slug`, `title`, `description`, and `sessions` array. Each session has
a course-local `slug`, `title`, `description`, and `view` (the module basename
under `courses/app/views/`, exporting `mount`). Add its authorship and review
record under `pages["<course>/<session>"]` in the same manifest.

The catalog links to `/courses/<course>/` and `/courses/<course>/<session>/`.
Add a Jekyll page at each path with the same course app container and extra
stylesheet as the existing pages. Additional courses need no router edits.
Existing `/courses/#/ai-theology/session-3` links keep working.
Model settings are shared across all courses. No second course content has
been invented; add it to the catalog when ready.

Run `node --test scripts/course-routing.test.mjs` to check course isolation
and preservation of existing session routes.

Model: GPT-6 | Harness: Codex | Operator: Shawn Hartsock | Time: 19:33 EDT | Date: 2026-10-07

## Local preview

### Browser chat Lab

`/lab/` is an experimental, no-index page in the normal site shell. It lists
all six tested builds by weight-download size, shows separate GPU-memory
estimates and reviewed smoke-test findings, and defaults to Qwen3.5 0.8B.
The site picker uses the same catalog; an existing saved choice is preserved.
No overall accuracy score is claimed. One article and a handful of follow-ups
are insufficient to establish a reliable assistant.

`assets/js/browser-models.js` pins the six MLC weight revisions and compiled
libraries used with WebLLM 0.2.85. The dated card measurements are from actual
Chrome smoke tests, not upstream benchmark scores. Update those editorial
observations only after reviewing answers, not by matching keywords.

`lab/context.json` is generated from a public post and its current metadata at
build time. The lab sends plain article text, replays bounded conversation
history after resetting the engine, disables Qwen thinking explicitly and folds
Gemma's system instructions into the first user message. The Gemma build still
has known contextual-output failures and is labeled accordingly.

Session-only loading is an **experimental worker-local RAM cache**, not a new
WebLLM storage backend or a browser privacy-setting change. It is the initial
mode to avoid persistent-storage failures, but needs extra RAM and downloads
again after unloading. Saved-download mode remains available. Neither the
browser's quota estimate nor the catalog's GPU estimate guarantees capacity.
OpenRouter `:free` variants and a user-supplied endpoint remain alternatives;
the Lab itself never sends prompts to remote inference.

No model downloads on Lab entry. Send is the primary action: if a model is not
loaded, a cancellable progress dialog appears, then the queued message sends
exactly once. Cancelling or failing the load preserves the draft for retry.
An already-loaded model responds without another download or loading dialog.
Leaving via HTMX, stopping or changing models
terminates the worker. The Lab unloads the normal site model before a trial to
avoid competing GPU allocations. Transcripts stay in visit memory, are excluded
from HTMX history snapshots, and can be exported deliberately (including prompts).
Exports retain at most 20 runs and 60 replies per run. There is no analytics or
automatic transcript upload.

Run `node --test scripts/*.test.mjs` for catalog, request formatting, cache and
worker lifecycle regressions. After a Jekyll build, run `node scripts/check-lab.mjs`
for the real generated context and page contract. Browser QA must additionally
load a real model, inspect its replies, stop during load/generation, and leave
and re-enter through HTMX; mocked lifecycle tests cannot establish WebGPU support.

### Run the site

```
bundle install
bundle exec jekyll serve
```

## Layout

- `_layouts/default.html` — shell (header, footer, archive link)
- `_layouts/read.html` — a single read: banner, dek, body, prev/next
- `_layouts/series.html` — a series landing page: banner + ordered parts
- `_includes/series-banner.html` — the reusable series banner
- `assets/css/style.css` — the whole stylesheet (intentionally small)

## The old 2014 site

The original Octopress site that used to live here is preserved on the
`archive/octopress-2014` branch. It is intentionally **not** published on the
new site.

## License

The writing is under traditional copyright — all rights reserved. See
[`COPYRIGHT.md`](COPYRIGHT.md). No open-source or Creative Commons license is
granted.

## Areas

- **Blog:** `_posts/YYYY-MM-DD-slug.md`, dated, newest first, the only thing in
  the feed. Run `scripts/page-id.py --write _posts/<file>` once per new post; it
  adds `id:` and `permalink:` (`/posts/<slug>-<8 chars>/`; `/blog/` belongs to the separate `hartsock/blog` project site). The id is a
  `content-addressable` ContentId over {area, slug, date, first author}, never
  the body, so edits do not move the URL. `scripts/page-id.py --check` fails on
  drift (needs `pip install content-addressable pyyaml`).
- **Series:** as described above; not in the feed.
- **Wiki:** `_wiki/<name>.md`, living pages at `/wiki/<name>/` (OCAP keeps its
  original URL redirects to `/wiki/ocap-in-the-age-of-agents/`).
- `/all/` lists every page from build data.

## By-lines, AI labels, revisions

Front matter drives a by-line (`_includes/byline.html`) and a revision list
(`_includes/revisions.html`):

```yaml
authors:        # order of contribution; the operator is listed by default
  - {name: Shawn Hartsock, role: commissioned}
  - {name: Claude, model: <exact model id>, harness: <harness>, role: drafted}
ai: drafted     # none | assisted | drafted | generated
status: draft   # draft shows an "Unreviewed draft" banner; remove when signed off
revisions:
  - {date: YYYY-MM-DD, by: <exact model id or name>, note: "..."}
```

Record exact model identifiers, since precision can be dropped later but not
reconstructed. If the harness cannot expose one (some Codex models do not know
their own id), omit `model` and give only `harness`; never guess. The workspace
footer line is not used on this site; the by-line replaces it.
- `scripts/orphans.py _site` (after a build) fails on orphaned pages or broken internal links.

Release implementation and republication tooling contribution:
Model: not exposed by harness | Harness: Codex | Operator: Shawn Hartsock | Time: 21:20 EDT | Date: 2026-10-07
