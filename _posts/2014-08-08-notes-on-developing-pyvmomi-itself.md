---
excerpt_separator: ""
layout: "archive-post"
title: "Notes on Developing pyVmomi itself."
date: "2014-08-08T12:30:00.000-04:00"
description: "Most of my development work over the last few weeks has been spent finding more efficient ways to develop pyVmomi itself. The problem with networked libraries is that they sit between metal and user code. (image removed,"
topics: ["testing","python","software-design"]
original_labels: ["VCSIM","python 3","pyvmomi","testing","vmworld"]
original_url: "https://hartsock.blogspot.com/2014/08/notes-on-developing-pyvmomi-itself.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-08-08-notes-on-developing-pyvmomi-itself/"
id: bafyr4ieco2wmpesnumwezkeyxplqmqrty6awslok7ejf4kbbpjdhmduw24
permalink: /posts/notes-on-developing-pyvmomi-itself-dhmduw24/
---
{% raw %}

Most of my development work over the last few weeks has been spent finding more efficient ways to develop pyVmomi itself. The problem with networked libraries is that they sit between metal and user code.

 [(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj9ytSrvZIiPYjGLtf8KJTrESYqgLmsEel3UVmXrPjYUQzOVmz6wNFlplbUJQejwTNP4MW7Dy-Kgv1DI2IpNzWSulpViBT9MLEtJMZ_nki4n7OPjs17n1Wr5DpmzbN4CYVrUEqWPg/s1600/Screen+Shot+2014-08-01+at+1.55.52+PM.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj9ytSrvZIiPYjGLtf8KJTrESYqgLmsEel3UVmXrPjYUQzOVmz6wNFlplbUJQejwTNP4MW7Dy-Kgv1DI2IpNzWSulpViBT9MLEtJMZ_nki4n7OPjs17n1Wr5DpmzbN4CYVrUEqWPg/s1600/Screen+Shot+2014-08-01+at+1.55.52+PM.png) As I've pointed out before, virtually all code written in the modern world fits in this model. There's a 'core system' under the code you are writing... that is to say the code you write orchestrates some other system of libraries, then you test the core system by writing tests that anticipate what the 'user' of your library is going to do. This is basically API development, at least in spirit.

####  Everyone does API development (somewhat)

 The interesting thing is that in today's world virtually all development *is* API development if you allow for this loose interpretation of what an API is. The 'user' code may end up being a Selenium test or a unit test. The 'user' party may be yourself or your coworkers ... or they maybe the industry at large. If code gets reused then that code is essentially part of the vocabulary of an API.

 I advocate that you write one test per use-case to describe each of the types of anticipated use of your API. These tests define the surface of the library and you should have no distinction between the library's tests and it's public API. That means anything private or internal should only be tested indirectly if it exists at all.

####  Porting pyVmomi to Python 3

 In the case of porting pyVmomi from python 2.x to python 3.x (as I covered [in](http://hartsock.blogspot.com/2014/06/pyvmomi-and-road-to-python3-part-1.html) [this](http://hartsock.blogspot.com/2014/07/pyvmomi-and-road-to-python3-part-2.html) [3 part post](http://hartsock.blogspot.com/2014/07/pyvmomi-and-road-to-python3-part-3.html)) the problem has been finding a way to rapidly regression test the library on python 2.x and python 3.x interpreters. The technique I settled on was using [fixtures for testing](http://youtu.be/N0x_mxnTs_k).

 To build these fixtures I alluded to what I call *the simulator problem*. In this situation, your back-end is so complex that your stubs and/or mocks become so comparably complex that these fake components approach the complexity of the actual system you are substituting for. At this point, your mock has become a simulator. This is a lot of effort and typically non-unique for any given project. That's why you can find [multiple](http://wiremock.org/getting-started.html) [simulators](https://github.com/jamesdbloom/mockserver) for [webservers](https://github.com/jharlap/mock-http-server) out there. It makes sense to share effort.

 In the vSphere space we have [VCSIM](http://www.datacenterdan.com/blog/15360-vms-in-your-pocket-vcsa-55-vcsim)which can be used to simulate vCenter. In most situations these simulations will be good enough for writing test cases with fixtures. These test cases with fixtures *do not* obviate the need for integration testing, but they do shorten the feedback loop for an individual developer. This shorter feedback loop is critical.

####  Simulating for Success

 I recorded a short video this week on how to setup VCSIM. My video is by no means definitive, but I hope it helps get you started. In the video I show how my setup works. I chose to alias my VCSIM to the fake DNS name 'vcsa' and I setup the user 'my_user' with the password 'my_password'. I make thes substitutions so that real IP, usernames, or passwords, do not leak into unit tests. The resulting setup helps me explore the API exposed on the wire by vCenter in my unit tests. Once I hit the scenario I want to develop on I metaphorically freeze it in amber by[recording a fixture](http://youtu.be/N0x_mxnTs_k) (as recorded in the preceding video).

####  Release Plans

 I plan on releasing officially the next version of pyVmomi (with python 3 support) in the next 2 weeks. The goal was always to release in front of VMworld. That means we'll be flat-out on the release war-path the next few days until we have a solid, stable, and tested release to push out. Fortunately, we are very nearly there. Python 3 support itself would be a big enough win without any additional changes. The ability to record fixtures in tandem with the library is icing on the proverbial cake and it will help us as a community develop pyVmomi more reliably and uniformly.

####  In summary

 The key to successfully navigating the change from python 2.x to python 3.x is testing, testing, and more testing. The *faster* you can get testing feedback (test, change, retest as a feedback loop) the better off you'll be. Waiting for a CI to kick back results is *far too long* to wait. You want all this to happen in a developer's local development environment. The more *automated* and *stand alone* your tests are the broader the total population of possible contributors are. The standalone test means a CI like Travis CI or Jenkins can run your tests without infrastructure. This does not obviate the need for integration testing but it will hopefully let you catch issues earlier.

 If you have a python project on Python 2.x and you want to follow pyVmomi into Python 3, I hope these posts have helped! Now that we have a solid way to test for regression on the library we can start work on feature parity. Future development after the next upcoming release will be focused on building up the library's capabilities.

 More on that next time...

{% endraw %}
