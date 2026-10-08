---
excerpt_separator: ""
layout: "archive-post"
title: "JAAS + Liferay + Woe"
date: "2007-07-03T14:10:00.001-04:00"
description: "The problem: I've written several EJB3 soap services that need to be secured by the PortalRealm security domain. When someone is logged into the portlet they can use the soap services... not logged in? no soap for you. T"
topics: ["capability-security","software-design"]
original_labels: ["jaas","java","jboss","liferay","portal","soap","woe"]
original_url: "https://hartsock.blogspot.com/2007/07/jaas-liferay-woe.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-07-03-jaas-liferay-woe/"
id: bafyr4ieepl5y2td74mm5mwlcv2lccyendijrrbmys5rfnl376rp4n7tpja
permalink: /posts/jaas-liferay-woe-p4n7tpja/
---
{% raw %}

The problem:

I've written several EJB3 soap services that need to be secured by the PortalRealm security domain. When someone is logged into the portlet they can use the soap services... not logged in? no soap for you.

The woe:

No ClassLoaders found for: com.liferay.portal.security.jaas.PortalLoginModule

Which seems innocuous enough until you realize what would be entailed in fixing the class loader problem. I would need to either make my project a direct extension of Liferay or I would need to alter Liferay to extend a custom security module.

Neither solution is good. It would be better if Liferay used a common container managed security system. Perhaps my solution is to somehow combine the realms.

{% endraw %}
