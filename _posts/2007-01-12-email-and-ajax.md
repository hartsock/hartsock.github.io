---
excerpt_separator: ""
layout: "archive-post"
title: "Email and Ajax"
date: "2007-01-12T17:06:00.000-05:00"
description: "If you write a web form to allow people to compose a mail message and you intend to let them send the email once they are done... don't setup an Ajax method called \"sendEmail\" because... now you're asking for trouble. Es"
topics: ["capability-security"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2007/01/email-and-ajax.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-01-12-email-and-ajax/"
id: bafyr4ibf2w5logclf2ynamdwxkmfwwlkuogxf2q3avgbgtyvsmmbc4j65u
permalink: /posts/email-and-ajax-mbc4j65u/
---
{% raw %}

If you write a web form to allow people to compose a mail message and you intend to let them send the email once they are done... don't setup an Ajax method called "sendEmail" because... now you're asking for trouble. Especially if you are in a portlet and didn't extend security around the servlet that is servicing your JSON messages. Just not a great idea.

{% endraw %}
