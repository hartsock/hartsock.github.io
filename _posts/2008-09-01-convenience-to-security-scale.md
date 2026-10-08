---
excerpt_separator: ""
layout: "archive-post"
title: "Convenience To Security Scale"
date: "2008-09-01T13:31:00.002-04:00"
description: "I was thinking about a few things... we're doing a kind of security system audit at work and I've come up with a few koans about it: Convenience is inversely proportional to Security. The more secure something is the mor"
topics: ["capability-security"]
original_labels: ["Security"]
original_url: "https://hartsock.blogspot.com/2008/09/convenience-to-security-scale.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-09-01-convenience-to-security-scale/"
id: bafyr4ihyh4h25v54nabuoedv4ddgcvzlx7zun5vbe5nh6rynpk7h2n4vum
permalink: /posts/convenience-to-security-scale-7h2n4vum/
---
{% raw %}

I was thinking about a few things... we're doing a kind of security system audit at work and I've come up with a few koans about it:

*

Convenience is inversely proportional to Security.

*

*

The more secure something is the more inconvenient it is.

*

*

The easiest security system to use is one that doesn't exist.

*

 In one measure the goal of security is to make things hard for people. Specifically, it should make things extremely hard for Bad People (tm) and not too hard for Good People (tm). These are both user groups that you are attempting to distinguish between. Both the good and bad people are people attempting to use your system and you are making a call as to which group a person belongs in.

So to that effect I've created the **Convenience to Security Scale** (patent pending).

 On a scale from 1 to 10 a system that rates a 1 has no security whatsoever and is (presumably) very easy to use. And, a system that rates a 10 is perfectly secure because it is completely inaccessable. The goal is to judge where on the scale your system needs to be.

This model works even for insecure and frequently crashing programs since the frequent crashes are viewed (in this model) as a security feature preventing attackers from using the service. So making the program more stable and thereby more useable makes it more attackable... lowering its rating on the scale. A program that can't execute is perfectly secure since it can never be attacked.

The "secure" in this model is also referring to the protection of information... no "secret" information is divulged by the program. So a program that can't produce output is perfectly secure... it is also perfectly unusable.

{% endraw %}
