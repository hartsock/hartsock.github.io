---
excerpt_separator: ""
layout: "archive-post"
title: "Inside Hibernate Events and Audit Logging with Grails Plugins"
date: "2008-04-18T21:02:00.004-04:00"
description: "Previously, I wrote about how I was able to take components posted on hibernate.org and reference the configuration files of other plug-ins to craft a plug-in for Grails that used the Hibernate Events model to create an "
topics: ["software-design"]
original_labels: ["GORM","events","grails","groovy","hibernate","plugin"]
original_url: "https://hartsock.blogspot.com/2008/04/inside-hibernate-events-and-audit.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-04-18-inside-hibernate-events-and-audit-logging-with-grails-plugin/"
id: bafyr4iardv6mk3irzbedk2rwrjfofyjqmpibwlvpde2ojaaw7umwik2l4a
permalink: /posts/inside-hibernate-events-and-audit-logging-with-grails-plugin-mwik2l4a/
---
{% raw %}

Previously, I wrote about how I was able to take components posted on [hibernate.org](http://www.hibernate.org/318.html) and reference the configuration files of [other plug-ins](http://thegioraproject.com/2008/03/22/hibernate-events-plugin/) to craft a plug-in for Grails that used the Hibernate Events model to create an Audit Logging system for my Grails projects. I've posted the [Grails Audit Logging Plugin](http://docs.codehaus.org/display/GRAILS/Grails+Audit+Logging+Plugin) that I'm using in my own mission critical projects. You can download and unzip the plug-in (or just install it into a Grails project) to read every delicious line of source code if you want to.

Before yesterday, I had no experience with Hibernate event listeners and no experience with Grails plug-ins yet in a *single day* I was able to create what might be a rather sophisticated plug-in for Grails using internet available resources. I'd love to know if anyone else uses this project or is inspired by it to do some other work based on it. This is my detailed write-up of the experience.

When I wanted audit logging in Grails, I wanted something that looked like other Grails features. I wanted to create a class that looked like:

```

class Person {

   **static auditable = true**

   Long id

   Long version

   String firstName

   String middleName

   String lastName

   String email

    **def onChange = { oldMap,newMap ->

        println "Person was changed ..."

        oldMap.each({ key, oldVal ->

            def newVal = newMap[key]

            if(oldVal != newVal) {

                println "  * $key from $oldVal to $newVal "

            }

        })

    }**

}

```

... and would automatically get Audit Logging and onChange event handlers that could examine the old and new values and act accordingly. (Audit Logging makes our DBA happy. And, we need to have different behaviors based on exactly *how* a value changed.) It was surprisingly easy to extend Grails to add these behaviors and I can't believe I was able to learn the plug-in architecture, learn Hibernate Events, and create a usable plug-in in only a day. If I can do it you can too.

In this post I'd like to dissect what I did to create an Audit Logging plug-in for Grails. It should shed some light on a few things. Hopefully it will inspire developers who are more talented than I am to do some really great work. There's really not that much to it and you can easily do this for yourself.

Firstly, creating Grails plug-ins is absolutely a joy. Just like creating any other project in grails you start with the command line. To create a plug-in project...

```

 $ grails create-plugin audit-logging

```

... and the result is a Grails project. All the conventions you would be familiar with in creating a Grails application are there. It's the same set of folders with an additional file... *AuditLoggingGrailsPlugin.groovy* that appears by magic in the root of the project. The file name is a simple variation of the name you gave the plug-in. This file is one of the things that distinguishes this project as a plug-in project. We'll come back to this file later. But remember this is the file that tells Grails what to do with your plug-in and how to install it into the Spring run-time.

In my project I wanted to create a Groovy class that could be wired into the Hibernate Events Model. I had played with a Hibernate Interceptor but the Hibernate Event model does what I need so well there's really no need for the interceptor. Either way, it really pays to carefully select what events you want to listen to. Certain events will have data that certain other events don't.

After some trial and error I found that for the purpose of an audit log the events that we care about are just *before* an entity is deleted, just *after* it is inserted, and just *after* it has been updated.

- You want to be invoked *before* the entity is deleted so you can optionally log all the values that the entity used to have before it was destroyed.

- You want to be invoked *after* the entity is inserted so you can reference any auto generated id numbers or version numbers and log them.

- You want to be invoked *after* an update because the [PostUpdateEvent](http://www.hibernate.org/hib_docs/v3/api/org/hibernate/event/PostUpdateEvent.html) object will have the old state and the current state (or new state) of the entity in it and you can log any changes.

So let's first create a Listener class that implements these listeners:

```

class AuditLogListener implements PreDeleteEventListener,

  PostInsertEventListener, PostUpdateEventListener, Initializable {

```

Each of those interfaces will demand their own methods... specifically...

```

public boolean onPreDelete(final PreDeleteEvent event) {

```

...

```

public void onPostInsert(final PostInsertEvent event) {

```

... and ...

```

public void onPostUpdate(final PostUpdateEvent event) {

```

we want to go "static typed" here since the classes calling us are Java classes and we want to be very clear which method it is that implements the interface.

While I've only used three event listeners here, it's true of all the pre-event listeners in hibernate that they return true if and only if the alter something in the event. So to be extra cautious here we've declared our parameters final. We won't be mucking about with event objects before or after the fact. The final keyword makes this explicit.

Next, we'll want to record log entries from the listener class. To do this my plug-in introduces an additional domain class. If the root folder of our project is *audit-logging* then the domain class is at *audit-logging/grails-app/domain/AuditLogEvent.groovy* and looks like this:

```

class AuditLogEvent {

 Long id

 Long version

 Date dateCreated

 Date lastUpdated

 String actor

 String className

 String persistedObjectId

 String eventName

 String propertyName

 String oldValue

 String newValue

 static constraints = {

  actor(nullable:true)

  className(nullable:true)

  persistedObjectId(nullable:true)

  eventName(nullable:true)

  propertyName(nullable:true)

  oldValue(nullable:true)

  newValue(nullable:true)

 }

 static mapping = {

  table 'audit_log'

 }

}

```

... this class isn't special. It's just another domain class like any other GORM domain class. In fact if I wanted to be evil I could label the AuditLogEvent class as an "auditable" class for my plug-in later. That would mean I would get trapped in an infinite recursion of audit logging. The first logged insert into the database would trigger an audit log insert which would trigger an audit log insert which would trigger an audit log insert... and so on...

I elected to map this domain class to the table 'audit_log' and that's just a personal taste issue. I feel that one row in the audit log is a single event but the whole list of events is a log. I hope it doesn't confuse anyone. It does read better from SQL for our DBA.

Grails will allow us to call save on a new object of class AuditLogEvent from inside the listener so we don't have to mess around with pulling out session factories from our event objects. This is a really nice feature of working with GORM in Grails.

To do really simple audit logging from any of our events all we need to do in the Grails environment is:

```

def entity = event.getEntity()

def className = entity.getClass().getName()

def eventName = 'INSERT'

def persistedObjectId = getEntityId(event)

new AuditLogEvent(

    className:className,

    eventName:eventName,

    persistedObjectId:persistedObjectId.toString()

).save()

```

In a straight Spring environment we would have a great deal more code to write. Take a look at what is essentially the same event handler in straight [Java and Hibernate](http://www.hibernate.org/318.html#A3) and compare that to the Grails listener in my project, it's much more work to handle the event in straight Java and Hibernate. Groovy and Grails make the job much easier.

One of the things that was much easier for example was to have the *onChange* handler receive the "old" and "new" states as a Map objects. Firstly, the map objects are at least more mnemonic to work with than arrays of Objects secondly... creating the maps was much simpler in Groovy. Let me explain...

The *onPostUpdateEvent* event provides us with two arrays of objects. First is the *OldState* array and second is the *State* array. I could not find an API that could tell me what parameter is in what ordinal position in these Object arrays. That meant that I could see what things changed from and to... but not which things... when I reference the entity it is the entity as it exists in its new state. But, there's no corresponding old state. So I wrote a block of Groovy to create a mapping of ordinal positions to property key names. It was surprisingly easy going take a look...

```

def nameMap = [:]

for(int ii=0; ii<newState.length; ii++) {

    def obj = newState[ii]

    entity.properties.each({ key,val ->

        if(val.is(obj)) {

            nameMap[ii] = key

        }

    })

}

```

... at the end of that I have a mapping of numbers to keys. I do this by using the Groovy *is* method. This is the Groovy *identity* comparison. Remember, since equality in Groovy means *value equality* (an intuitive meaning) you need a different operator to compare identity. Now I can build my *newMap* and my *oldMap* like so...

```

for(int ii=0; ii<newState.length; ii++) {

    oldMap[nameMap[ii]] = oldState[ii]

    newMap[nameMap[ii]] = newState[ii]

}

```

... and the maps are ready to be used as parameters to my logger method so it can record what column changed and what the new and old values are. And as a nice side effect I can now invoke the *onChange* handler with old and new maps representing the old and new parameters respectively.

I could go line by line through the event listener but I don't think I'll do that in this post. Instead I'll post the listener and let the interested pick it apart. Remember you can see the source code in the plug-in download too...

```

/**

 * @author shawn hartsock

 *

 * Grails Hibernate Interceptor for logging

 * saves, updates, deletes and acting on

 * individual properties changes... and

 * delegating calls back to the Domain Class

 *

 * This class is based on the post at

 * http://www.hibernate.org/318.html

 *

 * 2008-04-17 created initial version 0.1

 */

import org.hibernate.EntityMode;

import org.hibernate.StatelessSession;

import org.hibernate.HibernateException;

import org.hibernate.cfg.Configuration;

import org.hibernate.event.Initializable;

import org.hibernate.event.PreDeleteEvent;

import org.hibernate.event.PreDeleteEventListener;

import org.hibernate.event.PostInsertEvent;

import org.hibernate.event.PostInsertEventListener;

import org.hibernate.event.PostUpdateEvent;

import org.hibernate.event.PostUpdateEventListener;

public class AuditLogListener implements PreDeleteEventListener,

        PostInsertEventListener, PostUpdateEventListener, Initializable {

    static detailed = false // TODO back off into configuration file

    // only returns auditable entities

    def isAuditableEntity(event) {

        if(event && event.getEntity()) {

            def entity = event.getEntity()

            if(entity.metaClass.hasProperty(entity,'auditable') && entity.'auditable') {

                return true

            }

        }

        return false

    }

    /**

     *  we allow user's to specify

     *       static auditable = [handlersOnly:true]

     *  if they don't want us to log events for them and instead have their own plan.

     */

    boolean callHandlersOnly(entity) {

        if(entity && entity.metaClass.hasProperty(entity,'auditable') && entity.'auditable') {

            if(entity.auditable.getClass() == java.util.LinkedHashMap.class &&

                    entity.auditable.containsKey('handlersOnly')) {

                return (entity.auditable['handlersOnly'])?true:false

            }

            return false

        }

        return false

    }

    def getEntityId(event) {

        if(event && event.entity) {

            def entity = event.getEntity()

            if(entity.metaClass.hasProperty(entity,'id') && entity.'id') {

                return entity.id.toString()

            }

            else {

                // trying complex entity resolution

                return event.getPersister().hasIdentifierProperty() ? event.getPersister().getIdentifier(event.getEntity(), event.getPersister().guessEntityMode(event.getEntity())) : null;

            }

        }

        return null

    }

    /**

     * We must use the preDelete event if we want to capture

     * what the old object was like.

     */

    public boolean onPreDelete(final PreDeleteEvent event) {

        try {

            if(isAuditableEntity(event) && ! callHandlersOnly(event.getEntity())) {

                def entity = event.getEntity()

                def actor = "" // Need to figure out how to get the actor id somehow...

                def entityName = entity.getClass().getName()

                def entityId = getEntityId(event)

                logChanges(null,event.getEntity().properties,null,entityId,'DELETE',entityName)

            }

            executeSimpleHandler(event,'onDelete')

        } catch (HibernateException e) {

            println "Audit Plugin unable to process DELETE event"

            e.printStackTrace()

        }

        return false

    }

    /**

     * I'm using the post insert event here instead of the pre-insert

     * event so that I can log the id of the new entity after it

     * is saved. That does mean the the insert event handlers

     * can't work the way we want... but really it's the onChange

     * event handler that does the magic for us.

     */

    public void onPostInsert(final PostInsertEvent event) {

        try {

            if(isAuditableEntity(event) && ! callHandlersOnly(event.getEntity())) {

                def entity = event.getEntity()

                def actor = "" // Need to figure out how to get the actor id somehow...

                def entityName = entity.getClass().getName()

                def entityId = getEntityId(event)

                logChanges(event.getEntity().properties,null,null,entityId,'INSERT',entityName)

            }

            executeSimpleHandler(event,'onSave')

        } catch (HibernateException e) {

            println "Audit Plugin unable to process INSERT event"

            e.printStackTrace()

        }

        return;

    }

    /**

     * Now we get fancy. Here we want to log changes...

     * specifically we want to know what property changed,

     * when it changed. And what the differences were.

     *

     * This works better from the onPreUpdate event handler

     * but for some reason it won't execute right for me.

     * Instead I'm doing a rather complex mapping to build

     * a pair of state HashMaps that represent the old and

     * new states of the object.

     *

     * The old and new states are passed to the object's

     * 'onChange' event handler. So that a user can work

     * with both sets of values.

     *

     * Needs complex testing BTW.

     */

    public void onPostUpdate(final PostUpdateEvent event) {

        def entity = event.getEntity()

        def entityName = entity.getClass().getName()

        def entityId = event.getId()

        // object arrays representing the old and new state

        def oldState = event.getOldState()

        def newState = event.getState()

        // The event API only gives us an array of

        // objects representing the new and old states

        // so we need to use the identity comparison to

        // create a name mapping for each state's

        // ordinal positions.

        def nameMap = [:]

        for(int ii=0; ii<newState.length; ii++) {

            def obj = newState[ii]

            entity.properties.each({ key,val ->

                    if(val.is(obj)) {

                        nameMap[ii] = key

                    }

            })

        }

        def oldMap = [:]

        def newMap = [:]

        for(int ii=0; ii<newState.length; ii++) {

            oldMap[nameMap[ii]] = oldState[ii]

            newMap[nameMap[ii]] = newState[ii]

        }

        // allow user's to over-ride whether you do auditing for them.

        if(! callHandlersOnly(event.getEntity())) {

                logChanges(newMap,oldMap,event,entityId,'UPDATE',entityName)

        }

        executeSimpleHandler(event,'onUpdate')

        if(hasChanged(oldState,newState)) {

            executeComplexHandler(event,'onChange',oldMap,newMap)

        }

    }

    private boolean hasChanged(oldState,newState) {

        for(int ii = 0; ii            if(oldState[ii] != newState[ii]) {

                return true

            }

        }

        return false

    }

    public void initialize(final Configuration config) {

        // TODO Auto-generated method stub

        return

    }

    static excludedProps = [

                            'id','version',

                            'log','class','errors',

                            'auditable','constraints',

                            'mapping','searchable'

                          ]

    def logChanges(newMap,oldMap,parentObject,persistedObjectId,eventName,className) {

        if(newMap && oldMap) {

            newMap.each({key,val->

                if(!excludedProps.contains(key)) {

                    if(val != oldMap[key]) {

                        def audit = new AuditLogEvent(

                            actor:'', // TODO figure out how to log the actor later

                            className:className,

                            eventName:eventName,

                            persistedObjectId:persistedObjectId.toString(),

                            propertyName:key,

                            oldValue:oldMap[key].toString(),

                            newValue:newMap[key].toString()

                        )

                        if(!audit.save()) {

                            println audit.errors

                        }

                    }

                }

            })

        }

        else if(newMap && detailed) {

            newMap.each({key,val->

                if(!excludedProps.contains(key)) {

                    def audit = new AuditLogEvent(

                            actor:'', // TODO figure out how to log the actor later

                            className:className,

                            eventName:eventName,

                            persistedObjectId:persistedObjectId.toString(),

                            propertyName:key,

                            oldValue:null,

                            newValue:val.toString(),

                        )

                    if(!audit.save()) {

                        println audit.errors

                    }

                }

            })

        }

        else if(oldMap && detailed) {

            oldMap.each({key,val->

                if(!excludedProps.contains(key)) {

                    def audit = new AuditLogEvent(

                            actor:'', // TODO figure out how to log the actor later

                            className:className,

                            eventName:eventName,

                            persistedObjectId:persistedObjectId.toString(),

                            propertyName:key,

                            oldValue:val.toString(),

                            newValue:null

                        )

                    if(!audit.save()) {

                        println audit.errors

                    }

                }

            })

        }

        else {

            // I think this is dead code now...

            def audit = new AuditLogEvent(

                    actor:'', // TODO figure out how to log the actor later

                    className:className,

                    eventName:eventName,

                    persistedObjectId:persistedObjectId.toString()

                )

            if(!audit.save()) {

                // TODO don't use println...

                println audit.errors

            }

        }

        return

    }

    def executeSimpleHandler(event,handler) {

        def entity = event.getEntity()

        if(isAuditableEntity(event) && entity.metaClass.hasProperty(entity,handler)) {

            try {

                entity."${handler}"(getEntityId(event))

            } catch (groovy.lang.MissingMethodException mme) {

                // TODO don't use println here...

                println "${handler} has to take no parameters!"

            }

        }

    }

    def executeComplexHandler(event,handler,oldState,newState) {

        def entity = event.getEntity()

        if(isAuditableEntity(event) && entity.metaClass.hasProperty(entity,handler)) {

            try {

                entity."${handler}"(oldState,newState)

            } catch (groovy.lang.MissingMethodException mme) {

                try {

                    entity."${handler}"()

                } catch (groovy.lang.MissingMethodException mme2) {

                    // TODO don't use println here...

                    println "${handler} has to take two or no parameters!"

                }

            }

        }

    }

}

```

Now once you've got your listener in just the shape you need it in. Take a look at the plug-in file *AuditLoggingGrailsPlugin.groovy* again.

There are several [closures](http://groovy.codehaus.org/Closures) that while not documented extensively are rather self explanatory. In our example plug-in project we will are hooking into the GORM session factory. That means we want to work in the *doWithApplicationContext* closure.

This closure takes a parameter which by default is set up as the *applicationContext* if you take a look at the source code for [The Hibernate Events Plugin](http://docs.codehaus.org/display/GRAILS/Hibernate+Events+Plugin) you can see in the file *HibernateEventsGrailsPlugin.groovy* how [Keving Burke](http://docs.codehaus.org/display/~kevin.burke) has used the application context to get the sessionFactory and then registered the listeners with the session factory. I've only slightly adapted this here...

```

   def doWithApplicationContext = { applicationContext ->

        def listeners = applicationContext.sessionFactory.eventListeners

        def listener = new AuditLogListener()

        ['preDelete','postInsert', 'postUpdate',].each({

           addEventTypeListener(listeners, listener, it)

        })

   }

```

This closure is very interesting, it is pulling the sessionFactory out of the applicationContext and getting the array of eventListeners. Then we create an instance of our new event listener... finally we register the event listener with the session factory for each type of event it can accept.

The next method is very *Groovy* we are creating a string name for the particular type of event listener and then using Groovy's *Meta* features to extract the array of listeners of that type. The rest of the method is about manipulating the object array and registering the new listener.

```

    def addEventTypeListener(listeners, listener, type) {

        def typeProperty = "${type}EventListeners"

        def typeListeners = listeners."${typeProperty}"

        def expandedTypeListeners = new Object[typeListeners.length + 1]

        System.arraycopy(typeListeners, 0, expandedTypeListeners, 0, typeListeners.length)

        expandedTypeListeners[-1] = listener

        listeners."${typeProperty}" = expandedTypeListeners

    }

```

.. this is a very clever twist that injects a set of new listeners into the already created sessionFactory and does so using Groovy specific programming tricks. That call to *listeners."${typeProperty}"* is dynamically getting at "preDeleteEventListeners" and "postUpdateEventListeners" each in turn. That's very groovy. The method's result is a modified and registered listener array inside a running sessionFactory. Very cool.

Now that we have a listener and code to register the listener we need to run the packager to get the plug-in ready to be installed in another Grails project. Inside the project folder just run...

```

 $ grails package-plugin

```

... in my example project this command produces the zip file *grails-audit-logging-0.1.zip*. Now to install your new plug-in in any Grails project just specify the path and use the *grails plugin-install* command. For example from another project you would install the *audit-logging* plug-in with this command...

```

 $ grails install-plugin ../audit-logging/grails-audit-logging-0.1.zip

```

Now when you run your grails application you should see that the plug-in is installed and you can start using the plug-in's domain class conventions.

*NOTE: I've posted the *grails-audit-logging-0.2.zip* plugin [here](http://shawn.hartsock.googlepages.com/grails-audit-logging-0.2.zip) and I've written it up [here](http://docs.codehaus.org/display/GRAILS/Grails+Audit+Logging+Plugin) if you are just interested in audit logging.*

You've seen how easy it is create a grails plug-in that can do very sophisticated things using Java, Hibernate, and Spring API's. This type of project shows the real strength of Groovy and Grails by allowing you to leverage existing Java libraries and code to create new kinds of features rapidly and easily that would have been more work in some other frameworks.

I hope this inspires you to create your own plug-ins that do amazing things and add to the power of the Grails framework. Happy coding!

{% endraw %}
