---
excerpt_separator: ""
layout: "archive-post"
title: "Grails Plugin Testing Strategies"
date: "2012-07-31T18:18:00.002-04:00"
description: "I've been maintaining Grails plugins for years now both on the wild-wild web and in private enterprise-only plugins. In this talk at GR8Conf I shared stories from that history, the problems I encountered and how I solved"
topics: ["testing","software-design"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2012/07/grails-plugin-testing-strategies.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2012-07-31-grails-plugin-testing-strategies/"
id: bafyr4ihcnlfoox5e65tzz4zvxdzwiahu4zi7a4r7xg2jvid3lwkj7xzvfe
permalink: /posts/grails-plugin-testing-strategies-kj7xzvfe/
---
{% raw %}

I've been maintaining Grails plugins for years now both on the wild-wild web and in private enterprise-only plugins. In [this talk](http://gr8conf.us/Presentations/Grails-Plugin-Testing-Strategi) at [GR8Conf](http://gr8conf.us/) I shared stories from that history, the problems I encountered and how I solved them. Grails 2.x offers us so much in the way of testing and mocking we can now get rid of a lot of the crazy things I used to do to test my plugins.

 Ultimately, however, when you do things at the persistence layer you need to do a full integration test with the database since there's no real way to substitute for a real database. So my advice is to avoid at all costs dipping down any lower in the architecture than you absolutely have to. Good plugin testing starts with good plugin design... design to test.

 And if you do manage to do something naughty (as I often seem to want to do) then you should make sure you have lots of safety net underneath you with a rich testing environment all around your code.

 for code shown, see also:

- [https://github.com/hartsock/grails-audit-logging-plugin/tree/v100_beta](https://github.com/hartsock/grails-audit-logging-plugin/tree/v100_beta)
- [https://github.com/hartsock/grails-qrcode](https://github.com/hartsock/grails-qrcode)

{% endraw %}
