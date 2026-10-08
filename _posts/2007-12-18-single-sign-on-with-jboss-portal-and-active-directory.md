---
excerpt_separator: ""
layout: "archive-post"
title: "Single Sign On with JBoss Portal and Active Directory"
date: "2007-12-18T07:53:00.000-05:00"
description: "No one has asked for it but I've begun work on a SSO project when I'm between official projects. I discovered the power of Acegi and CAS. I have an install of the JBoss portal as well and that requires its own set up too"
topics: ["capability-security","software-design"]
original_labels: ["Acegi","CAS","SSO","Security","java","jboss","ldap","portal"]
original_url: "https://hartsock.blogspot.com/2007/12/single-sign-on-with-jboss-portal-and.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-12-18-single-sign-on-with-jboss-portal-and-active-directory/"
id: bafyr4ic4654t42ofoipxwbgvwb42bmc53jlusnu3ca7w7cj5yh6hhptlzi
permalink: /posts/single-sign-on-with-jboss-portal-and-active-directory-6hhptlzi/
---
{% raw %}

No one has asked for it but I've begun work on a SSO project when I'm between official projects. I discovered the power of Acegi and CAS. I have an install of the JBoss portal as well and that requires its own set up too... however it is looking like we are going to use Joomla instead.

I began with understanding how to talk to an [ldap](http://hartsock.blogspot.com/2007/11/helloldapgroovy.html) server (in my case Active Directory). Once I understood how to query LDAP I began searching around using my groovy scripts to find the object classes, and specific names I would need inside my CAS configuration.

I then followed this tutorial for CAS to *authenticate* the users:

- [CAS: LDAP - JA-SIG Wiki](http://www.ja-sig.org/wiki/display/CASUM/LDAP?decorator=printable)

Next I built in the CAS client into JBoss portal using this wiki page's instructions:

- [CAS SSO Framework Integration for JBoss Portal](http://wiki.jboss.org/wiki/Wiki.jsp?page=CASSSOFrameworkIntegration)

Finding the specific settings were hard. In particular I had to muck about with the *ldap_identity-config.xml* deep inside our jboss-portal.sar file... it turns out our AD setup is somewhat "special" and needed some extra care beyond what is in this page:

- [Configure Portal for MS Active Directory](http://wiki.jboss.org/wiki/Wiki.jsp?page=ConfigurePortalForMicrosoftActiveDirectory)

I have no idea how I would have figured out how to do that kind of configuration without that wiki page.

Once I managed to stitch together both sets of instructions I could have my users *authenticate* via CAS and then the portal would query roles on its own against Active Directory.

Next I'll investigate how to bring Groovy and Grails into this mix. I'll have a project for delivery in March that will need to hook into this SSO system... and likely subsequent projects to link into the CAS system using PHP and Perl.

{% endraw %}
