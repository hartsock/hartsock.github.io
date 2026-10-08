---
excerpt_separator: ""
layout: "archive-post"
title: "Configuration Best Practice"
date: "2009-09-05T14:48:00.003-04:00"
description: "So rattling around in my head is this idea of configuration. When should you configure? What should you configure? How much should you configure? As a rule of thumb I need to perform a software task in three relevant con"
topics: ["software-design"]
original_labels: ["administration","advice","configuration","design","software"]
original_url: "https://hartsock.blogspot.com/2009/09/configuration-best-practice.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2009-09-05-configuration-best-practice/"
id: bafyr4iguao77vvql4fz7unagxvvoag2bdzympqjj3idk4spemo7dcphi6u
permalink: /posts/configuration-best-practice-7dcphi6u/
---
{% raw %}

So rattling around in my head is this idea of configuration. When should you configure? What should you configure? How much should you configure?

As a rule of thumb I need to perform a software task in three relevant contexts to spot the important patterns for the system. That is to say I need three unique implementations of a system to spot how to generically implement a *framework* around the problem domain. The same is true for configuration.

Until I see three distinct scenarios where a system will be used I usually can't rightly discern what is going to need to be configurable and what isn't. I can usually make a good guess as to what will be needed by the time I'm working on two implementations ... but it really takes the third one for things to gel.

So if I were to number from best to worst case for configurations... I would put them in this order:

1. configuration by convention (as we see in Grails)

2. dynamic configuration by environment

3. explicit configuration by administrator

Once you figure out that part of a system is going to *actually need* to flex then you should refactor for just enough modularity to reach the changes you need see. When doing this work the best thing to do is to make your system self configure by convention. This way we provide the necessary configuration without increasing the load on the end developer or administrator.

Next best we can do configuration by picking up things from our environment and working out the values we might otherwise need configured. This allows the administrator of our application to merely move the application code base to the correct place in the "cloud" or the correct server.

The last thing we want is for the administrator to have to open a dialog and enter data about the environment for your system to use at run-time. This can be an error prone process and it is possible that the environmental factors will change forcing the administrator to always be conscious of additional variables in the system.

In the perfect world our software systems would have enough intelligence to ask the environment for what they need and the environment would be intelligent enough to compute those dependencies as they occurred.

Of course the real world is a long way from perfect.

{% endraw %}
