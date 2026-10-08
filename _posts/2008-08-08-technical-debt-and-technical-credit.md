---
excerpt_separator: ""
layout: "archive-post"
title: "Technical Debt and Technical Credit"
date: "2008-08-08T09:36:00.009-04:00"
description: "The Martin Fowler entry titled Technical Debt has probably been the single most profound article I've read about software design in the last five years. It honestly describes why quick and dirty is a necessary evil and w"
topics: ["software-design","philosophy"]
original_labels: ["fowler","grails","groovy","idea","philosophy","technical debt","thought"]
original_url: "https://hartsock.blogspot.com/2008/08/technical-debt-and-technical-credit.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-08-08-technical-debt-and-technical-credit/"
id: bafyr4iai7wythsi33u6swc5uni74l6mksdgbepshbbuotvuox6pcoilkeq
permalink: /posts/technical-debt-and-technical-credit-pcoilkeq/
---
{% raw %}

The Martin Fowler entry titled [Technical Debt](http://www.martinfowler.com/bliki/TechnicalDebt.html) has probably been the single most profound article I've read about software design in the last five years. It honestly describes why quick and dirty is a necessary evil and why shops need to build in development cycles to essentially "fix" working software. The idea of "paying down" technical debt is completely lost on non-programmers because they can't see the result directly. Instead what they see is the result of not paying technical debt.

I've had the misfortune of having this conversation:

Client: How long will this take?

Me: We've estimated that it will take about three weeks pushing just about everything else out of this development cycle.

Client: That's crazy! At my last job they could do the same thing in three days, that task should be trivial! Why will it take you so long?

Me: The legacy system design which we have to account for will never allow those changes without a significant amount of work. I'm sorry. Your other shop must have spent time upfront in preparation for such changes so that you didn't see the cost when you asked for them.

Sadly, the client can hardly help feeling that I'm incompetent. I've been set up for failure by a history of delivering too rapidly. It's something Bruce Webster calls the [Dangers of a Successful IT project](http://brucefwebster.com/2008/08/07/the-dangers-of-a-successful-it-project/) and I've had the problem in spades.

Obviously, I am working in a different legacy environment than the client's other shop was. To her she only sees working with me and her browser, to me I see working with her, the browser, and the old crufty code she just asked to have changed that has SQL in-lined in JSP and PHP, no CSS, a denormalized database, and cut-and-paste based templates (no templates at all). So changing somethings turn into a repetitive batch-job of a task and require full regression testing to make sure we didn't forget a page.

I'm working in a Technical Debt scenario and I've just been asked to do something that requires I *pay back* a lot of the technical debt in the system. In the scenario I'm thinking of the company had incurred over eight years of technical debt it had never bothered to try and pay back. The interest payments were huge by the time my "simple change" was asked for.

But, I've observed that are situations of both Technical Debt and *Technical Credit*. A Technical Credit is a credit that you get for working with tools that are *ready made* for agility. The [Grails Framework](http://grails.org) for example is perfectly positioned to give you a major Technical Credit. Ready made plugins such as the [Searchable](http://grails.org/Searchable+Plugin) plugin and the [JFreeChart](http://www.grails.org/JFreeChart+Eastwood+Plugin) plugin are examples of quick to get and use tools that will make you seem like a technical guru even if you aren't.

This all applies to clients at the same company as you or clients at different companies. Anyone who is non-technical and has a stake in the project needs to be seen as a client of your work. And you, dear developer, need to cultivate a relationship of trust with them.

I think the analogies of Technical Credit and Technical Debt together can make strong cases for doing the unglamorous work that needs to be done... or adopting things like Open Source tools in the Enterprise. The developers on a project need to remember to sell this idea and tie-in the incidents of debt making and credit making to project time-lines to management. That is a difficult but important task that will build trust between you and your clients.

{% endraw %}
