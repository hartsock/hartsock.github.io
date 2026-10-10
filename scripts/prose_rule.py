#!/usr/bin/env python3
"""Enforce Markdown prose ownership; report exact, shrink-only source/build debt.

Run --source and --built _site separately. --list emits debt identities for
review, never updates debt. CI supplies PROSE_DEBT_BASE to reject additions to
an existing baseline; missing baseline is permitted only for initial adoption.
"""
import argparse
from collections import Counter
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import subprocess
import sys

import yaml

ROOT = Path(__file__).resolve().parent.parent
WORD = re.compile(r"[A-Za-z][A-Za-z’'\-]*")

REGEX_PREV = set('(,=:[!&|?{};+-*%<>~^') | {''}
REGEX_WORDS = {'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await'}


def js_literals(src):
    """Yield (line, text, is_template) for each string/template literal."""
    out, i, n = [], 0, len(src)

    def line_at(k):
        return src.count('\n', 0, k) + 1

    def prev_token(k):
        j = k - 1
        while j >= 0 and src[j] in ' \t\r\n':
            j -= 1
        if j < 0:
            return ''
        if src[j].isalnum() or src[j] in '_$':
            e = j
            while j >= 0 and (src[j].isalnum() or src[j] in '_$'):
                j -= 1
            word = src[j + 1:e + 1]
            return word if word in REGEX_WORDS else 'ident'
        return src[j]

    def skip_regex(k):
        k += 1
        cls = False
        while k < n:
            c = src[k]
            if c == '\\':
                k += 2
                continue
            if c == '[':
                cls = True
            elif c == ']':
                cls = False
            elif c == '/' and not cls:
                return k + 1
            elif c == '\n':
                return k
            k += 1
        return k

    def scan_code(k, stop):
        """Scan code from k until an unmatched `stop` ('}' or EOF)."""
        depth = 0
        while k < n:
            c = src[k]
            if src.startswith('//', k):
                k = src.find('\n', k)
                k = n if k < 0 else k
                continue
            if src.startswith('/*', k):
                k = src.find('*/', k + 2)
                k = n if k < 0 else k + 2
                continue
            if c in '"\'':
                k = scan_string(k)
                continue
            if c == '`':
                k = scan_template(k)
                continue
            if c == '/':
                p = prev_token(k)
                if p in REGEX_PREV or p in REGEX_WORDS:
                    k = skip_regex(k)
                    continue
            if c == '{':
                depth += 1
            elif c == '}':
                if depth == 0 and stop == '}':
                    return k + 1
                depth -= 1
            k += 1
        return k

    def scan_string(k):
        q, start, buf = src[k], k, []
        k += 1
        while k < n and src[k] != q:
            if src[k] == '\\' and k + 1 < n:
                buf.append({'n': ' ', 't': ' '}.get(src[k + 1], src[k + 1]))
                k += 2
                continue
            if src[k] == '\n':
                break
            buf.append(src[k])
            k += 1
        out.append((line_at(start), ''.join(buf), False))
        return k + 1

    def scan_template(k):
        start, buf = k, []
        k += 1
        while k < n and src[k] != '`':
            if src[k] == '\\' and k + 1 < n:
                buf.append(src[k + 1])
                k += 2
                continue
            if src.startswith('${', k):
                k = scan_code(k + 2, '}')
                buf.append('{x}')
                continue
            buf.append(src[k])
            k += 1
        out.append((line_at(start), ''.join(buf), True))
        return k + 1

    scan_code(0, None)
    return out


def normalized(text):
    text = re.sub(r'\$\{[^}]*\}|\{\{.*?\}\}|\{%.*?%\}|\{[A-Za-z_][\w.]*\}', ' ', text, flags=re.S)
    return ' '.join(text.split())


def is_prose(text, rules):
    text = normalized(text)
    if not text or re.fullmatch(r'[\w.:/#?=&%+@~-]+', text):
        return False
    words = WORD.findall(text)
    limits = rules['thresholds']
    sentences = re.findall(r'[^.!?]*[.!?](?=\s|$)', text)
    return (len(words) >= limits['prose_words'] or
            any(len(WORD.findall(sentence)) >= limits['sentence_words'] for sentence in sentences))


def display_text(text, rules):
    return bool(WORD.search(normalized(text))) and normalized(text) not in rules['roles']['heading_allowlist']


def split_front(src):
    match = re.match(r'\A---[ \t\r]*\n(.*?)^(?:---|\.\.\.)[ \t\r]*(?:\n|$)', src, re.S | re.M)
    if not match:
        return None, src
    return match[1], '\n' * src[:match.end()].count('\n') + src[match.end():]


def strings_in(value, key=''):
    if isinstance(value, str):
        yield key, value
    elif isinstance(value, dict):
        for k, v in value.items():
            yield from strings_in(v, f'{key}.{k}' if key else str(k))
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from strings_in(v, f'{key}.{i}')


def resolve(front, key):
    value = front
    for part in key.split('.'):
        if isinstance(value, dict) and part in value:
            value = value[part]
        elif isinstance(value, list) and part.isdigit() and int(part) < len(value):
            value = value[int(part)]
        else:
            return None
    return value


class Markup(HTMLParser):
    """Collect full inline runs, preserving boundaries, coverage, and heading roles."""
    VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
    BLOCK = set('address article aside blockquote body dd details dialog div dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section table td th tr ul'.split())
    ATTRS = {'aria-label', 'title', 'placeholder', 'alt'}

    def __init__(self, rules, built=False):
        super().__init__(convert_charrefs=True)
        self.rules, self.built = rules, built
        self.stack, self.items, self.refs = [], [], []
        self.run, self.context = [], None

    def state(self):
        return (any(x['tag'] == 'body' for x in self.stack),
                any(x['covered'] for x in self.stack),
                any(x['display'] for x in self.stack),
                any(x['micro'] for x in self.stack),
                any(x['tag'] in self.rules['roles']['nonprose_tags'] for x in self.stack))

    def flush(self):
        if self.run and self.context:
            self.items.append((''.join(self.run), *self.context))
        self.run, self.context = [], None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in self.BLOCK or any(k in a for k in ('data-md', 'data-md-key', 'data-evidence')):
            self.flush()
        ref = None
        if 'data-md' in a or 'data-md-key' in a:
            ref = {'src': a.get('data-md'), 'key': a.get('data-md-key'), 'tag': tag, 'text': []}
            self.refs.append(ref)
        roles = self.rules['roles']
        frame = {'tag': tag, 'ref': ref, 'covered': 'data-md' in a or 'data-evidence' in a,
                 'display': tag in roles['heading_tags'] or a.get('role') == 'heading' or
                            bool(set((a.get('class') or '').split()) & set(roles['display_classes'])),
                 'micro': a.get(roles['microcopy_attribute']) == roles['microcopy_role']}
        self.stack.append(frame)
        state = self.state()
        for attr in self.ATTRS:
            if a.get(attr):
                self.items.append((a[attr], state[0], state[1], False, False, state[4]))
        if tag in self.VOID:
            self.stack.pop()
        if tag == 'br':
            self.run.append(' ')

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in self.BLOCK or (self.stack and self.stack[-1]['covered']):
            self.flush()
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index]['tag'] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        for frame in self.stack:
            if frame['ref'] is not None:
                frame['ref']['text'].append(data)
        state = self.state()
        if state[4] or (self.built and not state[0]):
            return
        if self.context != state:
            self.flush()
            self.context = state
        self.run.append(data)

    def finish(self):
        self.close()
        self.flush()
        for text, body, covered, display, micro, skipped in self.items:
            if skipped or (self.built and (not body or covered)):
                continue
            text = normalized(text)
            # Explicit microcopy can exempt a heading only within the same
            # threshold as ordinary labels; it never exempts a sentence.
            exempt = micro and len(WORD.findall(text)) <= self.rules['thresholds']['microcopy_words']
            if is_prose(text, self.rules) or (display and not exempt and display_text(text, self.rules)):
                yield text


def html_prose(src, rules, built=False):
    if not built:
        src = re.sub(r'\{%-?\s*comment\s*-?%\}.*?\{%-?\s*endcomment\s*-?%\}', '', src, flags=re.S)
        src = re.sub(r'\{%.*?%\}|\{\{.*?\}\}', '', src, flags=re.S)
    parser = Markup(rules, built)
    parser.feed(src)
    return parser


def paths(root, rules, patterns):
    seen = set()
    for pattern in patterns:
        for path in sorted(root.glob(pattern)):
            rel = path.relative_to(root).as_posix()
            if rel in seen or not path.is_file() or path.is_symlink():
                continue
            seen.add(rel)
            if set(path.relative_to(root).parts[:-1]) & set(rules['scan']['skip_dirs']):
                continue
            yield path, rel


def frontmatter(src, rel, add):
    raw, body = split_front(src)
    if raw is None and src.startswith('---\n'):
        add(rel, 'frontmatter', 'Missing closing front matter delimiter')
    try:
        data = yaml.safe_load(raw) if raw else {}
    except yaml.YAMLError:
        add(rel, 'frontmatter', 'Invalid YAML front matter')
        return {}, body
    if data is None:
        data = {}
    if not isinstance(data, dict):
        add(rel, 'frontmatter', 'Front matter must be a mapping')
        data = {}
    return data, body


def markdown_scan(path, rel, rules, add, widgets=None):
    front, body = frontmatter(path.read_text(), rel, add)
    for key in rules['roles']['prose_keys']:
        if key != 'copy' and key in front and not isinstance(front[key], str):
            add(rel, 'schema', f'{key} must be a string')
    copy = front.get('copy', {})
    if not isinstance(copy, dict):
        add(rel, 'schema', 'copy must contain groups of string values')
    else:
        for group, entries in copy.items():
            if not re.fullmatch(r'[a-z][a-z0-9_-]*', str(group)) or not isinstance(entries, dict):
                add(rel, 'schema', f'copy.{group} must be a named group')
                continue
            for key, value in entries.items():
                if not re.fullmatch(r'[a-z][a-z0-9_-]*', str(key)) or not isinstance(value, str):
                    add(rel, 'schema', f'copy.{group}.{key} must be a named string')
    authors = front.get('authors', [])
    if not isinstance(authors, list):
        add(rel, 'schema', 'authors must be a list')
    else:
        for author in authors:
            if not isinstance(author, dict):
                add(rel, 'schema', 'author must be a mapping')
            else:
                for key in ('model', 'harness'):
                    if key in author and (not isinstance(author[key], str) or not author[key].strip()):
                        add(rel, 'schema', f'author {key} must be a nonempty string')
    values = front.get('values', {})
    if not isinstance(values, dict):
        add(rel, 'schema', 'values must be a mapping')
        values = {}
    envelope = rules['archive_envelope']
    if path.match(envelope['glob']) and front.get(envelope['field']):
        body = re.sub(r'\A(\s*)\{% raw %\}\r?\n(.*)\{% endraw %\}\s*\Z', r'\1\2', body, flags=re.S)
    fence = None
    for line in body.splitlines():
        opening = re.match(r'^ {0,3}(`{3,}|~{3,})(.*)$', line)
        if fence:
            if re.fullmatch(r' {0,3}' + re.escape(fence[0]) + '{' + str(fence[1]) + r',}\s*', line):
                fence = None
            continue
        if opening:
            if re.search(next(x['pattern'] for x in rules['dialect_bans'] if x['id'] == 'fence-attributes'), line):
                add(rel, 'dialect:fence-attributes', line)
            fence = (opening[1][0], len(opening[1]))
            continue
        # Inline code is evidence/example syntax, not active Markdown markup.
        text = re.sub(r'(`+).*?\1', '', line)
        for ban in rules['dialect_bans']:
            if re.search(ban['pattern'], text):
                add(rel, 'dialect:' + ban['id'], line)
        for token in re.findall(r'(?<![\w{])\{([a-z][A-Za-z0-9]*)\}(?!})', text):
            if token not in values:
                add(rel, 'token', f'Undeclared value {{{token}}}')
        if re.match(r'^\{widget ', text):
            # Until a registry exists no widget can silently pass as prose.
            match = re.fullmatch(r'\{widget ([a-z0-9-]+)\}', text)
            if not match or match[1] not in (widgets or {}):
                add(rel, 'widget', text)


def scan_source(root, rules):
    findings = []
    def add(path, rule, text):
        findings.append((path, rule, ' '.join(text.split())))
    exceptions = {x['path']: x for x in rules['exceptions']}
    key_exceptions = {x['path'] for x in rules['key_rule_exceptions']}
    for path, rel in paths(root, rules, rules['scan']['source_globs']):
        if rel in exceptions:
            pin = exceptions[rel].get('capture_id')
            if pin and (json.loads(path.read_text()).get('capture_id') != pin or
                        hashlib.sha256(path.read_bytes()).hexdigest() != exceptions[rel]['sha256']):
                add(rel, 'capture', 'Capture identity changed')
            continue
        src = path.read_text()
        if path.suffix in ('.js', '.mjs'):
            for _, text, _ in js_literals(src):
                if re.search(r'<[A-Za-z/]', text):
                    for prose in html_prose(text, rules).finish():
                        add(rel, 'prose', prose)
                elif is_prose(text, rules):
                    add(rel, 'prose', text)
        elif path.suffix == '.html':
            front, body = frontmatter(src, rel, add)
            for key, text in strings_in(front):
                if is_prose(text, rules) or key.split('.')[-1] in rules['roles']['prose_keys']:
                    add(rel, 'frontmatter-prose', f'{key}: {text}')
            for prose in html_prose(body, rules).finish():
                add(rel, 'prose', prose)
            for script in re.findall(r'<script\b[^>]*>(.*?)</script>', body, flags=re.S | re.I):
                for _, text, _ in js_literals(script):
                    if is_prose(text, rules):
                        add(rel, 'script-prose', text)
        else:
            try:
                data = json.loads(src) if path.suffix == '.json' else yaml.safe_load(src)
            except (ValueError, yaml.YAMLError):
                add(rel, 'data', 'Invalid structured data')
                continue
            for key, text in strings_in(data):
                if is_prose(text, rules) or (rel not in key_exceptions and
                        any(k in rules['roles']['prose_keys'] for k in key.split('.'))):
                    add(rel, 'data-prose', f'{key}: {text}')
    for path, rel in paths(root, rules, ['**/*.md']):
        if rel not in rules['scan']['markdown_exclude']:
            registry = root / '_data/widgets.yml'
            widgets = yaml.safe_load(registry.read_text()) if registry.exists() else {}
            markdown_scan(path, rel, rules, add, widgets)
    return findings


def scan_built(root, site, rules):
    findings = []
    fronts = {}
    pages = list(sorted(site.rglob('*.html')))
    if not pages:
        raise ValueError('Built site contains no HTML pages')
    for page in pages:
        rel = page.relative_to(site).as_posix()
        parser = html_prose(page.read_text(), rules, built=True)
        for prose in parser.finish():
            findings.append((rel, 'unaddressed', prose))
        for ref in parser.refs:
            src, key, tag = ref['src'], ref['key'], ref['tag']
            # Paths must be relative canonical Markdown sources inside this root.
            path = root / (src or '')
            valid = (src and str(Path(src)) == src and not Path(src).is_absolute() and '..' not in Path(src).parts and
                     path.suffix == '.md' and path.is_file() and path.resolve().is_relative_to(root.resolve()))
            if not valid:
                findings.append((rel, 'address', f'Invalid Markdown address: {src!r}'))
                continue
            if key is not None:
                if src not in fronts:
                    front, _ = frontmatter(path.read_text(), rel, lambda *x: findings.append(x))
                    fronts[src] = front
                value = resolve(fronts[src], key)
                if not key or not isinstance(value, str):
                    findings.append((rel, 'address', f'Non-string or missing key: {src}:{key}'))
                elif ' '.join(''.join(ref['text']).split()) != ' '.join(value.split()):
                    findings.append((rel, 'address', f'Keyed text differs from {src}:{key}'))
            elif tag == 'main':
                findings.append((rel, 'address', 'A template main cannot be a body address'))
        if re.search(r'<p>\{widget\s', page.read_text()):
            findings.append((rel, 'widget', 'Unresolved widget paragraph'))
    return findings


def identities(mode, findings):
    counts = Counter()
    lines = set()
    for path, rule, text in findings:
        digest = hashlib.sha256(text.encode()).hexdigest()
        prefix = f'{mode}\t{path}\t{rule}\t{digest}'
        counts[prefix] += 1
        lines.add(f'{prefix}\t{counts[prefix]}')
    return lines


def read_debt(text):
    lines = [line for line in text.splitlines() if line and not line.startswith('#')]
    if len(lines) != len(set(lines)):
        raise ValueError('Duplicate debt identities')
    for line in lines:
        if not re.fullmatch(r'(source|built)\t[^\t\n]+\t[^\t\n]+\t[0-9a-f]{64}\t[1-9][0-9]*', line):
            raise ValueError('Malformed debt identity')
    return set(lines)


def ratchet(current, debt, mode, baseline=None):
    scoped = {line for line in debt if line.startswith(mode + '\t')}
    return current - scoped, scoped - current, (debt - baseline if baseline is not None else set())


def main(argv=None):
    cli = argparse.ArgumentParser(description=__doc__)
    modes = cli.add_mutually_exclusive_group(required=True)
    modes.add_argument('--source', action='store_true')
    modes.add_argument('--built', type=Path)
    cli.add_argument('--list', action='store_true', help='Print findings as debt identities; never modify debt')
    args = cli.parse_args(argv)
    mode = 'source' if args.source else 'built'
    rules = yaml.safe_load((ROOT / 'scripts/prose-rules.yml').read_text())
    findings = scan_source(ROOT, rules) if args.source else scan_built(ROOT, args.built, rules)
    current = identities(mode, findings)
    if args.list:
        print('\n'.join(sorted(current)))
        return 0
    debt = read_debt((ROOT / 'scripts/prose-debt.txt').read_text())
    baseline = None
    base = os.environ.get('PROSE_DEBT_BASE')
    if base and set(base) != {'0'}:
        subprocess.run(['git', 'cat-file', '-e', base + '^{commit}'], cwd=ROOT, check=True, capture_output=True)
        old = subprocess.run(['git', 'show', base + ':scripts/prose-debt.txt'], cwd=ROOT, capture_output=True, text=True)
        if old.returncode == 0:
            baseline = read_debt(old.stdout)
        else:
            # Missing file is the only permitted bootstrap, not an arbitrary git failure.
            tree = subprocess.run(['git', 'ls-tree', '--name-only', base, '--', 'scripts/prose-debt.txt'], cwd=ROOT,
                                  check=True, capture_output=True, text=True)
            if tree.stdout.strip():
                raise ValueError('Could not read the baseline debt file')
    new, stale, grown = ratchet(current, debt, mode, baseline)
    for kind, rows in [('NEW', new), ('STALE (remove from debt)', stale), ('DEBT GROWTH', grown)]:
        for line in sorted(rows):
            print(f'{kind}: {line}')
    print(f'{mode}: {len(current)} findings; {len(new)} new; {len(stale)} stale; {len(grown)} debt additions')
    return int(bool(new or stale or grown))


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, OSError, yaml.YAMLError, subprocess.CalledProcessError) as error:
        print(f'Prose check failed: {error}', file=sys.stderr)
        sys.exit(2)
