---
layout: default
title: Series
permalink: /series/
description: "Multi-part reads, in order."
---
# Series

Multi-part reads, meant to be read in order. They are not in the feed.
{% for s in site.data.series %}
{% unless s.sitemap == false %}
<article class="series-card">
  <h3><a href="{{ s.url | relative_url }}">{{ s.title }}</a></h3>
  <p class="tagline">{{ s.tagline }}</p>
  {%- if s.blurb %}<p class="blurb">{{ s.blurb }}</p>{% endif %}
</article>
{% endunless %}
{% endfor %}
