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
series/<slug>.md              # landing page  (layout: series, permalink: /<slug>/)
_reads/<slug>/NN-title.md     # the parts     (layout: read, front matter: series, part, dek, read_time, permalink)
```

The home page and every read's banner are generated from `_data/series.yml`, so
the title/tagline live in exactly one place.

### Add a new series

1. Add a block to `_data/series.yml`.
2. Create `series/<slug>.md` with `layout: series`, `series: <slug>`,
   `permalink: /<slug>/`.
3. Drop the parts in `_reads/<slug>/` — each with front matter:

   ```yaml
   ---
   title: "Part title"
   series: <slug>
   part: 1
   dek: "One-line standfirst."
   read_time: "~5 min"
   permalink: /<slug>/part-title/
   ---
   ```

Prev/next navigation and "Part N of M" are computed automatically from `part`.

## Local preview

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

## By-lines, AI labels, revisions

Front matter drives a by-line (`_includes/byline.html`) and a revision list
(`_includes/revisions.html`), used by `read` and `essay` layouts:

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
their own id), omit `model` and give only `harness`; never guess. The workspace footer line is not used on this site; the by-line
replaces it. `/all/` lists every page from build data, and the home page lists
essays (`layout: essay`), so nothing is orphaned. A new series must be added to
`_data/series.yml` to appear in either place.
