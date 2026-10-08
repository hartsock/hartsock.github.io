---
excerpt_separator: ""
layout: "archive-post"
title: "Server as a Text Pump"
date: "2006-10-16T08:40:00.000-04:00"
description: "So a server gets requests from the network and these come as text. A server gives a response and these are formulated as text. The text is formatted to give it a structure. And, if you use the right formats you get to ca"
topics: ["philosophy"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2006/10/server-as-text-pump.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2006-10-16-server-as-a-text-pump/"
id: bafyr4igkvz2yua4hrtc5eca7lacs4oncwvbc6poetqwol3qockok67bcxq
permalink: /posts/server-as-a-text-pump-ok67bcxq/
---
{% raw %}

So a server gets requests from the network and these come as text. A server gives a response and these are formulated as text. The text is formatted to give it a structure. And, if you use the right formats you get to call your server an XML-RPC server, or a SOAP server, or flavor of the week. Isn't all this just the [Unix Philosophy](http://catb.org/%7Eesr/writings/taoup/html/ch01s06.html) taken to the web and hammered on with an XML hammer?

And, this is the point where I start wondering why the heck so many freakin'' book get written about this. SOA should be the easiest thing in the world. Unix programs have been parsing and spewing forth text for ever why does it suddenly become so much more difficult once you put objects into the mix?

It's the frameworks. Many of these XML frameworks don't make life simpler, they make it more complex. If you're trying to do SOAP or any XML-RPC work in a Java Application Server I encourage you to look at JBoss' EJB3 product. It looks to me like EJB3 in general will save a lot of grief for SOAP-y programmers and the [JBossWS](http://wiki.jboss.org/wiki/Wiki.jsp?page=EJB3) API is the first implementation of this that I've found usable.

When I tried some of the WebService tricks on the Sun Application server that comes with NetBeans I sprained a nerve cluster. When I tried the same on Glassfish I lost a lobe. With JBossWS I was so shocked at how easily my EJB3 service went together I couldn't believe it. I've made EJB3 + JBossWS my default development stack for Web Services.

{% endraw %}
