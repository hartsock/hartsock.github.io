import test from 'node:test';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, existsSync, readdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

// Two real builds exercise the CLI flag, collection filtering and inherited layouts.
// Destinations stay under scripts (excluded from the site); no shared _site is changed.
test('unpublished CLI flag controls drafts, navigation, series badges and banner', async () => {
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
          const editLinks = [...nav[1].matchAll(/<a href="(\/_overlay\/on\?next=[^"]*)"([^>]*)>Edit<\/a>/g)];
          assert.equal(editLinks.length, unpublished ? 1 : 0, path);
          if (unpublished) {
            assert.match(nav[1], /data-md-key="copy.drafts.nav">Drafts<\/a>\s*<a href="\/_overlay\/on\?next=/);
            assert.match(editLinks[0][2], /data-md="_copy\/site.md" data-md-key="copy.edit.nav"/);
            assert.match(editLinks[0][2], /hx-boost="false"/);
            const url = '/' + path.slice(destination.length + 1).replace(/index\.html$/, '');
            assert.equal(editLinks[0][1], '/_overlay/on?next=' + url, path);
          }
          assert.equal(/href="\/drafts\/"/.test(nav[1]), unpublished, path);
        }
        if (!unpublished) assert.doesNotMatch(html, /class="(?:draft|unlisted)-badge"/);
      }
      assert.ok(navCount > 100);
      const home = page('/');
      const moduleURL = home.match(/<script type="module" src="([^"]+)"/)[1];
      const source = readFileSync(join(destination, moduleURL.split('?')[0]), 'utf8');
      const syntax = spawnSync(process.execPath, ['--check', '--input-type=module'], {input:source, encoding:'utf8'});
      assert.equal(syntax.status, 0, syntax.stderr);
      // Run the actual built lifecycle hook and event registrations with a persistent header.
      const hooks = source.slice(source.indexOf('async function onPage()'), source.indexOf('// Only pages are swapped'));
      const listeners = new Map();
      const edit = {href: 'https://example.test/_overlay/on?next=/',
        setAttribute(name, value) { if (name === 'href') this.href = new URL(value, 'https://example.test').href; },
        removeAttribute() {}};
      const location = {pathname:'/'};
      let present = unpublished;
      const context = {URL, location, pages:{leave() {}}, document:{
        querySelectorAll: () => present ? [edit] : [],
        querySelector: selector => selector === '[data-site-edit]' && present ? edit : null,
        body:{addEventListener: (name, callback) => listeners.set(name, callback)},
      }};
      runInNewContext(hooks, context);
      if (unpublished) {
        for (const [event, pathname, expected] of [
          ['htmx:afterSwap', '/posts/documentation-is-live-2tuzcfdi/', '/_overlay/on?next=/posts/documentation-is-live-2tuzcfdi/'],
          ['htmx:afterSettle', part, '/_overlay/on?next=' + part],
          ['htmx:historyRestore', '/', '/_overlay/on?next=/'],
          ['htmx:afterSwap', '/bad%20path/', '/_overlay/on'],
          ['htmx:afterSwap', '//outside/', '/_overlay/on'],
          ['htmx:afterSwap', '/bad?query/', '/_overlay/on'],
          ['htmx:afterSwap', '/bad\n', '/_overlay/on'],
          ['htmx:historyRestore', '/drafts/', '/_overlay/on?next=/drafts/'],
        ]) {
          location.pathname = pathname;
          await listeners.get(event)();
          assert.equal(edit.href, 'https://example.test' + expected, event + ': ' + pathname);
        }
      }
      assert.equal(existsSync(join(destination, 'assets/js/site-edit.js')), unpublished);
      if (unpublished) assert.match(home, /data-site-edit/);
      present = false;
      await listeners.get('htmx:afterSwap')();
      for (const url of ['/series/', '/all/']) {
        const html = page(url);
        assert.equal(html.includes(title), unpublished);
        assert.equal(html.includes('The Cruel Symmetry'), unpublished);
        assert.equal(html.includes('class="unlisted-badge"'), unpublished);
        if (unpublished) {
          assert.match(html, /class="unlisted-badge"[^>]*>Unlisted<\/span>/);
          assert.match(html, /class="draft-badge"[^>]*>Draft<\/span>/);
        }
        assert.equal(html.includes('class="draft-badge"'), unpublished);
      }
      if (unpublished) {
        for (const url of ['/', '/posts/documentation-is-live-2tuzcfdi/', part, '/drafts/']) {
          const href = page(url).match(/href="(\/_overlay\/on\?next=[^"]*)"/)[1];
          assert.equal(href, '/_overlay/on?next=' + url);
        }
        const drafts = page('/drafts/');
        assert.match(drafts, /href="\/drafts\/" aria-current="page"/);
        assert.ok(drafts.includes(`href="${series}"`));
        assert.ok(drafts.includes(`href="${part}"`));
        assert.match(drafts, /<code>series\/age-of-the-confused-deputy.md<\/code>/);
        assert.match(drafts, /<code>_reads\/age-of-the-confused-deputy\/01-the-compiler-that-overwrote-the-bills.md<\/code>/);
        assert.equal(drafts.split(`href="${part}"`).length, 2, 'series part listed only once');
        assert.match(drafts, /Marked draft/);
        assert.match(drafts, /data-md="drafts.md" data-md-key="title">Drafts and unlisted pages<\/h1>/);
        const unlisted = drafts.split('data-md-key="copy.drafts.unlisted">')[1];
        assert.ok(unlisted, 'Unlisted section exists');
        assert.match(unlisted, /<code>series\/cruel-symmetry.md<\/code>/);
        const paths = [...unlisted.matchAll(/<code>(_reads\/cruel-symmetry\/[^<]+)<\/code>/g)].map(m => m[1]);
        assert.equal(paths.length, 6);
        assert.deepEqual(paths.map(path => Number(path.split('/').at(-1).slice(0, 2))), [1,2,3,4,5,6]);
        assert.match(page('/series/cruel-symmetry/the-tool-outran-the-hand/'), /<aside class="series-banner">[\s\S]*?The Cruel Symmetry/);
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


test('unlisted inventory groups published content and excludes technical pages', () => {
  const entry = (path, extra={}) => ({path, url:`/${path}/`, title:'An <unlisted> & title',
    published:true, sitemap:false, output_ext:'.html', layout:'doc', ...extra});
  const fixture = {
    pages:[entry('series.md', {series:'hidden', series_order:1}), entry('other.md'),
      entry('stub.html', {layout:'redirect', redirect:{from:'/stub/', to:'/target/'}}),
      entry('redirect.md', {redirect_to:'/target/'}), entry('data.json', {output_ext:'.json'}),
      entry('raw.json', {output_ext:null, url:'/raw.json'}), entry('technical.html', {layout:null}), entry('untitled.md', {title:null}),
      entry('blank.md', {title:''}), entry('drafts.md', {url:'/drafts/'}),
      entry('ordinary.md', {sitemap:true}), entry('draft.md', {published:false})],
    reads:[entry('second.md', {series:'hidden', part:2}), entry('first.md', {series:'hidden', part:1}),
      entry('standalone.md')], posts:[entry('post.md', {series:'hidden'})], wiki:[entry('wiki.md')],
  };
  const run = spawnSync('bundle', ['exec','ruby','-e',fixtureRuby], {
    encoding:'utf8', input:JSON.stringify([fixture]), maxBuffer:4*1024*1024,
  });
  assert.equal(run.status, 0, run.stderr);
  const [html] = JSON.parse(run.stdout.split('DRAFT_FIXTURE_RESULT')[1]);
  const unlisted = html.split('data-md-key="copy.drafts.unlisted">')[1];
  assert.ok(unlisted, 'Unlisted section exists');
  for (const path of ['series.md','first.md','second.md','standalone.md','post.md','wiki.md','other.md'])
    assert.equal(unlisted.split(`<code>${path}</code>`).length, 2, path);
  for (const path of ['stub.html','redirect.md','data.json','raw.json','technical.html','untitled.md','blank.md','drafts.md','ordinary.md','draft.md'])
    assert.ok(!unlisted.includes(`<code>${path}</code>`), path);
  assert.ok(unlisted.indexOf('/first.md/') < unlisted.indexOf('/second.md/'));
  assert.ok(unlisted.indexOf('/second.md/') < unlisted.indexOf('/standalone.md/'));
  assert.ok(unlisted.indexOf('/standalone.md/') < unlisted.indexOf('/post.md/'));
  assert.ok(unlisted.indexOf('/post.md/') < unlisted.indexOf('/wiki.md/'));
  assert.ok(unlisted.indexOf('/wiki.md/') < unlisted.indexOf('/other.md/'));
  assert.match(unlisted, /An &lt;unlisted&gt; &amp; title/);
});


test('a series-only unlisted section has no empty unordered list', () => {
  const entry = (path, extra={}) => ({path, url:`/${path}/`, title:'Unlisted',
    sitemap:false, output_ext:'.html', layout:'read', ...extra});
  const run = spawnSync('bundle', ['exec','ruby','-e',fixtureRuby], {
    encoding:'utf8', input:JSON.stringify([{pages:[entry('series.md', {series:'hidden', series_order:1})],
      reads:[entry('part.md', {series:'hidden', part:1})]}]), maxBuffer:4*1024*1024,
  });
  assert.equal(run.status, 0, run.stderr);
  const [html] = JSON.parse(run.stdout.split('DRAFT_FIXTURE_RESULT')[1]);
  assert.match(html, /<ol>.*part.md/s);
  assert.doesNotMatch(html, /<ul>\s*<\/ul>/);
});

test('editing the addressed drafts title updates the heading and all metadata', () => {
  const ruby = String.raw`
require 'jekyll'; require 'json'
Jekyll::PluginManager.require_from_bundler
site=Jekyll::Site.new(Jekyll.configuration('quiet'=>true, 'unpublished'=>true))
site.reset;site.read;site.generate
page=site.pages.find { |p| p.path == 'drafts.md' }
page.data['title']='Edited staging title'
site.render
puts 'TITLE_RESULT'+JSON.generate(page.output)
`;
  const run = spawnSync('bundle', ['exec','ruby','-e',ruby], {encoding:'utf8', maxBuffer:4*1024*1024});
  assert.equal(run.status, 0, run.stderr);
  const html = JSON.parse(run.stdout.split('TITLE_RESULT')[1]);
  assert.match(html, /<h1 data-md="drafts.md" data-md-key="title">Edited staging title<\/h1>/);
  assert.match(html, /<title>Edited staging title[^<]*<\/title>/);
  assert.match(html, /property="og:title" content="Edited staging title"/);
  assert.match(html, /(?:name|property)="twitter:title" content="Edited staging title"/);
  assert.match(html, /"headline":"Edited staging title"/);
});


test('every unpublished page URL meets the overlay plain-path allowlist', () => {
  const ruby = String.raw`
require 'jekyll'; require 'json'
Jekyll::PluginManager.require_from_bundler
site=Jekyll::Site.new(Jekyll.configuration('quiet'=>true, 'unpublished'=>true))
site.reset;site.read;site.generate
puts 'URL_RESULT'+JSON.generate((site.pages + site.collections.values.flat_map(&:docs)).map(&:url).uniq.sort)
`;
  const run = spawnSync('bundle', ['exec','ruby','-e',ruby], {encoding:'utf8', maxBuffer:4*1024*1024});
  assert.equal(run.status, 0, run.stderr);
  const urls = JSON.parse(run.stdout.split('URL_RESULT')[1]);
  assert.ok(urls.length > 300);
  const rejected = urls.filter(url => !/^\/(?:[A-Za-z0-9._~-]+\/)*[A-Za-z0-9._~-]*$/.test(url));
  assert.deepEqual(rejected, [], 'URLs rejected by the overlay server');
  console.log(`Overlay allowlist: ${urls.length} URLs checked; ${rejected.length} rejected`);
});
