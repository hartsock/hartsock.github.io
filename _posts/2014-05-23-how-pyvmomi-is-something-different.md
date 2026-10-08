---
excerpt_separator: ""
layout: "archive-post"
title: "How pyVmomi is something different"
date: "2014-05-23T14:10:00.003-04:00"
description: "I'm largely responsible for the current set of Java samples vSphere WS Management SDKreleased with vSphere 5.5 last fall. It was really cool for me, for the first time in a 20 some-odd year career to actually be involved"
topics: ["python","software-design","organizations"]
original_labels: ["pyvmomi"]
original_url: "https://hartsock.blogspot.com/2014/05/how-pyvmomi-is-something-different.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-05-23-how-pyvmomi-is-something-different/"
id: bafyr4igih65m4czyw2ozc3m6ex4nme4zulyzwszzweryf3aepngxdk5u2a
permalink: /posts/how-pyvmomi-is-something-different-gxdk5u2a/
---
{% raw %}

I'm largely responsible for the current set of Java samples vSphere [WS](http://www.w3schools.com/Webservices/default.asp) Management [SDK](http://en.wikipedia.org/wiki/Software_development_kit)released with [vSphere 5.5](https://www.vmware.com/support/vsphere5/doc/vsphere-esx-vcenter-server-55-release-notes.html) last fall. It was really cool for me, for the first time in a 20 some-odd year career to actually be involved in a [shrink-wrapped product](http://www.thefreedictionary.com/shrink-wrapped+software) roll out. That may be out of fashion these days but it was still cool.

 This was also an unusual project for me mainly because I couldn't really talk about it at the time. I've worked most of my career on websites, [COTS](http://en.wikipedia.org/wiki/Commercial_off-the-shelf) or [GOTS](http://en.wikipedia.org/wiki/Government_off-the-shelf) modifications, or [OpenSource customizations](http://whitepaperit.com/open-source-customization/) and that implicitly entails some freedom to talk about things that *closed source *projects don't. The original plan was that I was going to start writing about vSphere 5.5 once it rolled out, but then [OpenStack happened](http://www.networkworld.com/news/2012/101712-vmware-openstack-263473.html)... (more on that in coming weeks).

 My job at VMware wasn't just to write samples but also to provide a link between the API developers inside VMware and developers outside VMware. Since the Java SDK was my first big job with the company I did things the way that people at the company were used to, I followed the normal channels. I really wanted to be a good VMware citizen first before I started rocking the proverbial boat.

 If you've seen the [vSphere Management SDK for vSphere 5.5](https://developercenter.vmware.com/web/sdk/55/vsphere-management) then you'll notice I took it in a very [JPA](http://en.wikipedia.org/wiki/Java_Persistence_API)-like direction. I wanted the SDK samples to feel like working with any other high level Java code. The theory was that in tools like JPA [magic annotations](http://www.adam-bien.com/roller/abien/entry/ejb_3_persistence_jpa_for) take care of wiring up an [Object to a Table](http://en.wikipedia.org/wiki/Object-relational_mapping). The effect is that the Java programmer gets to focus on [data modeling](http://www.javapractices.com/topic/TopicAction.do?Id=187) and less on details that don't pertain to their application. I tried to emulate that with the samples... magic annotations wire the [POJO](http://en.wikipedia.org/wiki/Plain_Old_Java_Object)getters and setters up to the Command Line Interface (CLI).

 The major changes involving the annotations and the framework that supported them were done in just three weeks. However, testing, verifying, and repairing the samples took the rest of *nine months* with a team of testers. That second part was long, labor intensive, and *frankly* not very satisfying.

 Unfortunately, because this was all closed-source and behind the scenes development I couldn't get feedback from the most critical audience that these changes affected... *you* the developer *outside* VMware. Inside VMware these changes have been well received and I gave the new Java SDK maintainer explicit permission to **completely nuke*** *the vSphere 5.5 Java samples, annotations, and framework when I shifted to OpenStack work in January 2013. The *current* maintainer has told me he likes the feel of the new samples and I hope VMware will eventually open source the annotation framework that takes CLI options and wires them to the POJO. The vSphere samples that arrive on the next release will be managed by a new developer and I'm not involved with that new framework anymore.

 As I mentioned in early 2013 I started to transition to [OpenStack Nova](https://wiki.openstack.org/wiki/Nova) work full time. Again, my typical strategy is to observe a project for one cycle before rocking the proverbial boat. I mostly watched the the Havana release and I more actively participated in the Icehouse release. In all this I felt there were some real problems with how the [vSphere Management SDK](https://developercenter.vmware.com/web/sdk/55/vsphere-management) was getting used. Some of these problems were related directly to how people understood the SDK and others were directly related to the SDK itself.

 I asked that we either bring in someone full time to work the pyVmomi library, its community, and its problems or that I be moved to the pyVmomi project full time. Guess which happened?

 As of this April, I took over the public facing parts of the [pyVmomi](https://github.com/vmware/pyvmomi)project. Part of that has been not rocking the boat for a bit as I observe how the sausage gets made. The other part of has been *finally rocking the boat* in regards to how *samples* are made. With pyVmomi I've been asked to write samples again but *this time* it's different.

 The project [pyVmomi Community Samples](https://github.com/vmware/pyvmomi-community-samples) is a really radically different way to do SDK samples for VMware. The project is an Apache 2 Open Source samples project and we're getting samples from non-VMware contributors. This new project structure means that *you* help write ***which*** samples you want to see, you help write them the ***way*** you want to see them, and you can use the awesome power of github to send pull requests. The samples become a durable, sharable, and living community effort.

 I've tentatively slated a new release of pyVmomi should come out every 6 months. That means releases every December and July. That does mean a bit of boat rocking early on for me... but then... if you'll help me out I think we can get this ship sailing in the right direction.

 More next week...

{% endraw %}
