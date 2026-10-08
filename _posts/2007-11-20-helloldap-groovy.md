---
excerpt_separator: ""
layout: "archive-post"
title: "helloLDAP.groovy"
date: "2007-11-20T13:57:00.000-05:00"
description: "Here's a short script that I wrote just to test working with an ActiveDirectory server. It's a short hack of a script that you can use to just test settings and the like. Thanks to this script I know I've found the right"
topics: ["software-design"]
original_labels: ["active directory","groovy","ldap","script"]
original_url: "https://hartsock.blogspot.com/2007/11/helloldapgroovy.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-11-20-helloldap-groovy/"
id: bafyr4iauzicyr5f6fjnjek2lr2cfdgrio5a7mcsqtwdnrxkz66iv23soa4
permalink: /posts/helloldap-groovy-iv23soa4/
---
{% raw %}

Here's a short script that I wrote just to test working with an ActiveDirectory server. It's a short hack of a script that you can use to just test settings and the like. Thanks to this script I know I've found the right settings to work with our Microsoft ActiveDirectory server through Java. I could even use this groovy code to set up a Spring Bean service.

```

#!/usr/bin/env groovy

import java.util.Hashtable

import javax.naming.*

import javax.naming.event.*

import javax.naming.directory.*

def ou = " System and Service Accounts"

// here, we're just reading in some parameters...

def stdin = new BufferedReader(

        new InputStreamReader(System.in)

    )

print "username: " // your username to access LDAP... not a real user

String username = stdin.readLine()

print "password: " // the password for that account...

String passwd = stdin.readLine()

// next we set up an environment for LDAP

Hashtable env = new Hashtable()

env.put(

    Context.INITIAL_CONTEXT_FACTORY,

    "com.sun.jndi.ldap.LdapCtxFactory"

    )

env.put(

    Context.SECURITY_AUTHENTICATION,

    "EXTERNAL"

    )

/* // if only I had SSL working... *sigh* oh well...

env.put(

    Context.SECURITY_PROTOCOL,

    "ssl"

    ) //*/

// You'll want to put your server's name or IP here:

env.put(

    Context.PROVIDER_URL,

    "ldap://activedirectoryhost.mycompany.com:636/"

    )

// Here, you'll want to set up your company's parameters for OU and DC...

env.put(

    Context.SECURITY_PRINCIPAL,

    "CN=" + username + ",OU=" + ou + ",DC=mycompany,DC=com"

    ) // username

env.put(

    Context.SECURITY_CREDENTIALS,

    passwd

    ) // and password

// Now we'll try and connect...

try {

    def ctx = new InitialDirContext(env)

    def attr = ctx.getAttributes("")

    def srchInfo = new SearchControls()

    // you'll want to use your own search base

    def searchBase= "OU=company,DC=mycompany,DC=com"

    // this is the magic search string sauce:

    def searchFilter = "(&(objectClass=person))"

    // we strong type the next var because it is

    // used in a Java API that needs String[]

    String[] objAttribs=[

        "givenName",

        "cn",

        "sn",

        "mail",

        "mailNickname",

        "userPrincipalName",

        "displayName",

        "manager",

        "department",

        "memberOf"

    ]

    srchInfo.setSearchScope(SearchControls.SUBTREE_SCOPE)

    srchInfo.setReturningAttributes(objAttribs)

    // Now we get the results and loop through them...

    NamingEnumeration dirObjects = ctx.search(searchBase,searchFilter,srchInfo)

    def nodirObjects = 0

    while (dirObjects != null && dirObjects.hasMoreElements()) {

        def dirObject = dirObjects.next()

        println("'" + dirObject.getName() + "':")

        def attrs = dirObject.getAttributes()

        for(name in objAttribs) {

            println "\t * " + attrs.get(name)

        }

        nodirObjects++

    }

    ctx.close()

    println("Number of entries identified: " + nodirObjects)

} catch (Exception e) {

    println "Exception: " + e

}

```

{% endraw %}
