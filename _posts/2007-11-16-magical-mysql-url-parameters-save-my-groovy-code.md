---
excerpt_separator: ""
layout: "archive-post"
title: "Magical MySQL URL parameters Save my Groovy Code"
date: "2007-11-16T14:58:00.000-05:00"
description: "I've been working with legacy databases in MySQL and basically forbidden from using hibernate by a bug I had with all zero dates of the format '0000-00-00' which is perfectly legal in MySQL but completely disallowed in J"
topics: ["software-design"]
original_labels: ["GORM","date","grails","groovy","mysql"]
original_url: "https://hartsock.blogspot.com/2007/11/magical-mysql-url-parameters.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-11-16-magical-mysql-url-parameters-save-my-groovy-code/"
id: bafyr4ihgnjgfhnajs4yhvag4korzusqtynvqpdcmpqrixvzzrkcj5ivzzq
permalink: /posts/magical-mysql-url-parameters-save-my-groovy-code-cj5ivzzq/
---
{% raw %}

I've been working with legacy databases in MySQL and basically forbidden from using hibernate by a bug I had with all zero dates of the format '0000-00-00' which is perfectly legal in MySQL but completely disallowed in JDBC.

Stack trace for this problem contains:

```

SQL Exception: Value '0000-00-00' can not be represented as java.sql.Date

```

The answer? Apparently there is a hidden setting to use...

```

dataSource {

  driverClassName = "com.mysql.jdbc.Driver"

  dialect= org.hibernate.dialect.MySQLMyISAMDialect

  url = "jdbc:mysql://localhost:3306/legacy?zeroDateTimeBehavior=convertToNull"

  username = "legacyUser"

  password = "legacyPassword"

 }

```

That little flag on the URL is absolutely magical and now I can map my Grails objects onto a legacy database. Isn't life grand?

{% endraw %}
