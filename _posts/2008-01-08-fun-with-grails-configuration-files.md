---
excerpt_separator: ""
layout: "archive-post"
title: "Fun with Grails configuration files"
date: "2008-01-08T10:41:00.001-05:00"
description: "In a Grails project you can put your own configuration inside the grails-app/conf/Config.groovy file. In this post is a sample of a configuration I'm using for a WebClient driven service. Certain web client configuration"
topics: ["software-design"]
original_labels: ["grails","groovy"]
original_url: "https://hartsock.blogspot.com/2008/01/fun-with-grails-configuration-files.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-01-08-fun-with-grails-configuration-files/"
id: bafyr4id22ljup7r3gj6b5ll232ayhizztvcjqnch6fd5ekjxpkba626t3e
permalink: /posts/fun-with-grails-configuration-files-ba626t3e/
---
{% raw %}

In a [Grails](http://grails.org) project you can put your own configuration inside the *grails-app/conf/Config.groovy* file.

In this post is a sample of a configuration I'm using for a WebClient driven service. Certain web client configurations have been pushed out into Config.groovy so that if I need to I can run different configurations for different combinations of products. NOTE: *My service performs web automations using the [com.gargoylesoftware.htmlunit.WebClient](http://www.google.com/search?q=Groovy+WebClient) that would otherwise be a screen-scrape operation becoming very brittle.*

```

webclient {

 crm {

  scheme = "http" // see: RenderRequest.getScheme

  server = "192.168.1.40"

  port   = 8080

  agent = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.9) Gecko/20071025 Firefox/2.0.0.9'

  username = "guest"

  password = "guest"

  timeout = 12000 // timeout in milliseconds for browser

  waitTime = 12000 // time to wait between failed attempts

  home {

   url = "/CRM/ui.jsp"

  }

  login {

   url = "/CRM/security_check"

   params {

    username

    password

   }

  }

  logout {

   url = "/CRM/logoff.jsp"

  }

}

```

Anything you need to do involving multiple data sources, multiple servers, or anything you need to configure to be sensitive to deployment environment can go in the configuration file. For example the following allows for the over ride of different configurations (in your own configs) in different environments... very handy...

```

environments {

 development {

  webclient {

   crm {

    server = "192.168.1.40"

    username = "guest"

    password = "guest"

   }

  }

 }

 test {

  webclient {

   crm {

    server = "192.168.1.41"

    username = "guest"

    password = "testing"

   }

  }

 }

 production {

  webclient {

   crm {

    scheme = "https" // see: RenderRequest.getScheme

    server = "192.168.1.42"

    port   = 443

    username = "automatic"

    password = "production"

   }

  }

  log4j {

   logger {

    grails="error,stdout"

   }

  }

 }

}

```

For more on web automation I found [PLEAC](http://pleac.sourceforge.net/pleac_groovy/webautomation.html) very helpful.

{% endraw %}
