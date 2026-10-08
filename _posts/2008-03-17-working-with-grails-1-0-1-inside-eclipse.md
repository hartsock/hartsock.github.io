---
excerpt_separator: ""
layout: "archive-post"
title: "Working with Grails 1.0.1 inside Eclipse"
date: "2008-03-17T10:32:00.005-04:00"
description: "I've started on a new project using Grails 1.0.1 and I've had to change a few things since working with Grails 1.0-RC4. Fortunately I did get an upgrade to Grails 1.0 into my application before deploy but 1.0.1 came too "
topics: ["testing","software-design"]
original_labels: ["eclipse","ejb3","grails","groovy","java","jpa"]
original_url: "https://hartsock.blogspot.com/2008/03/working-with-grails-101-inside-eclipse.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-03-17-working-with-grails-1-0-1-inside-eclipse/"
id: bafyr4ieag572eecnge46txzer5cipxvojdpczwv5igxb43rwi6sfuohn3i
permalink: /posts/working-with-grails-1-0-1-inside-eclipse-sfuohn3i/
---
{% raw %}

I've started on a new project using [Grails 1.0.1](http://grails.org/) and I've had to change a few things since working with Grails 1.0-RC4. Fortunately I did get an upgrade to Grails 1.0 into my application before deploy but 1.0.1 came too late to make it through our regression testing on that application. Today starts a new development project from scratch so I'm using 1.0.1 and when I went to use *grails create-app* it crashed on me... sorry I wish I had saved the trace... but I fixed this issue by deleting the *~/workspace/.metadata* directory from my workspace.

Unfortunately, when you delete the *.metadata* directory Eclipse forgets many of your settings. In setting up my new eclipse project for Grails I set up the [Eclipse Groovy plugin](http://groovy.codehaus.org/Eclipse+Plugin) to output to *bin* and I set the build path of Java to output to *project/bin* which made both Groovy and Java compilers output to the same directory. This seems to work well with [JPA](http://hartsock.blogspot.com/2007/11/groovy-grails-and-jpa.html) classes too. After I get farther with this project I'll write up yet another Groovy, Grails, and the JPA tutorial using the new 1.0.1 conventions.

This next project will make heavy use of XML and XSD files as well so this should be a very informative project. Another problem to solve will be using SSL certificates and CAS. The CAS work has been very easy thanks to the [CAS Client Plugin](http://docs.codehaus.org/display/GRAILS/CAS+Client+Plugin) for Grails (it works great if you already have CAS set up). Now I need to add role management... but that's another story.

{% endraw %}
