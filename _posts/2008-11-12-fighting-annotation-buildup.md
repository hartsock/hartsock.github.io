---
excerpt_separator: ""
layout: "archive-post"
title: "Fighting Annotation buildup"
date: "2008-11-12T06:09:00.004-05:00"
description: "It was called XML hell. More precisely XML configuration hell. You would spend hours and days fighting with XML configurations that grew in size and complexity until they became a nightmare. They call it Annotation hell."
topics: ["software-design"]
original_labels: ["Annotations","grails","groovy","java"]
original_url: "https://hartsock.blogspot.com/2008/11/fighting-annotation-buildup.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-11-12-fighting-annotation-buildup/"
id: bafyr4iagtuw74wasklyib2yuttrmthwgau3sz2hvcokip7nvvnacuba7aa
permalink: /posts/fighting-annotation-buildup-acuba7aa/
---
{% raw %}

It was called XML hell. More precisely XML configuration hell. You would spend hours and days fighting with XML configurations that grew in size and complexity until they became a nightmare.

They call it Annotation hell. It is what happens when you get a the same problems as you had in XML hell manifesting in Annotations. The earliest mention of Annotation hell I can find is from [2004](http://radio.weblogs.com/0112098/2004/05/14.html#a480) in [James Strachan](http://macstrac.blogspot.com/)'s [old weblog](http://radio.weblogs.com/0112098/) where he uses the term "annotation overkill" but is wrongly quoted in other blogs as saying "annotation hell".

There is an Annotation hell. And I've seen it. A good example is here in Eric Redmond's blog [Annotation Hell](http://www.coderoshi.com/2008/09/annotation-hell.html) where he posts a method with 10 annotations on one method operating in at least *four* contexts.

I've seen this before... although admittedly not *nearly* as bad... and I have called the same thing "Annotation Buildup" it's the cruft you get on a class that you are annotating for too many simultaneous execution contexts. It is a symptom of a design philosophy flaw.

The annotation centric design directly reverses the problem of XML hell by merging everything back into the class. This is good. It centralizes information related to the class into one place. The flaw is that all the configuration piles up in the same places and it isn't clear how the annotations make sense.

[Grails](http://grails.org/) solves this problem using Convention over Configuration (CoC) and a [GORM Mapping DSL](http://grails.org/GORM+-+Mapping+DSL) the effect is a much cleaner looking class. GORM can use [the JPA](http://hartsock.blogspot.com/2007/11/groovy-grails-and-jpa.html) if configured properly. And this isn't a bad combination to work in but the real advantage is being able to *both* centralize configurations for a class and also group them by context.

Convention keeps configuration hell at bay whether it is created by XML or annotations. Allowing a configuration DSL allows you to keep the flexibility of configurations without the XML and by placing the DSL inside the class definition you can keep everything related to a class together. The DSL also have the advantage of keeping related configurations grouped together so that you don't have to stare at a pile of annotations that don't relate to each other.

CoC in combination with in class DSL for configuration can keep annotation buildup at bay and keep away XML and annotation hell.

{% endraw %}
