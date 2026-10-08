---
excerpt_separator: ""
layout: "archive-post"
title: "Hibernate3 evil bug"
date: "2007-08-13T08:58:00.000-04:00"
description: "The version of hibernate that I'm using has this bug. I had one query in my code base with \" foo =: bar \" instead of \" foo=:bar \" and all my JUnit tests started failing. Remarkable that something so small and silly could"
topics: ["software-design","science"]
original_labels: ["bug","hibernate"]
original_url: "https://hartsock.blogspot.com/2007/08/hibernate3-evil-bug.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-08-13-hibernate3-evil-bug/"
id: bafyr4idwog5mbpmzfmsvsh7diluw37pkh2ufp3pqzrdqwtrwv4cmca34uu
permalink: /posts/hibernate3-evil-bug-cmca34uu/
---
{% raw %}

The version of hibernate that I'm using has this [bug](http://opensource.atlassian.com/projects/hibernate/browse/HHH-2264). I had one query in my code base with " foo =: bar " instead of " foo=:bar " and all my JUnit tests started failing. Remarkable that something so small and silly could destroy an entire code base. There is no warning in the trace to point you toward this syntax... a single space blows up your whole project... evil... just pure evil.

{% endraw %}
