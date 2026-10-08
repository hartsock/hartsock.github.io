---
excerpt_separator: ""
layout: "archive-post"
title: "What every developer should know about testing - part 3"
date: "2014-08-01T17:12:00.001-04:00"
description: "For the pyVmomi folks in a hurry, this video covers the big shift in the project and the code from the video is here. This week I'll finally dig into some detail on fixture-based testing. Summary > If you don't bother re"
topics: ["testing","python","software-design"]
original_labels: ["VCSIM","betamax","fixture","pyvmomi","testing","vcr","vcrpy"]
original_url: "https://hartsock.blogspot.com/2014/08/what-every-developer-should-know-about.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-08-01-what-every-developer-should-know-about-testing-part-3/"
id: bafyr4iadipvltl6anxcv3rk45gcajhonddtlg4c3smcl7e2xg5e2aqjfmq
permalink: /posts/what-every-developer-should-know-about-testing-part-3-e2aqjfmq/
---
{% raw %}

For the [pyVmomi](https://github.com/vmware/pyvmomi) folks in a hurry, [this video](http://youtu.be/n3CP_ObMP0g?list=UUf3z3twWumSOuOFYO2s2O8g) covers the big shift in the project and the code from the video is [here](https://github.com/vmware/pyvmomi/commit/e93a6e0a7ff08e29e1501b632b8d89734a10e946). This week I'll finally dig into some detail on fixture-based testing.

####  Summary

>  If you don't bother reading more from [part 1](http://hartsock.blogspot.com/2014/07/what-every-developer-should-know-about.html) and [part 2](http://hartsock.blogspot.com/2014/07/what-every-developer-should-know-about_25.html) in this series, the one thing to take away is: testing must be *stand alone*, *automated*, and *deterministic *no matter *what* you are writing.

 No matter what you are doing the bulk of your effort should go toward creating ways to write as little code and as few tests as possible *yet still cover the domain.* This is a much harder philosophy to follow than '[cover all the lines](http://en.wikipedia.org/wiki/Code_coverage)' but it is much more robust and meaningful.

 Good code coverage should be the outcome of good testing, not the goal. Because [testing is hard](http://www.thoughtworks.com/insights/blog/test-induced-design-damage-fallacy-or-reality) and getting it wrong is [bad](http://vimeo.com/68375232) you should write tests as sparingly as possible without sacrificing quality*. *Finally, unit boundaries *are API* and you should write tests to reflect the *unit boundary* which is an art in and of itself.

 In [part 1](http://hartsock.blogspot.com/2014/07/what-every-developer-should-know-about.html) I covered why your testing is bad. In [part 2](http://hartsock.blogspot.com/2014/07/what-every-developer-should-know-about_25.html) I covered what are stubs, mocks, and fixture testing. In part 3 we'll get specific and cover how to build a fixture and what it represents as a programming technique.

####  What your code *is* determines what your test *is*.

 Virtually *all* software built today is going to fall into this pattern:

 [(image removed, alt: "core system -> [your code] -> user's code", src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgm3i9ud7Fkk43jdaEIB30bg7RxlSP2aEKTdF0FQes_R7MA3DYOqSkeOuyawtYtT6nHvkryy0u7mSs1TsFQYeKzTghW17g_aERRW2u7ZlZHhQlGMZb3E4tKRmWCMNGTiyDR_5-CUQ/s1600/Screen+Shot+2014-08-01+at+1.55.52+PM.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgm3i9ud7Fkk43jdaEIB30bg7RxlSP2aEKTdF0FQes_R7MA3DYOqSkeOuyawtYtT6nHvkryy0u7mSs1TsFQYeKzTghW17g_aERRW2u7ZlZHhQlGMZb3E4tKRmWCMNGTiyDR_5-CUQ/s1600/Screen+Shot+2014-08-01+at+1.55.52+PM.png) Virtually *everyone* who writes software writes it in a space sandwiched between the software *you use* and the software that *uses you*. Interesting things happen when you move *up stack* far enough that '*user's code*' becomes actual human interaction or you move *down* stack far enough that '*core system*' means *physics*.

 In most projects, however, code that has to perform actual human interaction means code written for a *web app* or some kind of *GUI*. In these special cases you need tools like [Selenium](http://www.seleniumhq.org/) or some other 'bot like [Sikuli](http://www.sikuli.org/) to drive your tests. In that case the far right of my diagram "*User's Code*" is simulated in that test framework. It's ultimately code at the end of the day and the code you write for test is something you create anticipating how that middle category "*your code*" is going to be used.

 The more familiar case, where you are sitting between an end-developer (sometimes yourself later in the project's lifecycle) and a core-system of libraries that constitute the framework, runtime, or operating system *your code* is build on is what most unit test philosophies are build around. This is the world that is most comfortable for [mock and stub](http://martinfowler.com/articles/mocksArentStubs.html#TheDifferenceBetweenMocksAndStubs) based testing. It's the world of TDD and other methodologies. But, what happens when you start getting close to the *metal* when the things we need to mock are on the network or some other physical or transient infrastructure?

 This is the case where I advocate the use of fixtures. Depending on what's on the other side of *your code* the right tool to craft a fixture will differ. I've worked in environments where fixtures had to be physical because we were testing micro-code. Most of the time these days I need a network based fixture.

 I am a big fan of [vcr](https://rubygems.org/gems/vcr), [vcrpy](https://pypi.python.org/pypi/vcrpy), and [betamax](http://freeside.co/betamax/). These are tools for recording HTTP transactions to create a fixture. In generic terms, a testing fixture helps you fast forward a system to get it into the state you need for testing. In our specific purposes the fixtures replace the need for a network and related network servers.

####  Recording transactions

 BTW: The source code for this test is [available on github](https://github.com/vmware/pyvmomi/commit/e93a6e0a7ff08e29e1501b632b8d89734a10e946) now.

 Here's the sample interaction we want to support. It's a simple set of interactions... we login, get a list of objects, loop through them, and put things away.

```
    def test_basic_container_view(self):
        si = connect.SmartConnect(host='vcsa',
                                  user='my_user',
                                  pwd='my_password')
        atexit.register(connect.Disconnect, si)

        content = si.RetrieveContent()

        datacenter_object_view = content.viewManager.CreateContainerView(
            content.rootFolder, [vim.Datacenter], True)

        for datacenter in datacenter_object_view.view:
            datastores = datacenter.datastore
            pprint(datastores)

        datacenter_object_view.Destroy()

```

 As written this test goes over the network *nine* times. Without a tool like [vcrpy](https://pypi.python.org/pypi/vcrpy) running this test in any automated way would require us to use a whole pile of cloud infrastructure or at least a smartly built simulator. This means doing special setup work to handle edge cases like faults, or large inventories. It requires the construction of an entire mockup of the production scenario we want to test. This could be automated in itself; but then, if the tool to perform such automations is literally what we're writing; how do we develop and test those automations? That's an extremely time consuming and wasteful [yak shaving](http://www.markhneedham.com/blog/2008/10/25/dont-shave-the-yak-ask-why-are-we-doing-this/) exercise.

 Fortunately, in our project a simple one liner can help us remove the need to always have a service or simulator running somewhere for every test.

```
    @vcr.use_cassette('basic_container_view.yaml',
                      cassette_library_dir=fixtures_path, record_mode='once')

```

 This decorator allows us to record the observed transactions into a [YAML file](https://github.com/vmware/pyvmomi/blob/e93a6e0a7ff08e29e1501b632b8d89734a10e946/tests/fixtures/basic_container_view.yaml) for later consumption. We can't completely remove the need for a simulator or service, but we can remove the need for such beasts during test.

####  Modifying Recordings

 Once you have the capacity to record network events into a fixture you can [tamper](https://github.com/hartsock/pyvmomi/blob/87bb7080649932328b132201ead87f0760b8b153/tests/fixtures/test_unknown_fault.yaml#L261) with these recordings to produce new and unique scenarios that are otherwise hard to reproduce. That means *your code* can rapidly iterate through development cycles for situations that are really hard to get the *core-system* code on that remote server into.

 You "shave the yak" once to get a VCSIM to a state that represents the scenario that you want. Then you script your interactions anticipating a use case your end-developer would want to exercise. Finally, using [vcrpy](https://pypi.python.org/pypi/vcrpy) decorators, you record the HTTP interactions and preserve them so that you can reproduce the use-case in an automated environment.

 Once you have that fixture you can develop, regression test, and refactor *fearlessly*. You can synthesize new fixtures approximating use cases you might never be able to reliably achieve. And that's how you take something very chaotic an turn it into something deterministic.

 This is of course predicated on the idea that you have a [VCSIM](http://www.datacenterdan.com/blog/15360-vms-in-your-pocket-vcsa-55-vcsim)setup for testing, more on that next time...

{% endraw %}
