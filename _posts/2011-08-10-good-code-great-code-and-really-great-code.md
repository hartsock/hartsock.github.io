---
excerpt_separator: ""
layout: "archive-post"
title: "good code, great code, and really great code"
date: "2011-08-10T12:00:00.013-04:00"
description: "There's great software, and there's really great software. The stuff that's great is the stuff that works well and is well documented. Ever need to figure out something? Go read the docs, if you screw up then the softwar"
topics: ["software-design","documentation"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2011/08/good-code-great-code-and-really-great.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2011-08-10-good-code-great-code-and-really-great-code/"
id: bafyr4iak4sqsmdie475il7t4q3lhdpbolgadmhdwavjvwqlay7ppekn3oe
permalink: /posts/good-code-great-code-and-really-great-code-ppekn3oe/
---
{% raw %}

There's great software, and there's really great software. The stuff that's great is the stuff that works well and is well documented. Ever need to figure out something? Go read the docs, if you screw up then the software tells you exactly how you messed up and didn't follow the documentation. That's great software.

The best software (the really great stuff) doesn't require documentation. You can play with it and discover how to make it do what you want. You just have to poke about with it a little bit and it will guide you to a working use case. You don't have to read a book, understand a theory (beyond basic computer sciencey things) and you can get to work almost immediately.

This is accomplished through really good failure modes and support tools that help you figure out how to use the system. It's 100 time the work of documentation but it is 100 times better. The best form of this is really great test coverage. You need to have really great test coverage to show you the use cases the system designers were thinking of. That is the best documentation because if a developer changes their minds the tests must reflect the change in paradigm.

Then there's stuff like this:

[(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgH9wdp78USqDgG2h3AG7uge66KbuUq7VtQiaBL1kp1XeL4WWB_PEcZCP7NFmB6kTjBQ99dlDNREya9M-Z8RrLu_W9YrMPboen9MXInmeYGYGbnrVWvTXLF_IU8CS8oiLkMeJuEGg/s400/Screen+shot+2011-08-08+at+10.40.57+AM.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgH9wdp78USqDgG2h3AG7uge66KbuUq7VtQiaBL1kp1XeL4WWB_PEcZCP7NFmB6kTjBQ99dlDNREya9M-Z8RrLu_W9YrMPboen9MXInmeYGYGbnrVWvTXLF_IU8CS8oiLkMeJuEGg/s1600/Screen+shot+2011-08-08+at+10.40.57+AM.png)

This is from the [Sonatype Blog](http://www.sonatype.com/people/2009/06/integration-tests-with-maven-part-2-test-coverage-reports/). On its own this is a tiny mistake. A blog has had the POM XML fragment stripped out of it. A bit of spelunking on the web produces [this link](http://www.sonatype.com/people/2009/06/integration-tests-with-maven-part-2-test-coverage-reports/) as the definitive documentation for the plugin. Let's go and read the code for the plugin and see if we can't figure out what the missing tags are.

Over on github we find the [emma4it plugin's source code](https://github.com/sonatype/emma4it-maven-plugin). Diving this code we find that the project is actually pretty darn thin... and that's good because it is easy to understand. What does the JavaDoc say about how to configure this plugin? Thankfully there is at least documentation telling us what each of the Java files are for in the Maven lifecycle.

Does any of this include an example like the one Sonatype accidentally destroyed the only canonical example of in their blog? Sadly, no.

So my best guess is the first "report" word shown is a "report" id for the execution since we have more than one execution. My next guess is the phase we use in the documentation from the blog is different from the phase shown in the JavaDoc. The phase here is the "post-integration-test" phase by my guess. Next I have to take a wild leap. My guess is "project.build.sourcesDirectory" is the value set in the sourcesDirectory tag.This is my best guess at the missing POM fragment:

>  <execution>

 <id>report</id>

 <phase>post-integration-test</phase>

 <goals>

 <goal>report</goal>

 </goals>

 <configuration>

 <sourcesDirectory>

${project.build.sourcesDirectory}

 </sourcesDirectory>

 </configuration>

 </execution>

So by my estimation this is good code, that is on the cusp of being great code. That is still a ways from being really great code which wouldn't require you to dig around for documentation to begin with.

{% endraw %}
