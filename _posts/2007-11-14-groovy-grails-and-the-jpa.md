---
excerpt_separator: ""
layout: "archive-post"
title: "Groovy Grails and the JPA"
date: "2007-11-14T08:29:00.003-05:00"
description: "If you are using Grails 0.6 or later chances are the tutorials you've found for making EJB3 persistence annotated POJOs work with Grails don't match up exactly. If you're like me, probably need to be made aware of a few "
topics: ["software-design"]
original_labels: ["Annotations","ejb3","grails","groovy","java","jpa","mysql"]
original_url: "https://hartsock.blogspot.com/2007/11/groovy-grails-and-jpa.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-11-14-groovy-grails-and-the-jpa/"
id: bafyr4idpp7u5zypkanvzoptojovijymajh4g4myu2znmjix6sp7rhg6xtq
permalink: /posts/groovy-grails-and-the-jpa-7rhg6xtq/
---
{% raw %}

If you are using Grails 0.6 or later chances are the tutorials you've found for making EJB3 persistence annotated POJOs work with Grails don't match up exactly. If you're like me, probably need to be made aware of a few differences in configuration. They aren't big... but the little differences could trip you up.

First note my version of myApp/grails-app/conf/DataSource.groovy

```

import org.codehaus.groovy.grails.orm.hibernate.cfg.GrailsAnnotationConfiguration

dataSource {

    configClass = GrailsAnnotationConfiguration.class

    pooled = true

    dbCreate = "create-drop"

    driverClassName = "com.mysql.jdbc.Driver"

    dialect= org.hibernate.dialect.MySQLInnoDBDialect

    url = "jdbc:mysql://localhost:3306/grails"

    username = "grails"

    password = "grails"

}

```

Is not the same. Just because configClass = GrailsAnnotationConfiguration.class is set and your IDE says the class is found in this context doesn't mean that it's working for you... that import above still has to happen...

Next, I have added a file under "grails-app/conf/hibernate/hibernate.cfg.xml" and this part goes pretty much like the tutorials from last year... you register each class here one at a time. I need to research this one but I think grails mixes in this hibernate.cfg.xml with another one at run time so just stick to registering your classes. I tried to get fancy here and it didn't work out too well. My working hibernate.cfg.xml looks something like this:

```

<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE hibernate-configuration SYSTEM

 "http://hibernate.sourceforge.net/hibernate-configuration-3.0.dtd">

<hibernate-configuration>

  <session-factory>

    <mapping package="com.mycompany.shared.domain" />

    <mapping class="com.mycompany.shared.domain.Subject" />

   </session-factory>

</hibernate-configuration>

```

You'll need your Java files to be in "src/java" and annotated up. I will be trying to make a shared JAR file full of only the shared domain objects for the various projects that need them. I don't know how well this is going to work but my idea is to create one set of JPA annotated EJB3 Entity classes and put them in a JAR and share them between various Spring applications. I don't know if that's a good idea or not...

Finally, you'll need to get the compiled class files for these annotated POJOs into "web-app/WEB-INF/classes" that means you need to do a "grails run-app" or similar first so that the Java files get compiled into classes and dropped into the "web-app/WEB-INF/classes" directory.

Once that is done you can run the "grails generate-all" command on your Java classes.

If you're interested in working through the EJB3 examples I have posted [ejb3_grails.zip](http://shawn.hartsock.googlepages.com/ejb3_grails.zip) which uses this [tutorial](http://www.infoq.com/articles/grails-ejb-tutorial) by Jason Rudolph but also uses [Grails](http://grails.org) version 1.0_RC1 and the Groovy [Eclipse Plugin](http://groovy.codehaus.org/Eclipse+Plugin).

**EDIT**: in version 1.0 and higher recent experience shows that if you set the [Eclipse Groovy plugin](http://grails.org/Eclipse+IDE+Integration) to output to *bin* and set the build path of the Java compiler to output to *project/bin* class resolution will work fine for the IDE. When Grails itself goes to run the application or build the WAR file, the right class files will make it into "WEB-INF/classes" since Grails uses a separate class cache anyhow. It seems the reason I advised to output Groovy and Java classes to "web-app/WEB-INF/classes" is [no longer true](http://hartsock.blogspot.com/2008/03/working-with-grails-101-inside-eclipse.html).

{% endraw %}
