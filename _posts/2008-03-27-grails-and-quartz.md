---
excerpt_separator: ""
layout: "archive-post"
title: "Grails and Quartz"
date: "2008-03-27T17:16:00.007-04:00"
description: "When an action takes longer than about 10 seconds to perform web developers have a problem. Basically you can't expect a user to sit around for 15 or 20 minutes while an action completes. In LAMP and RoR land we solve th"
topics: ["software-design"]
original_labels: ["cronjob","grails","groovy"]
original_url: "https://hartsock.blogspot.com/2008/03/grails-and-quartz.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-03-27-grails-and-quartz/"
id: bafyr4igdtzazcptbvcz2lnme4trs66jxf36gdw4doscjamx4wbgc5yojje
permalink: /posts/grails-and-quartz-gc5yojje/
---
{% raw %}

When an action takes longer than about 10 seconds to perform web developers have a problem. Basically you can't expect a user to sit around for 15 or 20 minutes while an action completes. In LAMP and RoR land we solve this problem by using a cronjob or messaging a daemon... in Grails we have something better *Quartz*.

The [Grails Quartz plugin](http://docs.codehaus.org/display/GRAILS/Quartz+plugin) may have a low version number but it's no slouch. The plugin works well and is easy to install. Once installed you can add Quartz jobs to the *grails-app/jobs* directory. And that's one reason Quartz is better than cron.

When creating a cronjob the job is separate from the project code. When creating a Quartz Job the quartz job's code is embedded inside the project that it supports. That's an advantage because it keeps the project together.

The way you schedule Quartz jobs in Grails has other advantages over cronjobs too. For example you can set a Quartz job to run every 5 seconds if you want. That's something you can't really do well in cron.

When working with cronjobs sometimes you have to instantiate separate connections to the database, file system, and other networking resources. That can occasionally mean you have to build up a separate instance of part of your framework just for your cronjob.

When working with Quartz jobs I will typically create a service to do the work. Quartz jobs in Grails can get at services by IoC conventions... which means you don't have to figure out how to wire up the Quartz job and the service. Instead just use the Grails naming conventions for example:

```

class MyJob {

   MyService myService

   def timeout = 5000l

   def execute() {

       myService.myMethod()

   }

}

```

... would be automatically wired up to an instance of the MyService class and would fire the execute method every five seconds. Working this way we don't have to worry about other problems we can have with cronjobs. For example, what if a job takes too long and a second instance of the cronjob fires while the first is still running? Many developers simply ignore this possibility and create really long delays between their jobs. We don't even have to worry about it working with Quartz and a service. If we mark MyService as transactional it will thread-lock keeping two copies from running at once.

For example:

```

class MyService {

  boolean transactional = true

  .... code ....

```

That transactional mark at the top of the class tells Grails to allow only one copy of this service to run at a time. It means a potentially hairy problem which could involve creating semaphores and locks can be completely avoided.

Coupled with the advantages of scheduling inside the job itself, keeping related code packaged together, and running jobs in the same framework as the services they use Grails + Quartz solves the problems of working with long running tasks in a browser window much better than just a cronjob.

{% endraw %}
