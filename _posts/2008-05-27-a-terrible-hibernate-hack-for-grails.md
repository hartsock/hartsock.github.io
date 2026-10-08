---
excerpt_separator: ""
layout: "archive-post"
title: "A terrible hibernate hack... for Grails..."
date: "2008-05-27T12:05:00.007-04:00"
description: "I'm still \"under water\" this week but I felt this really deserved an entry. I found this blog entry by Sorin Postelnicu that solved a problem I was having with my Grails configuration. I've set up my database to use utf8"
topics: ["software-design"]
original_labels: ["grails","groovy","hack","hibernate"]
original_url: "https://hartsock.blogspot.com/2008/05/terrible-hibernate-hack-for-grails.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-05-27-a-terrible-hibernate-hack-for-grails/"
id: bafyr4igxt35oswhc3y6eafkmoijqb3ypcsnwruul25654wyvwetomknnnq
permalink: /posts/a-terrible-hibernate-hack-for-grails-tomknnnq/
---
{% raw %}

I'm still "*under water*" this week but I felt this really deserved an entry. I found [this blog](http://blog.tremend.ro/2007/08/14/how-to-set-the-default-charset-to-utf-8-for-create-table-when-using-hibernate-with-java-persistence-annotations/) entry by Sorin Postelnicu that solved a problem I was having with my Grails configuration. I've set up my database to use utf8 everywhere but my tables are still getting created as latin1 tables. What to do... using Sorin's example I did this:

```

package org.hibernate.dialect;

/**

 * Extends MySQL5InnoDBDialect and sets the default charset to be UTF-8

 * @author Sorin Postelnicu

 * @since Aug 13, 2007

 */

public class MySQL5UTF8InnoDBDialect extends MySQL5InnoDBDialect {

    public String getTableTypeString() {

        return " ENGINE=InnoDB DEFAULT CHARSET=utf8";

    }

}

```

The trick here is that Sorin had over-ridden the default table string from hibernate which says "*CHARSET=latin1*". I've just named the class differently. I put this class in the right package in my Grails project's "*src/java*" directory and modify my Datasource.groovy to read like this:

```

dataSource {

 configClass = GrailsAnnotationConfiguration.class

 pooled = false

 driverClassName = "com.mysql.jdbc.Driver"

 dialect= **org.hibernate.dialect.MySQL5UTF8InnoDBDialect**

 url = "jdbc:mysql://localhost:3306/grails?zeroDateTimeBehavior=convertToNull**&useUnicode=true&characterEncoding=UTF-8**"

 username = "grails"

 password = "grails"

 dbCreate = "update"

}

```

... now my GORM generated tables show up in UTF8. But my question to you is ... is this a plugin? is this a patch to hibernate? Is this a hack? You tell me.

{% endraw %}
