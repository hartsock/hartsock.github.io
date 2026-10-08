---
excerpt_separator: ""
layout: "archive-post"
title: "Grails + Acegi + CAS + Proxy Ticket"
date: "2010-06-29T11:46:00.006-04:00"
description: "Should you have Acegi + CAS setup in Grails and you want to proxy a URL secured behind the same CAS instance you should do something like this: URL url = new URL(urlString) SecurityContext ctx = SecurityContextHolder.get"
topics: ["capability-security","software-design"]
original_labels: ["Acegi","CAS","SpringSecurity","grails","groovy","proxy"]
original_url: "https://hartsock.blogspot.com/2010/06/grails-acegi-cas-proxy-ticket.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2010-06-29-grails-acegi-cas-proxy-ticket/"
id: bafyr4ihnl4xwzsxrbmz4mfrmr3djb374x5mdbhqhyxm546cavc2kcombvm
permalink: /posts/grails-acegi-cas-proxy-ticket-2kcombvm/
---
{% raw %}

Should you have Acegi + CAS setup in Grails and you want to proxy a URL secured behind the same CAS instance you should do something like this:

```

    URL url = new URL(urlString)

    SecurityContext ctx = SecurityContextHolder.getContext();

    CasAuthenticationToken auth = ctx?.getAuthentication();

    Assertion assertion = auth?.getAssertion();

    Principal principal = assertion?.getPrincipal();

    assert principal.proxyRetriever != null

   // the above line asserts that proxy system is properly setup and working

    String proxyTicket = principal?.getProxyTicketFor(url?.toString());

    assert proxyTicket != null

    URL readUrl = new URL(url.toString() + "?ticket=${proxyTicket}")

```

This only works if your CAS supports proxying and you have a working proxy call back. For details on troubleshooting this with [Grails-Acegi 0.5.3](http://www.grails.org/plugin/acegi) see [GRAILSPLUGINS-2231](http://jira.codehaus.org/browse/GRAILSPLUGINS-2231) which includes a working proxy callback controller. Hopefully this will be fixed in an upcoming version so you won't need this reference for long.

If your setup is not working properly the proxyRetriever embedded in the Principal object will be null. If it is null then *getProxyTicketFor* returns null no matter what. Once you get your CAS and SecurityConfig.groovy working properly the proxyRetriever starts getting magically injected into your application. This doesn't mean you actually have proxying working yet but you can almost rule out client-side configuration errors.

Your Grails application should also have something at /secure/receptor that can catch responses issued by the CAS server. You should see this URI respond to something just after you successfully log in. That URI also needs to be open so the CAS server can post there without needing to login to itself.

NOTE: your CAS server must be able to resolve the URL of the proxy call back. That means if you are running your proxy callback on localhost the responding CAS server must be able to post to that URL. Why? When you request a proxy granting ticket CAS will send the ticket back to your Grails application at the URI /secure/receptor by default. That means your application's URL must be resolvable by the CAS *server* for proxy tickets to function.

In practice, I run a small CAS server on localhost at an obscure port with the URL to proxy also on localhost when testing proxy ticket granting and other CAS secured proxy services. I work around the SSL issues by using a custom implementation of javax.net.ssl.HostnameVerifier that is installed during bootstrap in *development* and *test-app* modes only. The custom verifier (written in Java) looks like:

```

import javax.net.ssl.HostnameVerifier;

import javax.net.ssl.SSLSession;

import javax.net.ssl.HttpsURLConnection;

public class CustomHostnameVerifier implements HostnameVerifier {

    public String[] exemptNames = {"localhost","testing.com","example.com"};

   // whatever hosts need exempting from having a "real" SSL certificate

    public boolean verify(String hostname, SSLSession session) {

        boolean exempt = false;

        if(exemptNames != null) {

            for(String name:exemptNames) {

                if(hostname.toLowerCase().endsWith(name)) {

                    exempt = true;

                }

            }

        }

        return exempt;

    }

    // call from BootStrap.groovy or other opportune initializer

    public static void init() {

        HttpsURLConnection.setDefaultHostnameVerifier(new CustomHostnameVerifier());

    }

}

```

Other work arounds would involve a staging CAS server that was able to resolve the development or testing host during work on proxying. These are up to you.

{% endraw %}
