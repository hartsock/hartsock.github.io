---
excerpt_separator: ""
layout: "archive-post"
title: "More fun with Groovy and Reflection API"
date: "2008-11-07T06:00:00.000-05:00"
description: "This time in a TagLib I need to see all the properties of a domain class but I don't want to look at anything that isn't sent to hibernate. import java.lang.reflect.Modifier static getFields(obj) { def names = [] def fie"
topics: ["software-design"]
original_labels: ["groovy","java","reflection"]
original_url: "https://hartsock.blogspot.com/2008/11/more-fun-with-groovy-and-reflection-api.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-11-07-more-fun-with-groovy-and-reflection-api/"
id: bafyr4iforcez3vu4m54stqwmjf46ug6e322ycdftgqckkzqqc74ce5rnym
permalink: /posts/more-fun-with-groovy-and-reflection-api-4ce5rnym/
---
{% raw %}

This time in a TagLib I need to see all the properties of a domain class but I don't want to look at anything that isn't sent to hibernate.

```

import java.lang.reflect.Modifier

static getFields(obj) {

      def names = []

      def fields = obj.getClass().declaredFields

      fields.each({ field ->

       if(!field.synthetic)

        if(!Modifier.isStatic(field.modifiers))

         if(!Modifier.isTransient(field.modifiers)) {

          names.add(field.name.toString())

                                 }

      })

      return names

    }

```

... in another method I'll filter out the Closures by checking against Closure.class and the property's class.

{% endraw %}
