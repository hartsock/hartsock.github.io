---
excerpt_separator: ""
layout: "archive-post"
title: "On the topic of Grails Audit Logging Plugin version 0.5.4"
date: "2010-10-14T08:55:00.006-04:00"
description: "Last night, I released a new version of my Audit Logging Plugin. Release notes are here. There had been an outstanding compatibility issue with Grails 1.3.x based on JUnit 4's Integration tests. The bug documented here h"
topics: ["software-design"]
original_labels: ["audit","database","grails","groovy","hibernate","junit"]
original_url: "https://hartsock.blogspot.com/2010/10/on-topic-of-grails-audit-logging-plugin.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2010-10-14-on-the-topic-of-grails-audit-logging-plugin-version-0-5-4/"
id: bafyr4igodwryzzqtpomhf5k2xjef7nzf5rdhwed7vtdhtmgt75v5c7w3ae
permalink: /posts/on-the-topic-of-grails-audit-logging-plugin-version-0-5-4-v5c7w3ae/
---
{% raw %}

Last night, I released a new version of my [Audit Logging Plugin](http://www.grails.org/plugin/audit-logging). Release notes are [here](http://jira.codehaus.org/browse/GRAILSPLUGINS/fixforversion/16581). There had been an outstanding compatibility issue with [Grails 1.3.x](http://www.grails.org/1.3+Release+Notes) based on JUnit 4's Integration tests. The bug documented [here](http://jira.codehaus.org/browse/GRAILSPLUGINS-2187) has been open for several months as I haven't had time to come back to the project to work on it.

Normally I don't blog about tickets but I figure this one requires some attention because I've run into a few plugins that I need in my day job that are "broken" in 1.3.x and I'm not sure who else is having these troubles. In the interest of helping the community as a whole I want to cover my experience.

It turns out that [GRAILSPLUGINS-2243](http://jira.codehaus.org/browse/GRAILSPLUGINS-2243) (titled "Integration tests with auditable domain class do not observe test transaction boundary") is actually a more accurate description of the actual bug. The symptom is during integration testing you can't delete entities that are audited. If you take the same code and run it in development or production mode you *can* delete the objects.

The issue with my code is in this block... (extraneous logging and debugging code removed)

```
Session session = sessionFactory.openSession()

def trans = session.beginTransaction()

def saved = session.merge(auditLogObject)

session.flush()

trans.commit()

session.close()

```

Keep in mind this block functions exactly as expected in Grails 1.2 under all environments I know of. The one environment this code is horribly wrong is Grails 1.3.x in Integration testing. Only at that time does this code cause a problem.

So let me ask you... what's wrong with this code?

Before addressing the real issue, questions I anticipate:

1. Why are you opening your own session?

Because on a transactional database in some cases the audit log must fire *after* the database insert so that I can log the automatically assigned object Id. This means you can't use the open session without invalidating it.

2. Why are you using merge and not save?

Because there are edge cases where the AuditLog object will be saved twice and I don't want to dictate the logic for that in this block to keep it simple

3. Why are you flushing the session?

Because we want to make sure the audit log is being written outside the regular transaction cycle and this particular session is going to perform no other job we want to ensure the log is written out to the database

So ... what is wrong with this code again?

```

def trans = session.beginTransaction()

```

Apparently, under **integration** testing in Grails 1.3.x if you start a transaction in the way I have you will cause a problem with the other independent transactions in the rest of the application. This is simply **not** the behavior I see in my production systems under Grails 1.2 or in my staging systems running Grails 1.3 for that matter.

My solution is a bit of a work around. In the application context initialization for the Audit Logging plugin (the bit that runs just as you start up your grails application I have a block that does this...

```

if( Environment.getCurrent() != Environment.PRODUCTION && ConfigurationHolder.config.auditLog?.transactional == null ) {

       transactional = false

}

```

... which simply says in environments that are *not* production (Notice I'm using the Grails 1.1 API to find that breaking compatibility with Grails 1.0) the boolean flag "transactional" is set to false. I then wrapped the begin and commit calls to the transaction around a check on this boolean. For good measure, I gave the end developer the ability to override this behavior using the setting "auditLog.transactional" in their Config.groovy file. *(It would figure that I would release this as a feature and someone needs to use those transactions in their integration testing because they run their testing environment against Oracle or something so here's an out for you to get the old behaviors)*

What took so much time to find this bug? It's not clear cut basically. I stumbled on this answer by blindly trying different things until I found a combination that worked. Then I tried to build a theory around this result that fit the facts that I had on hand.

My theory is the JUnit 4 integration environment does something to the session factory so it does not really produce new sessions such that the session that I get in my plugin's *listener* code is not really a separate session or transaction. I call commit on this transaction and when the session is returned to the normal GORM code it is already committed so the actual entity delete call can't happen and is swallowed.

What is disturbing about this is *I didn't invent* this technique for Audit Logging I'm implementing here. I created this code after being educated by [the Hibernate wiki](http://community.jboss.org/wiki/AuditLogging). This means if my theory holds it's not just a Grails application that will observe this strange-ness ... pretty much any Hibernate application with this kind of Audit Logging will be affected when integration tested under JUnit 4.

Beyond just this anyone developing applications that open their own sessions independent of the GORM session may potentially see bugs during *integration* testing that do not manifest in other environments. That can be a very difficult situation to deal with. So I've over documented things here for the benefit of the community at large.

In other news...

In other places I've noticed a change in Groovy 1.6 and 1.7's builder API. In particular I use RichUI in one project which makes calls like...

```

builder.yield(" var ${attrs.yuiVariableName}DataSource = new YAHOO.util.XHRDataSource(\"${attrs?.action}\");\n", false)

```

... under Groovy 1.6 *yeild* was a builder method.

(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjsttftqkn6SNq6s8ttFpmZDozZh_5b3d1RgW8fwQ5RJC27Ry8sQpxuYYjgVKF0ry04qANk43cI7N-TzZCUHv0jct7Ytz3zSyaIHffHLjNS23pbA2Rmg61mF8X0mD1zJRHCGHnHMA/s400/Screen+shot+2010-10-14+at+9.47.26+AM.png)

But, under Groovy 1.7 this method is not present. That means the HTML rendered by code that used the *yield* and *yieldUnescaped* calls now create tags <yield> and <yieldUnescaped> which breaks some pages (but not all).

So far these are the only surprising issues I've run into that has kept Grails 1.3.x off of my production servers. I haven't yet seen and great benefit to 1.3 so I can't say I'm deeply compelled to move to the new version.

I am looking to rewrite the plugin in light of [GRAILS-5725](http://jira.codehaus.org/browse/GRAILS-5725) but this will be a breaking change. Frankly, it's such a large change I'm surprised it was not pushed to Grails 1.4 ... however, it does not appear to interfere with the operation of plugins using the listener injection technique I am also using so no harm no foul.

I see I've lost a *whole star* in my plugin ratings so, my apologies to my end users who have not had a plugin that works with your Grails 1.3 integration tests. I sincerely hope I can earn back that extra star from you. Thanks for your support and help. I am reviewing code submissions for another version of the plugin coming up and I greatly appreciate your support.

{% endraw %}
