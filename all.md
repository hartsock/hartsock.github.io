---
layout: default
title: Everything
permalink: /all/
description: "Every page on this site, generated at build time so none can be orphaned."
---
# Everything

Listed pages on this site. Unlisted pages remain available by direct link.

## Blog
<ul>
  {%- for p in site.posts %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a> <small>{{ p.date | date: "%Y-%m-%d" }}</small></li>
  {%- endfor %}
</ul>

## Series
{% for s in site.data.series %}
{% unless s.sitemap == false %}
<h3><a href="{{ s.url | relative_url }}">{{ s.title }}</a></h3>
<ol>
  {%- assign parts = site.reads | where: "series", s.slug | sort: "part" -%}
  {%- for p in parts %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a></li>
  {%- endfor %}
</ol>
{% endunless %}
{% endfor %}
## Wiki
<ul>
  {%- assign wp = site.wiki | sort: "title" -%}
  {%- for p in wp %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a></li>
  {%- endfor %}
</ul>

## Other pages
{% if site.archive_preview %}
### Archive corpus — local preview
<p><a href="{{ '/' | relative_url }}">Explore the archive by topic, format, and date</a>.</p>
{% endif %}
<ul>
  {%- assign others = site.pages | where: "layout", "default" | sort: "title" -%}
  {%- for p in others %}{% if p.title != blank and p.url != '/' %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a></li>
  {%- endif %}{% endfor %}
</ul>
