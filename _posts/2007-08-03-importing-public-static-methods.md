---
excerpt_separator: ""
layout: "archive-post"
title: "Importing Public Static Methods"
date: "2007-08-03T11:02:00.000-04:00"
description: "Consider the way you get \"assertNotNull\" into a JUnit4 test. You do it like this: import static org.junit.Assert.assertNotNull; import static org.junit.Assert.assertNull; import static org.junit.Assert.assertTrue; The pu"
topics: ["testing","software-design"]
original_labels: ["Java5","junit","testing"]
original_url: "https://hartsock.blogspot.com/2007/08/importing-public-static-methods.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-08-03-importing-public-static-methods/"
id: bafyr4ift22kmcx2a7oc5jminykv7qszsqivmcikgpfkkfzfgyuqfm4ekpa
permalink: /posts/importing-public-static-methods-qfm4ekpa/
---
{% raw %}

Consider the way you get "assertNotNull" into a JUnit4 test. You do it like this:

```

import static org.junit.Assert.assertNotNull;

import static org.junit.Assert.assertNull;

import static org.junit.Assert.assertTrue;

```

The public static methods of the class Assert are pulled into your lexigraphical context and now you can write code like this in your methods:

```

@Test

public void testStringyGoodness() throws Exception {

  String next = null;

  assertNull(next);

  next = "foo";

  assertNotNull(next);

  assertTrue(next.equals(foo));

}

```

And, all of this is relatively simple... but is it good? I guess that the Object Oriented Paradigm is so well established now that we can do things like this in the language and not expect "old skool" programmers to immediately break things with it.

{% endraw %}
