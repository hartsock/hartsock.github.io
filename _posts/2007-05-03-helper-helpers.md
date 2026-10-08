---
excerpt_separator: ""
layout: "archive-post"
title: "helper helpers"
date: "2007-05-03T09:52:00.000-04:00"
description: "While trying to solve a problem in code you go about finding the generic, abstract, or reusable and refactoring it out into units that can be adapted to a number of similar tasks using configuration or minimal programmin"
topics: ["software-design"]
original_labels: ["programming"]
original_url: "https://hartsock.blogspot.com/2007/05/helper-helpers.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-05-03-helper-helpers/"
id: bafyr4icz2u45tw7h44wiljtapoxe7344qazfrmifekdswj6ceto3jk5mxe
permalink: /posts/helper-helpers-o3jk5mxe/
---
{% raw %}

While trying to solve a problem in code you go about finding the generic, abstract, or reusable and refactoring it out into units that can be adapted to a number of similar tasks using configuration or minimal programming. In a language like Java this is usually about finding parent classes and helper methods... or even aspects.

For example, you pull out a private helper method out of a public method. The private helper takes three parameters while the public method only takes two. Now you can create new public method that only has two parameters and uses the private helper with a different third parameter. The benefit is that your second method only took one line of code and you saved yourself from cut and paste hell.

When does this stop?

When it's appropriate to stop. At some point the helper helper helper pushes the code's function so far down that you can't tell what the public method is supposed to do... or you end up with hundreds of one parameter methods that call two parameter methods that call three parameter methods. At this point abstraction stops helping and starts hurting the cause. Too much abstraction simply becomes obfuscation.

{% endraw %}
