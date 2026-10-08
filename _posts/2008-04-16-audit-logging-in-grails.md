---
excerpt_separator: ""
layout: "archive-post"
title: "Audit Logging in Grails"
date: "2008-04-16T15:52:00.015-04:00"
description: "EDIT: Audit Logging is now available via the grails command line tool $ grails install-plugin audit-logging Here's the story of how I ended up writing an AuditLogging plugin for Grails. I've posted the Grails Audit Loggi"
topics: ["software-design"]
original_labels: ["GORM","closures","grails","groovy","hibernate","java"]
original_url: "https://hartsock.blogspot.com/2008/04/audit-logging-in-grails.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-04-16-audit-logging-in-grails/"
id: bafyr4ide76dkmwgekizpjcn3bygitcrj5hz3vntplceiw3ja2b5whmuyju
permalink: /posts/audit-logging-in-grails-5whmuyju/
---
{% raw %}

EDIT: Audit Logging is now available via the grails command line tool

```
$ grails install-plugin audit-logging
```

Here's the story of how I ended up writing an AuditLogging plugin for Grails. I've posted the [Grails Audit Logging](http://docs.codehaus.org/display/GRAILS/Grails+Audit+Logging+Plugin) plugin [here](http://shawn.hartsock.googlepages.com/grails-audit-logging-0.1.zip). And I'll do a more formal write-up later. A [demo project](http://shawn.hartsock.googlepages.com/audit-test.zip) is here if you want to see it in action.

So, my story.

I have a project that I needs audit logging for certain objects in my domain. As usual (in the last six months) I started the project using Grails because of it's powerful and full featured GORM tool. GORM *in case you didn't already know* is built on top of Hibernate. So that means deep down we have the powerful hibernate events model to hook into.

A couple of years ago on the LAMP stack I would have written triggers in my database to handle the changes to certain tables. This would have the distinct disadvantage of not having any knowledge of the actual domain model that the table was supporting.

Today I can hook into Hibernate and get the same results keeping my domain class and triggers nice and close to each other.

Honestly, I would have probably went with the in database triggers and felt bad about it. Thank goodness I stumbled on [this blog entry](http://thegioraproject.com/2008/03/22/hibernate-events-plugin/) by [Kevin Burke](http://docs.codehaus.org/display/~kevin.burke) I would have had a much less interesting and satisfying project. Instead Kevin's influence caused me to create the AuditLogging plugin for Grails.

Kevin had the need to hook into the Hibernate Events model, and had already written the [Grails Hibernate Events Plugin](http://docs.codehaus.org/display/GRAILS/Hibernate+Events+Plugin). I was still a few weeks off from needing this plugin but I was glad to see it existed. Frankly, I'd be utterly lost without Kevin's plugin to show me how to work with Grails and Hibernate Events.

In true groovy fashion Kevin's work leans heavily on closures. He's added ten new conventions to GORM domain classes for use in the events plugin. I won't list them all there but the ones I was interested in were the *afterInsert*, *afterUpdate*, and *afterDelete* events and their matching closures.

When fired the event handler will call each closure from the matching *org.hibernate.event.*Listener* class. Kevin's project doesn't need to see the old values and compare them to the new values. So he doesn't pass these back down to the handlers defined in the class. Unfortunately for me. That's not going to work. I need audit logging and I need to be able to do custom things for some domain classes when certain values change. Pretty tall order actually.

I spent some time reading up on events in [Chapter 12](http://www.hibernate.org/hib_docs/reference/en/html/events.html) of the Hibernate 3 documentation. And taking a look at the [Hibernate documentation](http://www.hibernate.org/hib_docs/v3/api/org/hibernate/event/PreInsertEvent.html) I can see that any of the event objects nicely expose the Hibernate internals. In specific using the event object I can snag the EntityPersister that fired the event. That's interesting since I need to be able to see specifically what changed and throw one of 35 different event objects (that's a specific detail of my current project) out into GORM when it happens.

In particular I want to have a very groovy plugin that can be turned on and off for a given domain class using a convention like searchable does... I want it to be able to specify an "onChange" handler that can see old values and new values and do different things depending on what changed and how it changed... yeah... a pretty tall order.

That's why I'm so surprised at how easy this was to write. I was lucky to have the work of Rob Monie and even Kevin's Hibernate Events plugin to reference. The result is a plugin that you can use pretty simply.

To install my plugin just:

```

 $ grails install-plugin http://shawn.hartsock.googlepages.com/grails-audit-logging-0.1.zip

```

Then in your favorite domain class do this:

```

class MyClass {

  **static auditable = true**

  Long id

  Long version

  String someValue

  **

  def onChange = { newMap, oldMap ->

     oldMap.each({ key, oldVal ->

        if(oldVal != newMap[key]) {

            println " * $key changed from $oldVal to " + newMap[key]

        }

     })

  }**

}

```

Now when the class is acted on a new AuditLogEvent record will be inserted. The record will record when the event happened and what changed. If it's an insert or a delete then it will only record that the event happened.

What if you don't want every detail logged but only wanted that *onChange* handler? Then you can specify

```

  static auditable = [handlersOnly:true]

```

Now only the handlers you specify will be called. My plugin handles *onSave*, *onUpdate*, *onDelete*, and two types of *onChange*. The first type of *onChange* takes two parameters. The second kind takes none. In practice the no parameter *onChange* is identical to the *onUpdate*.

I'm putting this plugin to use in my project now. Hopefully someone else will find this useful. This work is still very rough but I will be torture testing the plugin in my own project which will have thousands of events per second. Any input is appreciated.

EDIT see also [Grails Audit Logging Plugin](http://docs.codehaus.org/display/GRAILS/Grails+Audit+Logging+Plugin)

{% endraw %}
