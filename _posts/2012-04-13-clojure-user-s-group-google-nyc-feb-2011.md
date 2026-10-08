---
excerpt_separator: ""
layout: "archive-post"
title: "Clojure User's Group @ Google NYC [Feb, 2011]"
date: "2012-04-13T12:00:00.000-04:00"
description: "This post was sitting in my drafts bin for a while but I decided to finish it off and post it today. My apologies if it is a bit dated and not up on current Clojure syntax. I was at Clojure User's Group, NYC back in 2011"
topics: ["software-design"]
original_labels: ["2011","NYC","clojure","jvm","languages"]
original_url: "https://hartsock.blogspot.com/2012/04/clojure-users-group-google-nyc-feb-2011.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2012-04-13-clojure-user-s-group-google-nyc-feb-2011/"
id: bafyr4idzvifst3dg4mw24csv72for2bs6zriahwivkmdfmnp5fsl6jrynu
permalink: /posts/clojure-user-s-group-google-nyc-feb-2011-sl6jrynu/
---
{% raw %}

This post was sitting in my drafts bin for a while but I decided to finish it off and post it today. My apologies if it is a bit dated and not up on current Clojure syntax.

 I was at [Clojure User's Group, NYC](http://www.meetup.com/Clojure-NYC/events/15945077/) back in 2011...

 And Stuart Halloway flashed this code on the screen:

```
(describe String (named "last"))
```

 He complained that while it appears simple, it is in fact *not simple* and showed this code instead (which does the same job).

```
(->>
   (reflect java.lang.String)
   :members
   (filters
        #(.startWith (str (:name %)) "last"))
   (print-table)
)
```

```

```

```
He then claimed the new code was *simpler*. I had to admit I just didn't see it. How is the second listing simpler? The idea is to describe in table format some data right? "describe" seems pretty simple to me.
```

```

```

```
Over beer that night Stuart illuminated my foggy understanding. The second listing is simpler because it introduces fewer new constructs to the language. It is also simpler because the components are smaller, looser in coupling, and can be re-used later without some special facility or dependency on printable output. The key to reuse being that "print-table" now does tablular output on any incoming data as opposed to hiding that nugget of function deep inside the "describe" machinery.
```

```

```

```
We went on to discuss the issues with ORM and how mapping data adds a layer of accidental complexity. Being a good disciple of the Java/Groovy camp I believe in hiding complexity behind clever facades like Domain Specific Languages, Frameworks, and API. This is in stark contrast to a good disciple of Lisp's view of the world.
```

```

```

```
What makes Clojure interesting is the deliberate collision between these two world views. I normally would not be forced to dredge up my decade old exposure to Lisp and place it directly in front of what I've learned from Java the last decade. The Clojure folks force us to do that and you can blame this momentary encounter with Stuart for my talk on [Functional Programming in Java](http://hartsock.blogspot.com/2012/03/functional-programming-in-java-trijug.html) and for the thought experiment that is [lambda-cache](https://github.com/hartsock/lambda-cache) which is an attempt to do caching (via ehCache) using a lambda construct in Plain Old Java Objects.
```

```

```

```
What is interesting is as we explore Functional Programming on the JVM and as [project lambda](http://openjdk.java.net/projects/lambda/) matures we are going to finally explore how best to reconcile these differing views of *simple. *That is because *simple *is anything but **simple**. In it's purest form *simple* is really an analogy for *beauty* when it comes to computer science or mathematics. The value of beauty is debatable. How to achieve beauty is at least in part subjective. 
```

```

```

```
What is most surprising is that there are *objective* measures of beauty in many fields. For example humans find adherence to [the golden ratio](http://plus.maths.org/content/os/issue22/features/golden/index) in proportion to be beautiful. There may in fact be a measure of beauty that can be performed mechanically. Similarly, is there a measure for beauty when it comes to computing? Ostensibly *simple* is the opposite of *complex* and [computational complexity theory](http://en.wikipedia.org/wiki/Computational_complexity_theory) is still a dark murky thing. Do we need to shine some light into the corners of complexity theory before we can measure *simplicity?*
```

{% endraw %}
