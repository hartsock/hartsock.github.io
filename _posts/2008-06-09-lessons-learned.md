---
excerpt_separator: ""
layout: "archive-post"
title: "Lessons learned..."
date: "2008-06-09T10:56:00.004-04:00"
description: "A short list of things I have done wrong recently... - Working in GORM/Hibernate if you provide a mapping DSL and intend on your class to move between databases do not assume the default \"hilo\" algorithm will work on all"
topics: ["software-design","documentation"]
original_labels: ["GORM","grails"]
original_url: "https://hartsock.blogspot.com/2008/06/lessons-learned.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-06-09-lessons-learned/"
id: bafyr4iags5j5mn7ttfygk7mku2vo4tvj6gnq37b4emamhjfgsqoikbcwvm
permalink: /posts/lessons-learned-oikbcwvm/
---
{% raw %}

A short list of things I have done wrong recently...

- Working in GORM/Hibernate if you provide a mapping DSL and intend on your class to move between databases do not assume the default "hilo" algorithm will work on all databases. See [id generator](http://www.hibernate.org/hib_docs/v3/reference/en/html_single/#mapping-declaration-id-generator) documentation at hibernate.org

- Do not assume that you can throw classes up and down an inheritance hierarchy in Hibernate. For example:

```

class Person {

  Long id

  String name

}

class Parent extends Person {

 static hasMany = ['kids':Person]

}

```

... you need to do this to turn a "person" into a "parent"

```

    def makeParent = {

        Person.executeUpdate( "update versioned Person as p set p.class =:clazz where p.id =:id", [clazz:Parent.class.getName(),id:params.id.toLong()] )

        def parent = Parent.get(params.id)

        if(!parent) {

            flash.message = "Person not found with id ${params.id}"

            redirect(action:list)

        }

        else {

            redirect(controller:'parent',action:show,id:parent.id)

        }

    }

```

... other techniques to do this create a new object with a new id. That means you can't model a "parent" to "child" relationship this way. Instead turn the relationship around ...

```

class Person {

  Long id

  String name

  static hasMany = ['parents':Person]

}

```

... or create a bridge object...

```

class Person {

  Long id

  String name

}

class Relationship {

   Person parent

   Person child

}

```

... and that works much better.

- Do not lock in a domain model based on "big design first" principles. Domain may have to change to fit reality of your system. Sometimes you don't really understand the problem on day 1 or day 10.

- Do not release big, release small, release frequently. It's better to get tiny releases and adjust course in small increments rather than have "big bang" releases.

- Coding and posting while tired only lead to messes you have to clean up later.

- Do not ignore your email.

Hopefully, the insanity has passed.

{% endraw %}
