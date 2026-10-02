---
layout: default
title: Everything
permalink: /all/
description: "Every page on this site, generated at build time so none can be orphaned."
---
# Everything

Every page on this site, built from the same data the pages use. If it renders,
it is listed here.

## Series
{% for s in site.data.series %}
<h3><a href="{{ s.url | relative_url }}">{{ s.title }}</a></h3>
<ol>
  {%- assign parts = site.reads | where: "series", s.slug | sort: "part" -%}
  {%- for p in parts %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a></li>
  {%- endfor %}
</ol>
{% endfor %}
## Essays
<ul>
  {%- assign essays = site.pages | where: "layout", "essay" | sort: "title" -%}
  {%- for e in essays %}
  <li><a href="{{ e.url | relative_url }}">{{ e.title }}</a></li>
  {%- endfor %}
</ul>

## Other pages
<ul>
  {%- assign others = site.pages | where: "layout", "default" | where_exp: "p", "p.title != blank and p.url != '/'" | sort: "title" -%}
  {%- for p in others %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a></li>
  {%- endfor %}
</ul>
