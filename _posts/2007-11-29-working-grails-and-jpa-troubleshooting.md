---
excerpt_separator: ""
layout: "archive-post"
title: "Working Grails and JPA... troubleshooting"
date: "2007-11-29T08:40:00.001-05:00"
description: "I've been working with Grails and the JPA. In eclipse I use the Hibernate3 reverse engineer tool. To make that work I use a hibernate.cfg.xml file that I place in my project's top level folder and a hibernate.reveng.xml "
topics: ["software-design"]
original_labels: ["bug","grails","groovy","jpa"]
original_url: "https://hartsock.blogspot.com/2007/11/working-grails-and-jpa-troubleshooting.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-11-29-working-grails-and-jpa-troubleshooting/"
id: bafyr4ibngifrgjrqefdu7gsy5z5ziykeqxxaq2mwzbjtulqffdh2y55jvi
permalink: /posts/working-grails-and-jpa-troubleshooting-h2y55jvi/
---
{% raw %}

I've been working with Grails and the JPA. In eclipse I use the Hibernate3 reverse engineer tool. To make that work I use a hibernate.cfg.xml file that I place in my project's top level folder and a hibernate.reveng.xml file also in the top level folder. I then ask the tool to create EJB3 annotated POJOs and drop them into my grails project.

Previously, I had been deleting the hibernate.cfg.xml and hibernate.reveng.xml files out of the project but yesterday I forgot to do that. What happens if you leave these extra files in your project is that none of the JPA objects get mapped and are therefore invisible to your GORM.

It turns out GORM is reading the top level hibernate.cfg.xml file so why would it see those classes? I never mapped the EJB3 entity beans in the hibernate.cfg.xml I was using for reverse engineer. So, no surprise. There won't be an error either because there were no hibernate errors. The GORM was working perfectly well against the hibernate.cfg.xml in the top level directory.

Now you might wonder why I have two different hibernate.cfg.xml files? Well, the answer is that I need different configurations for the running environment and for the reverse engineer environment. That might be peculiar for me.

Is this a bug? No, not really. It was very hard to diagnose because of the lack of output. Even turning all the logs wide open produced no problems. It wasn't until I went through the project and reverted it to an old version then added one change at a time to it that I noticed the problem was related to the extra hibernate file. At least I know to watch for that now.

{% endraw %}
