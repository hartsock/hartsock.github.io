---
excerpt_separator: ""
layout: "archive-post"
title: "Tautology and the Programmer"
date: "2008-01-15T10:25:00.000-05:00"
description: "I've decided to extract and simplify an example of why a programmer should know what a tautology is... I found very nearly exactly this code in production a few years ago: if(!a && !b) { if( ! (a || b) ) { // stuff } } /"
topics: ["software-design"]
original_labels: ["code","logic"]
original_url: "https://hartsock.blogspot.com/2008/01/tautology-and-programmer.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-01-15-tautology-and-the-programmer/"
id: bafyr4ic6mufvbtpxetam7nxtnmmp2b4tn54qbsm3ry7vwj2ztmsgx7bmlu
permalink: /posts/tautology-and-the-programmer-sgx7bmlu/
---
{% raw %}

I've decided to extract and simplify an example of why a programmer should know what a tautology is... I found very nearly exactly this code in production a few years ago:

```

if(!a && !b) {

  if( ! (a || b) ) {

    // stuff

  }

}

// ... more unrelated stuff

```

The if inside another if creates an implicit and ... further obviated by the fact that there is no else to the inner if statement.

But, what's worse the inner if is automatically true if the outer if is also true. The nested if statements form a tautology! The result is that a maintenance programmer must read and comprehend that he is looking at a tautology and understand how to edit the code.

What is particularly bad is if the maintenance programmer doesn't understand that there is a tautology in the nested if statements and is tempted to put an else after the inner if. That nested else will never fire... and the programmer may waste hours or days trying to figure out why.

{% endraw %}
