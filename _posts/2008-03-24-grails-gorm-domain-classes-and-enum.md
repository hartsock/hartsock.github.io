---
excerpt_separator: ""
layout: "archive-post"
title: "Grails, GORM, Domain Classes and Enum"
date: "2008-03-24T14:08:00.007-04:00"
description: "I'm currently building a domain model in Grails that uses Enum heavily. This is a tad bit of a problem since Grails doesn't support Enum directly. See GRAILS-2061 for more information. Now then, I have found this Enum Wo"
topics: ["software-design"]
original_labels: ["Enum","GORM","grails","groovy"]
original_url: "https://hartsock.blogspot.com/2008/03/grails-gorm-domain-classes-and-enum.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-03-24-grails-gorm-domain-classes-and-enum/"
id: bafyr4ia6m2ulzu7optcidaewiyz3mrddswulyk55shvqjeawtldctbir5a
permalink: /posts/grails-gorm-domain-classes-and-enum-dctbir5a/
---
{% raw %}

I'm currently building a domain model in Grails that uses Enum heavily. This is a tad bit of a problem since Grails doesn't support Enum directly. See [GRAILS-2061](http://jira.codehaus.org/browse/GRAILS-2061) for more information. Now then, I *have* found this [Enum WorkAround](http://code.google.com/p/geogia/wiki/EnumWorkaround) and I wasn't quite happy with that. I've come up with my own work-around that fits what I want to see on my database better.

I came up with this work-around based on my experiences of using an existing database with Grails. When using an existing database the GORM can treat any Enum on your database as a string. Next if you are manually building up the domain from this database model you would want to constrain your faux string by the values of the Enum as expressed in the database. When working from an existing table I would simply cut and paste the values into the *inList* [constraint](http://docs.codehaus.org/display/GRAILS/Validation+Reference) for the domain class. But what if you have an existing Enum class?

For a really simple example let's consider:

```

public enum GenderCode {

    M,

    F;

    public String value() {

        return name();

    }

    public static GenderCode fromValue(String v) {

        return valueOf(v);

    }

}

```

This is a really simple enumerated type that represents the "M" and "F" codes that many systems use to indicate Male or Female. Now we would probably use this class like this:

```

class Person {

  String name

  GenderCode gender

}

```

... but Grails will not know what to do with the enumerated type. So we can "work around" this limitation by using our good friend constraints... like so:

```

class Person {

  String name

  String gender

  static constraints = {

     name(nullable:false)

     gender(inList:GenderCode.getList())

  }

}

```

... only problem... how do we get the GenderCode enumerated type (a straight java class by the way) to give us a List object to use in the inList constraint?

It's not too hard...

```

public enum GenderCode {

    M,

    F;

    private static List list;

    public String value() {

        return name();

    }

    public static List getList() {

     if(list != null) {

      return list;

     }

     return buildList();

    }

 private static synchronized List buildList() {

  // List was not initialized...

     list = new ArrayList();

        for (GenderCode c: GenderCode.values()) {

         list.add(c.name());

        }

     return list;

 }

    public static GenderCode fromValue(String v) {

        return valueOf(v);

    }

}

```

You might notice I chose to use the synchronized key word on the buildList method. Also note that I store the Enumerated types in the grails project under *src/java*. The domain classes store only strings.

So now when I go to generate scaffolding code for the Person class I'll get a GSP that will use a drop-down list of values from the enumerated type. If I alter the enumerated type to include the value "U" in the enumerated type there is no need to re-generate any of the views... re-populate a database... or update a boot strap script.

If you want the Enum type on your database itself now your DBA can alter that column on that particular table to be of type Enum and coordinate with you what values are in the list. GORM won't complain. And, your DBA will be happy to see true enumerations in their database which are both human-readable and space efficient. Did I also mention that they cut down on the number of joins to lookup tables making queries in all application spaces faster?

What do you think?

{% endraw %}
