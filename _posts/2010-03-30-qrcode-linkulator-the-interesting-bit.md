---
excerpt_separator: ""
layout: "archive-post"
title: "QRCode Linkulator the interesting bit."
date: "2010-03-30T08:58:00.003-04:00"
description: "For me the interesting bit about writing QRCode Linkulator was creating a PNG on AppEngine. The JRE Class White List doesn't include any Graphical libraries. Notice that most of java.awt. is missing? Why would Google do "
topics: ["software-design"]
original_labels: ["android","appengine","cloud","gaelyk","google","java.awt.Color","qrcode","talk"]
original_url: "https://hartsock.blogspot.com/2010/03/qrcode-linkulator-interesting-bit.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2010-03-30-qrcode-linkulator-the-interesting-bit/"
id: bafyr4ibgqb3m64su7el35ufdeprfxtya7ahcsqmyixdk4gkom2xnrlk7iu
permalink: /posts/qrcode-linkulator-the-interesting-bit-xnrlk7iu/
---
{% raw %}

For me the interesting bit about writing [QRCode Linkulator](http://qrcodelinkulator.appspot.com/) was creating a PNG on AppEngine. The [JRE Class White List](http://code.google.com/appengine/docs/java/jrewhitelist.html) doesn't include any Graphical libraries. Notice that most of java.awt.* is missing?

Why would Google do that? Well, try downloading a copy of the OpenJDK. Go ahead. I'll wait. Got it now? Great. Now look in openjdk-6-src/jdk/src/share/native/sun/awt ... what do you see? A mess of native C code.

So key components of OpenJDK are written in C. Key components of AWT. That means if you want to do graphics (server side) in Java you need to hit some chunks of C code. I bet that's dangerous in AppEngine.

Combine this with the fact that [pngj](http://code.google.com/p/pngj/) is the only project I could find that had a pure Java implementation of the [PNG](http://www.w3.org/TR/PNG/) specification and the challenge of doing the "[impossible](http://code.google.com/p/googleappengine/issues/detail?id=1423)" and the temptation to pull this off was irresistible. Consider [how](http://sourceforge.net/tracker/?func=detail&aid=2810312&group_id=15255&atid=365255) [many](http://mail-archives.apache.org/mod_mbox/poi-dev/200907.mbox/%3Cbug-47497-47293@https.issues.apache.org/bugzilla/%3E) [programs](http://www.aspose.com/community/forums/thread/226124/google-app-engine-java-aspose-words.aspx) [rely](http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=446827) on [those classes](http://koders.com/default.aspx?s=java.awt.Color&submit=Search&la=*&li=*) and there is NO pure Java solution in existence.

At my current workplace we do a lot with cloud computing. Because of this I've got a special sympathy for the guys working on AppEngine. They probably have some technical infrastructural reason they can't let you get at those AWT classes either directly or indirectly. My guess is it has to do with how they implemented the custom JRE that your app runs in.

That combined with an interesting socio-economic constraint they placed on AppEngine applications makes me think that AppEngine isn't just "free" as in beer hosting but really an interesting way for Google to codify their chief aesthetic concerns about how applications function.

This aesthetic is born of cloud computing on a scale no other company gets close to. At this scale, apparently, an aesthetic similar to that found in embedded systems starts to come through. Which in my mind is extremely ironic. See... I've been doing some Android development lately.

Consider that your app-engine app may be sitting cold with no one using it. Then the user hits the application for the first time... perhaps deep linking into your application. The deep link re-activates the app. It's cold, dark, and if you are a scripting environment... not compiled requiring an interpreter to fire up, load your script and then interpret it.

Huge penalties in that environment. So I hear some clever developers have kept their applications hot by writing Google AppEngine [Cron Jobs](http://code.google.com/appengine/docs/java/config/cron.html) which hit the web application in some low cost way to keep it warm. That's pretty clever. But only works until your application scales.

Yes. That's right. It works until your application becomes really really popular. Why?

When your application scales your application is going to get provisioned with another "machine" on the Google Cloud. That application will be cold. You'll pay the warm up penalty for that application and that first user gets the raw deal having to wait while your app spins up. Bad news. This happens every time your app scales up one "machine" and the net effect can be [Fail Whale](http://failwhale.com/) like badness.

Besides, inflating your own app's "popularity" by "hitting yourself" seems a tad... well... evil. So please. Stop hitting yourself.

The "right" answer is to somehow mitigate that first page hit cost. You get that first page view cost down as close to zero as you can... then take it a little farther.

How? Anyone have ideas?

{% endraw %}
