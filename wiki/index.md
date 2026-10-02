---
layout: default
title: Wiki
permalink: /wiki/
description: "Living reference pages. Not dated, revised in place, with revisions listed."
---
# Wiki

Living reference pages. They are revised in place, and each page lists its revisions.
{% assign pages = site.wiki | sort: "title" %}
{% for p in pages %}
<article class="series-card">
  <h3><a href="{{ p.url | relative_url }}">{{ p.title }}</a></h3>
  {%- if p.description %}<p class="blurb">{{ p.description }}</p>{% endif %}
</article>
{% endfor %}
