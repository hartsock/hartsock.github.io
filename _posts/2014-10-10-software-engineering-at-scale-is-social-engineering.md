---
excerpt_separator: ""
layout: "archive-post"
title: "Software Engineering at scale is Social Engineering"
date: "2014-10-10T13:26:00.001-04:00"
description: "This week, I spent time at VMware's HQ in Silicon Valley. I gave a number of talks on my lessons learned with pyVmomi and rbVmomi and gave several calls to action. This week, I'd like to share one of the more profound le"
topics: ["python","software-design"]
original_labels: ["pyvmomi","rbvmomi"]
original_url: "https://hartsock.blogspot.com/2014/10/software-engineering-at-scale-is-social.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-10-10-software-engineering-at-scale-is-social-engineering/"
id: bafyr4ifmjsqtmiubqt7fjx75tkysjosbamqvs5lbbtzxy4rbstvui3vvii
permalink: /posts/software-engineering-at-scale-is-social-engineering-vui3vvii/
---
{% raw %}

This week, I spent time at VMware's HQ in Silicon Valley. I gave a number of talks on my lessons learned with pyVmomi and rbVmomi and gave several calls to action. This week, I'd like to share one of the more profound lessons from the project. It has to do with how tools impact social interactions.

 The first social networks were the ones that built software. The Software Development Life Cycle (SDLC) were social actions of developers directed, enabled, and enforced through the software tools that they used. If you take this view of creating software, then you it's natural to view any conflicts between departments or teams of developers as an opportunity to invent and apply new technology.

 Let's examine something really interesting and profound about Travis CI that may not even have been intentional. The way that Travis CI shifts responsibilities through a tiny change in how builds are specified. The magic is in that .travis.yaml file and any build system that emulated the .travis.yaml file strategy would exhibit the same magical effects (even without using yaml). To understand the profundity of the change, let's revisit the bad-old-days of Developer Operations for a moment.

 [(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgZBlKOOJgqhM45xtoAak32aB8l9dNeuUggmX_8peh7bHPAj-cBEhShYhqlSOXPapHOOMDGtr9I-kMcsIZxDuwntEO6PilRJZv3xPuDsBsr-zWgd1JfvOTX99SdfQpjf2HQo4_huw/s1600/IMG_20141010_085637554.jpg)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgZBlKOOJgqhM45xtoAak32aB8l9dNeuUggmX_8peh7bHPAj-cBEhShYhqlSOXPapHOOMDGtr9I-kMcsIZxDuwntEO6PilRJZv3xPuDsBsr-zWgd1JfvOTX99SdfQpjf2HQo4_huw/s1600/IMG_20141010_085637554.jpg)

 On the left, our developer builds some code and designs a build system to build their module. On the right an operations person builds a CI server to match. This process has some issues with it already. First off, the operations person must be told what the developer needs in a CI server. This requires a conversation and frequently its one that the operations person isn't directly incentivized to pay much attention to since this isn't likely to be their primary job.

 The Operations person may even feel that their cooperation with the developer is a *gift. *That comes from the fact that the developer likely isn't in the Operations persons direct line of report and their collaboration is a cross-functional team. What is the Operations person really on the hook for?

 Let's assume the previous gift from the Operations person lead to success. There's a working build. Over time the build works and breaks as you would expect. The developer is quite happy to fix their code to repair the build problems. Until one day... the build breaks *permanently*.

 [(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi30r8Gdxxezt9soJPxA5XHq__DkOVP4wHAI_ieht6xuVJZdBzMWqvd_ozLNGPSXLDqn7uQisxOxL2jr9i0x2D4B1eISidhsh754j5M3yKNupYuCB-ppD1iYsbqXJVie-2RS_Ovwg/s1600/IMG_20141010_085701849.jpg)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi30r8Gdxxezt9soJPxA5XHq__DkOVP4wHAI_ieht6xuVJZdBzMWqvd_ozLNGPSXLDqn7uQisxOxL2jr9i0x2D4B1eISidhsh754j5M3yKNupYuCB-ppD1iYsbqXJVie-2RS_Ovwg/s1600/IMG_20141010_085701849.jpg)

 First the developer will try their normal work-around tricks. These won't work. The build environment is operationally broken now because the developer changed a library dependency or some other build criteria. Or, perhaps, our developer is *spinning their wheels *this effort is pointless, because something in the data center is broken.

 What's the problem?

- if the fault is in the build service we waste time debugging code that isn't broken
- the developer is helpless to do their job without direct intervention from operations
- the operations people have no view into when a build is broken because of a service problem
- Operations may exercise their right to change how the server is running and break the build without notice to the developers

 In the most extreme cases, the Operations person is going to be bothered during a crisis. This will result in loss of developer time as they wait on Operations (at best), or it will result in the Developer *demanding more services *from an already busy operations crew what the Operations person thought was a *gift.* And, often the timing is terrible. Both parties are blocked from doing their jobs effectively.

 [(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi30H9JcTAeUY7-p4w2-PVsg5AGUkLnHbPlcbNeBv8HfZ1y6wj7WbS1x1APgSHv9LpF6BXBOqo4WPJqnZh32lDuYQ19Sf7u-HuwuxtGYr-qfOGr_Yk2pk3jRdhWynKuswZ9p8xjhA/s1600/IMG_20141010_085834640.jpg)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi30H9JcTAeUY7-p4w2-PVsg5AGUkLnHbPlcbNeBv8HfZ1y6wj7WbS1x1APgSHv9LpF6BXBOqo4WPJqnZh32lDuYQ19Sf7u-HuwuxtGYr-qfOGr_Yk2pk3jRdhWynKuswZ9p8xjhA/s1600/IMG_20141010_085834640.jpg)

 I've known at least one developer who would handle this by *screaming* "This is your job! Do your damn job!" Not only did this not get people to do their "damn jobs" but it also made them defensive viewing development as an enemy to defend against. This developer was not pleasant to be around.

 Demanding people do their jobs and threatening their livelihoods doesn't exactly setup a safe place for innovation. Not all of us are [high-priced-prostitutes](http://www.goodreads.com/quotes/300099-churchill-madam-would-you-sleep-with-me-for-five-million) and instead aspire to other motivations. (By the way, if you think I'm talking about *you* ... I'm not. [I'm really really not](http://youtu.be/b6UAYGxiRwU).) If you find yourself here, start asking how to keep people from feeling like they need pitch-forks and torches.

 Let's tear down this conflict. What are the *facts* in this scenario?

- The developer specifies the build's operational requirements

- building software is their job
- running build servers is not their job

- The operations person runs the build server

- running workloads, servers, and Infrastructure is their job
- deciding how software is built is not their job

 Does this about cover it?

 With these facts consider the following:

- The developer

- can't build software without asking for permission from operations

- Operations can't create the build server on their own

- ops has to stop a dev and ask for direction

 This is an issue of [Separation of Concerns](http://en.wikipedia.org/wiki/Separation_of_concerns) ... only on social systems, not software systems. The concern of specifying a build in most CI systems rests with a separate configuration. In Jenkins this configuration is commonly run through a control panel. That panel is not version controlled, it's not tested code, yet it is effectively a software artifact.

 Enter .travis.yaml

 [(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi9eDR4X-SXfMU93beTspAu060OBpM8JXMIryfpotGra11qkJLx4pAG08jl5RhTy6A29Xd4AxdeKYfOqCHdjZLqlkhAg4JnH7jbXffSmGay89an6rIRwR1tPU4R2n5WEwtjHT7HJQ/s1600/IMG_20141010_090045317.jpg)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi9eDR4X-SXfMU93beTspAu060OBpM8JXMIryfpotGra11qkJLx4pAG08jl5RhTy6A29Xd4AxdeKYfOqCHdjZLqlkhAg4JnH7jbXffSmGay89an6rIRwR1tPU4R2n5WEwtjHT7HJQ/s1600/IMG_20141010_090045317.jpg)

 The Travis CI build setup is minimal. Point a Travis job at a repository and branch. The configuration work typically carried by an Operations person (those long configuration forms) is carried by the .travis.yaml file. This file is versioned with the code-base itself. That means, when the developer exercises their right to change their own build, the yaml file goes through version control and we can see if things break *because* of the change in build specification.

 We now have two options as the developer:

1. modify our build to fit current expectations
2. request a new build environment that fits our new needs

 The .travis.yaml file does not eliminate conflict or eliminate the problem, it frames the issue in a different manner.

 Using a build specification by configuration file model means, the build configuration is now part of the project it describes. We have placed the control and authority over that process in the correct place ... with the person who's responsibility it is to maintain it. So one possible conflict is removed, the developer no longer has to beg and wait on Operations to donate their time to allow the developers to do their jobs.

 The other part of this new social reality is, if we build a .travis.yaml file that our CI can't support we know it will fail. What's the conversation we're going to have now? The developer now has highlighted boldly that Operations is prepared to give certain services but not others and to ask for new services is to *ask someone to go beyond their normal duties.*

 *

*

 Operations persons now equipped with the right back-end tools can see what kinds of build requests are coming in, what their resource consumption and performance profiles look like... and without having to interfere with the *developer's jobs* they can tune their environment to cope. Build configuration by document now becomes a *workload specification* that an IaaS or a PaaS operator can judge for themselves whether or not they can service.

 The conflict and struggle is still there, but now it's *framed* properly. We accomplish this through *software*. And, this ability to shape social interaction through software tools is why Software Engineering with more than a handful of people who know each other personally is *really* Social Engineering.

{% endraw %}
