---
excerpt_separator: ""
layout: "archive-post"
title: "On the topic of reviews..."
date: "2013-08-26T12:48:00.005-04:00"
description: "Over on the OpenStack mailing list, this article from IBM Developer Works has been making the rounds. The primary objection to the article is the prescriptions it makes on code size for review. No more than 200 to 400 li"
topics: ["software-design"]
original_labels: ["OpenStack"]
original_url: "https://hartsock.blogspot.com/2013/08/on-topic-of-reviews.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2013-08-26-on-the-topic-of-reviews/"
id: bafyr4iejnj6k2jrtklajfb7hqgkyqh2wntnklikkf44j5y6j4ioqvdwuo4
permalink: /posts/on-the-topic-of-reviews-oqvdwuo4/
---
{% raw %}

Over on the OpenStack mailing list, [this article](https://www.ibm.com/developerworks/rational/library/11-proven-practices-for-peer-review/) from IBM Developer Works has been making the rounds.

 The primary objection to the article is the prescriptions it makes on code size for review. No more than 200 to 400 lines of code is said to make a manageable review size. This measurement of "lines of code" (abbreviated LOC) harkens back to the bad old days of programming back when a developer might find herself paid on the number of lines of code she wrote. These were very early days.

 Over the last intervening century we've attempted to introduce more sophisticated ways of measuring what LOC measures. We tried [function point analysis](http://en.wikipedia.org/wiki/Function_point) for a time. Since the process of creating function points and then performing analysis on these involved lots of math there was a presumption of meaningfulness around these numbers. The problem was that in order to perform a real function point analysis you had to be able to measure something called "business utility" and that was something that was often very hard to measure. It was a bit like trying to measure "beauty" or "mood" and there have been equally number driven approaches at measuring both of these and nothing anyone would point to as definitive.

 So LOC has stuck around in programming circles because it is easy to count and at *some point* the numbers make sense. Is 200 or 300 lines too many? Maybe. Is 2,000 or 3,000 lines too many? Almost definitely, but there's an outside chance that it's not. This highlights the problem with hard and fast rules. Only those who aren't really aware yet of what they are actually doing really need them, once you know what you are doing and why there's a high chance you'll end up sticking to 200 or 300 line reviews just because it happens to serve the same purpose.

 In the end, LOC is an indicator that kind of works but for the wrong reasons. It is inevitable that more complex ideas take more characters to express. What can't be ascertained is the direct correlation between lines, characters, and ideas. In code review, that's the real metric we're trying to manage ... ideas per review... concepts per patch.

 The *one thing* I do agree with from this article on reviews is a review *should* take no more than 60 to 90 minutes. Note I'm not saying a review **must** take 60 minutes. Just that when you prepare your code for review, think of how long it will take someone to comprehend what you've done, consider it, and offer constructive criticism. If the process takes more than 60 minutes then you may have too big of a review. That's a signal to you to break it up.

 Denser languages are going to convey more concepts per line than other languages. That may mean that a 10 line patch might take a good 30 minutes to fully evaluate in some very expressive languages. Then, there are reviews which might alter a method signature across an entire code base and 90% of the review is just checking that the method signature has changed, so a few thousand lines is no big deal. (Albeit, that a change like that speaks to other rather gross issues in your code but let's not dwell on that.)

 One of my college professors was fond of a quote I've repeated often to my own students and colleagues through the years:

>  A good programmer is a good communicator.

 I often view a failure to understand a change, not as the failure of the reviewer, but a failure on my part for either setting up the reviewer for success or a failure to break up the patches/changes in such a way that they are easy to comprehend. In the last OpenStack review cycle I had a perfectly working 10 line patch that we grew to nearly 100 lines to make it more clear that the effect in the code was not accidental, but deliberate. In the end we changed no outward function in the code but only how it was stated.

 These things happen. It's important to know why. It is important to make intention clear. And, that is what writing good code is about.

{% endraw %}
