---
excerpt_separator: ""
layout: "archive-post"
title: "DWR POJO as a front controller for a WebService"
date: "2007-01-04T09:36:00.000-05:00"
description: "In the past I would have written my own JavaScript using XmlHttpRequest and a servlet on the back end. This means I have to maintain a lot of code that has nothing to do with my specific project. I evaluated several Ajax"
topics: ["software-design"]
original_labels: ["API","Annotations","DWR2","Java5","questions"]
original_url: "https://hartsock.blogspot.com/2007/01/dwr-pojo-as-front-controller-for.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-01-04-dwr-pojo-as-a-front-controller-for-a-webservice/"
id: bafyr4ib4hrsinmekysga7oxplrj6dix5bjwklcpii2x52dv33wscdnbusa
permalink: /posts/dwr-pojo-as-a-front-controller-for-a-webservice-scdnbusa/
---
{% raw %}

In the past I would have written my own JavaScript using XmlHttpRequest and a servlet on the back end. This means I have to maintain a lot of code that has nothing to do with my specific project. I evaluated several Ajax frameworks and settled on DWR for my current project. But I have a problem.

I've been writing a [DWR](http://getahead.ltd.uk/dwr) object to act as a front controller to a web service. As I wrote previously when using DWR you write a POJO. Register the POJO in dwr.xml and the annotations take care of the rest. But, what about request scope parameters? The request is gone by the time my POJO is called...

[http://getahead.ltd.uk/dwr/server/javaapi](http://getahead.ltd.uk/dwr/server/javaapi)

We use the WebContextFactory to pull out context data.

{% endraw %}
