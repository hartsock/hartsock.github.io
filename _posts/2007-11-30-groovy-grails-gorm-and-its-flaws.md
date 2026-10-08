---
excerpt_separator: ""
layout: "archive-post"
title: "Groovy Grails GORM and its flaws"
date: "2007-11-30T09:36:00.002-05:00"
description: "NOTE: This problem was fixed in the Grails 1.0 release making GORM the most amazing Object Relational Mapper ever created by mortals. I am beginning to understand the limitations in Grails better. I would say the \"honey "
topics: ["software-design"]
original_labels: ["GORM","bugs","grails","groovy"]
original_url: "https://hartsock.blogspot.com/2007/11/groovy-grails-gorm-and-its-flaws.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-11-30-groovy-grails-gorm-and-its-flaws/"
id: bafyr4idnwgunib6vn7rbcolkqo5lwo2n725vsm6fu4uzwwnp4v7mxds5ia
permalink: /posts/groovy-grails-gorm-and-its-flaws-7mxds5ia/
---
{% raw %}

NOTE: This problem was fixed in the Grails 1.0 release making GORM the most amazing Object Relational Mapper ever created by mortals.

I am beginning to understand the limitations in Grails better. I would say the "honey moon" phase is drawing to a close now and I can effectively evaluate the tool in light of some of its limitations. One such limitation is [GRAILS-1308](http://jira.codehaus.org/browse/GRAILS-1308) which is slated for fix on the Grails 1.1 release... yes the Grails 1.1 release... **NOT** the up coming Grails 1.0 release. It turns out that this is a significant problem.

The problem in a nutshell is that if you have:

```

class Company {

 Long id

 Long version

 String name

 static hasMany [employees: EmployeeBean]

}

```

... and that EmployeeBean can be the one from this [tutorial](http://www.infoq.com/articles/grails-ejb-tutorial) or even a straight Groovy domain object... and you try todo this:

```

      def people = EmployeeBean.list()

      people.each({ e ->

       company.addToEmployees(e)

      })

      company.save()

```

The employees will simply not make it into the database... more over GORM won't even bother setting up anything to associate the two classes... ick.

What I end up doing is either:

- edit EmployeeBean so it "belongsTo" the company

- create a "bridging" object like "Contract"

I haven't tested going to all JPA classes yet, but I wonder if that wouldn't work.

I had not even noticed that I was working around this problem because I just naturally saw that things weren't working for me the way I wanted to I tried to figure out what the tool could do... and then I'd do *that*. Ideally you shouldn't have to do that at all. But, this is reality and we have to ship our projects on the platforms in front of us.

Even with its flaws Grails is still much better at many tasks than any other Java related product I have access to. Seeing flaws like this one and the poor support for SOAP clients in Groovy/Grails make me evaluate where I'll use Grails until version 1.1 comes out. The answer for me is Grails will be my front end system and I'll learn how to do Spring-JNDI bridging or Spring-RMI remoting to tie in more mature EJB3 technologies for the complex tasks.

In other words, Grails becomes more View than Controller for me. It becomes a powerful front-controller system for UI and web-applications. That's a good niche to fill... especially if I can learn to tie in a SessionBean from plain old Java land.

Oh yeah, and I'm sorely disappointed in the Searchable plugin too. It simply doesn't work on newer Grails versions. I might use a standalone WAR with very old Grails in it just to get the searchable feature... or I might wait fitfully for that wonderful plugin to deliver on its promises.

EDIT

Looks like the searchable plugin development has stopped [dead in its tracks](http://fisheye.codehaus.org/changelog/grails-plugins/grails-searchable). Oh well. I guess it will be a while.

EDIT 2

I guess we can look forward to this bug being fixed in Grails 1.0! This just shows how amazingly responsive Graeme Rocher and his team are. Think of how many utterly disappointing software releases we've seen in the last few years. The Grails 1.0 release could really count as a breath of fresh air. I know getting this kind of response from a development team surely is for me. It bodes well for the future of Grails.

I can live without a plugin for a while if it means I get a sterling framework for it to plugin to.

{% endraw %}
