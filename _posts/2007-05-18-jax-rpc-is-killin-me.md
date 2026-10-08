---
excerpt_separator: ""
layout: "archive-post"
title: "JAX-RPC is killin' me."
date: "2007-05-18T09:55:00.000-04:00"
description: "No collections?!? WTF! It seems that the JBossWS product put out by JBoss does not allow for collections over the wire as SOAP... yet my XJC tool will turn an DTO into POJOs using java.util collections. What gives! We li"
topics: ["software-design"]
original_labels: ["JAX-RPC","POJO","WTF","hibernate","jBPM","java","jboss"]
original_url: "https://hartsock.blogspot.com/2007/05/jax-rpc-is-killin-me.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-05-18-jax-rpc-is-killin-me/"
id: bafyr4igww4b2n4yd4rtyjsu24eipacud4isy7bkqpnao5ersudkvyb6cpm
permalink: /posts/jax-rpc-is-killin-me-kvyb6cpm/
---
{% raw %}

No collections?!? WTF! It seems that the JBossWS product put out by JBoss does not allow for collections over the wire as SOAP... yet my XJC tool will turn an DTO into POJOs using java.util collections. What gives!

We live in the 21st century, application developers should have dynamic data structures like double ended queues, vectors, and hash-maps to work with. If you can't do a container then your serialization program just isn't ready for prime time.

Damn it. Now I'm going to have to pour through all that autogen code and rewrite it to use plain arrays. I wonder how Hibernate will feel about this.

{% endraw %}
