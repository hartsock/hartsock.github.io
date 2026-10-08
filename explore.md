---
layout: default
title: Browse by topic
permalink: /explore/
wide: true
extra_css:
  - /assets/css/topic-map.css
---
<section class="home-intro">
  <h1>Shawn Hartsock</h1>
  <p>Explore ideas across essays, reference pages, and courses.</p>
  <p><a href="{{ '/' | relative_url }}">Explore the similarity map →</a></p>
</section>

<section id="topic-map" aria-labelledby="topic-map-title" data-groups="{{ site.data.topics | jsonify | escape }}"{% if site.preview_corpus_url %} data-corpus-url="{{ site.preview_corpus_url | relative_url }}"{% endif %}>
  <h2 id="topic-map-title">Follow an idea</h2>
  <p class="topic-help">Choose a topic to explore. Recent writing comes first.</p>
  {% if site.archive_preview %}<p class="archive-preview-note">Local archive test corpus. Original dates are preserved; archive topics are provisional. <a href="/preview-corpus/map/">Explore the article similarity map →</a></p>{% endif %}
  <div class="topic-groups" aria-label="Explore topics"></div>
  <div class="topic-subtopics" aria-label="Narrow by topic"></div>
  <div class="topic-results-head"><h3 data-results-title>Recent pages</h3><p data-results-count role="status"></p></div>
  <div class="topic-explorer">
    <div class="topic-graph">
      <template class="topic-source">
        {% for p in site.posts %}{% include topic-node.html page=p kind="Post" %}{% endfor %}
        {% for p in site.wiki %}{% include topic-node.html page=p kind="Wiki" %}{% endfor %}
        {% for p in site.pages %}
          {% if p.layout == 'series' %}{% include topic-node.html page=p kind="Series" %}{% endif %}
          {% if p.topic_kind == 'Course' %}{% include topic-node.html page=p kind="Course" %}{% endif %}
        {% endfor %}
        {% if site.archive_preview %}{% for p in site.preview_archive %}{% include topic-node.html page=p kind="Archive post" %}{% endfor %}{% endif %}
      </template>
      <div class="topic-pages"></div>
      <nav class="topic-pagination" aria-label="Page results" hidden><button type="button" class="btn" data-newer>Newer</button><button type="button" class="btn" data-older>Older</button></nav>
    </div>
    <aside class="topic-preview" aria-label="Page preview" hidden>
      <span class="topic-kind" data-preview-kind></span>
      <h3 data-preview-title></h3>
      <p class="topic-date" data-preview-date></p>
      <p data-preview-description></p>
      <p class="topic-tags" data-preview-topics></p>
      <a data-preview-link>Open page →</a>
    </aside>
  </div>
  <noscript><p><a href="{{ '/all/' | relative_url }}">Browse all pages</a></p></noscript>
</section>
