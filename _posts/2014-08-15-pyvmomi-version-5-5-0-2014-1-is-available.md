---
excerpt_separator: ""
layout: "archive-post"
title: "pyVmomi version 5.5.0-2014.1 is available."
date: "2014-08-15T17:26:00.002-04:00"
description: "Earlier today with help from other VMware employees and python IRC users, I pushed the buttons necessary to release pyVmomi version 5.5.0-2014.1 to the general public. This is the first open source community built and re"
topics: ["python","software-design","organizations"]
original_labels: ["pyvmomi"]
original_url: "https://hartsock.blogspot.com/2014/08/pyvmomi-version-550-20141-is-available.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-08-15-pyvmomi-version-5-5-0-2014-1-is-available/"
id: bafyr4iebpfvghotisaxihkdhcnzkuagu7vlkljzkhgnbktvekkxukzh6ka
permalink: /posts/pyvmomi-version-5-5-0-2014-1-is-available-xukzh6ka/
---
{% raw %}

Earlier today with help from other VMware employees and #python IRC users, I pushed the buttons necessary to release [pyVmomi version 5.5.0-2014.1](https://pypi.python.org/pypi/pyvmomi/5.5.0-2014.1) to the general public. This is the first open source community built and released version of the [vSphere Management API library](http://pubs.vmware.com/vsphere-55/topic/com.vmware.wssdk.apiref.doc/right-pane.html) since VMware open sourced the project in [December](http://www.virtuallyghetto.com/2013/12/early-xmas-gift-from-vmware-pyvmomi.html).

 This release featured [contributions](https://github.com/vmware/pyvmomi/compare/v5.5.0...v5.5.0_2014.1) from 13 contributors, 10 of which were completely unaffiliated with VMware. With the exception of myself the [most active contributors](https://github.com/vmware/pyvmomi/graphs/contributors?from=2013-12-18&to=2014-08-15&type=c) are not at all affiliated with VMware.

 Special Thanks to...

- [Kevin McCarthy](https://github.com/vmware/pyvmomi/compare/v5.5.0...v5.5.0_2014.1) for his [vcrpy](https://github.com/kevin1024/vcrpy) project and his [contributions to pyVmomi](https://github.com/vmware/pyvmomi/commits?author=kevin1024) that made stand-alone and automated testing possible.
- [Michael Rice](https://github.com/vmware/pyvmomi/commits?author=michaelrice) for is help in setting up Travis builds, tracking down issues, and helping out on IRC when I wasn't around.

 Thanks as well to William Lam for [championing our project](http://www.virtuallyghetto.com/2014/08/pyvmomi-vsphere-sdk-for-python-5-5-0-2014-1-released.html) as well.

 This release marks an important step for pyVmomi, most notably the ability to use pyVmomi with vcrpy means we can do much more in-depth and thorough bug reporting for 3rd party developers. It also means that the focus of development can move from infrastructure to feature parity.

 More on that next time...

{% endraw %}
