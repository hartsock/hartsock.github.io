---
excerpt_separator: ""
layout: "archive-post"
title: "pyvmomi-community-samples the tags and what they mean"
date: "2014-05-30T16:05:00.002-04:00"
description: "This week on the pyVmomi Community Samples project I created a list of tasks to be accomplished. The pyVmomi library itself is a very bare binding onto the vSphere Management API. This is by design since the library has "
topics: ["python","software-design","organizations"]
original_labels: ["pyvmomi"]
original_url: "https://hartsock.blogspot.com/2014/05/pyvmomi-community-samples-tags-and-what.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-05-30-pyvmomi-community-samples-the-tags-and-what-they-mean/"
id: bafyr4idvbxi2tjou26fvm44v3rquj43wpdviwkk4azrvzmakxhpys6p5a4
permalink: /posts/pyvmomi-community-samples-the-tags-and-what-they-mean-pys6p5a4/
---
{% raw %}

This week on the [pyVmomi Community Sample](http://vmware.github.io/pyvmomi-community-samples/)s project I created a list of [tasks to be accomplished](https://github.com/vmware/pyvmomi-community-samples/issues?labels=help+wanted&page=1&state=open).

 The pyVmomi library itself is a very bare binding onto the vSphere Management API. This is by design since the library has to match very closely to the API which only changes with each vSphere release. That means we need to be careful to only alter that library when vSphere gets altered. Breaking out the samples to its own project frees the software to change at a much more dynamic rate and opens up the possibility that we can have a range of collaborators outside VMware contribute to those samples.

 Since I've heard a lot of folks are wanting to help out but don't know how, I've created a set of issues marked '[help wanted](https://github.com/vmware/pyvmomi-community-samples/issues?labels=help+wanted&page=1&state=open)' at any point if you want to help and don't know how... pick up a task marked 'help wanted' and comment on there that you're working the issue. Once you have a pull request ready [reference the issue number in the comment](https://help.github.com/articles/closing-issues-via-commit-messages).

 Some issues as I notice they are being worked on will get marked 'in progress' to let you know that the issue is taking a bit to work on. I'll be tagging issues with other special tags to make lists to send to VMware staff internally in order to solicit help and support from folks working inside VMware that may not normally spot issues in public.

 Currently I happen to be working on [issue 40](https://github.com/vmware/pyvmomi-community-samples/issues/40) and it's opened a whole different can of worms. The samples currently have a [tools package](https://github.com/vmware/pyvmomi-community-samples/tree/master/samples/tools). This tools package is the first stop on our way to identifying useful tools for general pyvmomi development.

 More on that next week...

{% endraw %}
