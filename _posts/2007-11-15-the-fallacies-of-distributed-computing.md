---
excerpt_separator: ""
layout: "archive-post"
title: "The Fallacies of Distributed Computing"
date: "2007-11-15T16:31:00.000-05:00"
description: "I'm working a SOAP heavy project right now so I thought I'd look up the 8 Fallacies of Distributed Computing. These are 8 assumptions people often make in designing network based systems such as a SOA or ESB that simply "
topics: ["personal-notes"]
original_labels: ["design","networking","soa","soap"]
original_url: "https://hartsock.blogspot.com/2007/11/im-working-soap-heavy-project-right-now.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-11-15-the-fallacies-of-distributed-computing/"
id: bafyr4ihqkjqx7fmrxrj3aua2o7rmskacpguzkywv2mrpjd4e36amyzfrnm
permalink: /posts/the-fallacies-of-distributed-computing-amyzfrnm/
---
{% raw %}

I'm working a SOAP heavy project right now so I thought I'd look up the [8 Fallacies of Distributed Computing](http://en.wikipedia.org/wiki/Fallacies_of_Distributed_Computing). These are 8 assumptions people often make in designing network based systems such as a SOA or ESB that simply aren't true.

The following is NOT true:

 1. The network is reliable.

 2. Latency is zero.

 3. Bandwidth is infinite.

 4. The network is secure.

 5. Topology doesn't change.

 6. There is one administrator.

 7. Transport cost is zero.

 8. The network is homogeneous.

Designs should allow for the network to drop in and out, run slowly, take a while to move data around, change with out notice, or deal with multiple operating systems, langauges, or data representations. How often to we just think about the 'best case' scenario and fail to build in allowances for problems?

{% endraw %}
