---
excerpt_separator: ""
layout: "archive-post"
title: "Deploying Grails 1.0.3 on JBoss 4.2.1"
date: "2008-06-12T11:38:00.001-04:00"
description: "Grails version 1.0.3 was recently released and if you blindly try and deploy this on to an old JBoss (I'm using 4.2.1) your deployment might fail giving you this trace: Exception sending context initialized event to list"
topics: ["software-design"]
original_labels: ["grails","groovy"]
original_url: "https://hartsock.blogspot.com/2008/06/deploying-grails-103-on-jboss-421.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-06-12-deploying-grails-1-0-3-on-jboss-4-2-1/"
id: bafyr4id2zzigdgo4wfjtctyskc6p7wuclx72lahjyqsnt5kw65o3qllitm
permalink: /posts/deploying-grails-1-0-3-on-jboss-4-2-1-o3qllitm/
---
{% raw %}

Grails [version 1.0.3](http://www.grails.org/1.0.3+Release+Notes) was recently released and if you blindly try and deploy this on to an old JBoss (I'm using 4.2.1) your deployment might fail giving you this trace:

```

Exception sending context initialized event to listener instance of class org.codehaus.groovy.grails.web.context.GrailsContextLoaderListener

org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'pluginManager' defined in ServletContext resource [/WEB-INF/applicationContext.xml]: Invocation of init method failed; nested exception is java.lang.NoClassDefFoundError: org/hibernate/annotations/common/reflection/ReflectionManager

        at java.security.AccessController.doPrivileged(Native Method)

```

You'll need to add the following jars (which you *could* take from grails-1.0.3/lib if you wanted) to your JBoss server's lib directory...

1. hibernate3.jar

2. hibernate-annotations.jar

3. hibernate-commons-annotations.jar

Why all three? Well, if you don't do all three you'll see...

```
Exception sending context initialized event to listener instance of class org.codehaus.groovy.grails.web.context.GrailsContextLoaderListener

org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'messageSource': Initialization of bean failed; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'transactionManager': Cannot resolve reference to bean 'sessionFactory' while setting bean property 'sessionFactory'; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'sessionFactory': Invocation of init method failed; nested exception is org.hibernate.AnnotationException: java.lang.NoSuchMethodException: org.hibernate.validator.ClassValidator.(java.lang.Class, java.util.ResourceBundle, org.hibernate.validator.MessageInterpolator, java.util.Map, org.hibernate.annotations.common.reflection.ReflectionManager)

```

... so drop all three in there and upgrade your JBoss server's version of Hibernate.

{% endraw %}
