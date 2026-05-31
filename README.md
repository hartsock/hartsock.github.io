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

## /archive/

`/archive/` is a static snapshot of the original 2014 Octopress site, kept for
posterity. Its internal links were rewritten to live under `/archive/`. The
untouched original is also preserved on the `archive/octopress-2014` branch.
