---
excerpt_separator: ""
layout: "archive-post"
title: "Hibernate3 is not EJB3"
date: "2007-05-30T08:35:00.000-04:00"
description: "My first and most painful lesson in my year with J5EE was about Hibernate, Hibernate3, annotations, and EJB3. I had been lead to believe by an evil leprechaun that EJB3 was just Hibernate. I learned by actual experience "
topics: ["personal-notes"]
original_labels: ["Java5","ejb3","hibernate","j5ee"]
original_url: "https://hartsock.blogspot.com/2007/05/hibernate3-is-not-ejb3.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-05-30-hibernate3-is-not-ejb3/"
id: bafyr4idetwqifzmlf7vmkr26wjplkgxsngpcb2d62krhdfg3rok7ryssa4
permalink: /posts/hibernate3-is-not-ejb3-k7ryssa4/
---
{% raw %}

My first and most painful lesson in my year with J5EE was about Hibernate, Hibernate3, annotations, and EJB3. I had been lead to believe by an evil leprechaun that EJB3 was just Hibernate. I learned by actual experience in creating applications that this is simply not true. In fact EJB3 is a standard that Hibernate3 implements.

Why is that an important distinction?

Because EJB3 features are a proper subset of Hibernate3 features since Hibernate "embraces and extends" the EJB3 standard. It also means that if you do intend on using those cute little "at" signs in a "portable" way you'll have to figure out what EJB3 annotation to use to solve the Hibernate trace you just saw.

EJB3 doesn't require XML sit-ups and the EJB3 implementation in JBoss that sits on top of the Hibernate3 layer hides those gut busting crunches from your beady little eyes. So using the EJB3 persistence feature is far less painful than using the Hibernate 2 XML workout routine. That would typically mean that you'd want to use the EJB3 model whenever possible.

The problem is that Annotations for persistence and XML for persistence can get into fistycuffs. If you set up a Hibernate SessionFactory (even if it's a version 3 session factory) you may use XML docs _or_ annotations... theory may say otherwise but when I sat down to mix my annotated classes with XML configured classes the programmatic changes to the configuration wouldn't stick.

Hibernate3 is not EJB3.

{% endraw %}
