---
excerpt_separator: ""
layout: "archive-post"
title: "Groovy Grails: Little joys"
date: "2007-08-29T16:33:00.000-04:00"
description: "I'm working on a Groovy Grails project and I've just written a controller that takes a post from a form with only a partial representation of the object. Full representation of the object in the form is easy just do this"
topics: ["software-design"]
original_labels: ["grails","groovy","joy"]
original_url: "https://hartsock.blogspot.com/2007/08/groovy-grails-little-joys.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-08-29-groovy-grails-little-joys/"
id: bafyr4ib2n2fzygg3z4scvlkhhgauzzackhzcvyr6bqj7syzalxj5wwik3u
permalink: /posts/groovy-grails-little-joys-j5wwik3u/
---
{% raw %}

I'm working on a Groovy Grails project and I've just written a controller that takes a post from a form with only a partial representation of the object. Full representation of the object in the form is easy just do this:

```

  myObj.properties = params

  myObj.save()

```

The properties save to the Database without much fuss and if the data is invalid we'll toss back to the edit view with a bucket of error messages. But, what if I only wanted to update one field in my object from a form... or sub form... or Ajax call?

...take a look at this little slice of groovy:

```

public class testObj {

    Long a

    Long b

    String c

}

def t = new testObj(a:0,b:1,c:"foo");

t.properties.each({

    println it

    });

def params = ['a':1,'b':2]

println "-----------"

params.keySet().each({

    println it + "->" + params[it]

    t[it] = params[it]

})

println "-----------"

t.properties.each({

    println it

    });

```

The output looks like this:

```

metaClass=groovy.lang.MetaClassImpl@157c2bd[class testObj]

class=class testObj

b=1

c=foo

a=0

-----------

a->1

b->2

-----------

metaClass=groovy.lang.MetaClassImpl@157c2bd[class testObj]

class=class testObj

b=2

c=foo

a=1

```

What just happened? We mapped the values from a Map object onto the fields of an object with out knowing what the fields in the Java object were. Without introspection.

I presume this works with a POJO and if it does I'm going to go have a party tonight because I think web form processing, ETL, and a whole mess of other ORM type activities just got a helluva lot easier in Java land.

Aren't you happy?

{% endraw %}
