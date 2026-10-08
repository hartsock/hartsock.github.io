---
excerpt_separator: ""
layout: "archive-post"
title: "Should I put that logic in my Grails domain class, service class, or a controller?"
date: "2009-10-01T07:36:00.007-04:00"
description: "I don't honestly know. I do have a feel for when this is appropriate and when it isn't. For example I think Anemic Domain Model is a valid anti-point. It completely jibes with how I feel the benefit of an Object Oriented"
topics: ["software-design"]
original_labels: ["design","domain","grails","groovy"]
original_url: "https://hartsock.blogspot.com/2009/10/should-i-put-that-logic-in-my-grails.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2009-10-01-should-i-put-that-logic-in-my-grails-domain-class-service-cl/"
id: bafyr4ibceuxvycv5l4x6ozwbwztyn5vygcf3uexplipv7qpuwayyedp5xu
permalink: /posts/should-i-put-that-logic-in-my-grails-domain-class-service-cl-yyedp5xu/
---
{% raw %}

I don't honestly know. I do have a feel for when this is appropriate and when it isn't. For example I think [Anemic Domain Model](http://en.wikipedia.org/wiki/Anemic_Domain_Model) is a valid anti-point. It completely jibes with how I feel the benefit of an Object Oriented Programming (OOP) system should work... in that I don't think domain classes should be just a representation of data.

The whole point of OOP is to encapsulate data and methods in a modular way keeping logic bundled together with the data it operates on. Let's work on a concrete example... assume this is a domain class in a Grails project.

```

class Person {

String firstName

String lastName

Date birthDate

}

```

So far so good. So if I want to figure out a person's age... where do I put that? The class seems like a good place...

```

class Person {

   String firstName

   String lastName

   Date birthDate

   def getAge() {

       def now = new Date()

       now[Calendar.YEAR] - birthDate[Calendar.YEAR]

   }

}

```

... in fact anything that operates on the domain data in the object seems like it fits well here. If we run *generate-all* on this class we get a UI that looks like this...

[(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgMlUaYDhj_95QPWsZ_vmmhW-soD2xWvdU3JNbJYUpv2WJ9G2d6UmkSkknQtWr1cLwuWkCtz5edhWZBQngFxOc52s16yE6W2Rpqe3EfYKNJnlkL8lz9y9LqJlGD-PDgCMbrdc1-vg/s400/Picture+1.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgMlUaYDhj_95QPWsZ_vmmhW-soD2xWvdU3JNbJYUpv2WJ9G2d6UmkSkknQtWr1cLwuWkCtz5edhWZBQngFxOc52s16yE6W2Rpqe3EfYKNJnlkL8lz9y9LqJlGD-PDgCMbrdc1-vg/s1600-h/Picture+1.png)

Marking non-persistent services as transient keeps them from getting sent to the database should we need them... for example if I had a "fooService" then I would get this injected in my domain class like so...

```

class Person {

   transient fooService

// ... snip ...

```

... but I'll not bother with an example just now.

So when does the logic belong in a service or a controller? Well, when it stops being directly driven by the domain model. For example things could get messy if we start injecting security checks into the domain model. I would find that a bit messy to maintain.

Similarly if there was a Person to Person relationship that required some logic that checked states of both objects...

```

class Person {

 Person spouse

//... snip ...

 void marry(Person other) {

   if(!other.spouse || other.spouse.id == this.id ) {

      other.spouse = person

   }

   else {

     throw new Exception("These two cannot wed")

   }

 }

```

... while this works it feels a tad clunky because I have to do this bit ...

```

if(!other.spouse || other.spouse.id == this.id )

```

... and since we have to somehow modify the other class too and it feels odd to have the *this* person object modify the *other* person object.

... but if there was a *minister* service I could write this...

```

class MinisterService {

  //... snip ...

  void marry(Person left, Person right) {

    if(!left.spouse && !right.spouse) {

       left.spouse = right

       right.spouse = left

    }

    else {

       throw new Exception("These two cannot wed")

    }

  }

  // ... snip ...

}

```

... and this feels a tad better since the Person class no longer needs to carry around the knowledge of all the possible marriage rules that a lawyer might enact. This also models real life better since people visit ministers, justices, or captains to get married in real life... and we cleanly avoid the issue of people modifying each other.

There's other rules that I could probably explain if I was more articulate. Has anyone else thought about this? What tweaks would you put on these ideas? How would you express this rule?

Note: this is a quick reply to [this tweet](http://twitter.com/ldaley/status/4516121123).

{% endraw %}
