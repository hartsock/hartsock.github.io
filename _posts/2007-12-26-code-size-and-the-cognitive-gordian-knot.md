---
excerpt_separator: ""
layout: "archive-post"
title: "Code Size and the Cognitive Gordian Knot"
date: "2007-12-26T10:26:00.000-05:00"
description: "The size of a code base is not the worst enemy of code. My personal experiences with code bases large and small have given me the insight to realize that size of code is a terrible enemy but not our worst enemy. Our wors"
topics: ["software-design","philosophy"]
original_labels: ["coding","philosophy","software culture"]
original_url: "https://hartsock.blogspot.com/2007/12/code-size-versus-cognitive-gordian-knot.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-12-26-code-size-and-the-cognitive-gordian-knot/"
id: bafyr4iadaukvryfqwgwu5dh436rehbveip3wp6uxcmkjvq2wy4pvemsghe
permalink: /posts/code-size-and-the-cognitive-gordian-knot-pvemsghe/
---
{% raw %}

The [size of a code base is **not** the worst enemy of code](http://steve-yegge.blogspot.com/2007/12/codes-worst-enemy.html).

My personal experiences with code bases large and small have given me the insight to realize that size of code is a terrible enemy but not our worst enemy. Our worst enemy is stupidity. Well, not out right stupidity but what I call the cognitive Gordian knot.

The larger a code base is the more material there is to create a knot. The smaller, the less material there is to create a mess with. So there is beauty in the small. I have been arguing for the decomposition of large projects into small reusable code units for most of my career.

Yet, I've seen examples at [Coding Horror](http://www.codinghorror.com/blog/) and [The Daily WTF](http://thedailywtf.com/) that show in a scant few lines some of the most impressive inability to think I have ever seen. These examples are not necessarily what we would consider mind numbingly, guffawingly, powerfully brutish idiocy but subtle brain warping WTF? These are the thought-knots we can't untie like that knot of legend the Gordian knot.

During my time over seas I have worked on code bases whose ages were measured in decades and sizes estimated in rough fractions of millions of lines. Code bases of this size are surely incomprehensible but the best can have inner structure that can be navigated and internal API that can be understood. The reader of this kind of code doesn't need to know what exactly each call does but only understand the local code and some specific libraries to work on it.

And then later in my career... oh the irony... I maintained a code base of a scant few hundred thousand lines of code whose internal structure shifted upon itself every few lines. Every few hundred lines a new API, a new convention, a re-written API, a half-refactor, a violation of another API. And so on the insanity folded over and over upon itself like a Lewis Caroll narrative without any beautiful onomatopoeia. All of it written by the same person over the course of five years.

Instead of a crystalline structure found in those majestic and old code bases whose patterns fold and unfold like a fractal thus leading the maintainer to an understanding of the whole from only a part... this newer... this smaller... this uglier code base contained no song and no resonance that my mind could fix upon. Instead it was a tangle of swamp weed coated in a toxic sludge that defied understanding and like "Alexander the great and the Gordian knot" I saw no other answer to my problems other than to cut it asunder. Bust it up, break it apart, make it small again.

No, I know better, size is not what kills code. It is the Gordian knot of superficial complexity that kills code. Instead of a crystalline pattern or an enforced internal structure the code is allowed to grow untamed. The key to long life in code is pulling out and separating concerns into libraries and frameworks.

You could argue this tactic constitutes removing some code from the main code base and creating small supporting projects that fit together to create a whole. You'd be right. That's what it is. That is what I mean by saying fractal, crystalline, or internally disciplined. The supporting libraries may be internal to the project but they may constitute sub-projects they divide and conquer the problems and keep the material from building to the point that it can accidentally tie itself in a knot.

You could achieve this using MVC, Services, or libraries. I've seen Domain Driven Designs and Spring annotations to enforce SoC that would work well. You could say this is how Linux and GNU work together to create a full operating system. You could say that is code reuse and proper object orientation. You could say this the weapon we have in the mix-in and dynamic language.

Whatever you call it. It makes code easier to understand because it has a logical structure and what I call a resonance or song. It means you can see part of a code base, understand it, and ignore the other concerns to focus on your particular problem.

If you can dive into one section of code and comprehend it without having to comprehend the whole thing then I say you have a good code base no matter how big or how small it is. The goal is to keep the knotty beast at bay for as long as possible using every trick we have.

{% endraw %}
