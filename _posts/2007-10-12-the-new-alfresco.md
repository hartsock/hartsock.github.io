---
excerpt_separator: ""
layout: "archive-post"
title: "The new Alfresco"
date: "2007-10-12T10:07:00.000-04:00"
description: "TriLUG last night had a special presentation from principal architect Jon Cox. Jon Cox had developed software for the Interwoven product suites and is now working for Alfresco which has released a new versioning engine b"
topics: ["software-design","organizations"]
original_labels: ["Software Design","java","triLUG"]
original_url: "https://hartsock.blogspot.com/2007/10/new-alfresco.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-10-12-the-new-alfresco/"
id: bafyr4idwraeyvsmo3kza724ibxnuy33vxj3dhcdks6txg5xlkpnivwxfqy
permalink: /posts/the-new-alfresco-nivwxfqy/
---
{% raw %}

[TriLUG](http://www.trilug.org/) [last night](http://www.mattfrye.net/2007/10/jon-cox-on-alfresco.html) had a special presentation from principal architect [Jon Cox](http://www.alfresco.com/about/people/all/#jonc). Jon Cox had developed software for the [Interwoven](http://www.interwoven.com/) product suites and is now working for [Alfresco](http://www.alfresco.com/) which has released a new versioning engine based on Jon's work.

The new alfresco tool's new features include Native Office integration, multiple locking models, adaptive workflow engines based on jBPM, REST style API, a new Web 2.0 front end, web portal integration, and web content management features. The big win here is the long awaited Office integration. Unfortunately, this feature is apparently very new and doesn't have good documentation around it yet.

For a programmer the most common use of versioning is in source code version management with tools such as SVN. The difference between Alfresco and SVN was described by Cox using this analogy:

Imagine you have a window pane and you are looking at the Mona Lisa. You can draw on this pane, erase it, do what ever you want and no one but you can see it. Now imagine there are three of you... Alice, Bob, and Charlie. Charlie puts a mole on Mona Lisa, Bob puts a mustache, and Alice adds a goatee. If Charlie commits (permanently saves) his mole Alice and Bob will suddenly see the mole show up underneath their window panes.

This is very different from source code control in products like SVN and CVS. In source code the developers all have their copies that they work on. When they are done they commit their changes. In SVN if Charlie has committed that mole neither Alice nor Bob will see the mole until they go to commit. When they try to commit they get an error. Alice and Bob each have to update manually and then make changes to accommodate Charlie's mole addition.

This is inappropriate behavior for managing documents. And, that is why Alfresco can be set up with either pessimistic locking (source code type locking) or optimistic locking (everyone sees each other's changes immediately).

I took away these key concepts:

Alfresco versioning composed of three layers... The official copy, the working copy, and the preview.

The official copy is like the Mona Lisa under glass, the working copy you have is like a pane of glass that you can draw on and no one can see. The preview exists behind you as a preview that you can send "links" to other people who can then look "over your shoulder". This set of concepts allows people to play "what if" scenarios with their documents and web sites.

The working copy can pass through an approval process before it reaches the official copy. You may snapshot a working copy before you send a preview and only allow a preview of the snap shot. And all this can be used to version sets of documents or websites.

Toward the end of the talk Jon entertained the long term vision that the Alfresco object-version system could be used for source code control. It would allow for the implementation of different policies on how source code could be modified and worked with... and could be used to implement radically different software work patterns then what we use now.

{% endraw %}
