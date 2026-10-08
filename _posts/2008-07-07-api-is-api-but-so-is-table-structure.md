---
excerpt_separator: ""
layout: "archive-post"
title: "API is API, but so is table structure..."
date: "2008-07-07T16:57:00.002-04:00"
description: "It's sometimes hard for developers to remember that table structure is also an API. Yes, it should be considered an internal API for the application you are developing, but it is still part of a system that must be caref"
topics: ["software-design"]
original_labels: ["Software Design","ideas","soap","social networking"]
original_url: "https://hartsock.blogspot.com/2008/07/api-is-api-but-so-is-table-structure.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-07-07-api-is-api-but-so-is-table-structure/"
id: bafyr4iffshlfyplcx2qyfzk7w43bblhkdtfrmrryt7p4fn5j4ivtpsxq7u
permalink: /posts/api-is-api-but-so-is-table-structure-vtpsxq7u/
---
{% raw %}

It's sometimes hard for developers to remember that table structure is also an API. Yes, it should be considered an internal API for the application you are developing, but it is still part of a system that must be carefully constructed to reflect the reality in which it operates. It is not enough to just normalize data following the rules of database normalization... not anymore anyway... it is important to consider how you will mash-up and add onto a database schema.

Consider RESTful webservices as a unique opportunity to add data into an enterprise system. You have a URI for a resource exposed by a restful API. That URI can then be bookmarked and annotated in a system like del.icio.us for your internal users.

That kind of annotation is powerful. It means you can add tags, wiki, and annotated information to CRM pages, BOM, or other data independent of the underlying system implementation. And, not surprizingly, Grails is well situated for this. Grails projects with [Content Negotation](http://grails.org/1.0+Release+Notes) can be viewed as amazing polymorphic services that display web pages to browsers, XML to services, and JSON to ajax clients.

That flexibility means you can "bookmark" ala social bookmarking in multiple contexts ... these bookmarks can carry meta data about a linked URI. That meta-data can be anything from contact notes to wiki entries. That could mean a new era of business applications that provide semantic inter-sections of web URI based on simple RESTful principles.

Imagine a BOM bookmarked and annotated in a del.icio.us type interface by different departments. A kitting department links the BOM to a history list that represents activities of kitting. Billing annotates accounting activity by bookmarking and logging the original BOM. The accounting system could be .NET, the kitting in PHP... it wouldn't matter. And you wouldn't need SOAP or known WSDL. The core system would be simpler and concerned with just web-page functions... and (using Grails) a scant few lines for context sensitivity to what the controller renders (XML, HTML, Ajax, JSON, etc.) ...meaning you can develop supporting systems each *orthogonal* to the data source system.

Think of it as meta-Aspect Oriented Programming if that makes you feel better about it. But, really, it's all about using REST and the web for what they are good at and leveraging the power of the browser as a broker platform. I've heard it called Browser As A Broker (BAAB) and also Enterprise Service Browser (ESB). I think I'll call it... simple and to the point.

{% endraw %}
