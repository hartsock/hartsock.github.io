---
excerpt_separator: ""
layout: "archive-post"
title: "Symbolic Link Joy"
date: "2007-07-29T18:08:00.000-04:00"
description: "Let's say you have a server. It runs the frobnicate service. The problem is you have to upgrade the frobnicate service every so often. Sometimes you have to \"roll back\" to an old version. What to do? Lately I've been thi"
topics: ["software-design","organizations"]
original_labels: ["distribution","howto","idea","linux","management"]
original_url: "https://hartsock.blogspot.com/2007/07/symbolic-link-joy.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-07-29-symbolic-link-joy/"
id: bafyr4iezf2ooot6lap3oqywyw3tewkoggaqjuocxdb6fagdvzpwconsxkq
permalink: /posts/symbolic-link-joy-wconsxkq/
---
{% raw %}

Let's say you have a server. It runs the frobnicate service. The problem is you have to upgrade the frobnicate service every so often. Sometimes you have to "roll back" to an old version.

What to do?

Lately I've been thinking like this:

```

 $ cd /usr/local/

 $ mkdir frobnicate-dist

 $ cd frobnicate-dist

 $ install frobnicate1

 $ install frobnicate2

 $ ln -s frobnicate2 current

 $ cd /usr/local

 $ ln -s frobnicate-dist/current frobnicate

```

The result is that /usr/local/frobnicate is our currently running frobnicate. If you need to change the currently running frobnicate... change the frobnicate-dist/current and all frobnicate versions are in the /usr/local/frobnicate-dist directory.

Perhaps frobnicate-versions?

Just a thought.

{% endraw %}
