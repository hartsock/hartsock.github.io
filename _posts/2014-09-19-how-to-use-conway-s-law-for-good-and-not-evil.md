---
excerpt_separator: ""
layout: "archive-post"
title: "How to use Conway's Law for good and not evil"
date: "2014-09-19T15:15:00.000-04:00"
description: "If you've been paying attention to our github repository you'll have noticed some noise around the following API additions to pyVmomi... - SMS - SPBM - EAM These are all presently scheduled for the next major release of "
topics: ["python","software-design","organizations"]
original_labels: ["pyvmomi","pyvmomi-tools"]
original_url: "https://hartsock.blogspot.com/2014/09/how-to-use-conways-law-for-good-and-not.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-09-19-how-to-use-conway-s-law-for-good-and-not-evil/"
id: bafyr4if2hmd7wb7ahruvxt3yl665jy6n7zwqtmbglj7k47ogrb6oib6pfu
permalink: /posts/how-to-use-conway-s-law-for-good-and-not-evil-6oib6pfu/
---
{% raw %}

If you've been paying attention to our [github repository](https://github.com/vmware/pyvmomi) you'll have noticed some noise around the following API additions to pyVmomi...

- [SMS](https://github.com/vmware/pyvmomi/issues/170)
- [SPBM](https://github.com/vmware/pyvmomi/issues/171)
- [EAM](https://github.com/vmware/pyvmomi/issues/172)

 These are all presently scheduled for the next major release of pyVmomi which is currently set for December of 2014 and will be called 5.5.0-2014.2 barring any major issues.

 I'll be working with the various feature teams inside VMware to figure out how best to Open Source their existing API bindings. More importantly, I'll be work with these teams to find a way that allows the effect described in [Conway's Law](http://en.wikipedia.org/wiki/Conway's_law) to function beneficially on this set of projects.

 In other words, pyVmomi isn't one large project with one [BDFL](http://en.wikipedia.org/wiki/Benevolent_dictator_for_life) directing the entire API. The reality is that the APIs potentially exposed by pyVmomi are in fact the result of multiple collaborating teams. Each of these teams will tend to be their own unique snowflake.

 Couple this with the fact that we will also have the opportunity to leverage contributions from interested third parties, vendors, and partners and you can see that the previous monolithic structure might not survive the strain. I'll be taking some vital time to implement at least one or more extension strategies for the library and have them evaluated. This will probably cost 3 or more weeks worth of time but it will be worth the pain because these are long-lived projects with minimum life-spans on the order of 3 or more *years*.

 As part of this research I've come back time and again to a talk by Doug Hellmann titled [Dynamic Code Patterns](http://stevedore.readthedocs.org/en/latest/essays/pycon2013.html).

 Not to diminish Doug's work at all, but his [Stevedore](http://stevedore.readthedocs.org/en/latest/) project is an implementation of the [Extensibility Pattern](http://en.wikipedia.org/wiki/Extensibility_pattern) which is itself part of the previous generation's [Software Design Patterns](http://en.wikipedia.org/wiki/Software_design_pattern) movement. The design patterns technique came under [understandable criticism](http://en.wikipedia.org/wiki/Software_design_pattern#Criticism) for not really contributing much to programming and more than occasionally over complicating things. It's these concerns about *over complication* that are going to slow me down a bit. After all, making things simple is not easy and my goal is to make things as *simple as possible *and no simpler.

 The Stevedore project does offer something to a library like pyVmomi. It is a tool to create *[extensions](http://stevedore.readthedocs.org/en/latest/patterns_loading.html#extensions-many-names-many-entry-points).* The term 'plugin' is not really accurate when we're talking about modules like SMS. The SMS module is neither a driver, nor is it a hook, but it is an extension. These are new classes and methods that provide new capabilities from the primary facade of the pyVmomi library itself. You can call these *plugins* but not in the normal sense.

 There is also danger in approaching the problem of extending into these new API as a *plugin*. It quite possibly introduces the problem of turning pyVmomi into a *framework* and such a transformation would be *wholly inappropriate*. In particular, I am considering the use case for pyVmomi as a helper library to deliver a driver for [SaltStack](https://github.com/saltstack/salt/blob/develop/salt/cloud/clouds/vsphere.py). What happens to the outer project if pyVmomi itself becomes a *framework* and does this make those consumer projects unnecessarily more complex?

 We want extensibility but not at the cost of adding the need to be *aware* of more details. We want the library to appear as a unit even though it is actually composed of multiple sub-units. That's something that requires some subtlety. It's not something to bother with if we don't need it so... why do I think we need it?

 Over the next 2 weeks I'll be experimenting with SMS support provided in a couple of different ways in the hopes of finding a sustainable, flexible, and robust mechanism to use [Conway's law](http://www.thoughtworks.com/insights/blog/demystifying-conways-law) as a means of enforcing a structure of collaboration between teams. In particular there's a set of existing organizational and structural relationships that I feel the current design violates..

 In particular, at VMware, I do not personally manage, dictate, or control what the structure or design a given ... feature interface (or sub-API) looks like. It's impractical to think I could. My role is to act as a bridge between VMware and the developer communities interested in building software on-top of the VMware *platforms*.

 Some details about the practical nature of how modules like SMS, SPBM, and EAM for use in pyVmomi are produced directly *informs* our library design considerations. For example...

- Feature teams (and their management)

- design, maintain, and release their own API
- dictate what API are official, unofficial, and deprecated
- have their own schedules, priorities, and deadlines
- are fundamentally disinterested in *low-level* concerns

 Knowing this, any design I create for pyVmomi that dictates that a feature team *must talk to me first* and then *convince me *to do things a certain way are very likely to fail. Why? Well, let's take the opposite approach as a thought experiment and see what happens.

 If I were to decide that I was going to *tightly control* pyVmomi and force feature teams to first get approval for API from me before I clicked my big "approved" button and there by uploading their API to github that would mean I could conceivably derail their priorities or deadlines.

 What do you think would happen? I could cause a vital product or feature to slip it's release; I could force an unnecessary conflict between managers; I could find my project usurped by something the feature team felt could disentangle themselves from my meddling in their affairs. Any or all these and other scenarios could happen. In short, I would create an unnecessary friction and unintentional power-struggle as people tried to focus on issues wholly unrelated to something as trivial as providing API to people like yourself.

 So, if I want to instead create a successful project in this environment I have to engineer my software so that it can function *with *the natural (and proper) social boundaries already present. The structure of the *code itself* will also influence how social interactions occur around the code base. And finally, the modularity of the code will *allow* me to potentially delegate power, authority, and autonomy to other people.

 So what are our design concerns?

- For feature creators adding to pyVmomi we should,

- leverage existing library features
- hide low-level concerns
- allow independent ownership
- simplify the process of creating a binding as much as possible

- For integrating developers working *with* pyVmomi in their separate projects we should,

- present a single unified "surface" for them to use
- hide [accidental complexity](http://en.wikipedia.org/wiki/No_Silver_Bullet) but expose *essential complexity*
- follow a rule of *least surprise*

 I admittedly may think of more as I work through the problems but this captures what we're after in a nutshell. This library in the world of Conway's Law represents a bridge between multiple parties and it's structure will end up reflecting how these groups relate. The pyVmomi software sitting between these groups will be least painful to work with for everyone if it can be molded to it present reality.

 After we tackle Open Sourcing these three new API I'll have a better picture of what that reality is. And, that's what large-scale software development is really about, not as much computers and code so much as people, relationships, and communication. Our tools affect our lives and better tools make better lives.

 More on this another time...

{% endraw %}
