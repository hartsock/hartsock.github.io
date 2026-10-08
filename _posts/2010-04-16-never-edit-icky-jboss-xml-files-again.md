---
excerpt_separator: ""
layout: "archive-post"
title: "Never edit icky JBoss XML files again!"
date: "2010-04-16T09:39:00.004-04:00"
description: "Do you have a JBoss application server? Do you have configuration files in that server that need to be edited or changed periodically? Do you have an allergy to XML? Have I got a solution for you! JBoss has the amazing a"
topics: ["software-design"]
original_labels: ["configuration","dataSource","database","grails","howto","jboss","trick"]
original_url: "https://hartsock.blogspot.com/2010/04/never-edit-icky-jboss-xml-files-again.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2010-04-16-never-edit-icky-jboss-xml-files-again/"
id: bafyr4iauzrucxun6pqljrwp7p7rl4surkdfugvmg57oa364nntlpymx74a
permalink: /posts/never-edit-icky-jboss-xml-files-again-lpymx74a/
---
{% raw %}

Do you have a JBoss application server? Do you have configuration files in that server that need to be edited or changed periodically? Do you have an allergy to XML?

Have I got a solution for you!

JBoss has the amazing ability to load *.properties files from any location (on the file system or on the internet) as part of its start up routine. So you can set properties in a simple properties file instead of an icky XML file.

NOTE: I'll refer to the directory you have installed JBoss into as $JBOSS_HOME you may have your JBoss server installed in /opt/jboss or /usr/local/jboss for example. It doesn't matter.

NOTE: I'll assume your JBoss is set up to load the "default" server directory. If it isn't then I think you are smart enough to figure out what to do on your own.

1. Stop the JBoss server

2. open the file $JBOSS_HOME/server/default/deploy/properties-service.xml in your favorite text editor.

3. Find the tag

```
<mbean code="org.jboss.varia.property.SystemPropertiesService"

  name="jboss:type=Service,name=SystemProperties">
```

4. Add this tag:

```
<attribute name="URLList">

      /etc/jboss/system.properties

</attribute>
```

5. Comment out or delete any other instances of the <attribute name="URLList"> *...* </attribute> tag

Great! Now when we start up the JBoss server again it will read the file /etc/jboss/system.properties and set its properties from there. But, wait... the file doesn't exist yet. If I start my JBoss server and that file isn't easily readable it will **crash**.

So let's create the directory...

```
$ sudo mkdir -p /etc/jboss
```

... and the file ...

```
$ sudo touch /etc/jboss/system.properties
```

... now we can restart JBoss safely.

We don't get much benefit yet though. Nothing in JBoss is using that file. So let's take a database-ds.xml file and configure it to use *system.properties* for its connector-url, user-name, and password.

Assuming you have a file like $JBOSS_HOME/server/default/deploy/database-ds.xml you can edit it to look like:

```

<?xml version="1.0" encoding="UTF-8"?>

<datasources>

   <local-tx-datasource>

      <jndi-name>MyDatabaseDS</jndi-name>

      <connection-url>**${MyDatabaseDS.connection-url}**</connection-url>

      <driver-class>**${MyDatabaseDS.driver-class}**</driver-class>

      <user-name>**${MyDatabaseDS.user-name}**</user-name>

      <password>**${MyDatabaseDS.password}**</password>

      <min-pool-size>10</min-pool-size>

      <max-pool-size>20</max-pool-size>

      <prepared-statement-cache-size>10</prepared-statement-cache-size>

   </local-tx-datasource>

</datasources>

```

Now edit /etc/jboss/system.properties to hold those values... it should look like this

```

# config for database-ds.xml

MyDatabaseDS.connection-url=jdbc:postgresql://localhost:5432/database

MyDatabaseDS.driver-class=org.postgresql.Driver

MyDatabaseDS.user-name=username

MyDatabaseDS.password=password

# this example is for postgresql but you could substitute any database.

```

... when you start up JBoss it will read the */etc/jboss/system.properties* file and when it looks at *database-ds.xml* it will see the **${variable}** values and substitute the values you set in *system.properties* for the **${variable}**. If a **${variable}** is not present, there will be no substitution... so be sure that every time you use a variable you set its value somewhere.

You can also set system wide system properties this way too. Commonly on servers that I work with the unix host name has nothing to do with the hostname being served. So I commonly set:

```

server.host=server.example.com

```

For use in my Grails applications which I then read in Config.groovy like this:

```

grails.serverURL = "https://${System.getProperty('server.host')}/${appName}"

```

... but that is another story ...

{% endraw %}
