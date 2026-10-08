---
excerpt_separator: ""
layout: "archive-post"
title: "pyvmomi-tools: providing library extensions and tools outside of the pyvmomi release cycle"
date: "2014-06-06T17:29:00.001-04:00"
description: "Last week I mentioned how some sample requests on pyvmomi-community-samples were bringing up a few interesting topics. These were issues I've seen elsewhere and desperately wanted to fix. I've found that new programmers "
topics: ["python","software-design","organizations"]
original_labels: ["pyvmomi","pyvmomi-tools"]
original_url: "https://hartsock.blogspot.com/2014/06/pyvmomi-tools-providing-library.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-06-06-pyvmomi-tools-providing-library-extensions-and-tools-outside/"
id: bafyr4ifwc7si7qrnfuqcq52qu2i7az7he6p3iqvcdn4n3bwdjqzfkqiisa
permalink: /posts/pyvmomi-tools-providing-library-extensions-and-tools-outside-zfkqiisa/
---
{% raw %}

Last week I mentioned how some [sample requests](https://twitter.com/nvermande/status/473764610781507585) on [pyvmomi-community-samples](http://vmware.github.io/pyvmomi-community-samples/) were bringing up a few interesting topics. These were issues I've seen [elsewhere](https://github.com/openstack/nova/blob/2014.1/nova/virt/vmwareapi/vmops.py#L625) and desperately wanted to fix.

 I've found that new programmers to the vSphere API have a lot of trouble dealing with [Tasks](http://pubs.vmware.com/vsphere-55/index.jsp#com.vmware.wssdk.apiref.doc/vim.Task.html), [PropertyCollector](http://pubs.vmware.com/vsphere-55/index.jsp#com.vmware.wssdk.apiref.doc/vmodl.query.PropertyCollector.html), [PropertyFilter](http://pubs.vmware.com/vsphere-55/index.jsp#com.vmware.wssdk.apiref.doc/vmodl.query.PropertyCollector.Filter.html), and [Views](http://pubs.vmware.com/vsphere-55/index.jsp#com.vmware.wssdk.apiref.doc/vim.view.ContainerView.html) constructs. These are in particular sticking points I would like to make easier for the programmers that don't want to necessarily deal with those constructs straight off. It is also beneficial to [certain projects](https://github.com/openstack/oslo.vmware) if the code for handling these kinds of issues is kept independently from the project itself.

>  Why not just add these functions directly to [pyVmomi](https://github.com/vmware/pyvmomi)?

 Well ... just [how](https://github.com/vmware/pyvmomi/blob/master/pyVmomi/CoreTypes.py) [can](https://github.com/vmware/pyvmomi/blob/master/pyVmomi/ManagedMethodExecutorHelper.py) I do [that](https://github.com/vmware/pyvmomi/blob/master/pyVmomi/ServerObjects.py)? The pyVmomi library[dynamically generates](https://github.com/vmware/pyvmomi/blob/master/pyVmomi/VmomiSupport.py) and loads its class definitions for vim.* and vmodl.* namespaces. I'm currently *playing* with ways to make this happen statically but that is going to be a **big** change and I don't want to tackle it until we have more tooling support around the library.

 In general, the tactic of developing pyvmomi-tools independently of pyvmomi means we get more latitude in the tools' development. If we identify certain tools as *promotion worthy* some might get promoted up into pyvmomi itself and others might be broken out into supporting libraries. In general, smaller projects are easier to maintain and having a large number of small projects to maintain means its easier to delegate work and assure an individual module is bug free.

 However, a large number of small modules is hard to use when you are a developer. Instead, it's much easier to grab a single library. So, to handle that problem when we get there, pyvmomi-tools should morph into a top-level project in time. When you include pyvmomi-tools in your requirements you would be getting a number of smaller libraries with focuses on any number VMware APIs but you would get to interact with a cohesive whole.

 That's the vision at any rate. You can compare what using pyVmomi with and without tools is like by looking at my latest samples on power_cycling virtual machines.

- plain pyvmomi: [virtual_machine_power_cycle_and_question.py](https://github.com/vmware/pyvmomi-community-samples/blob/master/samples/virtual_machine_power_cycle_and_question.py)
- with pyvmomi-tools: [virtual_machine_power_cycle.py](https://github.com/vmware/pyvmomi-tools/blob/master/samples/virtual_machine_power_cycle.py)

 The big things to notice? Look at finding a virtual machine, waiting for a task, and responding to something that can cause a task to hang. Naturally it's possible to do all this well without pyvmomi-tools but I hope you'll agree it's nice to have a well conceived helper tool to simplify some of this work.

 Building pyvmomi-tools this week, I actually ended up throwing out a lot of lib work I believed would be necessary based on my work with other vSphere bindings... pyVmomi's internals have some pleasantly surprising side-effects and benefits that I'd love to dissect.

 More on that next week...

{% endraw %}
