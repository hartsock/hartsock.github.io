---
excerpt_separator: ""
layout: "archive-post"
title: "Surprized by how little I use multithreading..."
date: "2009-12-04T08:40:00.006-05:00"
description: "Back in 2000 I was working on multithreaded applications. Since I was working in Posix environments in C I used the Pthreads library. I learned to use Pthreads from both C/C++ and Perl contexts but I had trouble with man"
topics: ["software-design"]
original_labels: ["java","jvm","multithreading","posix","pthreads"]
original_url: "https://hartsock.blogspot.com/2009/12/surprized-by-how-little-i-use.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2009-12-04-surprized-by-how-little-i-use-multithreading/"
id: bafyr4iapogcuaxqtqkpl4loxthm2nhteo3hahzktjlh5hr5lcgliwwdd3i
permalink: /posts/surprized-by-how-little-i-use-multithreading-liwwdd3i/
---
{% raw %}

Back in 2000 I was working on multithreaded applications. Since I was working in Posix environments in C I used the [Pthreads](https://computing.llnl.gov/tutorials/pthreads/) library. I learned to use Pthreads from both C/C++ and Perl contexts but I had trouble with managing Pthreads and in 2000 I perceived that Java's threading would be easier to use.

For an honest and unbiased comparison of Pthreads and Java threads based on the state of things (at that time) you can look at this paper by [Wim H. Hesselink](http://www.cs.rug.nl/~wim/pub/whh241b.pdf) which manages to cover in 8 pages most of the differences. It was these differences between C/C++ and Java that made me interested in shifting from Posix to Java development.

As it turns out, now that I work primarily in Java (something that took me the better part of a decade to orchestrate), I rarely make practical use of multithreading in Java. For the most part you don't need it when you work in an application server. In the cases I typically encounter if you structure your Java application properly it doesn't need explicit multithreading.

Notice, I said *explicit*. In Java Application Server environments we have tools like messaging queues and timers. Using these Application Server tools properly implicitly produces the same effects as you would get by setting up your own threads and these techniques tend to create fewer bugs since you aren't forced to write thread management code that is easy to make mistakes with.

So, what I'm looking for now are examples of *problems* that using JMS, asynchronous request processing, or Quartz timers won't provide a clean solution. Why do I need to use multithreading explicitly in today's managed Application Server world? What am I missing?

And once I'm developing multithreaded code... how do I test it?

I've gotten responses from some prominent developers out there already and I hope that we can collaborate and share from the experience. I am excited at the chance to learn from some of the people that I consider to be *great thinkers* in our community. Either way I know I'll learn something. In the end that's what I'm really after.

{% endraw %}
