"""Local archive experiment. No content is transmitted to an inference service.

Run after build-preview-corpus.mjs and a preview Jekyll build.
Uses the course's embedding model on local passages around extracted concepts.
"""
import argparse
import json
from pathlib import Path

import numpy as np
import spacy
from sentence_transformers import SentenceTransformer
from concepts import clean_text, extract_concepts, select_concepts, concept_passage
from map_source import load_source, source_id

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / '_corpus_preview'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--preview', action='store_true', help='Use the private archive experiment instead of listed public pages')
preview = parser.parse_args().preview
model_name = 'sentence-transformers/all-MiniLM-L6-v2'
if preview:
    catalog = json.loads((ROOT / '_site/preview-corpus/catalog.json').read_text())
    pages = [p for p in catalog if p['kind'] == 'Archive post']
    texts = []
    for page in pages:
        slug = page['url'].rstrip('/').split('/')[-1]
        body = (OUT / (slug + '.md')).read_text().split('---', 2)[-1]
        texts.append(clean_text(page['title'] + '\n' + body))
else:
    pages, texts = load_source(ROOT / '_site')
print(f'Extracting names and noun phrases from {len(pages)} articles', flush=True)
nlp = spacy.load('en_core_web_sm')
documents = [extract_concepts(doc) for doc in nlp.pipe(texts, batch_size=16)]
nodes = select_concepts(documents, [p['title'] for p in pages])
for node in nodes:
    node.update(description=node['title'], date=max(pages[i]['date'] for i in node['articles']),
                topics=pages[node['articles'][0]]['topics'])
nodes.sort(key=lambda n: (-int(n['date'][:10].replace('-', '') or 0), -len(n['articles']), n['title']))
# Encode the context of each concept, not the whole article. Average within
# each article first, then across articles, so repetition cannot add votes.
passages, owners = [], []
for n, node in enumerate(nodes):
    for i in node['articles']:
        spans = sorted(documents[i][node['key']]['spans'])
        distinct = []
        for span in spans:
            if not distinct or span[0] - distinct[-1][0] > 300:
                distinct.append(span)
        for span in distinct[:2]:
            passages.append(node['title'] + ': ' + concept_passage(texts[i], span))
            owners.append((n, i))
print(f'Embedding {len(passages)} local passages for {len(nodes)} concepts', flush=True)
model = SentenceTransformer(model_name, device='cpu', trust_remote_code=False)
encoded = model.encode(passages, batch_size=32, normalize_embeddings=True, show_progress_bar=True)
per_article = {}
for owner, vector in zip(owners, encoded):
    per_article.setdefault(owner, []).append(vector)
vectors = np.array([np.mean([np.mean(per_article[(n, i)], axis=0) for i in node['articles']], axis=0)
                    for n, node in enumerate(nodes)])
vectors /= np.maximum(np.linalg.norm(vectors, axis=1, keepdims=True), 1e-12)
similarity = np.clip(vectors @ vectors.T, -1, 1)
# Classical MDS on cosine distances, matching the course's stated approach.
distance = 1 - similarity
center = np.eye(len(nodes)) - np.ones((len(nodes), len(nodes))) / len(nodes)
values, basis = np.linalg.eigh(-.5 * center @ (distance ** 2) @ center)
coords = basis[:, -2:] * np.sqrt(np.maximum(values[-2:], 0))
coords /= max(float(np.max(np.abs(coords))), 1e-12)
for i, page in enumerate(nodes):
    page.update(x=round(float(coords[i, 1]), 5), y=round(float(coords[i, 0]), 5),
                nearest=[{'index': int(j), 'similarity': round(float(similarity[i, j]), 4)}
                         for j in np.argsort(-similarity[i]) if j != i][:8])
covered = set(i for n in nodes for i in n['articles'])
data = dict(model=model_name, dimensions=384, articles=len(pages), passages=len(passages), coveredArticles=len(covered), sourceId=source_id(pages,texts),
            extraction='spaCy en_core_web_sm names and noun phrases; canonical aliases; unreviewed candidates',
            layout='Classical MDS on cosine distance between article-balanced concept passage embeddings; 2D distances are approximate', pages=pages, nodes=nodes)
if not preview:
    (ROOT / '_data/concept_map.json').write_text(json.dumps(data, ensure_ascii=False) + '\n')
    print(f'Wrote public map with {len(pages)} pages and {len(nodes)} concepts', flush=True)
    raise SystemExit(0)
(OUT / 'similarity.json').write_text('---\nlayout: null\nsitemap: false\npermalink: /preview-corpus/similarity.json\n---\n' + json.dumps(data))
(OUT / 'map.html').write_text('''---
layout: default
title: Concepts and their articles
wide: true
sitemap: false
noindex: true
permalink: /preview-corpus/map/
extra_css:
  - /assets/css/similarity-map.css?v=2
---
<section data-app="similarity-map">
<p class="map-eyebrow">LOCAL EXPERIMENT · YOUR WRITING, CONNECTED</p>
<h1>A landscape of ideas</h1>
<p>Names, ideas, and the writing that connects them. Hover to preview; click a concept to pin its article list.</p>
<div class="map-tools"><label>Find a concept <input type="search" data-map-search placeholder="pyVmomi, unit testing…"></label><button data-map-reset>Recent overview</button><button data-map-more>Show more concepts</button><span data-map-status role="status">Building the view…</span></div>
<p class="map-legend">Larger dots = more distinct articles · Soft springs preserve semantic neighborhoods; repulsion makes room · Colour = provisional topic</p>
<div class="map-workspace"><div class="map-surface"><svg viewBox="0 0 1000 720" role="group" aria-label="Article similarity map"></svg></div><aside class="map-inspector" aria-live="polite"></aside></div>
<p class="map-method">314 archived blog articles · MiniLM compares passages around each concept, with each article weighted equally. Display positions relax to prevent collisions; similarity scores and semantic anchors do not change. The flat map is approximate. Hover never restarts the motion. Suggestions are not author-approved tags.</p>
<details><summary>Browse visible concepts as a list</summary><ul data-map-list></ul></details>
<p><a href="/">Back to the full archive browser</a></p>
</section>''')
print(f'Wrote map with {len(pages)} articles', flush=True)
