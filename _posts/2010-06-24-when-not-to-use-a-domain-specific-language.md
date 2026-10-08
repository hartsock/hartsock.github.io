---
excerpt_separator: ""
layout: "archive-post"
title: "When NOT to use a Domain Specific Language"
date: "2010-06-24T06:53:00.005-04:00"
description: "There's really one rule I can use to sum up why you would not use a domain specific language. > Do not use a Domain Specific Language when implementation specifics out weigh domain specifics. This one rule covers numerou"
topics: ["software-design","philosophy"]
original_labels: ["DSL","domain specific languages","philosophy"]
original_url: "https://hartsock.blogspot.com/2010/06/when-not-to-use-domain-specific.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2010-06-24-when-not-to-use-a-domain-specific-language/"
id: bafyr4iepaj7sxofdw3k2lijtzb45js27hfyerrt5cbydjp2onzoz2y3jve
permalink: /posts/when-not-to-use-a-domain-specific-language-oz2y3jve/
---
{% raw %}

There's really one rule I can use to sum up why you would **not** use a domain specific language.

>

Do not use a Domain Specific Language when implementation specifics out weigh domain specifics.

This one rule covers numerous cases:

1. when intimate knowledge of *API* are as important as function

2. when performance is critical and requires expert knowledge

3. when implementation details are nearly as important as semantic details

All these cases and numerous variations on this theme are summed up by acknowledging that the choice of using a Domain Specific Language (DSL) is a design trade off. You are deliberately adding a layer to your application stack. This layer intrinsically incurs a maintenance and/or performance cost. (Not all DSL cost additional clock cycles at run time it depends on your implementation.)

With these costs and benefits in mind you can make an intelligent choice about when and where to use this tool. It is far from a panacea but Domain Specific Languages do have the allure of potentially netting you accidental programmers and preserving folk knowledge about your system and its real world uses that few other techniques offer.

{% endraw %}
