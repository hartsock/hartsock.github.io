---
excerpt_separator: ""
layout: "archive-post"
title: "Groovy class tricks: Zero Padded Number"
date: "2008-07-23T11:10:00.008-04:00"
description: "Take the example of a SKU number. We need the number to be zero padded. For example the number 10 should print as \"0010\" and not \"10\" in any display of this object. These numbers might be generated from some source and h"
topics: ["software-design"]
original_labels: ["grails","groovy"]
original_url: "https://hartsock.blogspot.com/2008/07/groovy-class-tricks-zero-padded-number.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-07-23-groovy-class-tricks-zero-padded-number/"
id: bafyr4ic4mqclng4ceqkenq6cy5cwg6zh7t5bhmzl3slul62kphefyvaeka
permalink: /posts/groovy-class-tricks-zero-padded-number-efyvaeka/
---
{% raw %}

Take the example of a SKU number. We need the number to be zero padded. For example the number 10 should print as "0010" and not "10" in any display of this object. These numbers might be generated from some source and handed to us to store as an additional identifier for some object. So the source is a number but the destination is a zero-padded number string.

With groovy we have two ways to tackle this problem. First we could store the value as a string in our domain class. We know that the source data should be a number and the output will always be a string. This has the advantage of showing the zero padded number in our database for when folks do queries.

Now, Groovy automatically creates your getters and setters. You never write them yourself. But the trick here is that the getters and setters still *exist* that means you can do something like this:

```
class SkuItem {

    String skuNumber

    public void setSkuNumber(Long number) {

        skuNumber = String.format('%014d',number) // NOTE: zero-pad to 14 characters

    }

    public String toString() {

        return skuNumber

    }

}

```

Doing the zero-padded number this way means the following code will throw an exception and crash:

```
def sku = new SkuItem(skuNumber: "10")

println sku

```

The exception looks like this:

```
Caught: org.codehaus.groovy.runtime.typehandling.GroovyCastException: Cannot cast object '10' with class 'java.lang.String' to class 'java.lang.Integer'

```

Which is what we *want* if we intend to enforce that a skuNumber is actually a number. This code will work:

```
def sku = new SkuItem(skuNumber: 10)

println sku

sku.skuNumber = 20

println sku

```

and produces this output:

```
00000000000010

00000000000020
```

But now that we know that in Groovy the getters and setters are there we can solve this problem the other way. Storing the string in the domain class means that database reports will see the zero padded numbers but that is inefficient and means that the database is working harder to build string based indexes. These are numbers and working with numbers is faster and more compact.

Knowing that the getters and setters are under the covers even in our groovy constructors we could rewrite our SKU storage class like this:

```
class SkuItem2 {

    Long skuNumber

    public String getSkuNumber() {

        return String.format('%014d',this.skuNumber)

    }

    public String toString() {

        return this.getSkuNumber()

    }

}

```

Which has the advantage of storing numbers as numbers but the moment the item is fetched it gets turned into a zero padded string... for example:

```

def sku2 = new SkuItem2(skuNumber: 30)

println sku2

sku2.skuNumber = 40

println sku2

```

which now produces the output:

```
00000000000030

00000000000040
```

... which just goes to show you get *even more* out of Groovy when you understand how it works underneath the covers.

{% endraw %}
