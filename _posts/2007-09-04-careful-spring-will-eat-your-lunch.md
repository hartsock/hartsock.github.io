---
excerpt_separator: ""
layout: "archive-post"
title: "Careful, Spring will eat your lunch..."
date: "2007-09-04T20:44:00.001-04:00"
description: "One of the best NFJS talks that I did not attend but should have was the talk by Venkat Subramaniam titled \"OSGI: A Well Kept Secret.\" I discovered this talk on my CD a few days ago and started researching OSGi. OSGi is "
topics: ["software-design"]
original_labels: ["NFJS","java","osgi","spring","talk"]
original_url: "https://hartsock.blogspot.com/2007/09/careful-spring-will-eat-your-lunch.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-09-04-careful-spring-will-eat-your-lunch/"
id: bafyr4ib2rgmloqyshwsjgj244w6z2gqhgdtdvnxsjoitymouah4y77cyoy
permalink: /posts/careful-spring-will-eat-your-lunch-4y77cyoy/
---
{% raw %}

One of the best [NFJS](http://www.pragmaticprogrammer.com/titles/nfjs07/index.html) talks that I *did not attend* but should have was the talk by Venkat Subramaniam titled "OSGI: A Well Kept Secret." I discovered this talk on my CD a few days ago and started researching OSGi.

OSGi is indeed a well kept secret and appears to be worth looking at. Based on Venkat's presentation and research I've done on my own it looks like OSGi could very well be an answer to creating web enabled appliances. These could be hardware that through JNI and OSGi could expose themselves as services... and it appears that this could be the answer to the class loader woe I had a few months back. Not to mention sounding like it's a JINI/JMX killer... which seems to me to be the lion's share of what an Applications server is to most applicaitons.

The big deal here isn't so much OSGi and how good it is... but that Spring is (from what I see in Venkat's notes) poised to leverage OSGi in its 2.1 release. And if Spring can offer Hibernate3 and JINI/JMX replacements... and can offer SOA... and can offer all of this in an industry standard way...

... why are we using those big heavy application servers again? Clustering? It seems to me that Spring is getting ready to eat someone's lunch. Make sure it isn't yours. Red Hat, I'm looking in JBoss' direction... do you really think embeddable ejb3 will save you? Is that rye bread?

{% endraw %}
