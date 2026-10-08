---
excerpt_separator: ""
layout: "archive-post"
title: "JBoss Portal 2.6.0 woe and the fix"
date: "2007-07-16T10:56:00.000-04:00"
description: "I recently posted a problem in JBoss Forum and got an answer. The problem was: 16:38:07,433 ERROR [StartupServletContextListener] Error initializing ServletContext java.lang.IllegalArgumentException: Class org.jboss.port"
topics: ["software-design"]
original_labels: ["fix","jboss","notes","portal","woe"]
original_url: "https://hartsock.blogspot.com/2007/07/jboss-portal-260-woe-and-fix.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-07-16-jboss-portal-2-6-0-woe-and-the-fix/"
id: bafyr4iaotxm2zjrtu3ej7aiblq2v6guzmiynas7kbwwp5ypdzw7wf2fvhq
permalink: /posts/jboss-portal-2-6-0-woe-and-the-fix-7wf2fvhq/
---
{% raw %}

I recently posted a problem in [JBoss Forum](http://www.jboss.com/index.html?module=bb&op=viewtopic&t=113509) and got an answer.

The problem was:

```

16:38:07,433 ERROR [StartupServletContextListener] Error initializing ServletContext

java.lang.IllegalArgumentException: Class org.jboss.portal.faces.portlet.JSFMetaBridgeViewHandlerImp

l is no javax.faces.application.ViewHandler

```

Which is consistent with deployment isolation issues. It turns out that you can't isolate the right classes between a 2.6.0 install of JBoss Portal and certain legacy JSF servlets. The class cast problem will follow you around.

The fix is to head on over to:

```

http://anonsvn.jboss.org/repos/portal/trunk

```

checking that out and running build/build.sh deploy on that... (make sure your JBOSS_HOME is set and no old versions of jboss-portal.sar are lying around). From the trunk directory...

```

 $ export JBOSS_HOME=/usr/local/jboss

 $ ./build/build.sh

```

After that life in JSF land is good. Very vexing problem if you are doing anything in JSF not specific to JBoss Portal

{% endraw %}
