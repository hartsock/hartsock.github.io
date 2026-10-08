---
excerpt_separator: ""
layout: "archive-post"
title: "TriJUG: Java FX"
date: "2007-09-18T10:45:00.000-04:00"
description: "A term I shall coin today is YAJAPPL (Yet Another JAva Platform Programming Language.) and I'll use it to refer to Groovy, JRuby, and Java FX. Last night's TriJUG meeting was a double header on Java FX and Java 6 update "
topics: ["software-design"]
original_labels: ["JavaFX","TriJUG","java"]
original_url: "https://hartsock.blogspot.com/2007/09/trijug-java-fx.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-09-18-trijug-java-fx/"
id: bafyr4idtcsdzz26k65j6asw5w7nuhz4fxtcmus5te2rfcygummz3dh3hgi
permalink: /posts/trijug-java-fx-z3dh3hgi/
---
{% raw %}

A term I shall coin today is YAJAPPL (Yet Another JAva Platform Programming Language.) and I'll use it to refer to Groovy, JRuby, and Java FX. Last night's [TriJUG meeting](http://trijug.org/meetinginfo.jsp?date=2007-09) was a double header on Java FX and Java 6 update 5. The big noise in Java land is over new programming languages that play on the JRE and tonight was no different.

First up, Java FX which is tagged in the press as Sun's answer to Flash. This summary doesn't do either Flash or FX justice. From what Raghavan "Rags" Srinivas showed us I'd say that the real strategic play here with Java FX is the creation of YAJAPPL (pronounced yah-juh-apple) which has a nifty concept in it called a "bind".

Java FX appears to be yet another language enamored with the associative array. Window definitions and graphical display elements are composed of associative arrays of associative arrays. What's different here is that you can bind an attribute in a display element to a value or method in another object. Demos I've seen include tying a radius to a time stepped method that causes the circle to grow or shrink.

This is a powerful concept in the long run since it means a true separation of the MVC elements and not just by virtue of enforcing this via policy. The Java FX code itself will force the separation. The graphical design tools will certainly help craft better looking Java applications in shorter time frames... but it's really that "bind" concept that's going to simplify development.

Next up was the Java 6 update 5 release and the introduction of the Java Kernel. To someone who is relatively new to the Java political landscape this looks like an update that was sorely needed and a long time in coming. From what I understand the upshot of the new release is that Java is no longer distributed monolithically. That means you download the Java Kernel and some browser plugins to start with.

The browser plugins are interesting in that they will allow scripts running on websites to detect the presence and version of Java installed in the browser the plugin is running in. Sun's goal will be to get as many browsers as possible to run these Java bootstrapping plugins so that way sites can detect Java and cause the JRE to download additional Java features as needed.

It would be very nice for Sun to consider doing something with these remote class loaders that would allow the formation of a comprehensive Java archive network that would allow the distribution of JAR files and the expression of their dependencies. The archive network could function as an open source clearing house that developers could use to get their proposed classes peer reviewed and that neophyte Java developers could use as an example of "good" Java. Projects in the network would have to under go a review process to be accepted to keep out cruft.

With the new browser plugins circulating allowing for piece-meal download of the JRE on an as needed basis it reduces the cost of the JRE from an enormous 10 MB to a merely huge 4 MB. This reduces a barrier to entry for some shops.

Ethan Nicholas mentioned that the JRE plugin was too large for Yahoo! to consider using for the Yahoo! Maps project. It didn't matter if Java was a superior development platform, had better API, or could do a better job all around. It only mattered that from a practical stand point the JRE was a heavy plugin.

Ethan's lesson to Sun is in my words: "It doesn't matter if you are better if they don't let you play."

And, this is the problem facing Java in this space. Java is on just about every cell phone out there but it doesn't matter if they don't let Java play. Java and Java FX appear to be better suited linguistically for their respective jobs than anything that Flash and ActionScript currently have but that doesn't matter if Flash has more developers, better tools, and an equal install base. Java won't even get to play.

Now, Java is open source. [Open JDK](http://openjdk.java.net/) is out there. But, I don't see it causing any earth quakes until around Java version 8. That quake is coming though and the people involved now will likely be the shakers.

{% endraw %}
