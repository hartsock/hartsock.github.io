---
excerpt_separator: ""
layout: "archive-post"
title: "Fun with Groovy and the Reflection API"
date: "2007-12-19T14:30:00.000-05:00"
description: "Here's the scenario: You've got dates in the format \"MM/dd/yyyy\" to be parsed and turned into a real Date object. You would parse the date like so: public Date format(String str) { def format = new SimpleDateFormat( \"MM/"
topics: ["software-design"]
original_labels: ["groovy","reflection"]
original_url: "https://hartsock.blogspot.com/2007/12/fun-with-groovy-and-reflection-api.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-12-19-fun-with-groovy-and-the-reflection-api/"
id: bafyr4ihbfabhaivrsfxmxfthokl6obx4pk5fhwkpzfrwx3hvt6kphsnapa
permalink: /posts/fun-with-groovy-and-the-reflection-api-kphsnapa/
---
{% raw %}

Here's the scenario: You've got dates in the format "MM/dd/yyyy" to be parsed and turned into a real Date object. You would parse the date like so:

```

 public Date format(String str) {

  def format = new SimpleDateFormat( "MM/dd/yyyy" )

  return format.parse(str)

 }

 public String format(Date date) {

  def format = new SimpleDateFormat( "MM/dd/yyyy" )

  return format.format(date)

 }

```

And you have hundreds of collections of Java and Groovy objects that your library could be potentially mapping from hashes that look something like this:

```

 ["foo":[ "id" : "5", "started":"12/11/2007", "name":"bob" ]]

```

You could write a switch statement for each of these... or you could go and ask the class defintions for what the types of foo.id and foo.started are. But if you do this:

```

class Foo {

  Long id

  Date started

  String name

}

def foo = new Foo()

println foo.started.getClass()

```

... that println will print "null" because the started object is set to null. So how do I know if "started" is a date or not? I need to know the type on the other side of the "started" member. It would be nice to have a reverse mapping I could use... so I wrote this:

```

def getTypeMap(Class clazz) {

    def typeMap = [:]

    def members = clazz.getDeclaredFields()

    members.each( {

        m ->

            typeMap[m.getName()] = m.getType()

    } )

    return typeMap

}

```

... now you can ask the type of a field like so ...

```

    def classOf(Class clazz, field) {

     def typeMap = getTypeMap(clazz)

     if(typeMap.containsKey(field)) {

      return typeMap[field]

     }

     else {

      return null

     }

    }

```

... to get the type of the field on the class you are working with... in a loop you would...

```

def params = ["id":"5","started":"12/11/2007","name":"bob"]

def foo = new Foo()

params.each({ key,val ->

  def clazz = classOf(foo.getClass(),key)

  if(clazz && clazz != Date.class) {

     foo[key] = clazz.newInstance(val)

  }

  else if(clazz) {

     foo[key] = (Date) format(val)

  }

})

```

Presuming you knew that all the values of "val" were strings and all the members in "Foo" had constructors that could handle a string argument intelligently. I cache up the type map else where so that the real production classOf doesn't build a new type map on each pass.

But now I can map from arbitrary strings into real objects and back without having to specify a "mapping" for each object.

{% endraw %}
