---
excerpt_separator: ""
layout: "archive-post"
title: "The Life Cycle of Plugins & Addons in the Enterprise"
date: "2011-11-17T11:59:00.002-05:00"
description: "I'm probably one of the few people in the world that has had the opportunity to work with both Grails and Spring Roo on extended projects. In both environments I've discovered a strategy around code reuse that is a bit d"
topics: ["software-design"]
original_labels: ["addon","enterprise","grails","groovy programming language","plugin","spring roo"]
original_url: "https://hartsock.blogspot.com/2011/11/life-cycle-of-plugins-addons-in.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2011-11-17-the-life-cycle-of-plugins-addons-in-the-enterprise/"
id: bafyr4ifatmuehq3nwv634mzisvb5wi67bcnuvzincn4guxkjxss6vbzgu4
permalink: /posts/the-life-cycle-of-plugins-addons-in-the-enterprise-s6vbzgu4/
---
{% raw %}

I'm probably one of the few people in the world that has had the opportunity to work with both Grails and Spring Roo on extended projects. In both environments I've discovered a strategy around code reuse that is a bit different from what I normally observe in the Enterprises I consult with.

Both Spring Roo and Grails feature a reusable component system. They are similar enough you can use similar strategies in the enterprise with either Spring Roo or Grails. If you are in an enterprise that uses both Grails and Roo (these companies do in fact exist), I recommend that you develop common functionality in Spring POJO then graft a Grails plugin and/or a Spring Roo addon over the top.

In Grails, plugins are powerful sub-applications. A plugin can provide a command line script to the Grails CLI, a library, a library dependency, to a full set of Model View and Controllers or anywhere in between.

In Spring Roo, we term these reusable components *addons* because they do not necessarily contribute runtime functionality to the final system. Spring Roo's philosophy of having *zero* runtime footprint means that you don't have a Roo runtime to hang your hat on. What you do have is a very powerful Command Line Interface (CLI) that you can leverage along with a templating system inside your Roo addon to allow your end-user-developer to generate their own components. Instead of shipping function as you do in Grails, in Roo you provide a mechanism for guiding the developer through generating function.

Whether you are shipping function wholesale, as you do in Grails, or you are providing functional templates as you do in Roo, in an abstract sense I've discovered the same pattern applies to both Roo and Grails. You start with a pilot project for the addon or the plugin and you lift it out of the pilot project allowing it to graduate to a shared enterprise-wide repository.

[(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh9IBREI0f_6pfYptHLdPwdB5Sk2KbdJQr505XDqbc0oYjRvIhOGOOPWVO3qxTwWl51dWi7xt_cjFQ9NHo0FksYMMvszCpEpGs4Ed-bhmtoZ95DR_-twst-rI269V8TjOceRbY3IQ/s400/addon_or_plugin_lifecycle.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh9IBREI0f_6pfYptHLdPwdB5Sk2KbdJQr505XDqbc0oYjRvIhOGOOPWVO3qxTwWl51dWi7xt_cjFQ9NHo0FksYMMvszCpEpGs4Ed-bhmtoZ95DR_-twst-rI269V8TjOceRbY3IQ/s1600/addon_or_plugin_lifecycle.png)

As time goes by, you work on the addon or plugin as a separate project. Each project that uses the addon/plugin will keep track of its own versions of these addons meaning it is important to keep those old revisions available just in case. You will also want to tag each released revision in the event you need to *back port* fixes into old releases should a critical project get stuck on an old version of Roo or Grails for some reason.

The advantages to the enterprise would be a single place to revision control the client components of a Single Sign On system, or a single place to revision control and distribute shared client functions, look and feel components, or other commonly reused system components.

{% endraw %}
