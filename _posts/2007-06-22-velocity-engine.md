---
excerpt_separator: ""
layout: "archive-post"
title: "Velocity Engine"
date: "2007-06-22T09:22:00.000-04:00"
description: "I've been working with Velocity in Portlets and DWR (version 2) and found that I had to write my own Velocity utils to allow the DWR and generic Portlets to share context. I know there are velocity portlet classes our th"
topics: ["personal-notes"]
original_labels: ["DWR","DWR2","portal","portlet","velocity"]
original_url: "https://hartsock.blogspot.com/2007/06/velocity-engine.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-06-22-velocity-engine/"
id: bafyr4igu3aknoa5r5ym4i6nyy5zhaueizilewumcyhnqixcdydjr3c3lje
permalink: /posts/velocity-engine-jr3c3lje/
---
{% raw %}

I've been working with Velocity in Portlets and DWR (version 2) and found that I had to write my own Velocity utils to allow the DWR and generic Portlets to share context. I know there are velocity portlet classes our there but they are usually for a specific system of portals. Personally, I'm trying to write velocity portlets that can load on Liferay, JBoss, or any other Portal system.

As I was searching around at the start of the project I found that there were no portlet classes for velocity based portlets that were written generically to plug into any portal system. I ended up writing a short Velocity utility class to glue the two contexts together.

{% endraw %}
