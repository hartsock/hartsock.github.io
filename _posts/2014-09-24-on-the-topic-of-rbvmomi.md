---
excerpt_separator: ""
layout: "archive-post"
title: "On the topic of rbVmomi"
date: "2014-09-24T12:00:00.000-04:00"
description: "Earlier this week I started helping out on the rbVmomi project. My involvement is just to help take some pressure off of Christian Dickmann around reviewing and releasing the next version of rbVmomi. Compared with pyVmom"
topics: ["python","software-design","theology"]
original_labels: ["pyvmomi","rbvmomi"]
original_url: "https://hartsock.blogspot.com/2014/09/on-topic-of-rbvmomi.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-09-24-on-the-topic-of-rbvmomi/"
id: bafyr4idmevlbfdybqg6a5c6rkqfira3q6qrw2qxpvhlwfdir35xrsv3fn4
permalink: /posts/on-the-topic-of-rbvmomi-xrsv3fn4/
---
{% raw %}

[Earlier this week](https://twitter.com/cdickmann/status/514171886952271872) I started helping out on the rbVmomi project. My involvement is just to help take some pressure off of [Christian Dickmann](https://twitter.com/cdickmann) around reviewing and releasing the [next version](https://github.com/vmware/rbvmomi/issues?q=milestone%3Av1.8.2) of [rbVmomi](https://github.com/vmware/rbvmomi).

 Compared with [pyVmomi](https://github.com/vmware/pyvmomi), the [rbVmomi](https://github.com/vmware/rbvmomi) project has a longer history in Open Source. While pyVmomi has existed longer, rbVmomi has the benefit of being designed from the ground up for the type of collaborative effort an API binding like this can represent. I'll want to be cautious and observant of that established project workflow and primarily act as an accelerant for the processes already there.

 To address the initial problem of there being no release this year, I've begun drafting [v1.8.2](https://github.com/vmware/rbvmomi/issues?q=milestone%3Av1.8.2+) which should be ready for release in a few days. Having learned from pyVmomi, I've set up a follow up release [v1.8.3](http://v1.8.3/) to try and catch anything we miss in the earlier release. The follow up release should hit in mid-October if we need it. If it turns out we don't or can't hit mid-October I'll drop the milestone and we'll move to long-term planning. Future release schedules are TBD.

 For pyVmomi, this means my attentions are divided and I've shifted out [milestones](https://github.com/vmware/pyvmomi/milestones) for that project to match my expectations. The second release of 2014 for pyVmomi is now tentatively set for mid-December. (I hope that pyVmomi reaches feature parity with rbVmomi by that release.) Our big additions for the next release of pyVmomi should be SMS and SPBM API support provided we don't hit any hidden issues. We'll hopefully have time for EAM as well.

 My role on rbVmomi at this time is just to assist in the current release plan. Christian is very much still the lead developer. I'll be using tags on the open issues and pull requests to help decide what to call out for Christian's direct attention. There's also a bit of process for this project that I'll need to work out on the fly.

 More on these topics as things happen...

{% endraw %}
