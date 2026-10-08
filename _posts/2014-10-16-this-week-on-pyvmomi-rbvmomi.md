---
excerpt_separator: ""
layout: "archive-post"
title: "This week on pyVmomi/rbVmomi"
date: "2014-10-16T16:27:00.003-04:00"
description: "Last week, I took on a high priority task for VMware so my work on pyVmomi and rbVmomi had to move down in priority for me. I'll continue to post regular updates on progress but the velocity will have slowed on both proj"
topics: ["python"]
original_labels: ["pyvmomi","rbvmomi"]
original_url: "https://hartsock.blogspot.com/2014/10/this-week-on-pyvmomirbvmomi.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-10-16-this-week-on-pyvmomi-rbvmomi/"
id: bafyr4ignphc7jj4rushn5ouhlk4dkyifhxbwxmcxdalc23dgywuzm2abry
permalink: /posts/this-week-on-pyvmomi-rbvmomi-uzm2abry/
---
{% raw %}

Last week, I took on a high priority task for VMware so my work on pyVmomi and rbVmomi had to move down in priority for me. I'll continue to post regular updates on progress but the velocity will have slowed on both project until I have cleared my higher priority tasks.

####  rbVmomi

- I have slid out the next release until November 15th
- I have begun learning how to upstream the github changes into the VMware git repos for rbVmomi

- we will need to determine the upstreaming process' impact on the public repo
- I need to get any merge requests peer reviewed by VMware internal folks before proceeding

####  pyVmomi

- I have triaged 2 new bugs

- [issue 176](https://github.com/vmware/pyvmomi/issues/176) is an interesting issue we've seen directly impact integrations like OpenStack, SaltStack, and Ansible. I would like to find a clean answer.
- [issue 180](https://github.com/vmware/pyvmomi/issues/180) is a problem I've heard reported before, it has to do with a newer vCenter server speaking to an older ESXi host. The current work-around is to ask the programmer to select a lowest acceptable version number (ie: 5.1) and use that namespace exclusively. The bug reporter has done a good job of breaking down the problem. We need to have a solution that will work robustly and impact client code minimally. *EDIT: This issue is only known to impact ESXCLI use at this time*

- I wrote a simple sample for an IRC user today describing [how to navigate a virtual machine's hardware devices.](https://github.com/vmware/pyvmomi-community-samples/issues/124) The sample is rather straight forward and I was glad to get to write a sample after having neglecting samples for so long
- I revisited pyVmomi-tools and started a testing refactor using VCRpy

 Thursdays will be my rbVmomi/pyVmomi day and I'll alternate between the projects. This week I spent most of my time on pyVmomi so next week I'll try to focus on rbVmomi.

 More next week...

{% endraw %}
