---
excerpt_separator: ""
layout: "archive-post"
title: "What every developer should know about testing - part 2"
date: "2014-07-25T17:50:00.001-04:00"
description: "The short version of this post: pyVmomi contributions from this point forward will be required to follow this pattern. They include a fixture based unit test build around vcrpy. > Note: While these posts are python speci"
topics: ["testing","python"]
original_labels: ["VCSIM","fixtures","pyvmomi","testing","vcrpy"]
original_url: "https://hartsock.blogspot.com/2014/07/what-every-developer-should-know-about_25.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-07-25-what-every-developer-should-know-about-testing-part-2/"
id: bafyr4ifh667wcgtfxgqwe3crkbinvgygvnxpbsp3s7u3o4xdma3a4rfayu
permalink: /posts/what-every-developer-should-know-about-testing-part-2-3a4rfayu/
---
{% raw %}

#####  The short version of this post:

 [pyVmomi](https://github.com/vmware/pyvmomi) contributions from this point forward will be required to follow [this pattern.](https://github.com/vmware/pyvmomi/commit/19e5029d14677c639175ca0806aa718c1f8c9cc1) They include a fixture based unit test build around [vcrpy](https://pypi.python.org/pypi/vcrpy).

>  Note: While these posts are python specific, the techniques I advocate are not. If you happen to be working in a JVM language, then I recommend [Betamax](https://github.com/robfletcher/betamax). And, if you happen to be on Ruby, then use [vcr](https://github.com/vcr/vcr). The point of any unit test is that it should be *stand alone*, *automated*, and deterministic. These posts discuss how to create deterministic and automated tests in situations where people often argue it's *impossible* to create such tests.

####  Overview

 [Last week](http://hartsock.blogspot.com/2014/07/what-every-developer-should-know-about.html) I covered some basics about unit testing. What is a unit? What do you need to test? What don't you? This week we'll dive a bit deeper and cover why a [Stub](http://en.wikipedia.org/wiki/Test_stub), a [Mock](http://en.wikipedia.org/wiki/Mock_object), or any other trick may not solve your problems and how we create a unit test where there's arguably no '[unit](http://bulldozer00.com/2009/11/06/cscis-cscs-csus/)' only a [client](http://en.wikipedia.org/wiki/Client_(computing)).

 In this post we'll briefly recap what a unit test is. Then we'll cover stubs and mocks and why they are useful but aren't sufficient. Finally I'll cover fixtures.

 If I'm in the mood, I may cover [property based testing](http://www.slideshare.net/FranklinChen/handout-23548866) at some future date ... but that's an intermediate to advanced topic in my book.

#####  Recap: What a Unit Test is, what it isn't

 The [dividing line between units](http://bulldozer00.com/2009/11/06/cscis-cscs-csus/) is 'human hard' because it's not just 'a method is a unit' ... a method very frequently *is* a unit but then so is a *class* and there can be hidden classes and methods. I'm advocating a somewhat controversial position based on the [back-lash to TDD](http://vimeo.com/68375232) you'll find around the [blogosphere](http://martinfowler.com/articles/is-tdd-dead/) recently. My position in a nutshell is that tests are best defined at 'unit boundaries' which are necessarily *abstract* borders between software units (and units themselves are a [term of art](http://www.merriam-webster.com/dictionary/term%20of%20art)).

####  What is a good Unit Test?

 There is some debate over what makes a good unit test. In general, your tests should be [stand alone](http://en.wikipedia.org/wiki/Standalone_software), [automated](http://en.wikipedia.org/wiki/Automated_testing), and [deterministic](http://en.wikipedia.org/wiki/Deterministic_automaton) (and those three words in this context have very precise meanings). This is simple enough when a unit is simple. For example, the canonical [roman numeral example](http://www.diveintopython3.net/unit-testing.html) is easy enough to unit test.

 In the [roman numeral example](http://www.diveintopython3.net/examples/romantest1.py) the unit is easily isolated since the *concept* of a roman numeral does not require the introduction of additional units. This is the most basic tier of unit testing that every developer must learn.

 The next set of techniques are to use Fakes and Stubs, and then later maybe Mocks, and these work as long as system interactions remain relatively simple. But, these are not sufficient tools for your tool box. You have to learn *one more trick* before you have all the basic tools you'll need for modern development. You need to know how to build fixtures and the resources that go with them.

#####  When to Stub

 If your programming language supports interfaces and dependency injection then [creating stubs](http://spring.io/blog/2007/01/15/unit-testing-with-stubs-and-mocks/) will feel natural to you. If your unit uses several other objects by [composition](http://learnpythonthehardway.org/book/ex44.html) to accomplish it's work, one of the simplest things to do is write a fake version of the objects your unit under test uses.

 That means you have to create an object that implements all the methods of the dependent class that your particular test unit will use. The stub will have to cover as many calls as your unit of code uses. If you call on method 'foo' you need to write something that reasonably reproduces the expected output of 'foo'. This is fine when the call number is small, but it can quickly get out of hand. Take for example that someone felt compelled to write an entire [fake server](https://github.com/kristofa/mock-http-server) in Java.

 The fake HTTP server author calls their product a mock server but this is in fact a stub. You have no facility to assert call order, parameters, or the absence of calls.

#####  When to Mock

 A [mock is not a stub](http://martinfowler.com/articles/mocksArentStubs.html#TheDifferenceBetweenMocksAndStubs). With a stub you have to provide a stub implementation of all possible call paths and have no facility to later go back and make assertions on call order. If you do, you probably wrote it yourself... and you've probably neglected what your day job really is.

 A mock is about coding for expected calls and call order. The problem with doing this with your stub is that you will have to either be organically *grow* your stub into a mock to get this information (and that's a whole new project worth of complexity) or you'll have to invent a whole system of semaphores and messages to watch for these details.

 With mocks, you can assert how a method was called; you can make assessments about call order; you can also assert that there is an absence of calls. This is all very important for you to be able to do in your unit tests. With these tools you can continue to assert that no matter how you evolve your intervening code the *units* code continues to use it's underlying API within acceptable parameters.

 A concrete example is if you are *consuming* pyVmomi or rbVmomi as your client library bindings, you can mock the calls to the client binding library. If you observe that vim.VirtualMachine's PowerOff method is still called properly even after you refactor your own library then there's no need for a VCSIM to run your tests at the unit testing phase.

 Too much of this, however, and you [can't make assertions](http://googletesting.blogspot.com/2013/05/testing-on-toilet-dont-overuse-mocks.html) about the code's behavior outside of test. Not to mention that creating mocks and stubs are programming efforts of their own. This can lead to wonderful code coverage numbers, tightly coupled designs, and a frustrating body of work.

####  Enter the Network

 What if you're writing a client library? On the [pyVmomi project](https://github.com/vmware/pyvmomi), that's what we're doing. A highly efficient and specifically tailored API binding in Python for vSphere. How can we unit test something that's intended for use with a networked appliance?

####  Fixtures

 In the case of building tests for networked software, the [simulator problem](https://github.com/kristofa/mock-http-server) is a common problem. In order to deal with this it's vital to have *some tool* that can record your interactions then play them back. The ability to deliberately *tamper* with the interaction recording is vital. There are bound to be states that the complex server or simulator on the other end can't reach.

 If you only use a simulator for your tests, then they are by definition not stand-alone. You have to exit the testing context and enter an administration context to build an orchestrate the situation you want to test. This can be costly and it can be a problem very similar to the simulator problem. You will inevitably have to build a complex environment that will harm the determinism of your tests.

 Next week, I'll get specific and cover how to build a test with a recording, we'll have to get into details and I'll cover how I use [VCSIM](http://www.virtuallyghetto.com/2012/12/vcenter-server-simulator.html) to create the basis for complex situations I can't even create in my environment.

 More on that [next time](http://hartsock.blogspot.com/2014/08/what-every-developer-should-know-about.html)...

{% endraw %}
