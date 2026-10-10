# Isolated Scrybe preview

This opt-in comparison deploys nothing. Production keeps its Gemfile and
`_config.yml`; GitHub Pages safe mode ignores the custom plugin. The overlay
selects a custom Jekyll Markdown processor, used for documents and `markdownify`.
The processor shells out without a shell to `scrybe render --profile site
--body-only`, and fails on a missing executable or nonzero status.

The workflow `.github/workflows/scrybe-preview.yml` runs on relevant pull
requests and manually. It builds production with github-pages and checks its
Jekyll version matches the isolated bundle's 3.10.0. A future upstream version
change therefore fails visibly instead of silently comparing different Jekyll
versions. Both builds use the same commit timestamp for `site.time` to avoid
clock-only differences. The Scrybe install is pinned to a full source revision.
The four configured plugins load in the isolated bundle, without github-pages'
Markdown settings. There is no deployment, write permission, or secret input.

Local equivalent (with the pinned binary already named `scrybe` on PATH):

```sh
bundle install --local
mkdir -p .scrybe-preview/build
printf 'time: "%s"\n' "$(git show -s --format=%cI HEAD)" > .scrybe-preview/build/time.yml
bundle exec jekyll build --config _config.yml,.scrybe-preview/build/time.yml --destination .scrybe-preview/build/production
BUNDLE_GEMFILE=.scrybe-preview/Gemfile bundle install --local
BUNDLE_GEMFILE=.scrybe-preview/Gemfile bundle exec jekyll build --config _config.yml,_config.scrybe.yml,.scrybe-preview/build/time.yml --destination .scrybe-preview/build/scrybe
python3 -m unittest discover -s scripts -p 'test_scrybe*.py'
python3 scripts/scrybe_preview_diff.py .scrybe-preview/build/production .scrybe-preview/build/scrybe --output .scrybe-preview/build/report.md
```

The report compares every `.html` file plus `feed.xml` and `sitemap.xml` by
relative path. A tokenizer locates real tags without reserializing them. Only
whitespace-only text between those tags is normalized; quoted attribute values,
comments, visible text, and pre/code/script/style/textarea content are preserved.
Files are decoded directly from UTF-8 bytes, retaining CR and CRLF differences.
Nonbreaking spaces remain visible text.

Metadata differences (meta/generator tags, JSON-LD, and feed/sitemap timestamps)
have their own group and remain in the report. Other feature projections suggest
smart punctuation, code-block markup and heading-ID causes. These are heuristic,
overlapping labels, not proof of equivalent behavior. Unexplained differences
remain `other`. Each group lists every affected file and up to three escaped,
cause-specific excerpts, rather than the page's first unrelated mismatch.
One-sided files are listed separately. Other non-HTML assets are outside this
report. Missing/empty HTML builds are errors; real content differences produce
a successful report for human review.
