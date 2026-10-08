---
excerpt_separator: ""
layout: "archive-post"
title: "Nobody gets CSS"
date: "2007-01-11T09:49:00.000-05:00"
description: "Designers should \"get\" CSS. Yet of the dozen or so I've interviewed the following construct seems alien... <div class=\"title\">block1</div> <div class=\"info\"><div class=\"title\">block2</div></div> <div class=\"detail\"><div "
topics: ["personal-notes"]
original_labels: ["CSS","web2.0"]
original_url: "https://hartsock.blogspot.com/2007/01/nobody-gets-css.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-01-11-nobody-gets-css/"
id: bafyr4iebmxysbp2suouulzek26fdwsz7i27e75eazt2cdytnco6yt4xqpu
permalink: /posts/nobody-gets-css-6yt4xqpu/
---
{% raw %}

Designers should "get" CSS. Yet of the dozen or so I've interviewed the following construct seems alien...

<div class="title">block1</div>

<div class="info"><div class="title">block2</div></div>

<div class="detail"><div class="title">block3</div></div>

Accompanied with the CSS that reads:

<style type="text/css">

.title {

background: red;

color: black;

}

.info .title {

background: blue;

}

.detail .title {

color: green;

}

</style>

Now I might ask...

What color is the text block1?

What color is the background?

And the same for block2?

And block3?

The answers are: block1 shows as black on red text, block2 shows as black on blue, and block3 shows as green on red. And most of my interviewees are utterly confused by the above code. Most will default to naming everything a unique name such as info_title and detail_title. This sort of defeats the purpose of having the classes and subclasses defined at all.

Why is this kind of construct more desirable than one unique name per block? In an Ajax application where items are being moved around the DOM you may want the block3 to transform properly when it is moved adjacent to the block2. Also there may be common properties between title blocks across the document... such as font and font size... and only certain properties are overloaded in certain contexts such as color.

{% endraw %}
