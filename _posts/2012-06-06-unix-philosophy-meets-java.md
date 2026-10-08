---
excerpt_separator: ""
layout: "archive-post"
title: "Unix Philosophy meets Java"
date: "2012-06-06T00:00:00.000-04:00"
description: "In all the literature on computing there's one quote that I find the most profound and illuminating. In three sentences it successfully encodes what I intuit must be a fundamental law of system design. It is the first of"
topics: ["software-design","philosophy"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2012/06/unix-philosophy-meets-java.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2012-06-06-unix-philosophy-meets-java/"
id: bafyr4id7gdyneitzbjih4yyrqiqov3vu32wh24rjqnctulglnym25fzak4
permalink: /posts/unix-philosophy-meets-java-m25fzak4/
---
{% raw %}

In all the literature on computing there's one quote that I find the most profound and illuminating. In three sentences it successfully encodes what I intuit must be a fundamental law of system design. It is the first of my guiding lights when I design anything.

 From [Wikipedia](http://en.wikipedia.org/wiki/Unix_philosophy#McIlroy:_A_Quarter_Century_of_Unix):

 *[Doug McIlroy](http://en.wikipedia.org/wiki/Douglas_McIlroy), the inventor of [Unix pipes](http://en.wikipedia.org/wiki/Pipeline_(Unix)) and one of the founders of the Unix tradition, summarized the philosophy as follows:[[1]](http://en.wikipedia.org/wiki/Unix_philosophy#cite_note-0)*

>

>  *This is the Unix philosophy: Write [programs](http://en.wikipedia.org/wiki/Computer_program) that do one thing and do it well. Write programs to work together. Write programs to handle [text streams](http://en.wikipedia.org/wiki/Standard_streams), because that is a universal interface.*

 And, if you take this philosophy and apply it to Java... you get Separation of Concerns, Dependency Injection, and Interfaces with simple Data Transport Objects.

 In Java, you would make one class do one job. When you need two jobs done, we know inheritance eventually makes a mess so we do composition. The best way to handle that composition is to make a generic interface that has multiple implementations and inject the correct implementation when needed. Then we can bind together loosely coupled services to compose the right application or plumb together a new application later.

 The Dependency Injection model in Spring mirrors the pipes in Unix. Classes are supposed to do one job. Classes are ideally designed to be composited together to do a job. This part requires a little stretching: the use of interfaces with separate implementations that are wired after compile time is a mirror of using standard input and standard output.

Extend this analogy to the network and it is easy to see that the web itself is an extension of this core unix philosophy written large. Programs are connected through standard protocol and work together to produce the intended result. Often these protocols are nothing but the standard text streams that under-gird the unix pipe. In one sense the entire dot-com boom and subsequent internet related advances are all built on these three simple ideas that Doug McIlroy so clearly illustrates.

 History proves that if you do observe these rules your long-term prospects are much more favorable than those who do not. Consider the internal design of the systems and what happened to them over time. For example Apple pre and post OS X shift or Windows pre and post VAX infusion.

 Now consider the design of Android the OS. Few other OS have so completely embraced this design philosophy and been so completely designed around the web. The [intent](http://developer.android.com/reference/android/content/Intent.html) and subsequent OS design is highly instructive.

 Now, what will history prove about this new intersection of the unix philosophy and Java? Time will tell.

 EDIT: I added a link to the Android intent java documentation. I felt it would be clearer that I meant the *intent java interface* not merely the english word "intent" ... this was intended as an aid to casual readers.

{% endraw %}
