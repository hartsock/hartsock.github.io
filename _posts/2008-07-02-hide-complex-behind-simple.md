---
excerpt_separator: ""
layout: "archive-post"
title: "Hide complex behind simple..."
date: "2008-07-02T10:10:00.002-04:00"
description: "Hide the complex behind the simple. Keep the complexity of a system behind the simplest possible interface. At every level find the simplest way to express the intention of the interface, do that, and get out of the way."
topics: ["software-design"]
original_labels: ["thought"]
original_url: "https://hartsock.blogspot.com/2008/07/hide-complex-behind-simple.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-07-02-hide-complex-behind-simple/"
id: bafyr4icjrt2fmqkuzopfvblr372tyiqsbgja3ls7hdxd5rqzn2zoadwyhe
permalink: /posts/hide-complex-behind-simple-zoadwyhe/
---
{% raw %}

Hide the complex behind the simple. Keep the complexity of a system behind the simplest possible interface. At every level find the simplest way to express the intention of the interface, do that, and get out of the way. In short, make things easy for your user and hard on you. It's your job.

If you are creating API (as I sometimes find myself doing) work to create the interfaces that the users of your API will find intuitive and simple to use. Hide the complexity of this work as succinctly as possible behind the inner implementation of the library.

If you are working on UI (as I also paradoxically find myself doing) work to create an interface that encourages play. I don't mean gaming. I mean, allow a user to "play with" the interface and explore it. Let them discover what it can do and try and make it intuitive to the way that they think about problems.

In the desing of both UI and API you can find yourself altering what "simple" is. You can introduce new ways of thinking about a problem by creating new implicit behaviors. This is an interesting space to work in collaboratively because you can find that users (both programmers and lay-users) have developed preconceptions and notions of how a system "must work" and so doing box themselves in.

In my experience of hiding complex things under simple interfaces I have found that there really is nothing that is truly simple in the whole. Instead things are simple in isolation but produce emergent complexity when placed in large systems. So to fight this the best weapon is to keep systems small. By keeping systems small and isolating their inputs and outputs you have a better chance of artfully controlling their interactions.

The other side of this is that our minds are horrible at containing inherent complexity. I used to think I was very good at this. I no longer think that. I now realize that I might be better at dealing with complexity than some, but my abilities have a distinct upper limit that is reached very quickly.

That is why when we build systems of any size. We developers of systems of software should acknowledge the need to test the system to validate our understanding at every level. Just as we use the scientific method to validate what we believe to be true using experimentation we should validate the way thoughts interact via experimentation.

The irony that what we are testing is in my opinion codified thought is not lost on me. Consider [Kurt Gödel](http://en.wikipedia.org/wiki/Godel) and his [incompleteness theorems](http://en.wikipedia.org/wiki/G%C3%B6del%27s_incompleteness_theorem) which point to the limitations of all formal systems... they are doomed to incompleteness. That is to say that you can never through proof alone (code alone) create a system to model such complex yet simple things as the counting numbers.

So there is a bug in the universe?

When you or I create software in any capacity we are indeed creating a formal system. A system that will either fail to model the real world problem we are attempting to emulate or will be fraught with inconsistency and incompleteness. So even if we were super-coders that never produced bugs, and you and I could in fact produce a perfect system, that system could be fraught with problems due to its inability to properly model or express the real world system it was based on.

The simplest answer is to devise tests to prove the correctness of our systems.

{% endraw %}
