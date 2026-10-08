---
excerpt_separator: ""
layout: "archive-post"
title: "Grails XFire Plugin"
date: "2007-11-07T23:36:00.000-05:00"
description: "Had a little trouble with the XFire Plugin for Grails. I found this thread of posts on nabble which clears things up. I attached the thread to the appropriate bug. Other than that I noticed that java.util.Date Is turned "
topics: ["software-design"]
original_labels: ["DTO","XFire","date","grails","groovy","jsr181","plugin","soap"]
original_url: "https://hartsock.blogspot.com/2007/11/grails-xfire-plugin.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-11-07-grails-xfire-plugin/"
id: bafyr4idpgttbegfjgqsraulnftloz37jaoxzgyrmtouy36xcdwvziypu3e
permalink: /posts/grails-xfire-plugin-vziypu3e/
---
{% raw %}

Had a little trouble with the [XFire Plugin](http://grails.org/XFire+Plugin) for Grails. I found this thread of posts on

[nabble](http://www.nabble.com/Should-xfire-0.6.1-work-with-grails-1.0-RC1-SNAPSHOT-tf4569592.html) which clears things up. I attached the thread to the appropriate [bug](http://jira.codehaus.org/browse/GRAILS-1732). Other than that I noticed that java.util.Date Is turned into a string. To fix this I created DTO (Data Transport Object) with XMLGregorianCalendar instead. This works find for DTO but could cause a minor headache if I have to expose domain classes directly through a SOAP service. Other than that the XFire plugin handles everything I need it to so far.

XFire is apparently on the verge of getting replaced with [CXF](http://incubator.apache.org/cxf/) which is an Apache incubator project. I was able to work through an CXF service myself using the JSR-181 annotations (that's the Java Web Services meta data specification). Configuring CXF inside a Spring container was the usual Spring XML-er-ific mess that you run into when doing Spring work without a tool kit.

Integrating the CXF Spring config with Grails worked up until I hit a class incompatability between Groovy 1.1 and CXF somewhere down in the XML parsers. I caught just enough to see that it was a class version problem around the DATETIME type where Groovy had one version and CXF had another. That was enough for me to decide to stick with the XFire plugin. I don't want to be in the business of building my own versions of anything that I didn't write.

I figure if the XFire plugin is that simple to set up then it will probably be just that simple to "port" my services to CXF later. Grails does a pretty good job of letting you switch between DWR, Prototype, and YUI when you are working in Ajax... so why not have multiple SOAP plugins that swap out just as easily?

{% endraw %}
