---
excerpt_separator: ""
layout: "archive-post"
title: "Developer Community Engagement"
date: "2014-09-12T15:41:00.004-04:00"
description: "If you've not been following along at home, pyVmomi was run in a different manner from most VMware Open Source projects. It's been a bit of a social experiment. The last two weeks since our release, I've been working on "
topics: ["python","organizations"]
original_labels: ["pyvmomi","rbvmomi"]
original_url: "https://hartsock.blogspot.com/2014/09/developer-community-engagement.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-09-12-developer-community-engagement/"
id: bafyr4igrgdtfszqoi5zx6l2gp2ndjckjy7w7p6rqfrtdhpbvjypbqghofa
permalink: /posts/developer-community-engagement-pbqghofa/
---
{% raw %}

If you've not been following along at home, pyVmomi was run in a [different manner](http://hartsock.blogspot.com/2014/05/how-pyvmomi-is-something-different.html) from most VMware Open Source projects. It's been a bit of a social experiment. The last two weeks since our [release](https://github.com/vmware/pyvmomi/releases), I've been working on distilling lessons learned from the past five months of the project.

 I did not plan on also looking into [rbVmomi](https://rubygems.org/gems/rbvmomi) ... but ... at the same time just after [VMworld](http://www.networkworld.com/article/2466485/virtualization/top-5-things-to-watch-for-at-vmworld-2014.html) a [certain blog post](http://www.mattwrock.com/blog/dear-vmware-please-give-us-nice-things-to-automate-the-things) started making the rounds on [social media](https://twitter.com/dberkholz/status/507543475735527424). It's clearly an opportunity to examine what we're doing at VMware around OpenSource development projects.

 [rbVmomi](https://github.com/vmware/rbvmomi) is a more typical VMware fling project. These start as a developer driven POC project and these are developed on a best-effort basis. The rbVmomi project has closed [6 issues](https://github.com/vmware/rbvmomi/issues?q=is%3Aissue+is%3Aclosed) and closed [10 pull requests](https://github.com/vmware/rbvmomi/pulls?q=is%3Apr+is%3Aclosed) during its entire lifetime as a VMware project.

 [pyVmomi](https://github.com/vmware/pyvmomi) has benefited from having my attention full time since April/May of 2014. The total number of issues closed [to date is 59](https://github.com/vmware/pyvmomi/issues?q=is%3Aissue+is%3Aclosed) with a total number of [70 merges.](https://github.com/vmware/pyvmomi/pulls?q=is%3Apr+is%3Aclosed) These differences in numbers shouldn't be surprising, that's to be expected when you go from *free time* development to *full time* development. My personal stats have become [quite impressive](https://twitter.com/hartsock/status/510509689688170496) due to the full-time activity on GitHub.

 That's all nice for me, but, what does that really mean for the library? What does that mean for developer use, experience, and over-all for VMware? It's a matter of audience and SDK adoption.

 Over on stackoverflow, you can see that in its entire life-span rbVmomi has had [9 questions](http://stackoverflow.com/search?q=rbvmomi) asked as of this writing. That indicates 9 times people who are likely to seek help on stackoverflow have sought help and those 9 times only 4 of those questions got answers.

(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEju9EVdmg0R5FwhUIslVgq6qg2OdOutVQH1mYenv4acwXuWZAB8qhPSFoiH-bRl8-FrxDVS-7GkAwPZeJ3vLCO6ieuKU6R5GJosH_QSHbXerv0X2yjkVbCGaEKwOz_EZKfkKL2Eaw/s1600/Screen+Shot+2014-09-09+at+4.54.18+PM.png)

 Taking a look at the same search for pyVmomi yields [24 questions](http://stackoverflow.com/search?q=pyvmomi) over a much shorter life-span.

 [(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj2C8RSGRiWkauHuyIGnlsEir8bPW7OsX1F5Yj56DyV2u-gwLUoZLBXpWFIKAZaBlNGGooaUIj7vbZLfNELQpUm9hnyqbh3KF6oD4eL9yav5EpxSTAL0cGOJC4viw7PvkDEE_nHoQ/s1600/Screen+Shot+2014-09-09+at+4.55.58+PM.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj2C8RSGRiWkauHuyIGnlsEir8bPW7OsX1F5Yj56DyV2u-gwLUoZLBXpWFIKAZaBlNGGooaUIj7vbZLfNELQpUm9hnyqbh3KF6oD4eL9yav5EpxSTAL0cGOJC4viw7PvkDEE_nHoQ/s1600/Screen+Shot+2014-09-09+at+4.55.58+PM.png)

 13 of these questions have been answered and 19 of times people voted on the questions where as with rbVmomi *no one voted*. If you take a closer look, 17 of those questions occur *after* my full time commitment to the project. In the shorter time-frame my public commitment and effort to the library has helped increase developer engagement with the library improve by an order of magnitude.

 The next question is... is this effort *worth it*? And *how do we determine that*?

 I'm open to suggestions. What else should I be looking at?

{% endraw %}
