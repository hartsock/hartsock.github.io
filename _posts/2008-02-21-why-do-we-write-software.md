---
excerpt_separator: ""
layout: "archive-post"
title: "Why do we write software?"
date: "2008-02-21T12:50:00.007-05:00"
description: "I feel I have to ask: Why do we write software? I ask this because I think the why gets lost too easily. I've recently worked on a project that modeled a name and email address in JSON like this: [ [\"PRXYY298NAFR\",\"Bob\","
topics: ["software-design"]
original_labels: ["JavaScript","ORM","object"]
original_url: "https://hartsock.blogspot.com/2008/02/why-do-we-write-software.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-02-21-why-do-we-write-software/"
id: bafyr4ifxzg4rro34xejxln6hi4357poxhgmjuebxrmhvxf3gnuvnp2uuue
permalink: /posts/why-do-we-write-software-vnp2uuue/
---
{% raw %}

I feel I have to ask: Why do we write software?

I ask this because I think the why gets lost too easily. I've recently worked on a project that modeled a name and email address in JSON like this:

```

[

 ["PRXYY_298_NAFR","Bob",""],

 ["PRYXY_LARFN","Roberts",""],

 ["PRH_2810_EMA","bob@email.com","email"]

]

```

... why do that?

I suspect that this kind of tri-associative array allows for type information to be included in a JavaScript model. The problem is that the data thingy (because that sure ain't no object) is no longer human readable.

But what is worse is exposing this data model in an API to use as a service. This is basically screwing over the integration developer. I can see how you could have easily modeled the JSON object as:

```

{

 PRXYY_298_NAFR: "Bob",

 PRYXY_LARFN: "Roberts",

 PRH_2810_EMA: "bob@email.com",

}

```

... and then had a server-side mapping map "PRH_2810_EMA" to "email" on the fly. Even better would have been to use human readable names like "email" and map those to values like "PRH_2810_EMA" if you needed to server side.

Why do it?

I suspect this makes the original system designer's job easier on some level. No thought was given to system integration or how to make data import/export easy. Instead we are working with something that was easy to code but hard to use.

And, that circles back around to "Why do we write software?"

It clearly isn't to make the programmer's life easier is it? The programmer should be trying to make their user's life easier. After all isn't that why a programmer even has a job?

I mean "programmer" from the perspective of the one writing the program or API... and user being the person who is going make use of this product later. That means as a programmer I'm the user of PHP, Python, Perl, Ruby, Java, Scala, Groovy, or other technology. It means that if I write Rails, Grails, Maven, CakePHP, JSF, or other framework I'm using a programming language and creating tools that other programmers will use themselves. The role of programmer and user can switch. I could write an API then have to use it later.

So you would think that being a user of programming tools themselves the designer of our tri-associative array would have some sympathy... empathy... care for... the user of their tool since they are so very similar people. But instead of thinking about why the tool exists and who is going to use the tool our programmer chose the path that would give them the easiest success.

I don't like that very much.

As programmers our job is to do the hard things so our users don't ever have to care. The simpler we can make very hard things seem the better we are doing. For example Google probably has one of the most powerful and complex search engines on the planet. It is clustered and redundant and complex and beyond many programmer's or user's comprehension. Yet to use it you type text in one box and hit one of two buttons.

The user experience is simplified to almost a ridiculous level.

The Macintosh is like this too in places. And, so are some places in Windows. And, so are some places in Linux. Each one of these systems has traded easy in one place for hard in another. For Macintosh... hardware is harder... for windows security is harder... for Linux desktop user experience is harder. In Macintosh what does work works well and without a manual... in Windows you never wonder "will it work with windows?"... in Linux you never wonder if it will scale well or stay secure.

Each has taken a specific user experience and simplified that particular "most important" case.

So I ask you: What is your most important case? Why are you writing this software? Why will anyone bother to pay you? What would cause them to not pay you?

Features should be designed and implemented by order of priority.

So maybe my tri-associative-array friend never saw integration as a priority. But, we should have. And that should have meant we didn't pay him and instead paid for someone who aligned with our priorities.

And that is my big thought for today: Ask why you are writing software and ask whether you should write it at all first.

{% endraw %}
