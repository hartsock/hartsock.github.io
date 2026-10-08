---
excerpt_separator: ""
layout: "archive-post"
title: "What every developer should know about testing - part 1"
date: "2014-07-18T19:27:00.001-04:00"
description: "The short version of this blog post is that this week and next week on pyVmomi will be spent on radically improved testing code and processes. This testing process will become part of the commit cycle. And, it's about da"
topics: ["testing","python","software-design"]
original_labels: ["fixtures","python 3","pyvmomi","services","testing","vcrpy"]
original_url: "https://hartsock.blogspot.com/2014/07/what-every-developer-should-know-about.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-07-18-what-every-developer-should-know-about-testing-part-1/"
id: bafyr4iahhuyiwvyqnogyf7xzew5xnk76bo5nhrdgej6avdqhrsnx4tsxt4
permalink: /posts/what-every-developer-should-know-about-testing-part-1-nx4tsxt4/
---
{% raw %}

####

 The short version of this blog post is that this week and next week on pyVmomi will be spent on radically improved testing code and processes. This testing process will become part of the commit cycle. And, it's about damn time.

 Once these measures are in place over the next few days the project will be better able to absorb new commits from interested parties.

####  Overview

 Over the last three weeks I've been working on [pyVmomi's next release](https://github.com/vmware/pyvmomi/issues?milestone=1&state=open). If you've not been following along, it's a python client for a SOAP server and it's a code base dating back to at least [Python 2.3](https://github.com/vmware/pyvmomi/blob/v5.5.0/pyVmomi/SoapAdapter.py#L736)but it has only been in the wild as OpenSource now since [December 2013](https://github.com/vmware/pyvmomi/commit/f6eef2964463e94666ef7111fb93d16ac5bd6ead). The pyVmomi library has a long [internal history](http://www.doublecloud.org/2013/11/hacking-vmware-private-python-api-for-vsphere-with-a-quick-sample/) at VMware and has served many teams well over the years. But, it does have problems.

 The OpenSource version of the library has *no* unit testing shipping with it this makes it hard for interested third parties to contribue. It's time to change that. But, it's a client library for a network service. How do you test such a beast?

 In this post I will cover what unit testing is and what integration testing is and how this impacts the design choices made on libraries. This discussion is directly applicable to the long-term evolution of a library like pyVmomi and is generally applicable to Software Design. I'm bothering to write all this down because I want everyone to be on the same page and I don't particularly want to repeat myself too much. Over the years I expect to be involved with this project I expect to point at this post frequently.

####  The Problem

 Work on pyVmomi has been rather painful. For much of it, I have had to spend vast amounts of time deep in the debugger. Testing on this library involves building a [VCSIM](http://www.virtuallyghetto.com/tag/vcsim) and simulating a vCenter environment. This in turn means the creation of a suitable inventory and potentially setting up a [suitable Fault](https://github.com/vmware/pyvmomi/issues/72)to work with. This is a lot of [yak shaving](http://learnpythonthehardway.org/book/ex46.html#p5) to get to the point you *can even start* considering doing development work.

#####  The root of the *specific* problem

 The problem in specific is that pyVmomi as a library speaks to a server. No other *thing* can completely simulate all the inputs, outputs, and exposed states that such a *thing* achieves *except* the big complex *thing* itself. This problem is routinely solved by developers in this *entire cloud infrastructure space* by spinning up *virtual environments* to create the scenarios they need.

 This is a natural inclination since you have a beautiful hammer, why not nail all the bugs with this beautiful hammer? Virtualization is powerful and has transformed our industry. One day I will be an old man and tell stories of how infrastructure and development worked in the *bad old days* of [Dot-Com Boom](http://en.wikipedia.org/wiki/Dot-com_bubble) but this inclination is an example of the [hype-cycle](http://en.wikipedia.org/wiki/Hype_Cycle) in full detrimental effect.

#####  The problem in *general*

 Because *client* library code** development** starts** at the integration phase** the units that end up defined by the client library programmer are inherently *integrations. *How do you test integrations? With [integration tests](http://stephenwalther.com/archive/2009/04/11/tdd-tests-are-not-unit-tests). But, how do you do *integration testing* when the thing you are testing isn't even *on* your build machine? If it's a server (such as our case) you have to fall back to either a [simulator](https://communities.vmware.com/message/2095872) or you have to stand up [a whole new of your environment just for testing](http://www.thomas-franke.net/vmware-vsphere-5-5-workshop-building-a-test-environment-part-1overview/).

 Unsurprisingly, this is fairly standard practice for every step of *[IaaS](http://en.wikipedia.org/wiki/IaaS#Infrastructure_as_a_service_.28IaaS.29) and [PaaS](http://en.wikipedia.org/wiki/IaaS#Platform_as_a_service_.28PaaS.29)* development. You stand up the universe to author a new function then you retest the whole thing on a fresh copy of the universe. Then, you wash-rinse-repeat for the whole integrated system. It's so *easy*. It's also so *very wrong. *Because code that is [hard to test (or completely untestable) in isolation](https://www.destroyallsoftware.com/blog/2014/test-isolation-is-about-avoiding-mocks)is poorly designed. If you're defending the fact that it's tested, you're missing the point.

 [(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiylpf3a5vy5QPVEMdgkSwDf-FzsqGhoIXQL-C2tHGtVyFfa46EpfA7HGbnJVP8f1j7dZADg3zWEoDdA-aiLyUALZKVRMZy_OZQIkeVARhHA2x92LyEAdDS_hkbJ9PSlA4UaDJJ1Q/s1600/Screen+Shot+2014-07-18+at+4.48.01+PM.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiylpf3a5vy5QPVEMdgkSwDf-FzsqGhoIXQL-C2tHGtVyFfa46EpfA7HGbnJVP8f1j7dZADg3zWEoDdA-aiLyUALZKVRMZy_OZQIkeVARhHA2x92LyEAdDS_hkbJ9PSlA4UaDJJ1Q/s1600/Screen+Shot+2014-07-18+at+4.48.01+PM.png)

 This isn't just a problem with the one library I'm working on now. I've seen this repeatedly in development environments of every kind at huge shops and tiny shops. You build up a pile-o-software that glues systems together and to test it you build a pile-o-infrastructure that you bring to a pile-o-state so you can validate the right calls and responses.

 When you test this way (bringing a whole simulated universe into existence to test your new 'if' statement), invariably something's state gets out of sync and what do you do? You have to test the test environment to validate that you don't have false positives for your failure report, then you have to retest and you re-start the whole process which typically grows into hours. This is, frankly, *an [extremely expensive](http://www.agilemodeling.com/essays/costOfChange.htm) way to develop software.*

 And, for the record I've seen this in JEE, Spring, Grails, Python, Bash, Perl, C, C++, projects on Solaris, Linux, Irix, BSD, and now ESX based environments. This is not a problem unique to *those *crappy developers on *that* crappy environment. This is an intrinsic integration development problem that crops up when you routinely write code that takes big complex systems and makes them work *together*. It's a far too easy trap to fall into and a far too difficult of a pit to climb out of.

####  Unit Testing?

 So the story so-far is that we have a library, maybe that library talks to things "*not of this machine"*. Maybe, it speaks over the wire, talks to other things we can't see or directly control. These are things well outside of anything we could define as our *unit of code*. So if that's our fundamental unit (because what *else* is something like pyVmomi?) How the heck do we test it?

 [(image removed, alt: "http://youtu.be/G2y8Sx4B2Sk", src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi66zA1QFnhRcho8__ucRL6NbEMLKAbF_BtAexRcMj04tnxC4STt938bMKE9Pi9UM85W71ZNn0TIe8wnWBxSETi15q2bmZPPic7pmXyelw1nefIhuYL3tI8TShPYvm77MlYBhnNMg/s1600/Screen+Shot+2014-07-18+at+12.41.29+PM.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi66zA1QFnhRcho8__ucRL6NbEMLKAbF_BtAexRcMj04tnxC4STt938bMKE9Pi9UM85W71ZNn0TIe8wnWBxSETi15q2bmZPPic7pmXyelw1nefIhuYL3tI8TShPYvm77MlYBhnNMg/s1600/Screen+Shot+2014-07-18+at+12.41.29+PM.png)

 The term [unit is deliberately ambiguous](http://blog.cm-dm.com/post/2013/01/11/What-is-a-Software-Unit) in this context. Did we mean class? Did we mean method? The answer is *it depends*. Getting the logical border of the unit is *[hard](http://frankcode.wordpress.com/2014/07/01/tdd-where-did-i-go-wrong/).* It's actually *human intelligence* hard. It's "why AI do not yet write code" hard. Why is it hard? It's hard in the same what the making *beautiful art *is hard it's a fuzzy problem that requires aesthetics.

 The definition of where a unit is, is *hard* and simultaneously *critical *to get right. Define the *[wrong unit](http://vimeo.com/68375232)* and [pay the price](http://david.heinemeierhansson.com/2014/test-induced-design-damage.html). This doesn't mean testing is wrong, it just means [testing is a *programming-hard*](http://www.thoughtworks.com/insights/blog/test-induced-design-damage-fallacy-or-reality) problem. Looking for easy answers here just means you don't know what you're doing.

>  Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.

 — [Brian W. Kernighan](http://genius.cat-v.org/brian-kernighan/) and P. J. Plauger in [*The Elements of Programming Style*](http://www.amazon.com/gp/product/0070342075?ie=UTF8&tag=catv-20&linkCode=as2&camp=1789&creative=390957&creativeASIN=0070342075).

####

####  I mock your Mocks!

 A simple answer to the problem is to [Mock and Stub everything](http://www.mockobjects.com/2007/04/test-smell-everything-is-mocked.html). ([Mock objects are not Stubs](http://martinfowler.com/articles/mocksArentStubs.html#DrivingTdd), and you should know the difference.* Edit: this is a whole topic unto itself and I will cover it separately at a later date.*) The problem is when you work with a sufficiently complex interactions you will be forced to write sufficiently complex mocks and stubs. You will back your way into the *simulator problem* I mentioned before. In our specific case this means essentially re-inventing something like VCSIM except all in Python mock objects and that's absurd.

#####  What are you forging, o' library author?

 Consider also, where is the unit *boundary* when it comes to a client library? The library *absolutely* has a boundary at its public interfaces. If the bit-o-code you just wrote is **private** why did you write it? The private method is not part of the *interface* and so therefore it's not part of the library's unit definition. The unit *in this context* only makes sense as a test-first tested component if it's going to be exposed. By definition a private method isn't exposed so it's an implementation *detail* and we don't test our programs to make sure implementation details work. We don't test if the 'if' statement works. So where is the detail and where is the interface?

 This means your test-first tests should be your *surface. *To develop a library that you intend on providing to people to interact with you should *model* sets of expected interactions. Each interaction should then be codified as a set of calls to the library.

#####  Code as little as possible, test as little as possible

 Tests *are* code. The mark of a good programmer is not how *much* code they write, but how much they can accomplish with how *little*. If you are following the aesthetic of minimalist code, then this attitude should also follow into your tests. Your tests should cover *as many lines* as is needed to *validate* the code and should do this as effectively as possible. Ideally, you should have an efficiency to your tests. **No two tests should cover exactly the same unit.** Covering a unit multiple times is effectively *wasted effort*.

 This is a *much harder* philosophy and practice to follow than the lazy ['cover all the lines'](http://en.wikipedia.org/wiki/Code_coverage) strategy. It requires you to understand the *functional* cases your code can cover. In a rarified ideal world, this might mean you get 100% coverage *anyway* but the percentage isn't what we care about. You can have 100% code coverage and still have horrible comprehension of what your project even *is*.

 Breaking down your tests to cover *all* the methods, even the private ones is a horrible idea. If you cover your private methods you will be tying your *tests that matter* to what (by defining them as private methods) you have decided are *implementation details*. That equals tight coupling; [tight coupling is bad](http://www.codethinked.com/why-do-we-keep-building-tightly-coupled-software).

 How do you test something where it provides very little function other than basic interactions with a service? How do you exercise a library that is arguably *mostly* private and hidden code?

####  Introducing Fixtures

 The concept of a [testing fixture](http://en.wikipedia.org/wiki/Test_fixture) is a very old testing concept. It even predates software as a *thing* and yet I *rarely if ever* see a shop using fixtures. The truly sad thing is that for most development languages *[fixtures are old as the hills](http://pyunit.sourceforge.net/pyunit.html). *So, WHY are so few projects using them?

####  A Specific Solution: vcrpy

 I reviewed several Python fixture libraries this week and was fairly well impressed with [vcrpy](https://pypi.python.org/pypi/vcrpy) for our purposes. The description may mention '*mocking*' but function of the library is to provide you with testing fixtures *at the socket* level. In libraries like pyVmomi we are effectively a skin over a very complex back end web service. This 'skin' nature of ours means that a simple set of library interactions may hide *dozens* of network conversations.

 Manually creating dozens of HTTP interaction mocks to explore a single high-level test can be so painful that you are likely to just not do it. Fortunately tools like vcrpy exist and can [record](https://github.com/kevin1024/vcrpy#record-modes) your HTTP traffic. Now you can do the lazy thing and toy with your client-server a bit, record the on the wire interactions, and then later (and more importantly) *edit* the conversations to represent the larger API cases you want to cover.

 With the recorded HTTP fixtures at our disposal we can now work with the binding in much more predictable and controlled ways.

 More on that [next week](http://hartsock.blogspot.com/2014/07/what-every-developer-should-know-about_25.html)... (or skip to [the end](http://hartsock.blogspot.com/2014/08/what-every-developer-should-know-about.html))

{% endraw %}
