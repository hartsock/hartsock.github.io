#!/usr/bin/env python3
"""Compare HTML and feed/sitemap XML metadata. Normalize whitespace between tags, except in pre/code/
script/style/textarea. Classification is heuristic, not a semantic equivalence
claim: progressively fold punctuation, code markup and heading IDs; retain any
remaining difference as 'other'. Feature projections never affect equality.
"""
import argparse
from difflib import SequenceMatcher
from itertools import zip_longest
import html
from html.parser import HTMLParser
from pathlib import Path
import re

PROTECTED = {"pre", "code", "script", "style", "textarea"}
GROUPS = ("metadata", "smart punctuation", "code-block markup", "heading ids", "other")


class Markup(HTMLParser):
    """Locate real tags without reserializing any source bytes."""
    def __init__(self, source):
        super().__init__(convert_charrefs=False)
        self.source = source
        self.lines = [0] + [m.end() for m in re.finditer("\n", source)]
        self.tags = []
        self.feed(source)
        self.close()

    def record(self, tag, attrs, kind, raw):
        line, column = self.getpos()
        start = self.lines[line - 1] + column
        self.tags.append((start, start + len(raw), tag, dict(attrs), kind))

    def handle_starttag(self, tag, attrs):
        self.record(tag, attrs, "start", self.get_starttag_text())

    def handle_startendtag(self, tag, attrs):
        self.record(tag, attrs, "empty", self.get_starttag_text())

    def handle_endtag(self, tag):
        line, column = self.getpos()
        start = self.lines[line - 1] + column
        end = self.source.find(">", start) + 1
        self.record(tag, [], "end", self.source[start:end])


def normalize(source):
    tags = Markup(source).tags
    removed = []
    protected = []
    for index, (start, end, tag, _, kind) in enumerate(tags):
        if tag in PROTECTED:
            if kind == "start":
                protected.append(tag)
            elif kind == "end" and tag in protected:
                del protected[len(protected) - 1 - protected[::-1].index(tag):]
        if index + 1 < len(tags) and not protected:
            next_start = tags[index + 1][0]
            gap = source[end:next_start]
            if gap and re.fullmatch(r"[ \t\r\n\f]+", gap):
                removed.append((end, next_start))
    return without(source, removed)


def without(source, spans):
    pieces, end = [], 0
    for start, stop in sorted(spans):
        if start < end:
            continue
        pieces.append(source[end:start])
        end = stop
    return "".join(pieces) + source[end:]


def elements(source, names, metadata=False):
    spans, stack = [], []
    for start, end, tag, attrs, kind in Markup(source).tags:
        selected = tag in names or (metadata and tag == "script" and
                                   attrs.get("type", "").lower() == "application/ld+json")
        if kind in ("start", "empty") and selected:
            if tag == "meta" or kind == "empty":
                spans.append((start, end))
            else:
                stack.append((tag, start))
        elif kind == "end" and stack and tag == stack[-1][0]:
            _, opening = stack.pop()
            if not stack:
                spans.append((opening, end))
    return sorted(spans)


def metadata_spans(source):
    # XML timestamp elements cover feed/sitemap output as well as HTML metadata.
    return elements(source, {"meta", "generator", "updated", "published", "lastmod"}, metadata=True)


def first_pair(left, right):
    return next(((a, b) for a, b in zip_longest(left, right, fillvalue="") if a != b), ("", ""))


def excerpt(left, right):
    i = next((i for i, pair in enumerate(zip(left, right)) if pair[0] != pair[1]), min(len(left), len(right)))
    return left[max(0, i-30):i+150], right[max(0, i-30):i+150]


def chunks(source, spans):
    return [source[a:b] for a, b in spans]


def punctuation_regions(source):
    tags = Markup(source).tags
    regions = []
    for previous, following in zip(tags, tags[1:]):
        text = source[previous[1]:following[0]]
        if text.strip() and not text.lstrip().startswith("<!--"):
            # Include the immediate containing tags, never earlier page metadata.
            regions.append(source[previous[0]:following[1]])
    return regions or [source]


class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def code_text(match):
    parser = Text()
    parser.feed(match.group())
    return "<pre>" + html.escape("".join(parser.parts)) + "</pre>"


def punctuation(source):
    # Decode only typographic entities. Decoding &lt; here would turn literal
    # code into markup and could hide real content changes in the next stage.
    source = re.sub(r"&(?:#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z]+);",
                    lambda m: html.unescape(m.group()) if html.unescape(m.group()) in "“”‘’–—…" else m.group(), source)
    return source.translate(str.maketrans({
        "“": '"', "”": '"', "‘": "'", "’": "'", "–": "--", "—": "---", "…": "...",
    }))


def code_markup(source):
    # Discard syntax highlighter wrappers but preserve all code text/whitespace.
    source = re.sub(r'<div\b[^>]*class=["\'][^"\']*highlighter-rouge[^"\']*["\'][^>]*>\s*<div\b[^>]*class=["\']highlight["\'][^>]*>\s*(<pre\b.*?</pre>)\s*</div>\s*</div>', r'\1', source, flags=re.S)
    return re.sub(r"<pre\b[^>]*>.*?</pre>", code_text, source, flags=re.S | re.I)


def heading_ids(source):
    return re.sub(r"<h[1-6]\b[^>]*>", lambda m: re.sub(r'\s+id=("[^"]*"|\x27[^\x27]*\x27)', "", m.group()), source, flags=re.I)


def classify(left, right):
    original = (left, right)
    examples = {}
    a, b = metadata_spans(left), metadata_spans(right)
    meta_pair = first_pair(chunks(left, a), chunks(right, b))
    if meta_pair != ("", ""):
        examples["metadata"] = excerpt(*meta_pair)
    left, right = without(left, a), without(right, b)
    for name, transform in (("smart punctuation", punctuation),
                            ("code-block markup", code_markup), ("heading ids", heading_ids)):
        new_left, new_right = transform(left), transform(right)
        pair = ("", "")
        if name == "smart punctuation":
            x_regions, y_regions = punctuation_regions(left), punctuation_regions(right)
            # Align equivalent text regions first: positional zip would mislabel
            # all later text after an inserted element as punctuation changes.
            aligned = SequenceMatcher(None, [punctuation(x) for x in x_regions],
                                      [punctuation(y) for y in y_regions], autojunk=False)
            for block in aligned.get_matching_blocks():
                pair = next(((x_regions[block.a + i], y_regions[block.b + i])
                             for i in range(block.size)
                             if x_regions[block.a + i] != y_regions[block.b + i]), ("", ""))
                if pair != ("", ""):
                    break
        elif name == "code-block markup":
            pair = first_pair(chunks(left, elements(left, {"pre"})), chunks(right, elements(right, {"pre"})))
        else:
            names = {"h1", "h2", "h3", "h4", "h5", "h6"}
            for x, y in zip_longest(chunks(left, elements(left, names)), chunks(right, elements(right, names)), fillvalue=""):
                if x != y and (heading_ids(x) != x or heading_ids(y) != y):
                    pair = (x, y)
                    break
        if pair != ("", "") and (new_left != left or new_right != right):
            examples[name] = excerpt(*pair)
            left, right = new_left, new_right
    if left != right:
        examples["other"] = excerpt(left, right)
    if not examples:
        examples["other"] = excerpt(*original)
    return examples


def causes(left, right):
    return list(classify(left, right))


def compare(left, right):
    if not left.is_dir() or not right.is_dir():
        raise ValueError("both build directories must exist")
    files = lambda root: {p.relative_to(root).as_posix(): p for p in root.rglob("*")
                          if p.is_file() and (p.suffix == ".html" or p.name in {"feed.xml", "sitemap.xml"})}
    a, b = files(left), files(right)
    if not any(p.endswith(".html") for p in a) or not any(p.endswith(".html") for p in b):
        raise ValueError("both builds must contain HTML pages")
    result = {"same": 0, "same_metadata": 0, "changed": {}, "only production": sorted(a.keys() - b.keys()),
              "only scrybe": sorted(b.keys() - a.keys()), "examples": {}}
    for path in sorted(a.keys() & b.keys()):
        x, y = normalize(a[path].read_bytes().decode("utf-8")), normalize(b[path].read_bytes().decode("utf-8"))
        if x == y:
            result["same" if path.endswith(".html") else "same_metadata"] += 1
        else:
            examples = classify(x, y)
            result["changed"][path] = list(examples)
            result["examples"][path] = examples
    return result


def report(result):
    lines = ["# Scrybe preview comparison", "", "Normalization: whitespace-only text between real tags only; attributes, comments, visible text and pre/code/script/style/textarea content (including CR/CRLF) are preserved. HTML plus feed.xml and sitemap.xml are compared.",
             "Cause labels are heuristic candidates, may overlap, and do not prove semantic equivalence. Other retains differences unexplained by the projections.",
             "", f"Identical HTML pages: {result['same']}; differing HTML pages: {sum(p.endswith('.html') for p in result['changed'])}.", ""]
    for group in GROUPS:
        pages = [p for p, labels in result["changed"].items() if group in labels]
        lines.extend((f"## {group}: {len(pages)} files", ""))
        for path in pages:
            lines.append(f"- <code>{html.escape(path)}</code>")
        for path in pages[:3]:
            a, b = result["examples"][path][group]
            lines.extend(("", f"Cause-specific excerpt: {html.escape(path)}", "", "<pre>production: " + html.escape(a) + "\nscrybe: " + html.escape(b) + "</pre>"))
        lines.append("")
    for key in ("only production", "only scrybe"):
        lines.extend((f"## Files {key}: {len(result[key])}", ""))
        lines.extend(f"- <code>{html.escape(p)}</code>" for p in result[key])
        lines.append("")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("production", type=Path)
    parser.add_argument("scrybe", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    try:
        output = report(compare(args.production, args.scrybe))
    except ValueError as error:
        parser.error(str(error))
    if args.output:
        args.output.write_text(output + "\n")
    print(output)


if __name__ == "__main__":
    main()
