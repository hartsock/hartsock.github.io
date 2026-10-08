---
excerpt_separator: ""
layout: "archive-post"
title: "Groovy Grails and your URL"
date: "2008-11-26T08:00:00.001-05:00"
description: "Getting the URL you are at in Grails is pretty easy. Just use the dependency injected properties inside your controller and some of the nifty Grails built-in helpers. For example, want to know the application you are run"
topics: ["software-design"]
original_labels: ["grails","groovy","tips"]
original_url: "https://hartsock.blogspot.com/2008/11/groovy-grails-and-your-url.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-11-26-groovy-grails-and-your-url/"
id: bafyr4ifiru26yu4wxy2rhl6zdrl7qcutsevgmc4pfbmzioes6rz7btdfre
permalink: /posts/groovy-grails-and-your-url-z7btdfre/
---
{% raw %}

Getting the URL you are at in Grails is pretty easy. Just use the dependency injected properties inside your controller and some of the nifty Grails built-in helpers.

For example, want to know the application you are running in? Each grails application controller will be able to grab this info from the grailsApplication object magically available to it via the power of dependency injection. That grailsApplication object will hold metadata about the project which is the info stored in the file application.properties...

```

def warName = grailsApplication.metadata.'app.name'

```

Want to know your controller? Each controller has the variable "controllerName" already for you to use.

So you could build a back link to your current controller using the request object and metadata like so:

```

def urlString =  request.scheme + "://" + request.serverName

     + ":" + request.serverPort

     + "/" + grailsApplication.metadata.'app.name'

     + "/" + controllerName + "/"

```

{% endraw %}
