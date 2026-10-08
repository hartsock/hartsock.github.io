---
excerpt_separator: ""
layout: "archive-post"
title: "Learning more about Hibernate: Grails Audit Logging v0.2"
date: "2008-04-21T16:15:00.005-04:00"
description: "Very important changes in version 0.2, the mapping method I had written did this: def nameMap = [:] for(int ii=0; ii def obj = newState[ii] entity.properties.each({ key,val -> if(val.is(obj)) { nameMap[ii] = key } }) } ."
topics: ["software-design"]
original_labels: ["GORM","events","grails","groovy","hibernate","plugin"]
original_url: "https://hartsock.blogspot.com/2008/04/learning-more-about-hibernate-grails.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-04-21-learning-more-about-hibernate-grails-audit-logging-v0-2/"
id: bafyr4ibit65jpkppuwknqw45qrzrhalze67ujzz63mcr6m3cz3sukg32mu
permalink: /posts/learning-more-about-hibernate-grails-audit-logging-v0-2-sukg32mu/
---
{% raw %}

Very important changes in [version 0.2](http://shawn.hartsock.googlepages.com/grails-audit-logging-0.2.zip), the mapping method I had written did this:

```
def nameMap = [:]

for(int ii=0; ii    def obj = newState[ii]

    entity.properties.each({ key,val ->

        if(val.is(obj)) {

            nameMap[ii] = key

        }

    })

}
```

... but I found that I could do this instead ...

```
def persister = event.getPersister()

def nameMap = persister.getPropertyNames()
```

This fixes a bug in the onChange event handler that meant you couldn't see the old value on properties that had been set *to* null. Hit this in one of my test cases Friday afternoon.

Other tests show that it's impossible to fire onUpdate and not onChange so I've backed out the onUpdate event handler. In my working version I've also allowed each of the other events to catch either old or new values as a LinkedHashMap object.

Other annoyances were that when the version changed this was logged as an event by when the Audit Logger was set to verbose mode. (The version I posed had 'detailed = false' which disabled verbose logging.) I've made 'version' a special property that is not logged or reported as a change.

Some of the changes have the tidy side-effect of making things faster.

{% endraw %}
