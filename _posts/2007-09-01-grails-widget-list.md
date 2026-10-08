---
excerpt_separator: ""
layout: "archive-post"
title: "Grails Widget list..."
date: "2007-09-01T13:40:00.000-04:00"
description: "Take a look at this... def constraints = { description(widget:'textarea') } ... which I got from the Grails site. So, if you want to use the code generators to create views for a form and want a string to have a text are"
topics: ["software-design"]
original_labels: ["UI","code","grails","groovy","widget"]
original_url: "https://hartsock.blogspot.com/2007/08/grails-widget-list.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-09-01-grails-widget-list/"
id: bafyr4idai7xyctntigslmbapfhsrw2z46b34rsk5vphd6a3xod53tidirm
permalink: /posts/grails-widget-list-53tidirm/
---
{% raw %}

Take a look at this...

```

def constraints = {

        description(widget:'textarea')

}

```

... which I got from the [Grails site](http://grails.codehaus.org/Scaffolding). So, if you want to use the code generators to create views for a form and want a string to have a text area as its input you can use the constraints on the object to specify text area. But wait, what other widgets can you specify?

I did a little digging in the Grails source code and came up with this list....

1. textField
2. hiddenField
3. submitButton
4. field
5. textArea
6. form
7. actionSubmit
8. actionSubmitImage
9. datePicker
10. renderNoSelectionOption
11. timeZoneSelect
12. localeSelect
13. currencySelect
14. select
15. checkBox
16. radio

{% endraw %}
