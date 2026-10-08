---
excerpt_separator: ""
layout: "archive-post"
title: "Frameworks, delicious frameworks..."
date: "2008-08-18T09:31:00.003-04:00"
description: "This blog has been on \"auto pilot\" for the last few weeks while I've been on vacation. As my reserve of scheduled articles has dried up I guess it's back to work. I'll be at the trijug meeting tonight. We'll be hearing f"
topics: ["software-design","science"]
original_labels: ["grails","groovy","java","jboss","spring"]
original_url: "https://hartsock.blogspot.com/2008/08/frameworks-delicious-frameworks.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-08-18-frameworks-delicious-frameworks/"
id: bafyr4ig6usahi2s2jrgzr6ritbgqargnaarf5m4s5xziox5ptfiluvmkny
permalink: /posts/frameworks-delicious-frameworks-iluvmkny/
---
{% raw %}

This blog has been on "auto pilot" for the last few weeks while I've been on vacation. As my reserve of scheduled articles has dried up I guess it's back to work. I'll be at the [trijug](http://trijug.org) meeting tonight. We'll be hearing from Hadrian Zbarcea about [Apache Camel](http://activemq.apache.org/camel/) which is yet another framework *on top* of Spring.

As I've noted previously in this blog, the J2EE space is being very effectively invaded by Spring. So effectively so that even J2EE Application Server provider JBoss provides [Embeddable EJB3](http://docs.jboss.org/ejb3/embedded/embedded.html) which is a sub-set (as of this writing) of the full EJB3 environment that can deploy on "light weight" containers such as tomcat.

If that last paragraph made no sense, try thinking of it this way... JBoss, WebSphere, and other Application Servers provide a host of services that are considered part of an "Enterprise" stack. These services sit underneath specific applications. These are things that are conceptually low level like messaging between processes/beans, facilities for looking up shared resources, data persistence and storage, and security. Things like HTTP, HTTPS, and such are considered additional services and are provided by applications. A typical J2EE application looks up the additional resources it needs as it runs. So when your bean initializes it has to do a lot of leg-work looking things up and initializing resources.

The EJB3 application standard is in part an Inversion of Control framework. In some situations using Java 5 annotations EJB3 beans specify what resources they need and the framework wires up those resources so that they are available. Most notably the Entity Manager is usually wired up using annotations and not using JNDI lookups. It's so radically different that we call the new paradigm JEE 5 in some circles... not only skipping the numbers 3 and 4 (which are ugly looking anyhow) and jumping right to (the sexy looking) number 5... but *also* moving the number to the end of the acronym so we can spot the noobs.

Spring works on this Inversion of Control (IoC) design principle and this is a key feature of Spring that Grails makes heavy use of. The design inverts the J2EE sensibility of having a bean init and then look up everything it needs. It puts the control of a bean's initialization in the hands of the framework. Working this way actually means that the majority of logic for how a application server works moves out of the application server itself and out of the application and *into* the framework and its configuration files.

That means you can run complex applications in simpler "containers" like tomcat and jetty. That makes server administration simpler for shops running smaller and simpler applications. Shops with larger and more complex applications can migrate their Spring applications to heavier more robust clustering Application Servers. So you have simple to scalable in these lighter frameworks.

But, without the conventions found in Grails, IoC and Spring applications become "XML-er-ific" and choc-full of XML-ly goodness. You end up having to specify nearly all the same lookups and wirings you were having to do under J2EE anyhow. You just move the work from compiled Java to light-weight XML. It's better but you don't really escape the work.

This configuration issue is where Grails shines. Grails removes the need for most configuration work by introducing conventions. Because Spring is still under Grails you can over-ride or change the conventions if you want or you can abide by them and get the full benefit of Grails. So once again Groovy and Grails provide you with the choice of staying as shallow or diving as deep as you need. A great benefit that is missing in most development frameworks which either force you to become an expert of force you to keep the training wheels on forever.

I'm curious to learn about [Apache Camel](http://activemq.apache.org/camel/) to see how they solved these issues. I'm also curious to see if JBoss will bring along their embeddable EJB3 to compete in this space. Obviously Groovy/Grails is my personal favorite but I'm always up for learning from others.

{% endraw %}
