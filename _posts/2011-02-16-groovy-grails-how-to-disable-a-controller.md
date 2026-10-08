---
excerpt_separator: ""
layout: "archive-post"
title: "Groovy/Grails: How to disable a controller"
date: "2011-02-16T08:00:00.000-05:00"
description: "(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiCG0Kg4cLXOi8v7CsxAfbFXd5nZV6o6Pp7JfwXHxN5ZWOwGGVKL4YDo6x5Sv46zsqm1EBOCs3OGJrhDBB44nUYiq7OjY1UPOsJBqk7U-qCJGZ1DvxxegGAHQxXKNW1Gb1gHx3g/s"
topics: ["software-design"]
original_labels: ["controllers","filters","grails","groovy"]
original_url: "https://hartsock.blogspot.com/2011/02/groovygrails-how-to-disable-controller.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2011-02-16-groovy-grails-how-to-disable-a-controller/"
id: bafyr4ie62j7nhz4zxx3sqxbb4a3f2d7lmqoihb3skknt4p6i4e5nukbjk4
permalink: /posts/groovy-grails-how-to-disable-a-controller-5nukbjk4/
---
{% raw %}

[(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiCG0Kg4cLXOi8v7CsxAfbFXd5nZV6o6Pp7JfwXHxN5ZWOwGGVKL4YDo6x5Sv46zsqm1EBOCs3OGJrhDBB44_nUYiq7OjY1UPOsJBqk7U-qCJGZ1Dvx_xegGAHQxXKNW1Gb1gHx3g/s400/Selection_012.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiCG0Kg4cLXOi8v7CsxAfbFXd5nZV6o6Pp7JfwXHxN5ZWOwGGVKL4YDo6x5Sv46zsqm1EBOCs3OGJrhDBB44_nUYiq7OjY1UPOsJBqk7U-qCJGZ1Dvx_xegGAHQxXKNW1Gb1gHx3g/s1600/Selection_012.png)

Let's say you have a plugin. That plugin includes a controller. You don't want to use the controller provided by the plugin (for whatever reason) but instead you want use your own controller.

What do you do?

Filters my friend. Filters.

Next to your *Config.groovy* file in the grails-app/conf directory create for your self a file called *DisableFilters.groovy* and then add a class definition. Here's a filter definition that disables *everything* in the application... (making your grails application headless).

```

```

class DisableFilters {

 def filters = {

 all(controller:'*', action:'*') {

 before = {

 // return false

 }

 after = {

 }

 afterView = {

 }

 }

 }

}

Now you'll notice there is a *before* closure and it returns false. This closure fires *before* the request is passed to its destined controller/action. The *** means match all. So if you had a specific controller name or specific controller name pattern you wanted to disable you could easily disable all these by matching the name here.

Notice the nifty *after* which would execute *after* the controller and action complete. Finally you have the *afterView* closure which would execute after the entire call chain was done and the browser has left. I'll leave the uses for these up to your imagination.

In the filter body you have access to everything you have in a grails controller so you have a great deal of flexibility here with what you can do. You could look at usernames, session data, whatever your heart desires. You can even redirect the request to another URL using the same conventions as you would have in a controller. So have at it!

{% endraw %}
