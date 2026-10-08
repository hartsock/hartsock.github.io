---
excerpt_separator: ""
layout: "archive-post"
title: "EJB3 security annotations"
date: "2007-09-12T12:10:00.000-04:00"
description: "So with EJB3 declarative security annotations I can do things like this: @DeclareRoles(\"ADMIN\", \"USER\") public class Frobnicator { @RolesAllowed(\"ADMIN\",\"USER\") public boolean checkFrobnication() { ... } @RolesAllowed(\"A"
topics: ["capability-security","testing","software-design"]
original_labels: ["Annotations","ejb3","jaas","java"]
original_url: "https://hartsock.blogspot.com/2007/09/ejb3-security-annotations.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-09-12-ejb3-security-annotations/"
id: bafyr4idvree3ghf2j5t6hi4aevczjqrd4d734uzrfgenmxwppj53saczey
permalink: /posts/ejb3-security-annotations-53saczey/
---
{% raw %}

So with EJB3 declarative security annotations I can do things like this:

```

@DeclareRoles("ADMIN", "USER")

public class Frobnicator {

  @RolesAllowed("ADMIN","USER")

  public boolean checkFrobnication() { ... }

   @RolesAllowed("ADMIN")

  public boolean fullyFrobnicate() { ... }

}

```

Which will allow me to lift the Frobnicator bean out and drop it into a JUnit tests as a POJO. The POJO can then call the methods in Frobnicator without authentication. This helps doing unit tests and getting higher code coverage. But... isn't the authentication part of what I've written? Isn't that something that needs testing?

So my predicament is how do I provide automated acceptance testing for all the permutations of roles in the system?

{% endraw %}
