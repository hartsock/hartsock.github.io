---
excerpt_separator: ""
layout: "archive-post"
title: "Grails app.version & plugin utopia"
date: "2008-02-29T08:47:00.009-05:00"
description: "I was catching up on my reading recently when I came across this post. The technique Darryl is using to show application version numbers to his users is: v${grailsApplication.metadata.'app.version'} Which makes perfect s"
topics: ["software-design"]
original_labels: ["grails","groovy","news","plugin","utopia"]
original_url: "https://hartsock.blogspot.com/2008/02/grails-appversion-plugin-utopia.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-02-29-grails-app-version-plugin-utopia/"
id: bafyr4ih6viceiz7icltkp3xm2sarsleivtgls66ol23wy7w4dp5ifedmt4
permalink: /posts/grails-app-version-plugin-utopia-5ifedmt4/
---
{% raw %}

I was catching up on my reading recently when I came across

[this post](http://www.nabble.com/Using-app.version-from-application.properties-td15189987.html). The technique Darryl is using to show application version numbers to his users is:

```

v${grailsApplication.metadata.'app.version'}
```

Which makes perfect sense to me. In fact, I don't understand why it's not in the Grails defaults to show the version number. If you add that line to your grails-app/views/layouts/main.gsp or add the version number to the default title every page would get a version stamp. I can't see how it would be obtrusive either since you could remove it or change where it was placed yourself later.

The other news that I think is interesting on [aboutGroovy.com](http://aboutgroovy.com/item/show/394) is the [Selenium plugin](http://www.javathinking.com/?p=65) for Grails. This is indicative of what could be a major selling point for Grails. It can easily make use of all kinds of existing Java tools as [plugins](http://grails.org/Plugins). And do it today.

But, it's not only that you get to use these tools, Grails provides an interesting distribution mechanism for the tools as well.

You install grails plugins from the command line and you list out available plugins the same way for example:

```

$ grails list-plugins

Welcome to Grails 1.0 - http://grails.org/

Licensed under Apache Standard License 2.0

Grails home is set to: /usr/local/grails

Base Directory: /home/shawn/workspace/myproject

Environment set to development

Running script /usr/local/grails/scripts/ListPlugins.groovy

    [mkdir] Created dir: /home/shawn/.grails/1.0/plugins

Plugins list cache does not exist or is broken, recreating ...

Plugins list cache has expired. Updating, please wait... ...

Plug-ins available in the Grails repository are listed below:

-------------------------------------------------------------

acegi                   --  No description available

aop                     --  No description available

autorest                --  No description available

axis2               <0.1>            --  Add Web Service support for Grails services using Apaxhe Axis2.

cache                   --  No description available

cas-client          <0.2>            --  This plugin provides client integration for JA-SIG CAS

code-coverage       <0.7>            --  Generates Code Coverage reports

converters          <0.3>            --  Provides JSON and XML Conversion for common Objects (Domain Classes, Lists, Maps, POJO)

dbmapper            <0.1.7>          --  Database relation to domain object generator

dbmigrate           <0.1.5>          --  Database migration tasks

djangotemplates         --  No description available

dojo                <0.4.3>          --  Provides integration with the Dojo toolkit http://dojotoolkit.org, an Ajax framework.

dwr                 <0.1>            --  This plugin adds DWR capabilies to the services in a Grails application.

eastwood-chart      <0.1>            --  This plugin wraps JFreeChart's Eastwood servlet for Grails app

echo2               <0.1>            --  Echo2 capabilities to Grails applications

ext-ui                  --  No description available

fck-editor          <0.3>            --  FCKeditor

feeds               <1.2>            --  Render RSS/Atom feeds with a simple builder

flex                <0.1>            --  Provides integration between Grails and Flex

google-chart        <0.4.3>          --  This plugin adds Google Chart API features to Grails applications.

gwt                 <0.2.4>          --  The Google Web Toolkit for Grails.

i18n-templates      <1.0.1>          --  I18n Templates

ivy                 <0.1>            --  The Ivy Dependency Manager for Grails.

jasper              <0.5>            --

jcaptcha            <0.2>            --  Grails JCaptcha Plugin

jcr                     --  No description available

jms                 <0.3>            --  This plugin adds MDB functionality to services.

jsecurity           <0.1.1>          --  Security support via the JSecurity framework.

jsf                     --  No description available

laszlo              <0.6>            --  OpenLaszlo plugin for Grails

ldap                <0.1>            --  Adds easy to use LDAP connectivity

liquibase           <1.5.2.0>        --  LiquiBase Database Refactoring for Grails

modalbox            <0.1>            --  This plugin adds the ModalBox to your Grails applications.

mondrian            <0.1>            --  This plugin installs Pentaho Mondrian into your Grails application.

ofchart             <0.5>            --

portlets                --  No description available

quartz              <0.2>            --  This plugin adds Quartz job scheduling features to Grails application.

radeox              <0.1>            --  A plugin for the Radeox Wiki-render engine to allow easy markup and cross-linking.

remoting            <0.3>            --  Adds easy-to-use server-side and client-side RPC support.

richui              <0.2>            --  Provides a set of AJAX components

scaffold-tags       <0.7>            --  Adds tags to support fully-customizable & dynamic scaffolding

searchable          <0.4-SNAPSHOT>   --  Adds rich search functionality to Grails domain models.

staticresources         --  No description available

webtest             <0.3>            --  A plug-in that provides functional testing for Grails using Canoo Web Test

wicket              <0.3>            --  Provides integration between Grails and the Wicket framework

xfire               <0.7.4>          --  Add Web Service support for Grails services using XFire.

xmlrpc              <0.1>            --  This plugin adds XML RPC functionality to GRAILS

yui                 <2.5.0>          --  Yahoo! User Interface Library (YUI)

yui-widgets         <0.1>            --  Yahoo! User Interface Library (YUI) Widgets

To find more info about plugin type 'grails plugin-info [NAME]'

To install type 'grails install-plugin [NAME] [VERSION]'

For further info visit http://grails.org/Plugins

```

This is interesting not because this is new for Java programs, but, because the Grails plugin repository is now a *Java Software* distribution system. I think we'll see this eventually morph into something like a Gentoo or CPAN type distribution system where the real "all-stars" of development are known for having useful or interesting plugins.

The problem is. Even now this list is getting big. One of the attractions to Grails for new developers... like it or not... is that there are fewer choices. It's kind of funny but too many choices (as Scott Davis has pointed out in his "Paradox of Choice" talk) leads to people making no choice at all.

So already there are getting to be too many choices in Grails plugins. Now, admittedly, if you stuck to 1.0 and above releases you actually have only 4 plugins to choose from. But, very soon many of those "beta" plugins will be 1.0 and either way you still see them... still deal with the choice. This is an interesting problem that is going to be coming very rapidly for Grails. How do you deal with all that adoption and all that interest.

I think it will be very vital how the Grails team handles the next 18 months. They will have to find a way to deal with all the plugin contributions they get and how to limit choice intelligently.

Will they go the CPAN route? I'd like that since CPAN was (and technically still is) the best feature of Perl. Just as Ruby Gems is also a vital feature of Ruby. But, Gems lacks some of the features that made CPAN so popular. [CPAN](http://cpan.org/) has code author based search and other web search features that allow you to read through PerlDoc (the Perl version of JavaDoc) for each module. The author recognition was not vital to Perl or CPAN but I think it helped authors to make contributions.

Will they choose an elitist mentality and have "levels" of plugins which are gold, silver, bronze? Sort of a Gentoo approach which was the best feature of Gentoo. Or perhaps it's too soon to think about yet. After all there aren't too many plugins yet...

At some point we'll need to see some categorization from the command line of plugins. We'll need search features for plugins. And, we'll need a mechanism for at least three levels of plugins... "production", "test", and "development" because we will need to allow for beta code to be distributed... and for developers to work on advanced features that rely on other plugins that aren't even released yet.

We'll need to do some level of OSGI in Grails... at least something that handles plugin dependencies and manages them. At some point the Grails ecosystem could grow large enough that you could have plugins that require other plugins. That could get very interesting.

{% endraw %}
