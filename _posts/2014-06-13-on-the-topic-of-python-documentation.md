---
excerpt_separator: ""
layout: "archive-post"
title: "on the topic of python documentation"
date: "2014-06-13T15:52:00.001-04:00"
description: "I was going to talk about task management and how the pyVmomi API works with that. But, this week was eaten up by documentation work. If you're not aware there's a number of Python documentation styles out there. In part"
topics: ["python","software-design","documentation"]
original_labels: ["documentation","pyvmomi"]
original_url: "https://hartsock.blogspot.com/2014/06/on-topic-of-python-documentation.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-06-13-on-the-topic-of-python-documentation/"
id: bafyr4ibbmtqjlkxrpu35cjv4onu3ymodhd4k377svcuxelryfxqksqlpzq
permalink: /posts/on-the-topic-of-python-documentation-qksqlpzq/
---
{% raw %}

I was going to talk about task management and how the pyVmomi API works with that. But, this week was eaten up by documentation work.

 If you're not aware there's a number of Python documentation styles out there. In particular the [Sphinx style documentation](http://sphinx-doc.org/) is the most popular in the Python community at large. The problem with Sphinx documentation style is that it's rather dense to read. I plan on hosting these final products on the github project site, so that becomes part of the conversation as well.

 Because GitHub does such a good job with markdown files, as part of my documentation work I prepared t[his markdown](https://github.com/hartsock/pyvmomi/tree/docs/docs) version of the documentation. This is a very nice looking set of docs that we can generate procedurally. It's relatively regular and it will be easy for people to edit and maintain. But markdown isn't anywhere near anyone's idea of a documentation standard for Python.

 As a matter of human readability I'm very fond of the [Google Python Documentation](http://sphinxcontrib-napoleon.readthedocs.org/en/latest/example_google.html) style. It has the benefit of being regular yet very human readable. The problem is it doesn't get you where you need to go 100% of the time. Many tools around Python are built assuming Sphinx style markups.

 So... what to do? Plainly* I've not decided.* I will at minimum need the sphinx version of these documents. With the Sphinx version we should be able to enable IDEs to do code completion and other nifty tricks. But there's a fair bit of work in taking the [vSphere HTML](http://pubs.vmware.com/vsphere-55/index.jsp?topic=%2Fcom.vmware.wssdk.apiref.doc%2Fright-pane.html)documentation and turning it into Sphinx documentation. I'm busy with a tool to finish off conversions to either format.

 I've spent the week examining various ways to document the project and how to link these up in people's IDE. I've also been looking at ways to walk people through using the library and I've been busy cataloging new enhancement directions as we move along.

 The documentation work makes me very optimistic about switching to static Python classes for a future version of pyVmomi and it might even yield some interesting ways to do a new Java binding using Groovy as a dynamic language base (because Groovy and Python share a lot of language features.)

 I've had to drop off here at week's end with about 80% of the solution in hand for the documents.

 More next week...

{% endraw %}
