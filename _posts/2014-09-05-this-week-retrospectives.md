---
excerpt_separator: ""
layout: "archive-post"
title: "This week: Retrospectives"
date: "2014-09-05T13:30:00.001-04:00"
description: "This was a short week, so I would like to take a moment and reflect on where we've been since May. This week I've been getting ready for a creating a set of new spikes around a few of our unanswered sample requests. Out "
topics: ["python"]
original_labels: ["pyvmomi","pyvmomi-tools","rbvmomi"]
original_url: "https://hartsock.blogspot.com/2014/09/this-week-retrospectives.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-09-05-this-week-retrospectives/"
id: bafyr4ighkze2x2t54ibd6s6ddlghczawaxgkl653tnzsk7sgytcdpwrbca
permalink: /posts/this-week-retrospectives-cdpwrbca/
---
{% raw %}

This was a short week, so I would like to take a moment and reflect on where we've been [since May](https://github.com/vmware/pyvmomi/graphs/contributors?from=2014-05-01&to=2014-08-31&type=c).

 This week I've been getting ready for a creating a set of new [spikes](http://www.extremeprogramming.org/rules/spike.html) around a few of our [unanswered sample requests](https://github.com/vmware/pyvmomi-community-samples/issues). Out of these will come my development plan is to create [new features](https://github.com/vmware/pyvmomi-tools/issues) to include in [pyvmomi-tools](https://github.com/vmware/pyvmomi-tools). By the way, if you're new to the projects or haven't been following along, part of the reason for breaking out pyvmomi from pyvmomi-tools is to allow us to develop different release cycles and development standards and styles. It would allow a quicker-turn around on some items and also allow some experimentation in pyvmomi-tools that we might not want to risk in the core pyvmomi library.

 This is all part of a social experiment I'm conducting trying to help VMware at large find the best way to engage with the open source communities. Earlier in the week [someone called out](https://twitter.com/dberkholz/status/507543475735527424) this negative reaction in the [rbVmomi community](http://www.mattwrock.com/blog/dear-vmware-please-give-us-nice-things-to-automate-the-things). Ironically, rbVmomi is much older, more robust, and feature complete than pyVmomi but the [community](http://www.geeklee.co.uk/tag/pyvmomi/) [reception](https://twitter.com/lamw/status/504375054982193152) to pyVmomi has [been](http://dantehranian.wordpress.com/2014/08/11/building-a-better-dashboard-for-virtual-infrastructure/) [much](https://twitter.com/mcowger/status/503701928836993025) [warmer](https://twitter.com/ohh_wut/status/505806156657598465) in recent weeks.

 I'm getting reports of a number of python projects shifting from other vSphere API bindings to pyVmomi as the confidence in the library grows. I've been getting almost nothing but positive feedback from users of the library and I think we're well on our way to becoming the best way for integrators to work with vSphere. And, we're reaching that goal by encouraging [better developer practice](http://youtu.be/N0x_mxnTs_k).

 From some [IRC chats](http://webchat.freenode.net/?channels=#pyvmomi,#pyvmomi-dev) earlier in the week I found out that at least one shop has traded from [vijava](http://vijava.sourceforge.net/)to [pyVmomi](http://vmware.github.io/pyvmomi/) running in [jython](http://www.jython.org/). I've not tested or verified jython for use with pyVmomi but I'm encouraged to hear the work is progressing well. If anyone else is attempting this kind of work I would appreciate hearing and/or reading about the experience.

 I also find this language switch curious because vijava is actually quite well done. As a side note I am doubly curious because of my own past involvement in alternative languages for the JVM. I've not attempted jython with Java hybrid projects before and I'm curious as to how and why these fit together.

 I'll be presenting these stories to VMware teams to help build the case for this style of community engagement and I plan on having a series of discussions around [rbVmomi](https://github.com/vmware/rbvmomi) as well. As I've mentioned multiple times in this blog, merely building pyVmomi up is only one of the objectives toward my much larger goal of helping change the way we write software for the cloud.

 Part of that larger goal is [testing,](http://hartsock.blogspot.com/2014/08/what-every-developer-should-know-about.html) [process](http://hartsock.blogspot.com/2014/08/notes-on-developing-pyvmomi-itself.html), and [engagement](http://hartsock.blogspot.com/2014/05/how-pyvmomi-is-something-different.html).

 More on this next time...

{% endraw %}
