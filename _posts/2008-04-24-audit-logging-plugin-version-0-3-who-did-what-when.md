---
excerpt_separator: ""
layout: "archive-post"
title: "Audit Logging Plugin version 0.3: who did what when"
date: "2008-04-24T20:06:00.006-04:00"
description: "When I posted my Audit Logging plug-in I had no idea how to get at the user name of the person using the session. I posted a question on the Grails Dev forum. And the answer supplied by pftravis lead me this... static St"
topics: ["software-design"]
original_labels: ["CAS","audit","grails","groovy","logging","plugin","trace"]
original_url: "https://hartsock.blogspot.com/2008/04/audit-logging-plugin-version-03-who-did.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-04-24-audit-logging-plugin-version-0-3-who-did-what-when/"
id: bafyr4ibt4lhmnruldqa7m7hrtjqsh7p7guau3eiqj4zgbnp7d4yve4vjxq
permalink: /posts/audit-logging-plugin-version-0-3-who-did-what-when-yve4vjxq/
---
{% raw %}

When I posted my Audit Logging plug-in I had no idea how to get at the user name of the person using the session. I posted [a question](http://www.nabble.com/Question%3A-How-to-inject-a-session-property-in-a-GORM-Hibernate-Event--td16824282.html#a16824282) on the Grails Dev forum. And the answer supplied by [pftravis](http://www.nabble.com/user/UserProfile.jtp?user=1207023) lead me this...

```

    static String actorKey = 'userPrincipal.name'

    static String sessionAttribute = null

    def getActor() {

        def attr = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes()

        def actor = null

        if(sessionAttribute) {

            actor = attr?.session?.getAttribute(sessionAttribute)

        }

        else {

            actor = resolve(attr,actorKey)

        }

        return actor

    }

```

... if there is no configuration the default will read the 'userPrincipal.name' from the context. In my set up of the listener I read in the Config.groovy from the grails project and if there is a configuration like this...

```

auditLog {

   actorKey = "session.user.name"

}

```

...then I'll use a clever little groovy trick to resolve the session, user, and name out of the attributes. If instead the configuration looks like...

```

auditLog {

   actorKey = "userPrincipal.id"

}

```

... the same trick will read the id of the authenticated user. But, if you are using CAS then you can do this...

```

auditLog {

  username = "${edu.yale.its.tp.cas.client.filter.CASFilter.CAS_FILTER_USER}"

}

```

... and you get the CAS authenticated user name.

So long story short all you have to know is if your security system uses userPrincipal and if it does whether "userPrincipal.name" or "userPrincipal.id" is right. If you have a home brew security system all you have to know is what part of the authenticated user you want to identify the user by... and specify "session.user.name" or "session.login" depending on how your security system works. And for systems like CAS you can use an attribute key of any kind.

Nice and generic. Check out the latest [Grails Audit Logging Plugin](http://docs.codehaus.org/display/GRAILS/Grails+Audit+Logging+Plugin). As always any feedback or criticism will be welcome... and my goal in all of this is to contribute and learn.

{% endraw %}
