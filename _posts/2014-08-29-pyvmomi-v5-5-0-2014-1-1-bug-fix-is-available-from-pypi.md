---
excerpt_separator: ""
layout: "archive-post"
title: "pyVmomi v5.5.0-2014.1.1 - bug fix - is available from pypi."
date: "2014-08-29T18:40:00.000-04:00"
description: "This week was VMworld and we still managed to release a quick turn-around bug-fix release for pyVmomi. Up on pypi right now is the v5.5.0-2014.1.1 release. Part of the changes made involved improving our release process "
topics: ["python"]
original_labels: ["pyvmomi"]
original_url: "https://hartsock.blogspot.com/2014/08/pyvmomi-v550-201411-bug-fix-is.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-08-29-pyvmomi-v5-5-0-2014-1-1-bug-fix-is-available-from-pypi/"
id: bafyr4ibwvj6y5jq6h5ks4vj6qu5g7owlxuknkejkk3crvwfncpbixvnm2q
permalink: /posts/pyvmomi-v5-5-0-2014-1-1-bug-fix-is-available-from-pypi-bixvnm2q/
---
{% raw %}

This week was [VMworld](http://www.vmworld.com/) and we still managed to release a quick turn-around bug-fix release for pyVmomi. Up on pypi [right now](https://pypi.python.org/pypi/pyvmomi/) is the v5.5.0-2014.1.1 release. Part of the changes made involved improving our release process and incorporating feedback from RPM and DEB package maintainers.

- Here's the v5.5.0-2014.1.1 [release notes](https://github.com/vmware/pyvmomi/releases/tag/v5.5.0-2014.1.1)

- Here's the v5.5.0-2014.1 r[elease notes](https://github.com/vmware/pyvmomi/releases/tag/v5.5.0-2014.1)
  If you're still using the December release, here's a unified change list between 5.5.0 and 5.5.0_2014.1.1:

- [Python 3 support](https://github.com/vmware/pyvmomi/issues/55)

- added [unit testing using fixtures](https://github.com/vmware/pyvmomi/issues/42)

- fixed [session timeouts issue](https://github.com/vmware/pyvmomi/issues/43)

- fixed [Querying datastore cluster fails](https://github.com/vmware/pyvmomi/issues/24)

- fixed [Malformed Faults fail in non-informative ways](https://github.com/vmware/pyvmomi/issues/72)

- added [RST documentation](https://github.com/vmware/pyvmomi/pull/58)

- fixed [getheader does not always fetch cookie value](https://github.com/vmware/pyvmomi/issues/93)

- Fixes bug with [Iso8601 date serialization](https://github.com/vmware/pyvmomi/issues/112) (for messages sent to the service)

- Simplifies test-requirements.txt

- Introduces support for `tox`

- Changes version number scheme

- Fixes README to be pypi compatible

- Improved sdist and bdist packaging support

- Changes to package information based on *The Python Packaging Authority* instructions

- Fix [bug](https://github.com/vmware/pyvmomi/issues/131) that produces traceback when running tests for the first time

- Fixes [testing bug](https://github.com/vmware/pyvmomi/issues/147) present on some distributions.

 Far and away, working on the pyVmomi has been one of the most professionally *satisfying* projects of my career. That's chiefly because of how immediate the interaction and feedback from users of pyVmomi has been. In most other projects feedback from users of your code base has to navigate its way back to you over time, instead on pyVmomi the feedback has been immediate.

 Part of this is due to the ease of public interaction that tools like [github](https://github.com/), [freenode](http://freenode.net/), [pypi](https://pypi.python.org/pypi), and [twitter](https://twitter.com/) (with [ifttt](https://ifttt.com/recipes/search?q=github+twitter) automations) offers. I plan on evangelizing this working-style to other teams within VMware and your positive feedback can only help. For a developer it's a very rewarding way to work and hopefully for a customer it's also very satisfying.

 Next week, I'll be working on our [2014.2 milestone](https://github.com/vmware/pyvmomi/milestones/pyVmomi%205.5.0-2014.2) and setting up to make a go at some more [community samples](http://vmware.github.io/pyvmomi-community-samples/). It should be noted that while pyVmomi itself is able to run just fine on Python 3, many of the samples are written assuming Python 2.7 ... this is fine since the two projects are decoupled.

 The reason we keep the [community samples](https://github.com/vmware/pyvmomi-community-samples) repository separate from the [core pyvmomi](https://github.com/vmware/pyvmomi/) project is to allow for each project to exercise its own standards. The samples project is very loose while pyVmomi is run extremely tightly. That's a function of where on the stack each project lives. In general the deeper down the stack you go, the more rigid the project needs to run to ensure quality and stability for all the projects built on top of it.

 More on the community project next week...

{% endraw %}
