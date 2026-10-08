---
excerpt_separator: ""
layout: "archive-post"
title: "Performance Tuning Grails applications at SpringOne 2GX 2011"
date: "2011-10-27T20:31:00.005-04:00"
description: "I just got done with my SpringOne 2GX talk on Performance Tuning Grails Applications. When I proposed this talk six months ago there was no material on this subject. Since then a fantastic webinar came out. At the start "
topics: ["software-design"]
original_labels: ["Chicago","SpringOne 2GX","grails","groovy","talk"]
original_url: "https://hartsock.blogspot.com/2011/10/performance-tuning-grails-applications.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2011-10-27-performance-tuning-grails-applications-at-springone-2gx-2011/"
id: bafyr4ighvq5ok2256dijygqtvbwrpzcss644otupmhvbqgjsvipkazsnbq
permalink: /posts/performance-tuning-grails-applications-at-springone-2gx-2011-pkazsnbq/
---
{% raw %}

I just got done with my SpringOne 2GX talk on [Performance Tuning Grails Applications](http://www.springone2gx.com/conference/chicago/2011/10/session?id=23281). When I proposed this talk six months ago there was no material on this subject. Since then a fantastic webinar came out. At the start of the presentation I mentioned this video which I would call the essential resource. And, you can watch it any time.

I *deliberately* cut out of my talk much of the subject matter there, why present the same information in a talk that you can download at any time? Wanting to present new and original material at SpringOne 2GX I rewrote my own talk from scratch. This time focused on the performance tuning of the server side code itself.

I decided to focus on real world performance metrics associated with Groovy Code itself. In the talk I demonstrated four implementations of a service three in Groovy and one in Java. The result is a bit surprising. Restructuring your Groovy code yields order-of-magnitude *greater* performance improvement than simply shedding Groovy in favor of Java.

The lesson to be learned is that the largest expenses your application will pay are in data marshalling, unmarshalling, network transmission time, and database querying. The Groovy itself can be restructured to be more performant without resorting to pure Java. Pure Java is there for us if we really need it but the majority of its benefit is not in that it is Java but in that it removes the most elegant features of *functional programming* and dynamic type systems from our pallet. I ask if the trade-off is really worth the small difference we see when simple Groovy code restructuring can give us five times better performance.

Slides:

Code:

[https://github.com/hartsock/folksonomy](https://github.com/hartsock/folksonomy)

{% endraw %}
