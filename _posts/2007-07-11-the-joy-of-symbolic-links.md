---
excerpt_separator: ""
layout: "archive-post"
title: "The joy of symbolic links"
date: "2007-07-11T09:43:00.000-04:00"
description: "I'm working with different versions of JBoss. My company has standardized on /usr/local/jboss as the home directory for JBoss. All JBoss servers will find their homes under /usr/local/jboss but we upgrade JBoss servers a"
topics: ["software-design"]
original_labels: ["administration","coding","howto","jboss","linux"]
original_url: "https://hartsock.blogspot.com/2007/07/joy-of-symbolic-links.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-07-11-the-joy-of-symbolic-links/"
id: bafyr4iamkpokqz6bkxvgzi5bfynlvbrtkfcibpzpuvxpjx2wqtjcn24knm
permalink: /posts/the-joy-of-symbolic-links-jcn24knm/
---
{% raw %}

I'm working with different versions of JBoss. My company has standardized on /usr/local/jboss as the home directory for JBoss. All JBoss servers will find their homes under /usr/local/jboss but we upgrade JBoss servers about once a year. As a developer often I'm swapping between production and test environments switching between JBoss versions.

For example today we are going to production with JBoss 4.0.5 but we are moving forward on JBoss 4.2.0 and I need to swap between the different versions for different projects. Now we already use symbolic links in production. Let me show you how those work.

The directory /usr/local/jboss is actually a symbolic link made like this:

$ sudo ln -s /usr/local/jboss-4.0.5 /usr/local/jboss

If we upgrade to jboss-4.2.0 I can simply remove the symbolic link and point it at the new directory like this:

$ sudo rm /usr/local/jboss && sudo /usr/local/jboss-4.2.0 /usr/local/jboss

And now my server is upgraded and there is an easy way to "fall back" should I need to.

But what if I'm a developer?

For my developer set up I'll head off to my home directory and then I'll make a JBoss directory where I'll keep all the various versions of JBoss that I'm using. I'll have a ~/jboss/jboss-4.0.5 and a ~/jboss/jboss-4.2.0 for example.

Next I'll make a symbolic link...

$ ln -s ~/jboss/jboss-4.2.0 ~/jboss/current

... and then I'll make one more symbolic link ...

$ sudo ln -s ~/jboss/current /usr/local/jboss

Now when I need to change my current working version of jboss...

$ rm ~/jboss/current && ln -s ~/jboss/jboss-4.0.5 ~/jboss/current

{% endraw %}
