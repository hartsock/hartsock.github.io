---
excerpt_separator: ""
layout: "archive-post"
title: "Database Design"
date: "2006-12-14T14:33:00.000-05:00"
description: "Let's say I want a screen that displays a list of MP3s with Genre, Artist, Album, Song Name, Play Length. What would the database table for this look like? Many neophytes would design a table that looked like: MP3Files C"
topics: ["software-design"]
original_labels: ["database","design","normalization"]
original_url: "https://hartsock.blogspot.com/2006/12/database-design.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2006-12-14-database-design/"
id: bafyr4idmrvjepz2yzoht2ciap3znqeqje3ujfucyzfx4sgxl5uhw4c32qi
permalink: /posts/database-design-hw4c32qi/
---
{% raw %}

Let's say I want a screen that displays a list of MP3s with Genre, Artist, Album, Song Name, Play Length. What would the database table for this look like? Many neophytes would design a table that looked like:

MP3Files

Column

Typedefault

MP3ID

int

auto increment

Genre

varchar(255)NULL

Artist

varchar(255)NULL

Album

varchar(255)

NULL

Song Name

varchar(255)

NULL

Play Length

 varchar(255)NULL

... and amazingly never see the problem with this.

{% endraw %}
