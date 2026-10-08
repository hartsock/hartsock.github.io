---
excerpt_separator: ""
layout: "archive-post"
title: "The one about scope. And tacos."
date: "2011-07-24T18:34:00.011-04:00"
description: "Consider the following paragraph. > Mary and Sally are friends. Mary gives Sally a gift for her birthday. Mary hangs up the telephone. Are there any syntax problems in the above paragraph? Are there any grammar problems?"
topics: ["personal-notes"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2011/07/one-about-scope-and-tacos.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2011-07-24-the-one-about-scope-and-tacos/"
id: bafyr4idvaa4dr6azeoct3v6gffcuvxsxbr6ririnwerizt2ywwkqotpxvq
permalink: /posts/the-one-about-scope-and-tacos-kqotpxvq/
---
{% raw %}

Consider the following paragraph.

>  Mary and Sally are friends. Mary gives Sally a gift for her birthday. Mary hangs up the telephone.

 Are there any syntax problems in the above paragraph? Are there any grammar problems? What is wrong with this paragraph exactly? The problem is non-technical in nature. The paragraph references a relationship between Mary and Sally and then describes an interaction that occurs between them. Finally it describes Mary ending a phone conversation. However, we have no idea when or how Mary began talking on the phone. We don't even have a prior reference to a phone conversation.

 Consider the following code:

```
def exchangeIfRelated(def mary, def sally) {
  if( canRelate(mary,sally) ) {
    mary.exchange(sally)
  }
  mary.closeConnection()
```

```
}
```

 What is wrong here? The isn't anything technically wrong provided whatever connection we just closed was not in use after this method finishes. What is the likely hood this call is made from a different part of the program like this?

```
public void friends(FooService mary, BarService sally) {
   mary.openConnection()
   sally.openConnection()
   exchangeIfRelated(mary,sally)
   sally.closeConnection()
}
```

 Anything wrong here? No. Not really. It will compile, it will run. In this method we have implicitly taken responsibility for opening and closing whatever these connection things are. In a more concrete example, we might be opening and closing a database connection. In that kind of example, we are allowing concerns to bleed between methods. Ideally, I want one unit of code to be concerned with one thing. That thing (whatever it is) is hopefully easily abstracted for use by other units of code without their having to become experts in that other abstract thing (whatever that is). The following code is better and will likely lead to fewer misunderstandings.

```

public void friends(FooService mary, BarService sally) {
   mary.openConnection()
   sally.openConnection()
   exchangeIfRelated(mary,sally)
   mary.closeConnection()
   sally.closeConnection()
}
```

 Knowing how an ignition system works does not aid my ability to drive a car in rush hour traffic. When I start my car I do not need to have knowledge of what happens when in my car's engine, nor do I need to know how a camshaft functions in order to drive my car down the road. The driver is insulated from these automotive inner workings. In the same way when we build software we want to insulate the layer above us from details about the layer beneath us.

 Mixing the scope of when and where you do things is like changing the subject of a paragraph. There are fish in the sea. Nothing is really wrong with it from the stand point of the compiler which really only understands the mechanics of phrases in the programming language. There are tacos in a truck. However, just as properly formed sentences that have little to do with the core thought of a paragraph are disruptive and confusing. I like kites. Similarly, such disruptive code phrases in our code leads to confusion and in a program that kind of thing leads to bugs. And tacos.

{% endraw %}
