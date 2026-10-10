# Isolated Scrybe preview

This comparison deploys nothing. Production retains its existing Gemfile,
configuration and build command. The preview changes only the Markdown
processor, with the minimum loader changes needed to activate that processor.

The workflow `.github/workflows/scrybe-preview.yml` first installs and builds
production, then runs `scripts/scrybe_preview_bundle.rb export` inside that
bundle. The script queries Bundler's resolved specifications, including all
transitive dependencies, and writes exact pins into an ignored generated
Gemfile fragment. It reads the installed github-pages configuration code and
its `DEFAULT_PLUGINS`, rather than maintaining a separate version/plugin list.
The same `effective_config` method invoked by the Pages hook supplies the theme,
plugin list, content inclusion rules, highlighter settings and other defaults.
The preview consumes this snapshot before its explicit Scrybe overlay. Machine
source/destination/config paths and the randomized plugin directory are omitted.

The generated bundle pins every production gem except `github-pages` itself.
That gem's after-reset hook restricts the Markdown processor and would silently
replace Scrybe with kramdown, so it is deliberately unavailable to the preview.
Its dependencies remain exactly pinned. Every gem declaration uses
`require: false`; Jekyll loads only the derived configuration's plugin list.
`verify` compares the entire resolved preview gem/version map to the production
snapshot and fails on missing, additional or changed versions. It also rejects
a loaded Pages hook. This prevents independent SEO, Liquid, JSON or other
transitive version drift. A missing generated pin file fails before resolution.

All default and configured plugins from the installed Pages configuration are
included except `jekyll-commonmark-ghpages`, which registers a competing
Markdown processor. Its gem and dependencies remain pinned but are not loaded.
For locally cached github-pages 223, the retained defaults are
`jekyll-coffeescript`, `jekyll-gist`, `jekyll-github-metadata`, `jekyll-paginate`,
`jekyll-relative-links`, `jekyll-optional-front-matter`, `jekyll-readme-index`,
`jekyll-default-layout`, and `jekyll-titles-from-headings`. The site's four
configured plugins are retained too: `jekyll-redirect-from`, `jekyll-seo-tag`,
`jekyll-feed`, and `jekyll-sitemap`. The derivation logs the actual lists for each
installed Pages version. Optional front matter therefore processes COPYRIGHT
on both sides. Safe mode is disabled only for the preview so `_plugins` can
load the opt-in Scrybe processor; production safe-mode behavior is unchanged.

Both builds use the same commit timestamp for `site.time`. The Scrybe executable
is installed at a full source revision. The processor invokes `scrybe render
--profile site --body-only` with stdin and no shell, and fails with a source
filename on a missing binary or nonzero exit. There is no deployment, write
permission or secret input.

Local equivalent (with the pinned binary named `scrybe` on PATH):

```sh
bundle install --local
mkdir -p .scrybe-preview/build
printf 'time: "%s"\n' "$(git show -s --format=%cI HEAD)" > .scrybe-preview/build/time.yml
bundle exec jekyll build --config _config.yml,.scrybe-preview/build/time.yml --destination .scrybe-preview/build/production
bundle exec ruby scripts/scrybe_preview_bundle.rb export
BUNDLE_GEMFILE=.scrybe-preview/Gemfile bundle install --local
BUNDLE_GEMFILE=.scrybe-preview/Gemfile bundle exec ruby scripts/scrybe_preview_bundle.rb verify
BUNDLE_GEMFILE=.scrybe-preview/Gemfile bundle exec jekyll build --config _config.yml,.scrybe-preview/build/production-config.yml,_config.scrybe.yml,.scrybe-preview/build/time.yml --destination .scrybe-preview/build/scrybe
python3 -m unittest discover -s scripts -p 'test_scrybe*.py'
python3 scripts/scrybe_preview_diff.py .scrybe-preview/build/production .scrybe-preview/build/scrybe --output .scrybe-preview/build/report.md
```

For a control build, use the derived bundle/configuration without the Scrybe
overlay. Compare the complete output tree to detect non-converter drift.
The local Jekyll 3.9.0 / SEO 2.7.1 control differs only in JSON-LD object-key
order: Jekyll's Drop enumerates Ruby instance methods rather than sorting keys.
Parsed JSON values and every other byte match. The report deliberately retains
that serialization difference in `metadata`; it is not Markdown behavior.
Locally, cached Pages 223 derives Jekyll 3.9.0; CI's production bundle supplies
its own exact pins.

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
cause-specific excerpts. One-sided files are listed separately. Other non-HTML
assets are outside this report. Missing/empty HTML builds are errors; real
content differences produce a successful report for human review.
