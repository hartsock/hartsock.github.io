---
excerpt_separator: ""
layout: "archive-post"
title: "Bit Plumber"
date: "2006-09-25T09:41:00.000-04:00"
description: "It seems that most of my life is spent either waiting for, calling new, or building data transfers. I spend my Monday morning reviewing logs from the previous weekend's data transfers, I start a refresh of my development"
topics: ["software-design"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2006/09/bit-plumber.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2006-09-25-bit-plumber/"
id: bafyr4igbgfh4frzt7v6kgkahcbu47usxijjrbbyppxt25uyghx5pfl27ia
permalink: /posts/bit-plumber-5pfl27ia/
---
{% raw %}

It seems that most of my life is spent either waiting for, calling new, or building data transfers. I spend my Monday morning reviewing logs from the previous weekend's data transfers, I start a refresh of my development environment's database, and I work through last week's progress on the web services I created. This weeks project is to design a custom export of data from one database to an XML format and back into a different database. So much of this is repetitive and so much of it is the same from week to week I have to wonder if there isn't a group of tools to automate these tasks.

Let me introduce you to the wonderful world of [ETL](http://en.wikipedia.org/wiki/ETL)tools. These are tools that Extract, Transform, and Load data. In short they have the potential to replace an entire stack of SOA tools that currently are written painstakingly entity by entity by your talented Web Service programmers. They do all their by work by pragmatically by-passing the entire [ORM](http://en.wikipedia.org/wiki/Object-relational_mapping) process (that then demands you to [Serialize](http://en.wikipedia.org/wiki/Serialize)the Objects to get XML) and skip directly to the XML.

I expect to see more applications built around these ideas as [SOA](http://en.wikipedia.org/wiki/Service-oriented_architecture) catches on more. Why can't an ETL be used to generate Ajax messages or SOAP calls? After all aren't many SOAP calls and Ajax calls just loading up data from a database and transforming it into the right message format?

{% endraw %}
