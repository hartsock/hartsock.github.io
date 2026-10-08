---
excerpt_separator: ""
layout: "archive-post"
title: "Wandering around Research Triangle Software Symposium 2008"
date: "2008-06-23T18:53:00.001-04:00"
description: "My path through the Symposium one was eclectic. This year my needs are in the areas of project management and dealing with software development life-cycle. There comes a point when you realize you have all the right tech"
topics: ["software-design","organizations"]
original_labels: ["NFJS","grails","groovy","talk"]
original_url: "https://hartsock.blogspot.com/2008/06/wandering-around-research-triangle.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-06-23-wandering-around-research-triangle-software-symposium-2008/"
id: bafyr4idw7vsxxyl3sk2mj5djslvzqzfhzpenchsa4kst4vwi2fpagvbz5u
permalink: /posts/wandering-around-research-triangle-software-symposium-2008-pagvbz5u/
---
{% raw %}

My path through the Symposium one was eclectic. This year my needs are in the areas of project management and dealing with software development life-cycle. There comes a point when you realize you have all the right technical tools but you don't have the right *soft skills* in order to deal with business level problems.

I got to sit through several talks by [Jared Richardson](http://www.nofluffjuststuff.com/conference/speaker/jared_richardson.html). Jared's talks this weekend gave me the perspective that the changes we are after when we say "agile" are there to deliberately limit the number of negative interpersonal interactions and increase the positive interpersonal interactions. If you do that then it doesn't matter what you call it. The technologies that make us "agile" are not panacea but tools to tweak how people deal with each other. Tightening feedback loops between people and creating automations for tasks actually translate into building trust between people and objectivity into assessments of success and failure. This was a major perspective shifting moment for me that left me a little dumb-struck. It was a "there is no spoon" moment.

By Sunday I was really worn down. I'm not a naturally gregarious person and three days of constant crowds get me beat. Besides, how many mind-blowing life-changing talks can you take in three days? So Sunday I geeked out at the technology presentations and I was glad I did.

[Venkat Subramaniam](http://www.nofluffjuststuff.com/conference/speaker/venkat_subramaniam.html) covered FP on the JVM. Functional programming is something that I've brushed against repeatedly but never used in the enterprise. I think I share Venkat's predilection for learning new languages I just haven't exercised it as much. I am going to have to teach myself Erlang this year even though I know I'll never use it in production. Erlang will probably show up in this blog from time to time. Remember, this is not a *Groovy/Grails* blog. Groovy just happens to be what I'm working with both at work and at home right now. I strongly believe that the point of software is the codification of cognition. That means using the tool that best represents that thought and uses the best platform for delivery of that thought. Venkat has definitely raised my interest in some of the FP languages.

I'm so steeped in Groovy lately I thought I should go and get some JRuby exposure. I've never attended a talk on Ruby. I've only bashed my way through Ruby and Ruby on Rails in small toy applications that I developed during research projects over the last few years. Ruby is a very simple and powerful language (and very pretty IMHO) but I think most of what causes resistance to it is how alien it looks. The first time I heard about Ruby was from [Bishop](http://modzer0.cs.uaf.edu/~bishop/) while we were in college together.

I ended up getting work using Perl, C, Ada, and sometimes Bash over the years so I never really used Ruby at work. [Neil Ford](http://www.nofluffjuststuff.com/conference/speaker/neal_ford.html) does an excellent job selling JRuby as a next generation JVM language. I did detect that some of his comic jabs at Java were taken as outright insult by some of the more serious Java-heads. And this is why I say: "Never fall in love with technology." It blinds you to objectively evaluating a technology and its capabilities. That goes for all of us Ruby enthusiasts or Groovy enthusiasts alike.

Language is definitely one way to open up your mind about some of these new problems we face dealing with concurrency on multi-core systems. I think that the more important sea-change is in programming paradigm. Not necessarily language. Consider this video floating around on Slashdot (and triJug) featuring [Cliff Click](http://video.google.com/videoplay?docid=2139967204534450862). It covers concurrency correctness for a data structure by the use of finite-state-automata with an extra rule: Any state can be a start state. Cliff Click's solution is to create logic in the threads that will allow each one to act correctly no matter what state it finds the data in. Now if only I could get *paid* to write stuff like that. That's some serious getting your geek-on.

And that stuff is written in Java. Just to prove the point that any Turing complete language can produce the same computational results as any other. It's just a matter of how you get there.

Sunday afternoon I sat through both talks by [Jeff Brown](http://www.nofluffjuststuff.com/conference/speaker/jeff_brown.html) the first one by accident actually. I had forgotten to move to see [Venkat Subramaniam](http://www.nofluffjuststuff.com/conference/speaker/venkat_subramaniam.html) and hear his take on [Guice](http://code.google.com/p/google-guice/), but I was glad I stayed to hear both of Jeff's talks. Not only does he have the fantastic style of understating things to great effect but it was an absolute thrill to hear repeated gasps from the audience as he introduced Grails to them.

And here's what's interesting about Grails is that it does get Java people excited. Much more excited than Rails does. I think Grails excites Java developers because it can run in their current environments and hook into what they already have with very little work. Grails is built-up from Spring so they can see how they can leverage what they already know about so many Java tools. And at any point of pain you can fall back to what you know.

I think Grails fills a very neglected need in the Java developer space and that need has been neglected so long because those feedback loops between tool vendors and the common programmer have been broken. As long as the Grails community works to keep those loops closed and to listen to its user population there is a very large niche for Grails in Java-rich shops. The trip to Grails is so much shorter than the trip to Rails. Even Rails on the JVM.

Jeff's second talk taught me several tricks I was missing. I got to talk to him about my Audit Logging plugin and even got a few pointers so I've made a list of things I need to do. Highest on the list is to setup PostgreSQL and get to testing with that configuration. I also got several ideas for new plugins that I could add using what I already know. I should have time for this after July until then all my free development time is double booked.

An interesting question that I got was how does Grails scale? I'm sure most of the answer to that is contained in how does Spring scale? I personally only have production grails apps under modest load some 10 to 15 transactions a second at peak (a peak which is exceedingly rare and my performance upper bound is dependent on two external systems so I had to back my application's speed off to avoid swamping the other system). But, if you want the real answer from some guys with real heavy use scenario experience go take a look at [Brian Guan](http://blog.linkedin.com/blog/2008/06/grails-at-linke.html) has to say.

The other advantage with Grails is being able to say: "If you find a part that doesn't scale, rewrite it in Java." And I'm not telling a web developer to go dust off her C book instead I'm pointing to an existing infrastructure and expertise one layer below Groovy. One that the developer already has and uses.

For reasons that I'll explain in a later post I have to use two different container managed datasources. The first one drives my GORM for access to objects and the second drives a set of custom DAO to normalize data using some very cleverly hand crafted queries. The DAO gets its data source from Config.groovy in development mode or from JNDI in both test and production mode.

Just because it's never gotten a slide... here's the resource.xml way of grabbing that for Grails...

```

<bean id="legacyDataSource" class="org.springframework.jndi.JndiObjectFactoryBean">

        <property name="jndiName" value="jdbc/LegacyDS" />

</bean>

```

... and if I wanted to grab that data source in a groovy object

```

  def legacyDataSource

```

... sadly I don't always have a JNDI defined data source in my environment so what I did is the less elegant and more bludgeon-ly:

```

    def openDb() {

        def conf = ApplicationHolder.application.config

        def db

        if( conf.legacy.jndi ) {

            if(!legacyDataSource) {

                def initialContext

                // Obtain initial context

                try {

                    initialContext = new javax.naming.InitialContext();

                    legacyDataSource = (DataSource) initialContext.lookup(conf.legacy.jndi);

                } finally {

                    initialContext.close();

                }

            }

            db = Sql.newInstance(legacyDataSource)

        }

        else {

            db = Sql.newInstance(

                    conf.legacy.url,

                    conf.legacy.username,

                    conf.legacy.password,

                    conf.legacy.driverClassName

                )

        }

        return db

    }

```

... which switches depending on whether the environment is configured for JNDI or for directly managed connections.

I met lots of folks that I hope keep the Grails enthusiasm through the next year. I think we are at the beginning of a major sea-change in the Java space and I think both Groovy and Grails will be important players in that change. Nobody can predict what's next but Groovy has a way of getting Java people excited. It's been a long time in coming and the need in the RTP area is definitely there. With [Cloud Computing for Grails](http://www.dmitriy-kopylenko.com/2008/04/grails-in-cloud.html) [coming along nicely](http://chris-richardson.blog-city.com/grails_plugin_for_deploying_to_amazon_ec2.htm) I think we have plenty to be excited about.

{% endraw %}
