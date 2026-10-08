---
excerpt_separator: ""
layout: "archive-post"
title: "pyVmomi: preparing for 5.5.0-2014.1.1 our first bug fix release."
date: "2014-08-22T13:01:00.001-04:00"
description: "I've been heads down this week, so a short update this time. Last week, we released pyVmomi 5.5.02014.1 to pypi. This week we started work on preparing RPM and Debian packages which will allow pyVmomi to be included with"
topics: ["python","software-design"]
original_labels: ["pyvmomi"]
original_url: "https://hartsock.blogspot.com/2014/08/pyvmomi-preparing-for-550-201411-our.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-08-22-pyvmomi-preparing-for-5-5-0-2014-1-1-our-first-bug-fix-relea/"
id: bafyr4ielhexj5vl5gu5lglu2ynhf44ot2dtkbodemriontuoj7zp4pym3i
permalink: /posts/pyvmomi-preparing-for-5-5-0-2014-1-1-our-first-bug-fix-relea-zp4pym3i/
---
{% raw %}

I've been heads down this week, so a short update this time.

 Last week, we released [pyVmomi 5.5.0_2014.1](http://hartsock.blogspot.com/2014/08/pyvmomi-version-550-20141-is-available.html) to pypi. This week we started work on preparing [RPM](https://bugzilla.redhat.com/show_bug.cgi?id=1132971) and [Debian](https://github.com/vmware/pyvmomi/pull/125) packages which will allow pyVmomi to be included with Linux distributions important for OpenStack work.

 Having released 2014.1 I opened a milestone for [2014.1.1](https://github.com/vmware/pyvmomi/milestones/pyVmomi%205.5.0-2014.1.1) as a bug fix release and identified a few smaller quick turn around tasks. We have one [known bug](https://github.com/vmware/pyvmomi/issues/112) and a few minor improvements and changes that we'll have to get in place. (Being right up against [VMworld](http://www.vmworld.com/) has slowed down a few tasks, but we're still moving rapidly.)

 Notably the 5.5.0-2014.1.1 release will:

- [Fix](https://github.com/hartsock/pyvmomi/commit/40e5501a92d0a8bd52e396f5a6bf81d72df9853f)a [bug](https://github.com/vmware/pyvmomi/issues/112) with sending date-time stamps to the server
- [Tweak](https://github.com/vmware/pyvmomi/issues/127) the version number standard to fit better with pypi and RPM.
- Standardize [packaging](https://github.com/vmware/pyvmomi/issues/122) for the pyVmomi library
- Improve [release documentation](https://github.com/vmware/pyvmomi/issues/129) and processes for versions.
 I got a bit side-tracked this week as I investigated more of the pyVmomi internals and noted that the XML documents are non-deterministically assembled. This means from one run to the next the SOAP message coming out of pyVmomi can be different in certain *trivial* ways.

 I noted that...

- The order of *xmlns="*"* attributes inside tags can occur in random order
- The amount of whitespace in documents can vary in some situations
 This meant that naive string-based comparisons done in vcrpy's built-in [body request matcher](https://github.com/kevin1024/vcrpy#request-matching) can't actually compare XML document contents for *logical* consistency. I wrote the start of an [XML based comparison system](https://github.com/hartsock/pyvmomi/tree/xml_compare_test_feature) but after burning more than three days on the problem I have to stop and wonder if this is [worth the effort](https://travis-ci.org/hartsock/pyvmomi/builds/33297014) and if it wouldn't be simpler to just figure out *why* pyVmomi creates random ordered XML and then *fix that* instead.

 In the next week-or-so, we should be able to deliver a quick-turn around bug fix release with the improvements I've listed here. We're doing well for this now that we're getting more attention from last week's release. The [2014.2](https://github.com/vmware/pyvmomi/milestones/pyVmomi%205.5.0-2014.2) is tentatively scheduled for November 15th this year.

 More on these topics next week...

{% endraw %}
