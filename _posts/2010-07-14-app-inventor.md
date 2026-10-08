---
excerpt_separator: ""
layout: "archive-post"
title: "App Inventor"
date: "2010-07-14T08:51:00.004-04:00"
description: "If you haven't heard about it App Inventor is available to educators wanting to teach students about programming. It allows novice programmers to create Android applications using a graphical programming environment simi"
topics: ["software-design"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2010/07/app-inventor.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2010-07-14-app-inventor/"
id: bafyr4ia7dzndcjx5cg3vv5cbgav4aivcmgbcrvkdgsajs3eivn4cv6jiea
permalink: /posts/app-inventor-4cv6jiea/
---
{% raw %}

If you haven't heard about it [App Inventor](http://appinventor.googlelabs.com/about/) is available to educators wanting to teach students about programming. It allows novice programmers to create Android applications using a graphical programming environment similar to [Scratch](http://scratch.mit.edu/).

> The educational perspective that motivates App Inventor holds that programming can be a vehicle for engaging powerful ideas through active learning. As such, it is part of an ongoing movement in computers and education that began with the work of Seymour Papert and the MIT Logo Group in the 1960s.

This is probably one of the more interesting and exciting ways to engage lay-programmers in software creation. It is possible to view the graphical programming language blocks as a *Domain Specific Language* but I'm not clear on whether this is actually the case or not. In particular:

1. the types of statements are limited to available blocks

2. these statement blocks are limited to guided classifications specific to phone app development

3. user and device interactions are limited to the palette

In these ways the "developer" is "on-rails" (in the [video game](http://en.wikipedia.org/wiki/Shoot_'em_up#Definition) sense) limited to a certain type of application. This kind of limitation is beneficial in some cases guiding the developer toward a "good" application. In this case the limitation keeps the developers from heading down paths that require knowledge about the halting problem or multi-threading. For this class of application... that's a good thing.

The [OpenBlock](http://dspace.mit.edu/handle/1721.1/41550) *abstract* certainly *sounds* like a description of a Domain Specific Language (emphasis added):

> Graphical programming systems have been built to lower the threshold to programming for beginners. However, because these systems were **designed to make programming more accessible to novices**, they were developed with narrower intentions for their users and applications. For example, in StarLogo TNG, a graphical block programming environment, **users may create games and simulations, but they cannot use this same system to create programs** that can automate their computer processes, like the text-based scripting system AppleScript. Application developers can create their own programming systems, but doing so can take a significant amount of time to design and implement. This thesis describes an extendable framework called OpenBlocks that enables application developers to build and iterate their own graphical block programming systems by specifying a single XML file. Application developers can **focus more on the design of their systems instead of oil the details of implementation**. The design and implementation of OpenBlocks are described, along with a user study conducted to test its usability and extendability.

On the other hand it could be argued that the graphical programming environment is just an immature environment and is only limited because of how new the tool set is. There is no intrinsic reason a graphic block based programming language couldn't eventually become as rich as a traditional text based language. The real differentiator between a (DSL) Domain Specific Language and a GPL (General Purpose Language) is that the scope of the programming done.

You evolve a DSL either by creating a very rich API that "begins to talk" or you create a deliberately limited subset of your GPL that can be exposed and interpreted using limited API.

So is App Inventor using a new(-ish) Domain Specific Language or a new way to wrap a General Purpose Language?

{% endraw %}
