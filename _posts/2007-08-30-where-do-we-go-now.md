---
excerpt_separator: ""
layout: "archive-post"
title: "Where do we go now?"
date: "2007-08-30T08:44:00.000-04:00"
description: "Last year Google dropped their SOAP API and today they announced that You Tube launched a new API. That got me thinking. This Google-hate-on-SOAP was covered at my NFJS conference, the reason cited was the strong typing "
topics: ["software-design"]
original_labels: ["REST","Software Design","Software Engineering","groovy","java","web2.0"]
original_url: "https://hartsock.blogspot.com/2007/08/where-do-we-go-now.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-08-30-where-do-we-go-now/"
id: bafyr4ia3pvvkdrq7k52leljwe5b3hr2kz2jrguvabl5cpqmrwiin4l5xaq
permalink: /posts/where-do-we-go-now-in4l5xaq/
---
{% raw %}

Last year [Google dropped their SOAP API](http://searchengineland.com/061219-112153.php) and today they announced that [You Tube launched a new API](http://googlesystem.blogspot.com/2007/08/youtube-launches-new-api.html). That got me thinking.

This Google-hate-on-SOAP was covered at my NFJS conference, the reason cited was the strong typing issue in SOAP.

As I've written SOAP services I've found that you get tied to the POJO or DTO object that you write. This is okay if you are a small shop and you control both end points (read "me") but it becomes a problem when you have 3rd parties working with your services. The problem gets pretty bad after a half dozen versions...

What to do? Well, apparently if you ar a multi-billion dollar organisation you do this:

[Google Data API](http://code.google.com/apis/gdata/)

Which is the google answer to the problems in SOAP. Now if you aren't Google you could do a few different things... you could just use the GData libraries... reverse engineering your own back end for them since they don't release the server side code for this stuff... or you could do what was suggested by the ThoughtWorks consultant at NFJS... you _could_ do loosely typed SOAP services.

Huh?

A loosely typed soap service is a soap service that takes an XML document as its only parameter. That means your method names change from

```

@WebMethod

public User getUserByComplex(ComplexObject complex)

```

to

```

@WebMethod

public XmlDocument getUser(XmlDocument xml)

```

which doesn't seem all that profound from the method signature but it does introduce a bit of pain. The pain introduced is in the necessity of implementing a strategy pattern...

[Strategy Pattern](http://www.exciton.cs.rice.edu/JavaResources/DesignPatterns/StrategyPattern.htm)

... in this case you would have a collection of parser or processing engines that would return a result document. The particulars on which result and how we get it are determined by the concrete implementation.

But even this seems a little hackish. But, take a look at this:

[stone mind on rest, groovy, and other things](http://www.stonemind.net/blog/2007/01/26/rest-groovy-behavior-driven-development-and-other-things-changing-how-i-approach-my-work/)

And, I think this sums up where my mind is headed. After spending a lot of time hacking around in the J2EE playing grounds where there are all kinds of horribly stodgy things, conflicting ideas, and just plain crazy ideas... I've come away with a couple of golden nuggets I'll share with you and where I think the technology stack will be in three years.

I don't have an affinity for Python. I don't have a particular love of plain old Java either, but I do have a yen for many tools that Java lovers have. I love their XML handling tools. I love entity manager based persistence engines.

I think Groovy is going to be a major player for shops like mine where we have a need to work with Java and other tool chains too. We need to get things done quickly but we also need to be a bit stodgy at times. Groovy means we can bring in the Java "enterprise" stack without choking on the "enterprise" part.

Grails helps a lot too. It is rapid application development, MVC, Hibernate3, and Spring in a box and you can crank out applications in it once you know what you're doing. The trouble is getting to know what you are doing if you are a PHP programmer. (which we can find... but not JSP programmers)

I think there needs to be a few more Grails books. But I'm adept at figuring things out and I can get by without a book. I'm impressed that Grails has a DWR plugin so that means the best of all possible worlds.

I am looking forward to getting things done with Java, Groovy and Grails in the next couple of months. I think Groovy will take off in the next few years and legitimize the dynamic language on the Java stack. Groovy is just variant enough off of Java to improve development cycle but close enough to Java to keep the barrier to entry low.

{% endraw %}
