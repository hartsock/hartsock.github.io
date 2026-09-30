---
layout: default
title: ""
---
<section class="home-intro">
  <h1>Shawn Hartsock</h1>
  <p>Short series on intelligence, systems, and the ideas that outlast their tools. Published in plain text; the source lives in git.</p>
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

{%- assign featured = site.data.nav | where: "home", true %}
{%- if featured.size > 0 %}
<section class="series-index">
  <h2>Projects</h2>
  {% for n in featured %}
  <article class="series-card">
    <h3><a href="{{ n.url | relative_url }}">{{ n.title }}</a></h3>
    <p class="blurb">{{ n.blurb }}</p>
  </article>
  {% endfor %}
</section>
{%- endif %}
