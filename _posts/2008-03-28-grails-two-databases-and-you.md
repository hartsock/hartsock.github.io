---
excerpt_separator: ""
layout: "archive-post"
title: "Grails, two databases, and you"
date: "2008-03-28T10:06:00.010-04:00"
description: "I'm working a project right now that requires me to access a legacy LAMP system and then import these into GORM/JPA persisted objects. Douglas Fils has some good notes on this topic in his post \"grails datasource in reso"
topics: ["software-design"]
original_labels: ["GORM","database","grails","groovy","mysql"]
original_url: "https://hartsock.blogspot.com/2008/03/grails-two-databases-and-you.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-03-28-grails-two-databases-and-you/"
id: bafyr4igiwgrki44mdlgeeasdnrby2x2nbgntddwj66rxciltchg3lm4bea
permalink: /posts/grails-two-databases-and-you-g3lm4bea/
---
{% raw %}

I'm working a project right now that requires me to access a legacy LAMP system and then import these into GORM/JPA persisted objects. [Douglas Fils](http://www.blogger.com/profile/04578829160811273052) has some good notes on this topic in his post "[grails datasource in resource.xml](http://douglasfils.blogspot.com/2008/03/grails-datasource-in-resource.html)." So I'm not going to cover how to get access to a second database in detail since it doesn't really need covering.

I will point out that if you are thinking you'll run two GORM instances... persisting one group of domain objects to one database and persisting another set of object to a different database... well, I haven't figured that out yet. What I will talk about is one database connection that uses [groovy.sql.Sql](http://groovy.codehaus.org/Tutorial+6+-+Groovy+SQL) to create simple fast DAO.

What I've been doing lately is writing queries against my old database that "normalizes" the result sets into exactly the properties I have in my Grails domain classes. For example let's say we have a Person table on our legacy (non GORM) database that looks like this:

```

+------------------------+--------------+------+-----+-------------------+-------+

| Field                  | Type         | Null | Key | Default           | Extra |

+------------------------+--------------+------+-----+-------------------+-------+

| PersonID               | int(11)      | NO   | PRI | 0                 |       |

| FirstName              | varchar(255) | NO   |     |                   |       |

| MIorMiddleName         | varchar(255) | NO   |     |                   |       |

| LastName               | varchar(255) | NO   |     |                   |       |

| EmailAddress           | varchar(255) | NO   |     |                   |       |

| Gender                 | varchar(255) | NO   |     |                   |       |

| DataIDontCareAbout1    | varchar(255) | NO   |     |                   |       |

| DataIDontCareAbout2    | varchar(255) | NO   |     |                   |       |

| DataIDontCareAbout3    | varchar(255) | NO   |     |                   |       |

| DataIDontCareAbout4    | varchar(255) | NO   |     |                   |       |

+------------------------+--------------+------+-----+-------------------+-------+

```

Some of these columns we'll ignore... some we want to pull out and use in a new layout that better normalizes the data for our use. In my example to keep things simple let's say we decided to pull the name attributes out as a separate object and table. There are other cases that can result in rather complex pivot queries but I'll leave those for another time... suffice to say you can put a lot of work into the queries.

So in my MySQL queries I have something like this:

```

-- person query

  SELECT PersonID AS 'id'

    , EmailAddress AS 'email'

    , SUBSTR(Gender,1,1) AS 'genderCode'

  FROM PeopleContact

  WHERE

       EmailAddress = ?

```

... and ...

```

-- name query

  SELECT FirstName AS 'firstName

    , MIorMiddleName AS 'middleName'

    , LastName AS 'lastName'

  FROM PeopleContact

  WHERE

       PersonID = ?

```

These queries now match their result columns with the properties of the classes I have in my Grails domain ...

```

class Person {

  Long id

  Long version

  Name name

  String email

  String genderCode

  static constraints = {

     name(nullable:true)

     email(nullable:false,email:true)

     genderCode(nullable:true,blank:true,inList:['M','F','U'])

  }

}

```

... and ...

```

class Name {

  Long id

  Long version

  static belongsTo = ['person':Person]

  String firstName

  String middleName

  String lastName

}

```

*Side NOTE: This particular normalization trick is interesting... I'm not necessarily recommending it... two people with the same name could end up pointing to the same name object. We would have to write our services & controllers to be sure that changing the name of one person did not change it for both... this is a point of debate with our system designers right now. However, we **are** doing something similar with mailing addresses which are currently in-line in several tables. Everyone agrees that normalizing addresses will make managing mailing addresses easier in our case.*

To help with putting query data into objects I've written a mapping method that uses features of the [GroovyRowResult](http://groovy.codehaus.org/api/groovy/sql/GroovyRowResult.html) class to our advantage:

```

    /**

     * A generic mapping utility assumes that the row

     * has keys that map one-for-one onto the object.

     *

     * This is useful only if the queries are specially

     * constructed so they can be mapped.

     */

    public static void map(obj,row) {

      row.keySet().each({ key ->

           if( obj.properties.containsKey(key) ) {

               obj.properties[key] = row.get(key)

           }

      })

    }

```

*...this is where working with groovy really shines!*

Now that I've laid this ground work, in a service that has a *groovy.sql.Sql* object I've referred to as *db*. I've loaded the queries into strings and now I'll take the db object and pass it the queries and a parameter to go where the question mark is... in our example first we will query for a person based on their email...

```

 def person = new Person()

 def personRow = db.firstRow(personQuery,[email])

 map(person,personRow)

```

... and for the name...

```

 person.name = new Name()

 def nameRow = db.firstRow(nameQuery,[personRow.id])

 map(person.name,nameRow)

```

Now I've got a person object and a name object. To save them to the database now I just call the Gorm save commands on them... I can work with validation and I can work with all the other nifty Grails tools at hand. That means you could use the DAO snippets from a controller with a special "import" action that then forwarded to a "create" based action.

So we've seen code fragments that can be used to create an import DAO that can map rows from straight SQL queries onto GORM persisted objects. You can imagine that reversing the process would be very easy using the same tricks in reverse with update statements. That means hooking up a Grails project to import and export to a LAMP database can be very easy.

I'd love to know if anyone else is trying this and what their observations are or if they have better ideas.

{% endraw %}
