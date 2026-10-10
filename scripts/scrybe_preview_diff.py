#!/usr/bin/env python3
"""Compare HTML only. Normalize whitespace between tags, except in pre/code/
script/style/textarea. Classification is heuristic, not a semantic equivalence
claim: progressively fold punctuation, code markup and heading IDs; retain any
remaining difference as 'other'. Never normalize the actual equality check.
"""
import argparse
from collections import Counter
import html
from html.parser import HTMLParser
from pathlib import Path
import re

PROTECTED = re.compile(r"<(pre|code|script|style|textarea)\b[^>]*>.*?</\1\s*>", re.I | re.S)
GROUPS = ("smart punctuation", "code-block markup", "heading ids", "other")


def normalize(source):
    protected = []
    marker = "SCRYBE_PROTECTED"
    while marker in source:
        marker += "_"

    def preserve(match):
        token = f"<{marker}_{len(protected)}>"
        protected.append((token, match.group()))
        return token

    result = re.sub(r">\s+<", "><", PROTECTED.sub(preserve, source))
    for token, original in protected:
        result = result.replace(token, original)
    return result


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


def causes(left, right):
    found = []
    for name, transform in zip(GROUPS, (punctuation, code_markup, heading_ids)):
        new_left, new_right = transform(left), transform(right)
        if new_left == new_right and left != right:
            found.append(name)
        elif name == "smart punctuation":
            signature = lambda text: Counter(re.findall("[“”‘’–—…]", html.unescape(text)))
            if signature(left) != signature(right):
                found.append(name)
        elif name == "code-block markup":
            if re.findall(r"<pre\b.*?</pre>", left, re.S) != re.findall(r"<pre\b.*?</pre>", right, re.S) and (new_left != left or new_right != right):
                found.append(name)
        elif name == "heading ids":
            if re.findall(r"<h[1-6]\b[^>]*>", left) != re.findall(r"<h[1-6]\b[^>]*>", right) and (new_left != left or new_right != right):
                found.append(name)
        left, right = new_left, new_right
    if left != right:
        found.append("other")
    return found or ["other"]


def compare(left, right):
    if not left.is_dir() or not right.is_dir():
        raise ValueError("both build directories must exist")
    files = lambda root: {p.relative_to(root).as_posix(): p for p in root.rglob("*.html")}
    a, b = files(left), files(right)
    if not a or not b:
        raise ValueError("both builds must contain HTML pages")
    result = {"same": 0, "changed": {}, "only production": sorted(a.keys() - b.keys()),
              "only scrybe": sorted(b.keys() - a.keys()), "examples": {}}
    for path in sorted(a.keys() & b.keys()):
        x, y = normalize(a[path].read_text()), normalize(b[path].read_text())
        if x == y:
            result["same"] += 1
        else:
            result["changed"][path] = causes(x, y)
            # Small escaped excerpts; never emit raw rendered HTML in summaries.
            # Linear-time first mismatch; large generated pages must stay cheap.
            i = next((i for i, pair in enumerate(zip(x, y)) if pair[0] != pair[1]), min(len(x), len(y)))
            result["examples"][path] = (x[max(0, i-30):i+150], y[max(0, i-30):i+150])
    return result


def report(result):
    lines = ["# Scrybe preview comparison", "", "Normalization: whitespace between tags only; pre/code/script/style/textarea content is preserved.",
             "Cause labels are heuristic candidates, may overlap, and do not prove semantic equivalence. Other retains differences unexplained by the projections.",
             "", f"Identical HTML pages: {result['same']}; differing HTML pages: {len(result['changed'])}.", ""]
    for group in GROUPS:
        pages = [p for p, labels in result["changed"].items() if group in labels]
        lines.extend((f"## {group}: {len(pages)} pages", ""))
        for path in pages:
            lines.append(f"- <code>{html.escape(path)}</code>")
        for path in pages[:3]:
            a, b = result["examples"][path]
            lines.extend(("", f"First-difference excerpt: {html.escape(path)}", "", "<pre>production: " + html.escape(a) + "\nscrybe: " + html.escape(b) + "</pre>"))
        lines.append("")
    for key in ("only production", "only scrybe"):
        lines.extend((f"## Pages {key}: {len(result[key])}", ""))
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
