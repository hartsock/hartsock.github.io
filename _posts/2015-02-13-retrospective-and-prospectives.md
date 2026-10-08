---
excerpt_separator: ""
layout: "archive-post"
title: "retrospective and prospectives"
date: "2015-02-13T17:18:00.001-05:00"
description: "You're busy, I'm busy, so here's a Summary of the post's points. - I'm focusing on pyVmomi for a Q2 release (hopefully earlier) - I'll be assisting in on boarding rbVmomi contributors from inside VMware in Q2 (I hope, no"
topics: ["python","software-design"]
original_labels: ["pyvmomi","rbvmomi"]
original_url: "https://hartsock.blogspot.com/2015/02/retrospective-and-prospectives.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2015-02-13-retrospective-and-prospectives/"
id: bafyr4idugve7ppztuj2oevl3lrcydbciggsft3dr4mouyg56s343s5xkjm
permalink: /posts/retrospective-and-prospectives-43s5xkjm/
---
{% raw %}

You're busy, I'm busy, so here's a Summary of the post's points.

- I'm focusing on pyVmomi for a Q2 release (hopefully earlier)
- I'll be assisting in on boarding rbVmomi contributors from inside VMware in Q2 (I hope, no solid commitments there yet.)
- Both rbVmomi and pyVmomi will have samples of the vSphere 6.0 API some time in 2015

####  Retrospective

 If we look back at [the amazing output](https://github.com/vmware/pyvmomi/graphs/contributors?from=2013-12-08&to=2014-12-31&type=c) we saw in 2014, it was driven by a clear targeted focus. We knew that pyVmomi needed to be future proof. It had to be able to survive into the [Python 3 era](https://wiki.python.org/moin/Python2orPython3). A quick survey of the pyVmomi code base reveals that the project has existed [since 2008](https://github.com/vmware/pyvmomi/blob/v5.1.0/pyVmomi/Cache.py#L2). (I've personally been doing integrations with vSphere on some level since that time without knowledge that pyVmomi existed.) This was a big step for VMware to Open Source the project.

 Today pyVmomi is a fork of that internal project. The idea of a vibrant and collaborative Open Source community improving vSphere is a novel idea. It's one that I hope will catch on. That said, 2008 was a long time ago in [internet time](http://en.wikipedia.org/wiki/Internet_time). The future is coming and it's called vSphere 6.0

 Much of this goes for [rbVmomi](https://github.com/vmware/rbvmomi/graphs/contributors?from=2014-01-01&to=2014-12-31&type=c) too. I have a mental [cycle](http://en.wikipedia.org/wiki/OODA_loop) that I use when approaching a project. When I enter a new project there is always a period of observation and orientation before I make decisions and start acting. When my attention is divided that forces me to lengthen my input phase before I make a decision and then act.

 On the pyVmomi project I've come to trust the judgement of a select handful of contributors. If they like the submission I'm more likely to accept it. I've not built relationships like that on rbVmomi. It takes time to form that kind of trust and I'm actively soliciting VMware staff who are *deeply *experienced Rubyists for help in forming those.

####  Prospective

 Most VMware followers will know the company had a [big launch in February](http://vmwareemeablog.com/uk/vmwares-biggest-online-announcement-for-2015-live/). Some of what I've been doing is coming along side folks who needed a fresh pair of eyes just before release. The [launch of vSphere 6.0](http://blogs.vmware.com/vmtn/2015/02/vsphere-6-0-vexpert-blog-articles.html) is a [big step](http://www.dcig.com/2013/10/vmware-takes-big-step-up-in-virtual-server-backup.html) toward a [new future](http://blogs.vmware.com/tribalknowledge/software-defined-data-center) for VMware. There are many new features and new ways to integrate, converge, and innovate with these offerings. The new vSphere 6.0 API collectively point the way to how VMware of the future will deliver API, I am eager to hear people's reactions and to help adjust these offerings.

 I'm currently juggling pyVmomi, rbVmomi, and a separate academic research project that I made commitments to. I've been talking to folks about delegating some of this work. Each of these projects deserves my full attention right now, but I can only divide myself so much. In the case of pyVmomi and rbVmomi your participation is vital and I view my job in this area as supporting the community's desire to get things done on vSphere.

 I'm not the primary mover here, you are. That includes work on getting pyVmomi into the hands of python developers [however](https://bugzilla.redhat.com/show_bug.cgi?id=1132971) [they manage](https://launchpad.net/ubuntu/+source/python-pyvmomi) [libraries](https://pypi.python.org/pypi/pyvmomi). That is all work initiated by and driven by folks like you. As I dig deeper into [what needs to happen in 2015](https://github.com/vmware/pyvmomi/milestones/pyVmomi%202015.1), I would welcome your participation. If you want to take on one of the fixes that need to happen, let me know via GitHub or via IRC.

 I've also gotten an early look at the vSphere 6.0 SDK and I know that there are a few new API features that developers will find immensely useful. There is also a grand SDK vision to be worked out and its early days to be talking about that yet. Remember that pyVmomi is currently a [Fling](https://labs.vmware.com/about) from VMware so it's living in slightly different product support space than most VMware products do.

####  Project Goals

 Both rbVmomi and pyVmomi will have code samples available that will show off the new vSphere 6.0 API and I can talk about that more as we come up on the release. In the mean time I'll be firming up what we're going to deliver in our rapid succession 1st and 2nd releases of 2015.

{% endraw %}
