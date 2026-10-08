---
excerpt_separator: ""
layout: "archive-post"
title: "Code Samples and the argument for WET versus DRY"
date: "2012-09-14T11:54:00.002-04:00"
description: "In my new role at VMware I've been tasked with writing new code samples for the various API that have been created for supporting the Ecosystem around VMware's product line. This has been a very different experience for "
topics: ["testing","software-design"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2012/09/codes-samples-and-argument-for-wet.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2012-09-14-code-samples-and-the-argument-for-wet-versus-dry/"
id: bafyr4ic3pvqamqufcukhnuj5m5p65vpkuhszfxnoz3umq6dh2aywamsooe
permalink: /posts/code-samples-and-the-argument-for-wet-versus-dry-ywamsooe/
---
{% raw %}

In my new role at VMware I've been tasked with writing new code samples for the various API that have been created for supporting the Ecosystem around VMware's product line. This has been a very different experience for me.

 I practice the principle of Don't Repeat Yourself (DRY) in most of the code I've produced during my career. In the last few years I've adopted Test Driven Development (TDD) as well as other techniques that make sense. In creating code samples most of these things still apply but DRY sort of doesn't.

 The purpose of code samples is to highlight the use of the API and the target user is a programmer that is in a hurry. A methodical and slow programmer wouldn't necessarily even need samples since they would read documentation and work out via TDD the necessary information for how to use the API themselves. So my work with samples is for the developer who won't even necessarily stop to turn their attention to documents.

 That means there is a need to Wholly Express our Terms (WET). In other words, if I happen to make my code *too* DRY there is opportunity for the *learning* programmer to miss vital steps. The solution to this is to choose things to repeat very carefully. This actually creates code repetition I would not want in a production system but should not completely brush aside code reuse.

 The trick is to package steps up into reusable units that are easy to compose but are still expressed in an end product. In a nonsense and non NDA violating example:

```
    class Frobnicator extends Thingicator {
        public void frobnicate() {
            Something s = someService.doThing0();
            Otherthing o = someOtherService.doThing1(s);
            Anotherthing a = someService.doThing2(s,o);
            someBinding.doTheThing(s,o,a);
        }
    }
```

 Hopefully we get to demonstrate some salient parts of an algorithm leaning on services to the end user. If I have to repeat the lines for how to get '**s**' and '**o**' over and over, this is not so bad as repeating the contents of *doThing0* and *doThing1* over and over. The argument can still be made that by being WET (which also means Write Everything Twice) we are being instructional.

 Conversely, we could argue that DRY code should still be used here since any good coder should be able to trace back the compositions and decompose what happened. The trick with balancing WET and DRY in a code *sample* is to recall that we are not writing a *framework* or a *library* or even a *prototype*. The purpose of a code sample is to document.

 So I'm learning where to balance WET versus DRY in this game of writing code samples. I tend to prefer making the mistake of making things *too *DRY as opposed to too WET since this means I will have fewer things to think about in the future.

 Incidentally, one of the things I would normally avoid is *inheritance* but I feel in the case of code samples it plays very well since I can say* "this algorithm I'm showing you is a variation of ... "* which is probably very instructive. In another system I might have use Functional thinking paradigms instead. Remember, I'm trying to keep a low bar in these samples and avoiding the temptation to teach both the API and Functional Programming at the same time. The goal is not to introduce too many hurdles.

 Do you disagree with me? Should I just use all the best practices I know and force my sample reader to climb to my level? Am I condescending by making my code samples WET assuming too low a bar for the new developer? Your feedback is welcome.

{% endraw %}
