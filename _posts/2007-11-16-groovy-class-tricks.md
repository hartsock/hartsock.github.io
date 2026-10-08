---
excerpt_separator: ""
layout: "archive-post"
title: "Groovy Class tricks"
date: "2007-11-16T13:37:00.000-05:00"
description: "jwagon sent me these mind bending groovy class manipulations in a chat today: !/usr/bin/env groovy class AA { def msg AA(something){ msg = something } } def c = { a, b -> def x =a.newInstance(b) println x.msg } c(AA, \"fo"
topics: ["software-design"]
original_labels: ["groovy"]
original_url: "https://hartsock.blogspot.com/2007/11/groovy-class-tricks.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-11-16-groovy-class-tricks/"
id: bafyr4ibemfstqq4ywtwsb7jybupz2foz2ppvhmvtmqo6yxsr4wmlrm2jk4
permalink: /posts/groovy-class-tricks-mlrm2jk4/
---
{% raw %}

[jwagon](http://del.icio.us/jwagon/) sent me these mind bending groovy class manipulations in a chat today:

```

#!/usr/bin/env groovy

class AA {

        def msg

        AA(something){ msg = something }

    }

def c = { a, b ->

 def  x =a.newInstance(b)

 println x.msg

}

c(AA, "foo")

```

Or how about....

```

#!/usr/bin/env groovy

def m = java.lang.String

def n =  m.newInstance("foo")

println n

```

{% endraw %}
