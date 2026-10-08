---
excerpt_separator: ""
layout: "archive-post"
title: "@annotations"
date: "2007-01-03T09:03:00.000-05:00"
description: "In case you've been under a rock... Java 5 now has a feature called the annotation and it allows you to attach meta-data to a class or a method. This isn't too terribly exciting unless you write a class that can read the"
topics: ["software-design"]
original_labels: ["Annotations","Java5","POJO"]
original_url: "https://hartsock.blogspot.com/2007/01/annotations.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-01-03-annotations/"
id: bafyr4igcbu2x7knjp3b77jlt5vyhndbnl2ljwmzylo5q4gwk5jhg2vbqi4
permalink: /posts/annotations-hg2vbqi4/
---
{% raw %}

In case you've been under a rock... Java 5 now has a feature called the [annotation](http://del.icio.us/hartsock/annotations) and it allows you to attach meta-data to a class or a method. This isn't too terribly exciting unless you write a class that can read these annotations. Official docs [here](http://java.sun.com/j2se/1.5.0/docs/guide/language/annotations.html). So what I've found you end up doing is writing a proxy or mediator to handle how the annotated classes are used, what the annotations mean, and how the classes interact.

I'm using [DWR](http://getahead.ltd.uk/dwr) at the moment and when we write a POJO and annotate it with the [right annotations](http://getahead.ltd.uk/dwr/server/annotations) we get a class that DWR can use to create JSON messages. DWR searches a registered POJO for the "@RemoteMethod" annotations and registers those methods for remote invocation. This is very similar to how the [JBossWS](http://wiki.jboss.org/wiki/Wiki.jsp?page=JBWS181HelloWorld) system works.

In both DWR and JBWS we are using annotations on POJOs to mark the class and method for consumption by a larger framework that will use the method we wrote to form the unique functional core of an application. We can tell the framework some things about how to consume the method and class using the annotation... and we can use the same POJO in multiple frameworks... in theory.

In theory the same annotations could mean different things to different frameworks. This way a POJO could be fed through a testing tool and then fed to a Web Services framework. The key to using the annotations is that the consuming tool, library, or framework sits across concerns from the POJO.

You POJO should be concerned about one thing, such as how to build an item summary. Your POJO then plugs into the framework. The result is that you program what is unique about your application and forget about everything else.

In designing tools, libraries, or frameworks to consume annotations, consider what is always the same. Write your framework to do those things. Then you register POJO into your framework to do the unique tasks for an application.

I can see a need for about a half dozen annotations frameworks from where I sit. And I can see how a code by convention system could be obsoleted by the astute use of annotations. If the framework is built intelligently, Java 5 could become the fastest and simplest way to build applications because so many concerns could be lifted from the application programmer's shoulders by use of Annotations and well-designed AOP.

{% endraw %}
