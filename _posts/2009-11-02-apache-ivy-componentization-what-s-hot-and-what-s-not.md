---
excerpt_separator: ""
layout: "archive-post"
title: "Apache Ivy: Componentization? What's hot and what's not?"
date: "2009-11-02T08:54:00.008-05:00"
description: "I'm working with Apache Ivy over the next few weeks. The problems I'm trying to solve are around the testability of a J2EE application and its functional decomposition. I have chosen Ivy after an evaluation period due to"
topics: ["testing","software-design"]
original_labels: ["J2EE","TDD","grails","groovy","java"]
original_url: "https://hartsock.blogspot.com/2009/11/apache-ivy-componentization-whats-hot.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2009-11-02-apache-ivy-componentization-what-s-hot-and-what-s-not/"
id: bafyr4ihqehmxqoys4lqpojlt4dbk6mj5riaxwzj7uostsyaw3pcwohpaxm
permalink: /posts/apache-ivy-componentization-what-s-hot-and-what-s-not-cwohpaxm/
---
{% raw %}

I'm working with [Apache Ivy](http://ant.apache.org/ivy/) over the next few weeks. The problems I'm trying to solve are around the testability of a J2EE application and its functional decomposition. I have chosen Ivy after an evaluation period due to its simplicity and how easy it is to port Ivy into existing Ant build systems.

In the case of the Grails applications I'm working with this problem domain is all rather straight forward. The Grails applications can be functionally decomposed easily along plugins and modules. They were all developed with a Test Driven Design (TDD) mentality and so have a large suite of test automations around the application. NOTE: I have not yet picked a code-coverage tool for this environment, however, so don't ask about code coverage for now okay... suggestions are welcome.

The problem still lies with the J2EE application. I have several components I can identify that have not changed in years since the original system designers bequeathed the code to their heirs. The original system had no automated testing but had ample "test scripts" which were human driven. In some respects I'm shocked at this approach to testing but I can't say it surprises me.

I've been in work environments that literally employed armies of testers. (No really, it was literally the Army... literally armies of testers.) And while there is a place for this if you can afford it ... doesn't it make sense to focus those human-level testers on testing human-level problems? I'm not talking about getting rid of those armies of testers just focusing them on the most interesting problems, saving their collective power for the big issues.

So, here's my hypothesis about how you should decompose an application already long in development, with no automated test harness so it can be better managed. It's a work in progress so please help me knock off the rough edges or if you think I'm daft... let me know.

I'm operating under the theory that the human testing in fact exercises all relevant existing code as it is compiled and bundled up as a part of the whole system. Any components we identify were in that tested whole. Any components we create will be tested under the unified whole. Therefore any *movement* of components creates no net change in the whole. This initially appears pointless but positions us to begin creating automated unit and integration tests around the identified components. The outcome creates no user-visible results initially but is incredibly important since it makes adding features much more certain.

The end goal of the introduction of Ivy is to identify stable framework components and put those components under tests that mimic the current human-based test scripts. The **end** result will be the ability to identify the volatile system components and isolate them for focused testing and design work. This is desirable because you isolate the system's accidental complexity and help keep it away from its intrinsic complexity. You should in the process be able to identify layers of abstraction in the system.

NOTE: An interesting side-effect is that classes designed for use with RMI may not change frequently right now but we have observed that they will "break" backwards compatibility at seemingly random intervals. Since our system is distributed this poses a problem. Decomposing these RMI interfaces and classes into their own Jar (compiling them separately and only on the event that they are changed) means actions that change them thus breaking compatibility between nodes will become very apparent since it will be harder to make the change accidentally.

**Working theory: Componentization of large existing systems**

I'm thinking that (in the large existing system) you want to only decouple packages of classes from the grand unified build that have little change between revisions. You should be able to identify these "stable components" by creating a "heat map" of the repository and watching the rate-of-change in the change control system. The more frequent the changes the "hotter" the class. The "hotter" the class the closer to the other frequently changing components it should be... ostensibly going under a new round of full tests with them. I would only select the coldest classes to be moved into components for control by Ivy.

I will take these carefully selected classes and move them to a separate module to be built and packaged as a single Jar file. These will be placed in the Enterprise Ivy repository for management by Ivy. At build time the project will download these Jar files, just like other Ivy dependencies, from the Enterprise's Ivy repository.

When the unified whole goes under test part of that whole will be the independent Ivy managed Jars. These Jars can be instrumented during our human-driven tests to see how they are exercised by those armies of humans. With that documentation I can then devise unit and integration tests to reenact those human-level tests on the isolated Jars. That means, the next round of the application's life cycle will have a set of automated tests that document how the system operates.

Once we know what the colder classes do we can begin to formulate a framework based on them. And that begins the first steps to identifying and targeting changes to the system to add to what it can do... or designing a replacement... or designing a new feature. Each time behavior changes in the future it will be more *explainable* and thus more *controllable*.

And you start getting there by identifying what's hot and what's not.

Have I gone wrong? Commentary?

{% endraw %}
