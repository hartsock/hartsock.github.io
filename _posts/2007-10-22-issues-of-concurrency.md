---
excerpt_separator: ""
layout: "archive-post"
title: "Issues of Concurrency"
date: "2007-10-22T11:19:00.000-04:00"
description: "I have a problem. I have two databases. One old one and one new one. The new one is fully normalized and the old one is not. Both databases drive their own front ends. One is a Perl front end the other is a Spring Java f"
topics: ["software-design"]
original_labels: ["OLTP","ORM","concurrency","database","hibernate"]
original_url: "https://hartsock.blogspot.com/2007/10/issues-of-concurrency.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-10-22-issues-of-concurrency/"
id: bafyr4if6cp3fslcgp6hakkavuosjxsagxrqannx4s5e7y2hdxcp26k5ynm
permalink: /posts/issues-of-concurrency-p26k5ynm/
---
{% raw %}

I have a problem. I have two databases. One old one and one new one. The new one is fully normalized and the old one is not. Both databases drive their own front ends. One is a Perl front end the other is a Spring Java front end. The data between both interfaces has to stay in sync. Our DBA has elected to use triggers to keep the databases in sync.

Hibernate uses its own Version column to keep up with which version got committed to the database and when it happened. There are articles dealing with JPA, Hibernate, and Concurrency... my problem is a little different.

Here's my example of the problem.

Let's say you have a web application using an ORM engine like Hibernate. There is Entity version 1 in the database. User Alice checks out version 1. User Bob checks out version one.

Alice edits her copy of version 1 and sends it back. The ORM engine checks the object version against the database version and they match and on commit of Alice's changes the database version number is set to 2.

Bob makes changes to his copy of version 1 of the Entity and checks his version in. The ORM checks the database version and sees version 2 in the database. Version 1 is old and Bob gets an error reporting mid-air collision.

Now lets say you introduce a second database. This second database uses different Relational mappings but is itself an OLTP. Let's pretend both databases have exact copies of the data initially and an update trigger mechanism keeps the two OLTP's in sync.

If Alice checks out version 1 from the first database and the first interface and Bob checks out version 1 from the second database and the second interface. When Alice makes her change and creates first version 2 (2' or two prime) and Bob commits his changes to create second version 2 or (2'' or two double prime) the trigger from the first database to update the second will fire simultaneously as the trigger from the second.

In other words Alice's OLTP is unaware of changes made on Bob's OLTP and both changes are in route to the other's.

How should the two databases proceed?

Should last saved win? Should both databases error and roll back? Should the systems attempt to "merge" changes? Should one system be elected the "authority" for this data electing that Alice's interface and OLTP are always the right ones?

{% endraw %}
