"""Public map inputs, shared by generation and the stale-map release check."""
import json
import re
from pathlib import Path
from content_addressable import content_id
from concepts import clean_text


def load_source(site):
    site = Path(site).resolve()
    pages = [p for p in json.loads((site / 'assets/data/page-catalog.json').read_text()) if p]
    pages.sort(key=lambda p: (p['date'], p['url']), reverse=True)
    texts = []
    for page in pages:
        page['topics'] = page.get('topics') or []
        path = (site / page['url'].lstrip('/') / 'index.html').resolve()
        if not path.is_relative_to(site):
            raise ValueError('Catalog path escapes the build')
        main = re.search(r'<main\b[^>]*>([\s\S]*?)</main>', path.read_text())
        if not main:
            raise ValueError(f"No main content at {page['url']}")
        texts.append(clean_text(page['title'] + '\n' + page['description'] + '\n' + main[1]))
    return pages, texts


def source_id(pages, texts):
    return str(content_id({'pages': pages, 'texts': texts}))
