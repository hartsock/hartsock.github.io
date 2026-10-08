---
excerpt_separator: ""
layout: "archive-post"
title: "A nice bit of textbook groovy"
date: "2008-04-09T08:19:00.007-04:00"
description: "Groovy is just so groovy. I've been working in Groovy since August of 2007 but I still take such pleasure from little things like this... take some tokens def tokens = \"abc,def foo+bar bar foo\" now break them apart def p"
topics: ["software-design"]
original_labels: ["groovy"]
original_url: "https://hartsock.blogspot.com/2008/04/nice-bit-of-textbook-groovy.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-04-09-a-nice-bit-of-textbook-groovy/"
id: bafyr4ieardb2kttvm6imyjyp6foz6m6mlztitnjil2uhyjy6aqvgcoqrta
permalink: /posts/a-nice-bit-of-textbook-groovy-vgcoqrta/
---
{% raw %}

Groovy is just so groovy. I've been working in Groovy since August of 2007 but I still take such pleasure from little things like this... take some tokens

```

def tokens = "abc,def foo+bar bar foo"

```

now break them apart

```

def parts = tokens.split("[+,\\s]")

```

now make the array a list...

```

def list = parts.toList()

```

now get groovy with the list...

```

def words = list.unique()

```

... and check it against test case list ...

```

assert words == ["abc", "def", "foo", "bar"]

```

... and that just beats the socks off of stuffing the words in a hash then pulling out the keys. Putting it back together I have a single method now:

```

    static parseTags(String tagTokens) {

     return tagTokens.split("[+,\\s]").toList().unique()

    }

```

this method will pull apart a string with tagTokens and return a unique list of tags. Inspired by Graeme Rocher's book "The Definitive Guide to Grails" *Listing 9-8*. Literally a text book example of why Groovy is so groovy.

Back to our one-liner. I developed the return statement to the method *parseTags* using a groovy shell script. First, I put groovy in my path by editing my *.profile* or from the command line...

```

 $ export PATH=$PATH:/path/to/groovy/bin

```

Once you have that you can run the script from the command line. The whole script reads... (file name: test.groovy)

```
#!/usr/bin/env groovy

assert "abc,def foo+bar bar foo".split("[+,\\s]").toList().unique() == ["abc", "def", "foo", "bar"]

println "If this prints then it worked." // otherwise the script will bomb out on the previous line

```

Notice the *#!* it works because groovy is in our path. Now from the command line I run...

```

 $ groovy test.groovy

```

... if I *chmod* the test.groovy file executable it will run as a shell script. And that's just groovy. I can play with code now changing bits and re-running it over and over finding just the line I need. That little shell script is a test. In a Linux system it's the lightest test environment imaginable.

And this is a big deal because now I can script Java. I can call Java code from OS commands as easily as I call a shell script. It could mean I could write Java-esque scripting admin files to fire-up Java services like GlassFish or JBoss. That could be very groovy.

These little tweaks can make a huge difference.

{% endraw %}
