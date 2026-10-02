---
layout: default
title: ""
---
<section class="home-intro">
  <h1>Shawn Hartsock</h1>
  <p>Short series on intelligence, systems, and the ideas that outlast their tools. Published in plain text; the source lives in git.</p>
</section>

<section class="series-index">
  <h2>Latest from the blog</h2>
  {% for p in site.posts limit: 3 %}
  <article class="series-card">
    <h3><a href="{{ p.url | relative_url }}">{{ p.title }}</a></h3>
    <p class="tagline">{{ p.date | date: "%Y-%m-%d" }}</p>
    {% if p.description %}<p class="blurb">{{ p.description }}</p>{% endif %}
  </article>
  {% endfor %}
  <p><a href="{{ '/posts/' | relative_url }}">All posts</a></p>
</section>

<section class="series-index">
  <h2>Series</h2>
  {% for s in site.data.series %}
  <article class="series-card">
    <h3><a href="{{ s.url | relative_url }}">{{ s.title }}</a></h3>
    <p class="tagline">{{ s.tagline }}</p>
    {% if s.blurb %}<p class="blurb">{{ s.blurb }}</p>{% endif %}
  </article>
  {% endfor %}
</section>
