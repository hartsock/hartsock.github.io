#!/usr/bin/env python3
"""Stable page ids for blog posts, via the content-addressable crate.

The id is a ContentId over the page's identity record, which is fixed at first
publication: {area, slug, date, author}. The body is NOT hashed, so edits never
move the URL. permalink = /posts/<slug>-<last 8 chars of the CID>/.

  page-id.py --write FILE...   add `id:` and `permalink:` to front matter
  page-id.py --check           verify every post under _posts/ (CI / push hook)
Needs: pip install content-addressable pyyaml
"""
import re, sys, pathlib
import yaml
from content_addressable import content_id

AREA = "blog"      # identity only; never changes
PREFIX = "posts"   # URL path; /blog/ is taken by the separate hartsock/blog project site

def split(path):
    m = re.match(r"---\n(.*?)\n---\n", path.read_text(), re.S)
    return yaml.safe_load(m.group(1)), m

def ident(path):
    fm, _ = split(path)
    slug = re.sub(r"^\d{4}-\d{2}-\d{2}-|\.md$", "", path.name)
    date = path.name[:10]
    author = fm["authors"][0]["name"]  # first-listed author at first publication
    cid = str(content_id({"area": AREA, "slug": slug, "date": date, "author": author}))
    return slug, cid, f"/{PREFIX}/{slug}-{cid[-8:]}/"

def main(argv):
    if argv[:1] == ["--check"]:
        bad = 0
        for p in sorted(pathlib.Path("_posts").glob("*.md")):
            fm, _ = split(p)
            slug, cid, url = ident(p)
            if fm.get("id") != cid or fm.get("permalink") != url:
                print(f"{p}: id/permalink drift (expected {url})"); bad = 1
        return bad
    if argv[:1] == ["--write"]:
        for f in argv[1:]:
            p = pathlib.Path(f)
            fm, m = split(p)
            slug, cid, url = ident(p)
            head = re.sub(r"^(id|permalink):.*\n?", "", m.group(1), flags=re.M).rstrip("\n")
            p.write_text(f"---\n{head}\nid: {cid}\npermalink: {url}\n---\n" + p.read_text()[m.end():])
        return 0
    print(__doc__); return 2

sys.exit(main(sys.argv[1:]))
