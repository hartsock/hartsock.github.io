---
excerpt_separator: ""
layout: "archive-post"
title: "Velocity versus JSP"
date: "2006-09-06T21:15:00.000-04:00"
description: "I've spent the last few weeks in a new larval stage again. This time I've the been studying the alphabet soup that surrounds web portlets and the JSR168 spec. I'm not talking about learning to make portlets... that's eas"
topics: ["personal-notes"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2006/09/velocity-versus-jsp.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2006-09-06-velocity-versus-jsp/"
id: bafyr4icihxgvix4yufmiq5n6j77ctv2jbdsoxyexcxcy4rml6lfv7qpy2m
permalink: /posts/velocity-versus-jsp-fv7qpy2m/
---
{% raw %}

I've spent the last few weeks in a new [larval stage](http://catb.org/%7Eesr/jargon/html/L/larval-stage.html) again. This time I've the been studying the alphabet soup that surrounds web portlets and the [JSR168](http://developers.sun.com/prodtech/portalserver/reference/techart/jsr168/) spec. I'm not talking about learning to make portlets... that's easy... I'm talking about the best way to make portlets.

The fastest way to get working with portlets is to start by creating [JSP](http://java.sun.com/products/jsp/)pages and balling them up into portlets. You end up with function fast. But, if you plan on doing that, why not just go with a [PHP](http://www.php.net/) based site? About all that JSP will get you in this case would be some props at cocktail parties where you can get an easy 'wow' by tossing around the word [Java](http://java.sun.com/) a few times.

We want [MVC](http://en.wikipedia.org/wiki/Model-view-controller) and we want to enforce it. So I've decided on [velocity](http://jakarta.apache.org/velocity/docs/developer-guide.html)for page design. With velocity I can give page designers the ability to work with active page content and remove the possibility that some slack-jaw might muck up my code-base by slapping in some ill concieved [SQL](http://en.wikipedia.org/wiki/SQL). It also means that view policy is utterly divorced from controller mechanisms.

{% endraw %}
