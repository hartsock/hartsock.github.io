---
excerpt_separator: ""
layout: "archive-post"
title: "Groovy Automatic type casting tricks..."
date: "2009-08-21T13:44:00.008-04:00"
description: "I've been working on a Domain Specific Language. We wanted to hide the fact that you were passing string parameters to methods... so you could say things like: something 'foo' something foo ...and they would be equivalen"
topics: ["software-design"]
original_labels: ["asType","groovy","java","script"]
original_url: "https://hartsock.blogspot.com/2009/08/groovy-automatic-type-casting-tricks.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2009-08-21-groovy-automatic-type-casting-tricks/"
id: bafyr4ibups3nvj5piwhamnqyrmergckiqgfwxf4bonir7lxx2isihc5khq
permalink: /posts/groovy-automatic-type-casting-tricks-sihc5khq/
---
{% raw %}

I've been working on a Domain Specific Language. We wanted to hide the fact that you were passing string parameters to methods... so you could say things like:

```

something 'foo'

something foo

```

...and they would be equivalent. As the project progressed I needed to make calls like these...

```

something 'foo.bar'

something foo.bar

```

... again we want the two calls to be equivalent. But then I needed to reference the implicit tree of properties created by calling 'foo.bar' and 'foo.bar.baz' when I was interpreting these statements. So I needed to start tracking the symbols.

So my text-book meta-programming trick ...

```

 def propertyMissing(String name) {

   return name

 }

```

... stopped working since *foo.bar* would result in a property missing on the String object. I **could** do some meta-programming on the String object but I also wanted to preserve the tree relationship for other work later. So with that in mind I wrote a class to wrap the symbols.

But there's a problem with that. If I introduce this new class... there are many places I just want the symbol like 'foo.bar.baz' and not the complex relationship. And by this point in the project I've written a lot of code to deal with things as strings.

Wouldn't it be great if I could ignore the complex nature of the object most of the time... but pick out the complex bits when I wanted them? To that end I created this class *ComplexSymbol* to do that work. I empowered it to know how to turn itself into a string silently in all sorts of situations.

So I wrote some tests to express what I wanted to see...

```

assert symbol == "foo"

assert symbol.bar == "foo.bar"

assert symbol.baz.bing == "foo.baz.bing"

assert symbol.baz.blat == "foo.baz.blat"

assert symbol.bar.blat == "foo.bar.blat"

```

... and I wanted to see the class of Symbol silently swap in for String whenever the method that was being called was expecting a string and not a complex symbol.

Take a look at the class I came up with to do this job...

```

public class ComplexSymbol {

  ComplexSymbol parent

  String symbol

  Map symbols = [:]

  ComplexSymbol(String str) { symbol = new String(str) }

  ComplexSymbol(String str, ComplexSymbol other) {

      symbol = new String(str);

      parent = other

  }

  String toString() {

    if(parent) {

      return parent.toString() + "." + this.symbol

    }

    return symbol

  }

  def propertyMissing(String sym) {

    if(symbols.containsKey(sym)) {

        return symbols[sym]

    }

    def obj = new ComplexSymbol(sym,this)

    symbols[sym] = obj

    return obj

  }

  def asType(Class clazz) {

    Object obj = null

    switch(clazz) {

      case java.lang.String:

        obj = this.toString()

        break

    }

    return obj

  }

  boolean equals(Object other) {

    this.toString().equals(other.toString())

  }

}

```

I've got lots of explicit typing in places to document the use of the class since I expect this class to show up in Java and Groovy code. The typing is really for documentation as it should be.

In the class where I want ComplexSymbol to stand in for naked strings I now do this:

```

 def propertyMissing(String name) {

   return new ComplexSymbol(name)

 }

```

... which sets things up nicely so that the following works ...

```

  someMethod foo.bar.baz

```

... and someMethod should get called with a string "foo.bar.baz" but before we get to that point I need to sanity check things.

Now to test the class with some methods... I just dumped the text for the above class into a file called *symbols.groovy* and stuck these methods at the end of the script so I could call them.

```

boolean stringify(String str) {

    return str != null

}

```

This one should just see if it gets a string and I'll pass my ComplexSymbol to it and see if it gets the string.

```

boolean stringify(ComplexSymbol sym) {

    return stringify(sym as String)

}

```

This method explicitly takes the complex symbol and uses the asType explict cast on it. This should show that the cast works.

```

boolean implicitlyCast(String sym) {

    return sym != null

}

```

The implicit cast is my holy grail. If I can get the type system to see String whenever it asks for a String or the full ComplexSymbol type when it can handle that then I've got the *whole enchilada*.

```

/** Here's the tests again **/

def symbol = new ComplexSymbol("foo")

assert symbol == "foo"

assert symbol.bar == "foo.bar"

assert symbol.baz.bing == "foo.baz.bing"

assert symbol.baz.blat == "foo.baz.blat"

assert symbol.bar.blat == "foo.bar.blat"

assert stringify(symbol)

println "-" * 40

println symbol

println "-" * 40

println symbol as String

println "-" * 40

println symbol.toString()

println "-" * 40

assert implicitlyCast(symbol)

```

... command line output of this ...

```

$ groovy symbol.groovy

----------------------------------------

foo

----------------------------------------

foo

----------------------------------------

foo

----------------------------------------

Caught: groovy.lang.MissingMethodException: No signature of method: symbol.implicitlyCast() is applicable for argument types: (ComplexSymbol) values: [foo]

 at symbol.run(symbol.groovy:71)

```

Notice that the last assert (my holy grail) fails. What I have is a very nice **taco** if not the whole enchilada.

Methods like print and println are going to implicitly handle the ComplexSymbol properly since they'll call the toString() on the object. And for methods that don't call ".toString()" we can either call it for them or explicitly cast to a String just before calling them.

All and all, it's a nice compromise with static and dynamic typing that allows me to use this class in plain Java code or in Groovy code very easily.

If someone has some thoughts on how I can get **assert implicitlyCast(symbol)** to work I'd love to hear them. With out it though, it's simple enough to spot the problem in a test case and put "as String" in the call like so...

```

assert implicitlyCast(symbol as String)

```

... and as I have incorporated this class into my work I've found points where I *don't* want the implicit cast to work all the time! I actually want to go into ComplexSymbol and ask for the *symbol* property directly. It turns out I actually need to hold the leaf nodes by their leaf node value sometimes and having them automatically resolve to their whole name would cause problems.

So in the end I'm glad the implicitlyCast test doesn't work the way I imagined.

{% endraw %}
