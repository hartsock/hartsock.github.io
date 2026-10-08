"""Validate public map freshness, republication and private-preview exclusion."""
import json
from pathlib import Path
import re
import sys
import yaml
from map_source import load_source, source_id

root = Path(__file__).resolve().parent.parent
site = Path(sys.argv[1]) if len(sys.argv) > 1 else root / '_site'
pages, texts = load_source(site)
data = json.loads((site / 'assets/data/concept-map.json').read_text())
if data['sourceId'] != source_id(pages, texts):
    (site / 'map-input-diagnostic.json').write_text(json.dumps({'pages':pages,'texts':texts}))
assert data['sourceId'] == source_id(pages, texts), 'Map is stale: build, regenerate the map, then rebuild'
assert data['pages'] == pages, 'Map inventory differs from listed pages'
urls = {p['url'] for p in pages}
dates = {p['url']:p['date'] for p in pages}
assert len(urls) == len(pages)
assert not any('cruel-symmetry' in url or '/preview-corpus/' in url for url in urls)
assert not (site / 'preview-corpus').exists(), 'Private corpus was included in the public build'
assert not (site / '_config.preview.yml').exists()
assert len({n['key'] for n in data['nodes']}) == len(data['nodes'])
for node in data['nodes']:
    assert len(node['articles']) == len(set(node['articles']))
    assert all(0 <= i < len(pages) for i in node['articles'])
    assert all(0 <= edge['index'] < len(data['nodes']) for edge in node['nearest'])
count = 0
for path in (root / '_posts').glob('*.md'):
    front = yaml.safe_load(path.read_text().split('---', 2)[1])
    if not front.get('republished'):
        continue
    count += 1
    assert front['permalink'] in urls
    assert front['id'].startswith('bafy')
    assert front['original_url'].startswith(('https://hartsock.blogspot.com/', 'http://hartsock.blogspot.com/'))
    assert str(front['date']).startswith(path.name[:10]), f'Original date drift: {path.name}'
    assert dates[front['permalink']] == path.name[:10], f'Rendered date drift: {path.name}'
    html = (site / front['permalink'].lstrip('/') / 'index.html').read_text()
    assert 'local preview only' not in html
    assert 'name="robots" content="noindex"' not in html
    assert 'Republished from' in html
assert count == 314, f'Expected 314 republished posts, got {count}'
for url in ['/series/cruel-symmetry/', '/series/cruel-symmetry/the-tool-outran-the-hand/']:
    html = (site / url.lstrip('/') / 'index.html').read_text()
    assert 'name="robots" content="noindex"' in html
for file in ['sitemap.xml', 'feed.xml']:
    assert 'cruel-symmetry' not in (site / file).read_text()
assert 'data-map-url="/assets/data/concept-map.json"' in (site / 'index.html').read_text()
assert not re.search(r'localhost|127\.0\.0\.1|home\.lab', (site / 'sitemap.xml').read_text())
print(f'Publication checks passed: {count} republished posts; {len(pages)} map pages; {len(data["nodes"])} concepts.')
