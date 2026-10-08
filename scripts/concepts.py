"""Corpus concept candidates, transparent aliases, and local passage evidence."""
from collections import Counter, defaultdict
from html import unescape
import math
import re

# Spelling/variant normalization only. An entry never creates a concept unless
# its text is actually present. Keep related but distinct phrases separate.
TERM_GROUPS = {
    'pyVmomi': ['pyvmomi'], 'rbVmomi': ['rbvmomi'], 'VMware': ['vmware'],
    'vSphere': ['vsphere'], 'OpenStack': ['openstack'], 'GitHub': ['github'],
    'Grails': ['grails'], 'Rails': ['rails'], 'Groovy': ['groovy'], 'Python': ['python'],
    'Java': ['java'], 'JavaScript': ['javascript'], 'JUnit': ['junit'],
    "Conway's Law": ["conway's law", 'conway’s law'],
    'testing': ['test', 'tests', 'testing'],
    'unit testing': ['unit test', 'unit tests', 'unit testing'],
    'software design': ['software design', 'software designs'],
    'software engineering': ['software engineering'],
    'developer community': ['developer community', 'developer communities'],
    'Domain Specific Language': ['domain specific language', 'domain specific languages',
                                 'domain-specific language', 'domain-specific languages'],
}
ALIASES = {alias.casefold(): title for title, aliases in TERM_GROUPS.items() for alias in aliases}
GENERIC = set('thing year month day week time today tomorrow yesterday way fact part point order case type person people example instance something anything actually going work idea process result number value bit lot kind sort line end start question answer reason issue problem help file return version feature level world best new good great small big source unit specific date link http https www com org div span nbsp quot amp'.split())


def clean_text(text):
    text = re.sub(r'```[\s\S]*?```|~~~[\s\S]*?~~~', ' ', text)
    text = re.sub(r'<(pre|code|script|style)\b[^>]*>[\s\S]*?</\1>', ' ', text, flags=re.I)
    text = re.sub(r'!\[[^\]]*\]\([^)]*\)', ' ', text)
    text = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', text)
    text = re.sub(r'<[^>]+>|\{%.*?%\}|https?://\S+', ' ', text)
    return unescape(text).replace('`', '')


def extract_concepts(doc):
    found = {}

    def token_title(token):
        # Protect names before lemmatization (Grails is not a plural of grail).
        return ALIASES.get(token.text.casefold(), token.text if token.pos_ == 'PROPN' else token.lemma_.lower())

    def add(title, kind, start, end):
        title = re.sub(r'\s+', ' ', title.strip()).replace('’', "'")
        # Surface spelling wins over an NLP-generated lemma or entity label.
        surface = re.sub(r'\s+', ' ', doc.text[start:end]).replace('’', "'").casefold()
        title = ALIASES.get(surface, ALIASES.get(title.casefold(), title))
        key = title.casefold()
        # A recognized named phrase is one concept, not a second surname node.
        if kind == 'proper name' and any(k != key and ' ' in k and k in ALIASES and r['kind'] == 'proper name' and any(a <= start and end <= b for a, b in r['spans']) for k, r in found.items()):
            return
        if len(title) < 3 or len(title) > 48 or len(title.split()) > 4:
            return
        if key in GENERIC or not re.fullmatch(r"[\w]+(?:[ '\-][\w]+)*", title) or any(c.isdigit() for c in title):
            return
        record = found.setdefault(key, dict(title=title, kind=kind, spans=[]))
        if kind == 'proper name':
            record['kind'] = kind
        if (start, end) not in record['spans']:
            record['spans'].append((start, end))

    # Known technical spellings survive a general-purpose tagger's mistakes.
    for alias, title in ALIASES.items():
        for match in re.finditer(r'(?<!\w)' + re.escape(alias) + r'(?!\w)', doc.text, re.I):
            add(title, 'proper name' if any(c.isupper() for c in title) else 'noun phrase', *match.span())
    for ent in doc.ents:
        if ent.label_ in {'PERSON', 'ORG', 'PRODUCT', 'LAW', 'WORK_OF_ART', 'EVENT'}:
            add(ent.text, 'proper name', ent.start_char, ent.end_char)
    for chunk in doc.noun_chunks:
        tokens = [t for t in chunk if not t.is_stop and t.pos_ in {'ADJ', 'NOUN', 'PROPN'}]
        if not tokens or tokens[-1].pos_ not in {'NOUN', 'PROPN'} or tokens[-1].lemma_.lower() in GENERIC:
            continue
        proper = any(t.pos_ == 'PROPN' for t in tokens)
        if 1 < len(tokens) <= 3:
            # A named modifier must not freeze a common noun's plural form.
            title = ' '.join(token_title(t) for t in tokens)
            add(title, 'proper name' if proper else 'noun phrase', tokens[0].idx, tokens[-1].idx + len(tokens[-1]))
    for token in doc:
        if token.pos_ not in {'NOUN', 'PROPN'} or token.is_stop:
            continue
        # Don't separate a person's surname or a product's component words.
        if token.ent_type_ in {'PERSON', 'ORG', 'PRODUCT'} and any(e.start <= token.i < e.end and len(e) > 1 for e in doc.ents):
            continue
        title = token_title(token)
        add(title, 'proper name' if token.pos_ == 'PROPN' else 'noun', token.idx, token.idx + len(token))
    return found


def select_concepts(documents, titles, limit=160):
    members = defaultdict(list)
    for i, terms in enumerate(documents):
        for key in terms:
            members[key].append(i)
    scores = Counter()
    for i, terms in enumerate(documents):
        ranked = []
        for key, term in terms.items():
            df = len(members[key])
            in_title = key in titles[i].casefold()
            if df < 2 and not (term['kind'] == 'proper name' and in_title) and key not in ALIASES:
                continue
            score = (1 + math.log(len(term['spans']))) * math.log(1 + len(documents) / df)
            score *= 1.5 if term['kind'] == 'proper name' or ' ' in key else 1
            score *= 2 if in_title else 1
            ranked.append((score, key))
        for score, key in sorted(ranked, reverse=True)[:7]:
            scores[key] += score
    chosen = [key for key, _ in scores.most_common(limit)]
    # Explicit canonical names found in the corpus should not vanish behind a
    # frequency cutoff, including small but distinct technical subjects.
    chosen += [key for key in members if key in ALIASES and key not in chosen]
    nodes = []
    for key in chosen:
        ids = members[key]
        spellings = Counter(documents[i][key]['title'] for i in ids)
        title = ALIASES.get(key, spellings.most_common(1)[0][0])
        nodes.append(dict(key=key, title=title, kind=documents[ids[0]][key]['kind'], articles=ids))
    return nodes


def concept_passage(text, span):
    start, end = span
    # Bound the context around the mention, not the beginning of the article.
    return text[max(0, start - 180):min(len(text), end + 260)].strip()
