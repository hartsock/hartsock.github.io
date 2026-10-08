---
excerpt_separator: ""
layout: "archive-post"
title: "A Grails WebFlow observation"
date: "2008-05-19T21:07:00.005-04:00"
description: "Objects created and persisted either explicitly or implicitly to the flow context must implement the java.io.Serializable interface. But, closures can not be serialized. That means that any class that uses a closure such"
topics: ["software-design"]
original_labels: ["grails","groovy","webflow"]
original_url: "https://hartsock.blogspot.com/2008/05/grails-webflow-observation.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-05-19-a-grails-webflow-observation/"
id: bafyr4ihtmmeqblthrzzz66xya2tw6dta5hvmddw4cvbiwicgqqrmqq3sw4
permalink: /posts/a-grails-webflow-observation-rmqq3sw4/
---
{% raw %}

Objects created and persisted either explicitly or implicitly to the flow context must implement the [java.io.Serializable](http://java.sun.com/developer/technicalArticles/Programming/serialization/) interface. But, closures can not be serialized. That means that any class that uses a closure such as [constraints](http://grails.codehaus.org/Validation) will probably have to do custom serialization. This is very easy to implement in Groovy since all objects have a properties map and maps can serialize. Just be certain to pick the right keys to serialize.

I've noticed that even objects created by the [onChange](http://docs.codehaus.org/display/GRAILS/Grails+Audit+Logging+Plugin) event handler may end up serialized if the change happens inside an action node of a [WebFlow](http://grails.codehaus.org/WebFlow).

EDIT: I stand corrected. It is much easier to mark the closures with *transient* instead of just *def*. This *just works* and requires no further thinking. I should probably put this in an example somewhere.

{% endraw %}
