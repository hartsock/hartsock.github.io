---
excerpt_separator: ""
layout: "archive-post"
title: "Drinking from the Grail"
date: "2008-06-11T09:07:00.008-04:00"
description: "The idea behind Grail (not to be confused with Grails) has me excited. In particular the idea had come to me earlier but... I'm not Guillaume so it's not like I'm going to pull off an idea like that. But. Guillaume is Gu"
topics: ["software-design"]
original_labels: ["grails","groovy"]
original_url: "https://hartsock.blogspot.com/2008/06/drinking-from-grail.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-06-11-drinking-from-the-grail/"
id: bafyr4iebks5wltizx74ynfaxua75nmtgwwfrcoepbzsdcglcjv4hry2rru
permalink: /posts/drinking-from-the-grail-4hry2rru/
---
{% raw %}

The idea behind [Grail](http://groovy.codehaus.org/Groovy+realtime+archive+internet+lookup) (not to be confused with Grails) has me excited. In particular the idea had [come to](http://hartsock.blogspot.com/2008/02/grails-appversion-plugin-utopia.html) me earlier but... I'm not Guillaume so it's not like *I'm* going to pull off an idea like that.

But. Guillaume *is* Guillaume. So that means he just might pull off this concept.

What's the big idea? It's Guillaume et al's take on CPAN/RubyGems for Java/Groovy land. The biggest strength that Perl had was CPAN. One of the best features of Ruby is the RubyGems which is ostensibly a take on CPAN for Ruby. There have been several attempts in the past at a CPAN for Java but, sadly, none have taken. The same problems that keep a CPAN for C/C++ from existing keep a CPAN for Java from existing... basically build environments get screwy.

But, Groovy is a special beastie in the world of programming languages. It is truly unique in its place because of how closely it matches Java and how it *can* be run as a script or as a compiled Java class. Jeff Brown gave a nice [presentation](http://trijug.org/downloads/A_Thorough_Introduction_To_Groovy.pdf) at [TriJug](http://trijug.org/) showing how a compiled groovy class' byte code looks just like a Java class' byte code... and that's a nifty trick that takes some people three or four double takes to understand. The compiler is dropping in whole methods for you. Powerful, easy to use, and a little mind-warping. It's probably the number one reason Groovy has had a shallow uptake until now. It has taken time for the community to digest this new paradigm.

It's this interesting hybrid compiled/scripted/synthesis nature of Groovy that could mean a project like Grail could work where other Java archive systems have failed. I suspect that as the project becomes reality we'll find it leaning on Groovy language capabilities more and more under the covers even if it can benefit straight Java projects it will need Groovy in some way. Probably using that [MissingClassException](http://groovy.codehaus.org/api/groovy/lang/MissingClassException.html) feature and some nifty code synthesis tricks... I'm not sure...

Of course I'm just arm-chair-quarter-backing here. It's a rock star like Guillaume who's going to pull this off.

EDIT: And there we have it: [Grape](http://docs.codehaus.org/display/GROOVY/Grapes+and+grab()) ... thanks for pointing that out Andres.

{% endraw %}
