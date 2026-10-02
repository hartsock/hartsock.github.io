#!/usr/bin/env python3
"""Fail if any built page is unreachable from / by internal links, or a link is broken.
Usage: jekyll build, then scripts/orphans.py [_site]"""
import os, re, sys
root = sys.argv[1] if len(sys.argv) > 1 else "_site"
pages = {}
for r, _, fs in os.walk(root):
    if "index.html" in fs:
        u = "/" + os.path.relpath(r, root).strip(".").strip("/")
        pages[u if u == "/" else u + "/"] = open(os.path.join(r, "index.html")).read()
seen, todo, bad = {"/"}, ["/"], 0
while todo:
    u = todo.pop()
    for h in re.findall(r'href="(/[^"#?]*)"', pages[u]):
        if h in pages:
            if h not in seen: seen.add(h); todo.append(h)
        elif not re.search(r"\.\w+$", h):
            print("BROKEN", u, "->", h); bad = 1
for o in sorted(set(pages) - seen):
    print("ORPHAN", o); bad = 1
sys.exit(bad)
