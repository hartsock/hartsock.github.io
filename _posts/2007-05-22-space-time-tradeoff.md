---
excerpt_separator: ""
layout: "archive-post"
title: "Space-time tradeoff"
date: "2007-05-22T13:11:00.000-04:00"
description: "My half of a chat conversation: \"In computer science, a space-time or time-memory tradeoff is a situation where the memory use can be reduced at the cost of slower program execution, or vice versa, the computation time c"
topics: ["software-design","science"]
original_labels: ["computer science","database","software"]
original_url: "https://hartsock.blogspot.com/2007/05/space-time-tradeoff.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-05-22-space-time-tradeoff/"
id: bafyr4iblw744dbedgaqttw6bhp3rzzjaq4sgmofzlnvgkk5cfrwqerfbmy
permalink: /posts/space-time-tradeoff-wqerfbmy/
---
{% raw %}

My half of a chat conversation:

"In computer science, a space-time or time-memory tradeoff is a situation where the memory use can be reduced at the cost of slower program execution, or vice versa, the computation time can be reduced at the cost of increased memory use."

From: [http://en.wikipedia.org/wiki/Space-time_tradeoff](http://en.wikipedia.org/wiki/Space-time_tradeoff)

... so in a very general and theoretical sense... if there was enough ram on your system, your OS should put everything in RAM to make things faster... not just because Hard Drives are slow... but because it is faster to look up the answer to 32 billion divided by 8 than it is to compute 32 billion divided by 8. The more time it takes to compute an answer the smarter it is to save that answer so you can look it up later.

More RAM makes software many many times faster.

However, Database design teaches the exact opposite: only save that which you can't compute, and save that information in the most terse compact form possible. Which is why database engines tend to do a lot of on-the-fly computation, caching, and indexing. The reason for this is that Databases are concerned with consistency and accuracy of data and that is easier to maintain for terse, tight, inter-related groupings of data without any redundancy.

{% endraw %}
