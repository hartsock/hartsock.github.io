---
layout: default
title: Blog
permalink: /blog/
description: "Dated posts, newest first. The feed carries these."
---
# Blog

Dated posts, newest first. The [feed]({{ '/feed.xml' | relative_url }}) carries these.
{% for p in site.posts %}
<article class="series-card">
  <h3><a href="{{ p.url | relative_url }}">{{ p.title }}</a></h3>
  <p class="tagline">{{ p.date | date: "%Y-%m-%d" }}</p>
  {%- if p.description %}<p class="blurb">{{ p.description }}</p>{% endif %}
</article>
{% endfor %}
