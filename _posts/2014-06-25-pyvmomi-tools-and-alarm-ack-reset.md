---
excerpt_separator: ""
layout: "archive-post"
title: "pyvmomi-tools and alarm ack & reset"
date: "2014-06-25T00:00:00.000-04:00"
description: "There are going to be use cases like \"Ack & Reset vCenter Alarm implementing hidden API method\" these are going to be relatively common and yet reasonably outside the definition of an official API binding. To handle this"
topics: ["python","software-design"]
original_labels: ["pyvmomi","pyvmomi-tools"]
original_url: "https://hartsock.blogspot.com/2014/06/pyvmomi-tools-and-alarm-ack-reset.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-06-25-pyvmomi-tools-and-alarm-ack-reset/"
id: bafyr4ifvmevwwvh2ewz7z6obpfan37hbijpcuq3u3nwjtdldx4txgdafs4
permalink: /posts/pyvmomi-tools-and-alarm-ack-reset-txgdafs4/
---
{% raw %}

There are going to be use cases like "[Ack & Reset vCenter Alarm implementing hidden API method](http://www.virtuallyghetto.com/2010/10/how-to-ack-reset-vcenter-alarm.html)" these are going to be relatively common and yet reasonably outside the definition of an official API binding. To handle this I've created [pyvmomi-tools](https://github.com/vmware/pyvmomi-tools) as a project to distribute these kinds of additions to the official bindings.

 We'll record [feature requests](https://github.com/vmware/pyvmomi-tools/issues/4) and after a number of these get implemented we'll provide an official release that you can pull down with `pip`. The pyvmomi-tools project will be freer to explore techniques for working with vSphere that might not be officially supportable or might break between releases.

 I will want to come up with a system of warnings to let you know when you are using an API that might not survive between vSphere releases or isn't officially released and therefore isn't covered by the very generous backwards compatibility guarantees that the rest of vSphere is.

 But... that's another topic...

{% endraw %}
