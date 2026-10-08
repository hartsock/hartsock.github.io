---
excerpt_separator: ""
layout: "archive-post"
title: "Logging in a Unit Test of a Service in Grails"
date: "2008-02-25T15:39:00.007-05:00"
description: "Here's the scenario: You've got a grails project and you have a simple service you'd like to test. Let's say it's just something like: class MyService { boolean transactional = true def myMethod() { log.debug \"MyService."
topics: ["testing","software-design"]
original_labels: ["grails","groovy","testing"]
original_url: "https://hartsock.blogspot.com/2008/02/logging-in-unit-test-of-service-in.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-02-25-logging-in-a-unit-test-of-a-service-in-grails/"
id: bafyr4icp2beq7t5c46y2nc37aeb2dvbrixp4ehgvc56e7z43ezrosayole
permalink: /posts/logging-in-a-unit-test-of-a-service-in-grails-rosayole/
---
{% raw %}

Here's the scenario: You've got a grails project and you have a simple service you'd like to test. Let's say it's just something like:

```

class MyService {

    boolean transactional = true

    def myMethod() {

         log.debug "MyService.myMethod() was called!"

    }

}

```

If you were to hook up a quartz job to this service and then run "grails run-app" to test your service you would see the service happily chirruping away. Now if you were using Eclipse or some other IDE you might try to write an integration test of some kind and run that test from your IDE. You'll get an automatically generated test for that service if you used the grails commands... let's say you edit it so the test looks like:

```

class MyServiceTests extends GroovyTestCase {

     void testMyMethod() {

       def myService = new MyService()

       myService.myMethod()

     }

}

```

Now try and run that from your IDE. The test may fail with...

```

groovy.lang.MissingPropertyException: No such property: log for class: MyService

```

... what to do?

Grails is injecting the "log" property for you. That means if you want to test that class outside of Grails you'll need to do the same. So, you could do this:

```

import org.apache.log4j.*

class MyServiceTests extends GroovyTestCase {

     def myService

     def log

     void setUp() {

        // build a logger...

        BasicConfigurator.configure()

        LogManager.rootLogger.level = Level.DEBUG

        log = LogManager.getLogger("MyService")

        // use groovy metaClass to put the log into your class

        MyService.class.metaClass.getLog << {-> log}

        myService = new MyService()

     }

     void testMyMethod() {

       myService.myMethod()

     }

}

```

Now if you run this in your IDE you'll see your service pleasantly chirruping away in your IDE console window.

{% endraw %}
