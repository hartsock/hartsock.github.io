---
excerpt_separator: ""
layout: "archive-post"
title: "Lingua XML"
date: "2006-06-29T09:16:00.000-04:00"
description: "How do you represent data? How do you exchange data on heterogeneous networks? How do you share representations of data between systems? Since the dawn of modern computing (somewhere back around timestamp 0000000001 at t"
topics: ["personal-notes"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2006/06/lingua-xml.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2006-06-29-lingua-xml/"
id: bafyr4ige4pi7pehfjfyfcuwairob22rdnuroqxsnxn26mf263r7vjrlizi
permalink: /posts/lingua-xml-7vjrlizi/
---
{% raw %}

How do you represent data? How do you exchange data on heterogeneous networks? How do you share representations of data between systems?

Since the dawn of modern computing (somewhere back around timestamp 0000000001 at the dawn of the [epoch](http://en.wikipedia.org/wiki/Unix_Epoch)) we've had different methods for representing essentially the same data. Whether it was [little-endian](http://en.wikipedia.org/wiki/Little_endian)versus [big-endian](http://en.wikipedia.org/wiki/Big_endian) or variations on floating point numbers we haven't had a single common way to represent data.

This was a problem that has been attacked from several different angles. One was standards such as the [IEEE floating point](http://en.wikipedia.org/wiki/IEEE_floating_point) standard. [CORBA](http://www.acmqueue.com/modules.php?name=Content&pa=showpage&pid=396) was developed to create Interface Definitions that were mapped to platform specific implementations across machines and networks. Another approach was to declare [plain old text as a standard](http://catb.org/%7Eesr/writings/taoup/html/ch01s06.html)and process it.

The plain old text approach had problems, one of which was not endian issues. The plain old text approach lacked structure. Without structure interpreting the text between programs became a chore. The [parsers](http://en.wikipedia.org/wiki/Parser) were brittle breaking each time a slight change occurred in one program's output. So structured text was introduced... And after a few iterations of this we get [XML](http://en.wikipedia.org/wiki/XML). The real power of XML is its ubiquity.

Obviously, ubiquity isn't something a computing standard gets automatically. People have to agree to use it. For example in the world of international languages French was once "lingua Franca" an expression meaning universal language but literally meaning language of the Francs. There was an attempt to create a new universal language but [Esperanto](http://en.wikipedia.org/wiki/Esperanto) is little more than a curiosity in practice. It isn't universal if people don't use it universally.

Just because a project uses XML doesn't make it better. You can do terrible things with an elegant tool. XML just gives us a universal tool to work with. It may not even be optimal for some tasks. Things such as [JSON](http://en.wikipedia.org/wiki/JSON) work better than XML for the specific task of asynchronous server to browser communication. XML, however, will probably win in this arena just because its power is its universality.

{% endraw %}
