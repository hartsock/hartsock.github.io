import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, existsSync, readdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

// Two real builds exercise the CLI flag, collection filtering and inherited layouts.
// Destinations stay under scripts (excluded from the site); no shared _site is changed.
test('unpublished CLI flag controls drafts, navigation, series badges and banner', () => {
  const scratch = mkdtempSync(join('scripts', '.drafts-nav-'));
  const series = '/age-of-the-confused-deputy/';
  const part = series + 'the-compiler-that-overwrote-the-bills/';
  const title = 'The Age of the Confused Deputy';
  function* htmlFiles(dir) {
    for (const entry of readdirSync(dir, {withFileTypes:true})) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) yield* htmlFiles(path);
      else if (entry.name.endsWith('.html')) yield path;
    }
  }
  try {
    for (const unpublished of [false, true]) {
      const destination = join(scratch, unpublished ? 'staging' : 'public');
      const build = spawnSync('bundle', ['exec', 'jekyll', 'build', '--quiet', '--destination', destination,
        ...(unpublished ? ['--unpublished'] : [])], {
        encoding:'utf8', env:{...process.env, JEKYLL_ENV:'production'}, maxBuffer:8*1024*1024,
      });
      assert.equal(build.status, 0, build.stderr);
      const page = url => readFileSync(join(destination, url, 'index.html'), 'utf8');
      assert.equal(existsSync(join(destination, 'drafts/index.html')), unpublished);
      assert.equal(existsSync(join(destination, 'assets/css/drafts.css')), unpublished);
      assert.equal(existsSync(join(destination, series, 'index.html')), unpublished);
      let navCount = 0;
      for (const path of htmlFiles(destination)) {
        const html = readFileSync(path, 'utf8');
        for (const nav of html.matchAll(/<nav class="site-nav">([\s\S]*?)<\/nav>/g)) {
          navCount++;
          assert.equal(/href="\/drafts\/"/.test(nav[1]), unpublished, path);
        }
        if (!unpublished) assert.doesNotMatch(html, /class="draft-badge"/);
      }
      assert.ok(navCount > 100);
      for (const url of ['/series/', '/all/']) {
        const html = page(url);
        assert.equal(html.includes(title), unpublished);
        assert.equal(html.includes('class="draft-badge"'), unpublished);
      }
      if (unpublished) {
        const drafts = page('/drafts/');
        assert.match(drafts, /href="\/drafts\/" aria-current="page"/);
        assert.ok(drafts.includes(`href="${series}"`));
        assert.ok(drafts.includes(`href="${part}"`));
        assert.match(drafts, /<code>series\/age-of-the-confused-deputy.md<\/code>/);
        assert.match(drafts, /<code>_reads\/age-of-the-confused-deputy\/01-the-compiler-that-overwrote-the-bills.md<\/code>/);
        assert.equal(drafts.split(`href="${part}"`).length, 2, 'series part listed only once');
        assert.match(drafts, /Marked draft/);
        for (const empty of ['Unpublished reads', 'Unpublished posts', 'Unpublished wiki entries', 'Other unpublished pages'])
          assert.ok(!drafts.includes(`>${empty}</h2>`));
        const banner = page(part).match(/<aside class="series-banner">([\s\S]*?)<\/aside>/)?.[1];
        assert.ok(banner?.includes(title));
        assert.match(banner, /class="draft-badge"/);
        assert.match(page(part), /class="back-to-series"/);
      }
    }
  } finally { rmSync(scratch, {recursive:true, force:true}); }
});

const fixtureRuby = String.raw`
require 'jekyll'; require 'json'
Jekyll::PluginManager.require_from_bundler
site=Jekyll::Site.new(Jekyll.configuration('quiet'=>true));site.reset;site.read
results=JSON.parse(STDIN.read).map do |documents|
  payload={'pages'=>[], 'reads'=>[], 'posts'=>[], 'wiki'=>[], 'copy'=>site.collections['copy'].docs}.merge(documents)
  template=site.liquid_renderer.file('_includes/drafts-list.html').parse(File.read('_includes/drafts-list.html'))
  template.render!({'site'=>payload, 'page'=>{'url'=>'/drafts/'}}, registers:{site:site}, strict_filters:true)
end
puts 'DRAFT_FIXTURE_RESULT'+JSON.generate(results)
`;
test('draft inventory groups every kind, omits covered reads, escapes sources and has an empty state', () => {
  const entry = (path, extra={}) => ({path, url:`/${path}/`, title:'A <draft> & title', published:false, ...extra});
  const fixture = {
    pages:[entry('series.md', {series:'fixture', series_order:1}), entry('other.md'),
      entry('drafts.md', {url:'/drafts/'}), entry('marked.md', {published:true, status:'draft'}),
      entry('not-public.md', {status:'draft'})],
    reads:[entry('part.md', {series:'fixture', part:1}), entry('standalone.md'),
      entry('second.md', {series:'fixture', part:2, published:true})],
    posts:[entry('post.md')], wiki:[entry('wiki.md')],
  };
  const run = spawnSync('bundle', ['exec','ruby','-e',fixtureRuby], {
    encoding:'utf8', input:JSON.stringify([{}, fixture]), maxBuffer:4*1024*1024,
  });
  assert.equal(run.status, 0, run.stderr);
  const [empty, html] = JSON.parse(run.stdout.split('DRAFT_FIXTURE_RESULT')[1]);
  assert.match(empty, /No drafts to show\./);
  assert.doesNotMatch(empty, /<h[23]|<li>/);
  for (const heading of ['Unpublished series','Unpublished reads','Unpublished posts','Unpublished wiki entries','Other unpublished pages','Marked draft'])
    assert.ok(html.includes(`>${heading}</h2>`), heading);
  for (const path of ['series.md','other.md','marked.md','not-public.md','part.md','standalone.md','second.md','post.md','wiki.md'])
    assert.equal(html.split(`<code>${path}</code>`).length, 2, path);
  assert.ok(html.indexOf('/part.md/') < html.indexOf('/second.md/'));
  assert.doesNotMatch(html, /<code>drafts.md|<draft>/);
  assert.match(html, /A &lt;draft&gt; &amp; title/);
  assert.doesNotMatch(html.split('>Marked draft</h2>')[1], /not-public.md/);
});
