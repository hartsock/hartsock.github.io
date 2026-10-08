---
excerpt_separator: ""
layout: "archive-post"
title: "NFJS 2007: RESTful Loosely Typed SOAP services"
date: "2007-07-22T21:49:00.000-04:00"
description: "I just got back from No Fluff, Just Stuff 2007 (NFJS) and I went there with my document centric design ideas and came back after words with an idea that is far more powerful. RESTful Loosely Typed SOAP services. Okay, I'"
topics: ["software-design"]
original_labels: ["NFJS","idea","java","soap"]
original_url: "https://hartsock.blogspot.com/2007/07/nfjs-2007-restful-loosely-typed-soap.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-07-22-nfjs-2007-restful-loosely-typed-soap-services/"
id: bafyr4ids25qs7o3x7mayv62hf3igzrp2rn3fmdbwuskcptf5llifsz4vb4
permalink: /posts/nfjs-2007-restful-loosely-typed-soap-services-ifsz4vb4/
---
{% raw %}

I just got back from No Fluff, Just Stuff 2007 ([NFJS](http://www.nofluffjuststuff.com/show_view.jsp?showId=89)) and I went there with my document centric design ideas and came back after words with an idea that is far more powerful. RESTful Loosely Typed SOAP services.

Okay, I'll admit it... it would be hard to pull off a truly RESTful SOAP service but we nearly have all the components. It is much easier to pull off a Loosely Typed SOAP service and that is where the real power is.

There is quite a bit of support for a Loosely Typed SOAP service. Simply put SOAP services use XML documents and not structured data types defined in their WSDL. The cost is using strategy patterns to tear apart your documents. Since you can get any number of document versions you need any number of strategies to unmarshal them.

The benefit is that the marshaling and unmarshaling of data is done by strategy patterns that can be swapped out. One service end point can service multiple document process versions. Viola instant upgrade path that is also backward compatable.

The RESTful-ness is achieved by providing a set of "fetch" documents that would fetch things in an easy to understand way... the fetches would be polymorphic too. This is not quite RESTful since the restful ideal would be to be able to specify unique URI to get each item... but it is closer to the ideal than strongly typed SOAP.

I need to play with this more and write some examples.

{% endraw %}
