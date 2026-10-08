---
excerpt_separator: ""
layout: "archive-post"
title: "The Rules of Data Normalization"
date: "2007-07-10T15:09:00.000-04:00"
description: "When Codd came down from the moutain top he held in his hands two stone tablets that had these rules graven upon them. One tablet contained the first three rules, the second tablet contained the other two. The rules are:"
topics: ["software-design"]
original_labels: ["database","rdbms"]
original_url: "https://hartsock.blogspot.com/2007/07/rules-of-data-normalization.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-07-10-the-rules-of-data-normalization/"
id: bafyr4ihu5vkwgilymhiaztsspskbnxsowqnvt5mcneksg2nx3en4rdzdn4
permalink: /posts/the-rules-of-data-normalization-n4rdzdn4/
---
{% raw %}

When Codd came down from the moutain top he held in his hands two stone tablets that had these rules graven upon them. One tablet contained the first three rules, the second tablet contained the other two. The rules are:

 1. Eliminate Repeating Groups: Thou shalt not repeat the names of columns in a table. The key shall designate a unique row without repeats.

 2. Eliminate Redundant Data: Thou shalt not repeat data in a table. The data in a table shall be unique for the whole of the key.

 3. Eliminate Columns not dependent on the key: Thou shalt not put data in a table that relates to a column not in the key.

 4. Isolate Independent Multiple Relationships: Thou shalt not put multiple relationships in one table unless they are related to each other

 5. Isolate Semantically Related Multiple Relationships: Thou shalt not mingle semantically unrelated data in the same table.

The first three rules can be committed to memory using this saying: "The key, the whole key, and nothing but the key... so help me Codd."

Good database design will not number column names. Good database design will focus on what uniquely identifies data and not repeat the same data over and over again in the same table. Good database design will only relate columns to the key creating new tables for newly identified keys. Good database design will avoid master "relationship tables" that force all relationships to traverse them. Good database design will not mix un-related data just because they share the same key.

Thus saith Codd.

Woe unto those who do not heed the words of Codd for doom and swarms of Bugs will follow all those who fail to heed the wisdom of Codd.

Joy and prosperity will follow all who hear and obey the words of Codd for they will know the ever lasting peace of DataIntegrity.

{% endraw %}
