---
excerpt_separator: ""
layout: "archive-post"
title: "pyVmomi and the road to Python3 - part 2"
date: "2014-07-03T13:13:00.001-04:00"
description: "Short week this week, so a short update ... I've spent most of my time with my head in the debugger flipping between Python 2.7 and Python 3.4 interpreters. I've been observing the differences in behavior between the two"
topics: ["python"]
original_labels: ["python 3","pyvmomi"]
original_url: "https://hartsock.blogspot.com/2014/07/pyvmomi-and-road-to-python3-part-2.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-07-03-pyvmomi-and-the-road-to-python3-part-2/"
id: bafyr4ihjpdzrq6ae6ok4tfzcogvpqqnpvl33nypqgpg2ipxgnnbtnbubk4
permalink: /posts/pyvmomi-and-the-road-to-python3-part-2-btnbubk4/
---
{% raw %}

Short week this week, so a short update ...

 I've spent most of my time with my head in the debugger flipping between Python 2.7 and Python 3.4 interpreters. I've been observing the differences in behavior between the two versions and finding ways to make pyVmomi behave with both. Some of the more interesting work has had to do with how Python 3 handles class loading and namespaces. I could probably write a whole post on that alone.

 In my [current attempt](https://github.com/hartsock/pyvmomi/commit/45f35151e9a2808cbe6e05558a761d0173c1c070), even with a good debugger I've been forced to resort to bear-skins-and-bone-knives development. The problem being that the [critical fault](https://gist.github.com/hartsock/52bd5fab36e9bd488a9f)occurs during interpreter load. That has to do with how pyVmomi builds its binding.

 At runtime pyVmomi uses a [LazyModule](https://github.com/vmware/pyvmomi/blob/v5.5.0/pyVmomi/VmomiSupport.py#L211) class to hold instances of class definitions it needs. This leads to some efficiencies in cases where very little of the actual API is being used. The API is enormous as you can see from the [generated documents](https://github.com/vmware/pyvmomi/commit/15f7be9a526d209fb7f0940cbf6b8e7cc481c0dd) I posted so this efficiency makes sense. It does mean that the pyVmomi classes that you use in your own code are not python types as you normally experience them. The binding does produce a convincing illusion, however.

 I've bumped back the next release milestone from July 15th to July 31st to give us time to validate the changes for Python 3 support since they will be slightly more invasive than I had hoped for. I want the next post to pypi to include that Python 3 support patch if possible.

 Lessons learned from porting pyVmomi to Python 3 will be generally valuable beyond just pyVmomi but, I'm still in the thick of it. So far progress is encouraging but there is still a way to go before declaring the new version stable.

 More on that next week...

{% endraw %}
