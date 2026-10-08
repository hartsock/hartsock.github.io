---
excerpt_separator: ""
layout: "archive-post"
title: "pyVmomi and the road to Python3 - part 1"
date: "2014-06-27T18:13:00.000-04:00"
description: "This week in pyVmomi development I've been working onPython 3x support. In my opinion this is the most important move to make in pyVmomi development. While python 2.7 will have a long life ahead of it with support contin"
topics: ["python"]
original_labels: ["python 3","pyvmomi"]
original_url: "https://hartsock.blogspot.com/2014/06/pyvmomi-and-road-to-python3-part-1.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-06-27-pyvmomi-and-the-road-to-python3-part-1/"
id: bafyr4igbsibsplxitqm4iqxaj2gfaopiqozn4vuwt76k2nmoa6oeditx2m
permalink: /posts/pyvmomi-and-the-road-to-python3-part-1-oeditx2m/
---
{% raw %}

This week in pyVmomi development I've been working on[Python 3x support](https://github.com/vmware/pyvmomi/issues/55). In my opinion this is the most important move to make in pyVmomi development. While python 2.7 will have a [long life](http://legacy.python.org/dev/peps/pep-0373/) ahead of it with support continuing through 2020 most [state of practice projects](https://wiki.openstack.org/wiki/Python3) will be moving to python 3 much ahead of that.

 As a library, our target audience is the developer working on *new *products *right now* so tying the project to Python 2 only means cutting out a majority of our potential adopters. For the general health and longevity of the project we need to make the move.

 That means, the first, most invasive, and most volatile change to be made to pyVmomi will be to change the library *just *enough to allow it to operate both on Python 2 and Python 3. And I'm already in process of making [these changes](https://github.com/hartsock/pyvmomi/tree/python3) while also writing a test suite for the library.

 In the process of writing these changes I've found that there's more to do than initially thought. Python 3 migration was one of the blockers that initially made me pause when I was evaluating the use of [pyVmomi in OpenStack](https://review.openstack.org/#/c/69964/). I went from very optimistic, to the realization that there would be some work to do. Now in my [current investigation](https://github.com/hartsock/pyvmomi/commit/cc9e643bc63cbf9f3432f641cf85d47d93daff17), I've determined that [trivial python 2 to 3 automation](https://docs.python.org/2/library/2to3.html) may not get us all the way there.

 I'll be spending the next week or so investigating how to best make this move. And I'll keep you posted on how this is progressing. I'll be looking for the simplest, cheapest, and best fit solution for the problem. That doesn't mean I'm looking for the most elegant solution but just the most effective.

 Of primary concern to the pyVmomi SDK is maintaining compatibility with the existing tools and toolchains that already use it. That may mean occasionally making decisions that don't look [Pythonic](http://python.net/~goodger/projects/pycon/2007/idiomatic/handout.html#naming). The solution as a whole is more important than any one technical element. That's what we keep in mind when we design solutions like pyVmomi. How do we deliver something that doesn't just work in its beauty, but also in it's practicality.

 Here's a nice video to underscore this kind of thinking. It's a thoughtful analysis of why Betamax lost to VHS and it underscores the role of ecosystem. The total ecosystem a product lives within is important and its really those factors that determine which solution is proven.

 On other fronts, the [pyvmomi-community-samples](http://vmware.github.io/pyvmomi-community-samples/) project is starting to take shape. This project has our lowest bar to entry. If you were just getting started and wanted to contribute that's the best place for you to go. If you want to write something but don't have an idea what to write, there is a [significant backlog](https://github.com/vmware/pyvmomi-community-samples/issues?labels=help+wanted&state=open) on the project ready for takers. Some marked with the '*low hanging fruit*' tag are likely suitable for beginners.

 If you are contributing to [pyvmomi-community-samples](http://vmware.github.io/pyvmomi-community-samples/) then you are making a contribution to an [Apache 2 Licensed](http://www.apache.org/licenses/LICENSE-2.0.html)project. That means you get to keep a by-line on your file if you like, but it really belongs to the community after you submit it and it's under that nice Apache 2 License. In my experience, code [you post](http://www.planet-source-code.com/vb/scripts/ShowCode.asp?txtCodeId=34&lngWId=3) can [end up](http://mikepetry.blogspot.com/2008/06/hell-is-other-peoples-code.html) in the [darnedest places](http://jogamp.org/git/?p=jogl.git;a=blob;f=LICENSE.txt#l341) so you might as well post to a project that will respect your authorship.

 If you are a bit more advanced and want to extend pyVmomi then I've set up [pyvmomi-tools](https://github.com/vmware/pyvmomi-tools). The project's purpose is to act as an incubator while we iron out problems like the Python 2 to 3 issue. I've blogged about the project [here](http://hartsock.blogspot.com/2014/06/pyvmomi-tools-and-alarm-ack-reset.html). You'll need to be a more advanced developer to really help out with that project and I've been hearing from people interested in talking about which way to go with extending pyVmomi beyond it's core vSphere API. There's lots to do there and we'll need to setup some time to discuss between interested parties new feature sets to include.

 If you are an IRC user you can hang out with me on freenode on [#pyvmomi and #pyvmomi-dev](http://webchat.freenode.net/?channels=#pyvmomi,#pyvmomi-dev) or as always I'm on [twitter](https://twitter.com/hartsock).

 We're also working on a regression testing suite for pyVmomi targeted for public use by teams interested in doing their own integration testing. This is intended to be a test suite for building a public facing CI for pyVmomi contributors, but also it will be a way for private cloud vendors take and adapt the project and create their own in-house IaaS stress testing services.

 More on that another time...

{% endraw %}
