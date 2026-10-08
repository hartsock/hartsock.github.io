---
excerpt_separator: ""
layout: "archive-post"
title: "Documentation is live"
date: "2014-06-20T21:55:00.002-04:00"
description: "This week I've been dealing with documentation for pyVmomi. I decided to go with the Google Python Documentation standard for this current set of docs because the Google standard is very human readable and renders reason"
topics: ["python","software-design","documentation"]
original_labels: ["documentation","git","github","pyvmomi","tutorial","video"]
original_url: "https://hartsock.blogspot.com/2014/06/documentation-is-live.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-06-20-documentation-is-live/"
id: bafyr4ic6v4wk2uxzcc3ad2u2pwii6f7ejn3vjdxlyagmjfcn5u2tuzcfdi
permalink: /posts/documentation-is-live-2tuzcfdi/
---
{% raw %}

This week I've been dealing with documentation for pyVmomi. I decided to go with the [Google Python Documentation standard](http://sphinxcontrib-napoleon.readthedocs.org/en/latest/example_google.html) for this current set of docs because the Google standard is very human readable and renders reasonably well in GitHub. The docs are l[ive on GitHub now](https://github.com/vmware/pyvmomi/tree/master/docs).

 However, when it comes to the most useful documentation standard for inline documentation the Sphinx standard has too many benefits to ignore. In particular if you want code completion using tools like Eclipse or IntelliJ you need to have Sphinx docs and those have to be on concrete static classes.

 So, for actual inline code comments I want to enforce [Sphinx's standard with type hinting](https://pythonhosted.org/an_example_pypi_project/sphinx.html). These kinds of hints are very valuable for static code analysis tools and you simply can't get that with any other standard at present.

 My next set of tasks will be to build up the testing infrastructure around pyVmomi, once that is done we'll be able to leave behind the timid and slow progress stage we've been stuck in. This will have to happen sooner rather than later. The project will officially "launch" at VMworld coming up in August and we'll need to be ready for the additional attention that will bring.

 Part of this week's documentation effort has been trying to find ways to present developer documentation and developer guides to make sure that new developers don't get mired down too badly. I've been years off the speakers circuit now and I think it shows. My presentation is a bit choppy but I hope you'll find it useful.

 This video that I've prepared walks through the code contribution process from *[fork](https://help.github.com/articles/fork-a-repo)* to *[pull request](https://help.github.com/articles/creating-a-pull-request). *It assumes you have a previously [setup GitHub account](https://help.github.com/articles/generating-ssh-keys). This is the first time I've done one of these in a good long while and I was surprised by how badly the text blurred. I may update this later.

 When you submit a pull request it should **only** have the commits listed in it that *you wrote* if it doesn't then something went wrong! You'll have to start over by branching from master and cherry-picking your commits. Git has a learning curve but it's worth learning and it's worth spending time with to get things down properly.

 If you have a good contribution and you're really stuck, I've already pulled and cherry-picked some key submissions from other people into my local git repos. I try to preserve the code authorship marks on the patches so that you can find your committer credits on the source repository later.

 Now that we know the basics of how to contribute, I'll take some time and work on precisely *[what](https://github.com/vmware/pyvmomi/issues?milestone=1&page=1&state=open)* we're going to work on and *[when](https://github.com/vmware/pyvmomi/issues/milestones)* we'll release it.

 More on that next week...

{% endraw %}
