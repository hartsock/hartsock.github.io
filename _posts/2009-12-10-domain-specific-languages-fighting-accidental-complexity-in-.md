---
excerpt_separator: ""
layout: "archive-post"
title: "Domain Specific Languages: fighting accidental complexity in a sea of technology"
date: "2009-12-10T21:13:00.004-05:00"
description: "I had a great time presenting at UNC's Programming Practices group today. This was the first time I've presented in about a decade so I'm glad that folks stuck around and gave me feed back. Slides from the presentation: "
topics: ["software-design"]
original_labels: ["DSL","UNC","groovy","slides","talks"]
original_url: "https://hartsock.blogspot.com/2009/12/domain-specific-languages-fighting.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2009-12-10-domain-specific-languages-fighting-accidental-complexity-in-/"
id: bafyr4iffiomfsk4iuyumdjzymkag3gwyfmcahile3x4dk76tnovjyj67au
permalink: /posts/domain-specific-languages-fighting-accidental-complexity-in--vjyj67au/
---
{% raw %}

I had a great time presenting at UNC's Programming Practices group today. This was the first time I've presented in about a decade so I'm glad that folks stuck around and gave me feed back.

Slides from the presentation:

I wrote speaker's notes for nearly each slide. If you click the menu button and click the link to the full document you can find a button that will pop up the speaker's notes for you.

For code samples, take a look at this example by [Tim Yates](http://groovyconsole.appspot.com/view.groovy?id=27001). My live coding example was a reimplementation of this using a Test Driven Design (TDD) technique. TDD doesn't translate well into a recorded medium. I tried to show how we could stumble toward the same (or similar) design by using TDD and what we knew to extend our knowledge and grow beyond it.

I made a simple extension on Tim's example. I added a simple way to make his internal DSL into an *external* DSL. I use the GroovyShell object:

```

  // def list = DateDSL.interpret(stringOfCode) // could be a file?

  static interpret(String code) {

    def shell = new GroovyShell();

    Closure closure = shell.evaluate("{->" + code + "}")

    closure.delegate = new DateDSL()

    closure.call()

  }

```

Finally, I tried to tie the idea that Domain Specific Languages hide accidental complexity of a system behind "simpler" API and externalize-able syntax. These goals provide not just more focused ways for application developers to write software. They outline a design aesthetic. An aesthetic that fits well with the idea of empowering amateur programmers.

I ended with the assertion that this sea of technology will end in a world where everyone programs. But not everyone will be a programmer. We will think of programming the way we think of writing. Just because you *can* write it doesn't make you a *writer*. The ubiquity of computing means humanity will eventually view computer programming the same way... as ubiquitous as reading and writing.

One way to make sure this happens is to develop Domain Specific Languages that empower domain experts to write software.

{% endraw %}
