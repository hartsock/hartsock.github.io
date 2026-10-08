---
excerpt_separator: ""
layout: "archive-post"
title: "GORM is a work of Art"
date: "2007-10-05T09:55:00.000-04:00"
description: "I've been working in GORM a lot lately. And out of all the different ways I've ever had to make objects work with tables this is perhaps the most fun and straight forward. My eyes kind of glaze over when people mention X"
topics: ["software-design"]
original_labels: ["GORM","grails","groovy"]
original_url: "https://hartsock.blogspot.com/2007/10/gorm-is-work-of-art.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-10-05-gorm-is-a-work-of-art/"
id: bafyr4iebid2nerquam7w5l6agjhpc6jbu4l2ucyijes6uluo7u3nmmbnoi
permalink: /posts/gorm-is-a-work-of-art-3nmmbnoi/
---
{% raw %}

I've been working in [GORM](http://grails.codehaus.org/GORM) a lot lately. And out of all the different ways I've ever had to make objects work with tables this is perhaps the most *fun* and straight forward.

My eyes kind of glaze over when people mention XML configurations and that seems to violate some deep down desire I have for all the things related to a thing... let's say a class Foo and its mapping and validation... to either be contained with in Foo or near by Foo. Spreading out validation and mapping between multiple objects related to Foo rubs me wrong.

GORM fixes this problem by using the Groovy language concepts to store this validation configuration inside the class definition. Which I like because my bias is nearly always toward code. The addition of code by convention means many of the pre-defined queries I would have been writing in EJB3 annotations are created when called.

It is the most pleasant way to do ORM I've ever seen.

{% endraw %}
