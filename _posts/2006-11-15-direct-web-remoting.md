---
excerpt_separator: ""
layout: "archive-post"
title: "Direct Web Remoting"
date: "2006-11-15T21:29:00.000-05:00"
description: "DWR (Direct Web Remoting) is yet another Ajax framework. This one is, however, a Java framework that makes a heck of a lot of sense for java developers. Take a POJO. Register it in the dwr.xml file under WEB-INF in your "
topics: ["software-design"]
original_labels: ["DWR","ajax","java","web2.0"]
original_url: "https://hartsock.blogspot.com/2006/11/direct-web-remoting.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2006-11-15-direct-web-remoting/"
id: bafyr4ifev5tfyftrvymqjjbowyat3r72fnj5vmfupkpatq2omhkncexq24
permalink: /posts/direct-web-remoting-kncexq24/
---
{% raw %}

DWR (Direct Web Remoting) is yet another Ajax framework. This one is, however, a Java framework that makes a heck of a lot of sense for java developers. Take a POJO. Register it in the dwr.xml file under WEB-INF in your war... and now you have an object you can call from your webpages.

Yeah. I didn't believe it either. But the 2.0 beta of DWR that I have been working with is really just about that easy. DWR generates the javascript which you just include in a page, then it generates the servlet that the javascript calls. DWR turns a POJO into an Ajax servlet.

See how easy it is to [get started with DWR](http://getahead.ltd.uk/dwr/getstarted) and if I get enough feed back I'll post some code samples of how to do a portlet that has can process actions using that POJO you registered with DWR. Now with some very simple (but smart) scripting you get Ajax features that automatically degrade to universally supported portlet actions.

And that is why DWR is head and shoulders over some very wrong-headed attempts to turn Ajax web development into Swing or pseudo-swing development. The web is the web. Features should degrade gracefully and page designers and artists should be able to work with programmers to create web applications that work well, look nice, and degrade gracefully.

see also: my DWR tag roll on [del.icio.us](http://del.icio.us/hartsock/DWR)

{% endraw %}
