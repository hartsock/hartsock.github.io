---
excerpt_separator: ""
layout: "archive-post"
title: "Grails 1.0-RC2 sprites and stogies"
date: "2007-12-07T08:42:00.000-05:00"
description: "So, I've run on over to check out the Grails 1.0-RC2 release and see if all my favorite bugs were fixed. They were! And there were birds chirruping and rainbows and a unicorn ... and a sprite lit a fresh stogy for me and"
topics: ["software-design"]
original_labels: ["GORM","grails","groovy","jpa"]
original_url: "https://hartsock.blogspot.com/2007/12/grails-10-rc2-sprites-and-stogies.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-12-07-grails-1-0-rc2-sprites-and-stogies/"
id: bafyr4igxqigztllduatlp5mjbrvflmr6zw4sptgha7lf7cekkctypwilgm
permalink: /posts/grails-1-0-rc2-sprites-and-stogies-typwilgm/
---
{% raw %}

So, I've run on over to check out the [Grails 1.0-RC2](http://docs.codehaus.org/display/GRAILS/2007/12/03/Grails+1.0+RC2+Released) release and see if all my favorite bugs were fixed. They were! And there were birds chirruping and rainbows and a unicorn ... and a sprite lit a fresh stogy for me and one for [Bender](http://shawn.hartsock.googlepages.com/bender_cigar.gif). Then I tried to do something a little unusual. Should I? Dare I? Yes.

I tried to do a one-to-many mapping where the "one" side was a Groovy domain class and the many side was a JPA annotated class (You know an EJB3 entity bean). And it failed. Oh, the misery and woe! Well, okay it's not quite that bad.

So the lesson learned children? Don't do drugs, stay in school, use JPA or use GORM, be careful using both. I have filed this bug hoping that next time the stogy is a fine cuban cigar: [GRAILS-1983](http://jira.codehaus.org/browse/GRAILS-1983). Bender likes fine cigars.

(image removed, src was: http://shawn.hartsock.googlepages.com/bender_cigar.gif)

{% endraw %}
