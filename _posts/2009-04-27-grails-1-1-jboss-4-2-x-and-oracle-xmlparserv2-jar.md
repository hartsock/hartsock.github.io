---
excerpt_separator: ""
layout: "archive-post"
title: "Grails 1.1, JBoss 4.2.x, and Oracle xmlparserv2.jar"
date: "2009-04-27T06:00:00.000-04:00"
description: "If you want to use Grails 1.1 and the XMLType from oracle (the class is found in the Oracle jar xdb.jar) then you're going to need the Oracle xmlparserv2.jar in your Grails project. The problem is that Grails 1.1 will di"
topics: ["software-design"]
original_labels: ["Oracle","grails","groovy","jboss","xml"]
original_url: "https://hartsock.blogspot.com/2009/04/grails-11-jboss-42x-and-oracle.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2009-04-27-grails-1-1-jboss-4-2-x-and-oracle-xmlparserv2-jar/"
id: bafyr4ihuypss7tdg7jlbld5qkty5pubqqmyrdy6eydtjhakcu3qodelhku
permalink: /posts/grails-1-1-jboss-4-2-x-and-oracle-xmlparserv2-jar-qodelhku/
---
{% raw %}

If you want to use Grails 1.1 and the XMLType from oracle (the class is found in the Oracle jar xdb.jar) then you're going to need the Oracle xmlparserv2.jar in your Grails project. The problem is that Grails 1.1 will die if you just drop xdb.jar and xmlparserv2.jar into the lib directory of Grails. Why?

Well it turns out that [this post](http://www.jroller.com/hasant/entry/how_to_change_oracle_xml) tells you why. It was not cheap to find this answer at all... it cost me days of web surfing!

When you use JBoss in the $JBOSS_HOME/lib directory you'll find and endorsed sub-directory in there are two jars of particular interest to us. The xalan.jar and the xercesImpl.jar these provide the following services defined in their META-INF/services directories... xercesImpl.jar provides *javax.xml.parsers.DocumentBuilderFactory* and *javax.xml.parsers.SAXParserFactory* and the xalan.jar provides *javax.xml.transform.TransformerFactory*.

These three services are *also* supplied by the Oracle provided jar file xmlparserv2.jar and will effectively evict the JBoss provided implementations of these Java services. So what you have to do is replace the class references inside the xmlparserv2.jar with the *same* ones inside JBoss's endorsed libraries.

In short, explode xmlparserv2.jar then copy over the *javax.xml.parsers.DocumentBuilderFactory* and *javax.xml.parsers.SAXParserFactory* from xercesImpl.jar and the *javax.xml.transform.TransformerFactory* from the xalan.jar... re-jar the archive and redeploy.

{% endraw %}
