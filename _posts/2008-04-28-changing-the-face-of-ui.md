---
excerpt_separator: ""
layout: "archive-post"
title: "Changing the face of UI"
date: "2008-04-28T11:05:00.004-04:00"
description: "I have talked previously about how I felt about many of the UI building environments out there today. My UI experience comes from a nearly decade old C/C++ experience in CaveGL, OpenGL, and GLUT... so I can't speak much "
topics: ["software-design"]
original_labels: ["DSL","java","swing"]
original_url: "https://hartsock.blogspot.com/2008/04/changing-face-of-ui.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-04-28-changing-the-face-of-ui/"
id: bafyr4ihksydtucckbbopv7vamstmhakg72r7j2vy5jvijfk5gbkq752mbi
permalink: /posts/changing-the-face-of-ui-kq752mbi/
---
{% raw %}

I have talked previously about how I felt about many of the UI building environments out there today. My UI experience comes from a nearly decade old C/C++ experience in CaveGL, OpenGL, and GLUT... so I can't speak much to Java UI. Fact is I've never had to build a full Java UI for a commerical project before. I've only had toy Java UI projects.

Recently, when an opportunity to do real Java UI work landed in my lap, I jumped on it a little too eagerly. In my time working with Java UI I've found that unlike my days with OpenGL and other open source GUI rendering tool kits the ones for Java are comparatively opaque.

Part of what worked well in those "primitive" environments was how easy it was to stumble upon or discover the API and design a system with trial-and-error. My feeling is you can't do this in Eclipse because the system has too many moving parts to just tinker with and discover. I feel strongly that software on any level should encourage play and discovery and be tolerant of screw-ups by the user.

I've also mentioned that UI should perhaps be a descriptive exercise. That is to say that the look of UI should be described and computed. The function should be meticulously programmed but the look and feel should be easily changed and readily played with.

Today I found this project, [Java Builder](http://jacekfurmankiewicz.blogspot.com/2008/04/java-builder-for-swing-complet-complex.html). The idea behind Java Builder is exactly what I've been trying to express in words. Java builder provides a YAML based DSL to describe Java UI. The YAML is turned into straight Java.

This is brilliant work that is moving in the right direction.

{% endraw %}
