---
excerpt_separator: ""
layout: "archive-post"
title: "The Woe of MySQL and java.sql.Date"
date: "2007-07-05T15:13:00.000-04:00"
description: "The class java.sql.Date cannot hold a date of \"0000-00-00\" (ISO date format YYYY-MM-DD) because that is simply NOT a valid date. Our legacy Perl application uses the string \"0000-00-00\" as a date for any uninitialized da"
topics: ["software-design"]
original_labels: ["java","jdbc","legacy","mysql","perl","woe"]
original_url: "https://hartsock.blogspot.com/2007/07/woe-of-mysql-and-javasqldate.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-07-05-the-woe-of-mysql-and-java-sql-date/"
id: bafyr4ihzm5e63s2qtqyo6l7pppl3hnbaqyswxxshmclliove5rtl3blkjm
permalink: /posts/the-woe-of-mysql-and-java-sql-date-tl3blkjm/
---
{% raw %}

The class java.sql.Date cannot hold a date of "0000-00-00" (ISO date format YYYY-MM-DD) because that is simply NOT a valid date. Our legacy Perl application uses the string "0000-00-00" as a date for any uninitialized date in the system. That is because the original system designer forbade the use of NULL for dates. This becomes a problem when working with Perl legacy dates in Java. Specifically the JDBC drivers will throw exceptions when attempting to work with a date that has the value "0000-00-00" and exception handlers for these exceptions are not prompted for by the Eclipse IDE.

I have developed a few strategies for dealing with this date woe problem.

On the issue of selecting "0000-00-00":

Using the NULLIF mysql function inside select statements means that you must map out every single select column returned and catch every single date so that it gets set to NULL for the JDBC drivers...

```

NULLIF(Candidate.CertificationDate, '0000-00-00') AS certificationDate

```

On the issue of saving "0000-00-00":

Since you can't create a date of "0000-00-00" you'll need to leave the date null but you'll have a problem setting the column NULL in MySQL since the column will be restricted to prevent your insert of a NULL value. Here's what I have done:

```

     try {

      ps.setDate(107, new java.sql.Date(a.getCertificationDate1().getTime()));

     } catch (NullPointerException npe) {

      ps.setString(107, "0000-00-00");

     }

```

Note: The IDE doesn't "know" about the NullPointerException? since it can be thrown from every single line of code in every single java program ever written and handling it on every single line of code would get a little silly.

The Date stored in object a may be null. If it is we use the feature of MySQL that will take the string "0000-00-00" and map it into a date.

FAQ

 1. Q: Why not change the database? A: Perl programs look for the string "0000-00-00" to be returned indicating a NULL date (an uninitialized date). You will have to rewrite all these Perl programs.

 2. Q: Why not work with dates in Java as strings? A: Java's date parsers are deprecated and you would have to perform custom parse and casts on these date strings since they do not match the Java date formats... if you wanted to work with the dates as dates. In other words: you would have to write your own date handling.

 3. Q: Why not toString all dates for the database? A: Java and MySQL use different native date string formats... and we still would have to make special cases for "0000-00-00" any way.

 4. Q: Why not write a custom Perl2Java Date class? A: Your company would have to dedicate a small portion of staff time to monitoring for changes in ISO date formats, time zones, DST, and watch for potential date bugs.

Other possible solutions

 1. Write a helper utility class that would manage the casts taking all dates to MySQL strings. (only helps saves, can't help loads)

 2. "fix" all the Perl programs and write helpers in Perl to handle the cases where the Perl programs need "0000-00-00" then set all null dates to null.

 3. don't fix this and wait for the legacy Perl to age out.

NOTE: I found the answer to this problem [here](http://hartsock.blogspot.com/2007/11/magical-mysql-url-parameters.html).

{% endraw %}
