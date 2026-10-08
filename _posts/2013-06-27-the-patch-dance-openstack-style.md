---
excerpt_separator: ""
layout: "archive-post"
title: "The patch dance - OpenStack style."
date: "2013-06-27T22:48:00.002-04:00"
description: "If you are working on patches for OpenStack and you find yourself building patches that rely on other patches... what do you do? Well, you could maintain all your patches in one big directory and hope not to screw someth"
topics: ["personal-notes"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2013/06/the-patch-dance-openstack-style.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2013-06-27-the-patch-dance-openstack-style/"
id: bafyr4ibbrlqjtddkw6p5jmhwqvyup4xbv4yk3ibq6cy2e5igtiqspq4rpq
permalink: /posts/the-patch-dance-openstack-style-qspq4rpq/
---
{% raw %}

If you are working on patches for OpenStack and you find yourself building patches that rely on other patches... what do you do? Well, you *could* maintain all your patches in one big directory and hope not to screw something up or "cross the files" but that would be down right lazy.

 Seriously... lazy in the bad way... not at all lazy in the good way.

 The right way to do things is a git branch per bug (or blueprint related patch) and then to rebase each "down-stream" bug from your appropriate "up-stream" bugs. That means you need to create a kind of "bug dependency" chart maintaining a tree like relationship between the various bugs.

 As a prerequisite, I'll assume you followed:

- http://docs.openstack.org/developer/nova/devref/development.environment.html
- https://wiki.openstack.org/wiki/GerritWorkflow

 If you were a dummy and you managed to submit your first review on *master *(oh you fool!) then how do you fix this? Assuming your patch is safely up in [gerrit](https://review.openstack.org/)for review already...

1. roll back your master to head
2. create a new local branch for your bug number
3. use the "patch" link for your patch in gerrit
4. after applying the patch, commit again and paste your old message in as the new commit message

 The trick that makes this work is the special Change-Id:xxxxxxxx line at the end of the original message. This will tell gerrit to take your incoming patch as a new version of the old change.

 What happens if you need to rebase your patch?

1. git check out the master
2. git fetch --all
3. check out your bug branch
4. git rebase master
 What happens if you need to have bug B based on bug A?

1. git checkout master
2. git fetch --all
3. git branch bug/A
4. git checkout bug/A
5. do work for bug/A and possibly submit it to git review
6. git checkout bug/A
7. git branch bug/B
8. git checkout bug/B
9. do work for bug/B and possibly submit separately
 Need to make sure the master hasn't drifted under bug A and B?

1. git checkout master
2. git fetch --all
3. git checkout bug/A
4. git rebase master
5. ... conflicts better result in your changing only code touched in bug/A or see the trick for how to "move" a patch to a branch above ...
6. git checkout bug/B
7. git rebase bug/A
 The key is to keep the dependencies clean, feeding the master, then sliding up the branch dependency tree one bug at a time pulling forward the rebase from the last branch. Keeping each branch and patch separate should make other aspects of your life easier.

{% endraw %}
