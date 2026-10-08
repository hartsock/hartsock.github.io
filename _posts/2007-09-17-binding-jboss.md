---
excerpt_separator: ""
layout: "archive-post"
title: "Binding JBoss"
date: "2007-09-17T14:18:00.000-04:00"
description: "$ /usr/local/jboss/bin/run.sh -b hostname 1>&2>/dev/null & Binds JBoss to hostname on port 8080 and ignores the standard output and standard error."
topics: ["software-design"]
original_labels: ["howto","java","jboss","linux","notes"]
original_url: "https://hartsock.blogspot.com/2007/09/binding-jboss.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-09-17-binding-jboss/"
id: bafyr4ih552s7vcs56q73nrceavb2u4flavhdtnnqtwvpmqupfkdiagdkze
permalink: /posts/binding-jboss-diagdkze/
---
{% raw %}

```

 $ /usr/local/jboss/bin/run.sh -b `hostname` 1>&2>/dev/null &

```

Binds JBoss to `hostname` on port 8080 and ignores the standard output and standard error.

{% endraw %}
