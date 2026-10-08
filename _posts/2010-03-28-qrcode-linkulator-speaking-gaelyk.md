---
excerpt_separator: ""
layout: "archive-post"
title: "QRCode Linkulator speaking Gaelyk"
date: "2010-03-28T13:47:00.005-04:00"
description: "I've just written my first application using Gaelyk a Groovy based framework for Google App Engine. I ported the qrcode plugin I had written for Grails over to Gaelyk in a matter of hours. This isn't really an applicatio"
topics: ["software-design"]
original_labels: ["gaelyk","groovy","qrcode"]
original_url: "https://hartsock.blogspot.com/2010/03/qrcode-linkulator-speaking-gaelyk.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2010-03-28-qrcode-linkulator-speaking-gaelyk/"
id: bafyr4ibyjcycvyst3lnjm64h2xhzzd2y6zhecorhvg33ww2zneipw46h4m
permalink: /posts/qrcode-linkulator-speaking-gaelyk-ipw46h4m/
---
{% raw %}

I've just written my first application using [Gaelyk](http://gaelyk.appspot.com/) a [Groovy](http://groovy.codehaus.org/) based framework for [Google App Engine](http://code.google.com/appengine/). I ported the [qrcode plugin](http://grails.org/plugin/qrcode) I had written for [Grails](http://grails.org/) over to [Gaelyk](http://gaelyk.appspot.com/) in a matter of hours.

This isn't really an application for iPhone or Android but it relies on the [Barcode Scanner](http://zxing.googlecode.com/files/BarcodeScanner3.21.apk) on Android or an app like

 [Barcodes](http://phobos.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=292197557&mt=8) on the iTunes AppStore for iPhone. Combined with a tiny "bookmarklet" I found the result is quite useful for moving a link between my desktop and my phone. I made a [demonstration video](http://www.youtube.com/watch?v=5ex8sPrVeLQ) since this can be a little hard to explain.

You can get a gander at the app here: [QRCode Linkulator](http://qrcodelinkulator.appspot.com/). I make use of the HTTP referer header property to determine where you came from so if you were to click [http://qrcodelinkulator.appspot.com/300](http://qrcodelinkulator.appspot.com/300) for example then you would get a QRCode for the URL you were at *before* you clicked the link. The error mode (should you have no "referer" associated with your browser (for example if you were to right-click the link and open it in a new window) is just the logo for the app.

You might notice I tested out this feature in my blog. When you hit a given page in my blog there will be a QRCode for the URL you are currently looking at embedded in the page. This is done with simple image tags and no javascript.

Right now, I'm just hosting the app on the free AppEngine account and hoping that is enough CPU + Bandwidth for the application. I'm also hoping to stress-test the app a little to get a feel for how things scale. So far [Gaelyk](http://gaelyk.appspot.com/) is running error free. I'm quite pleased with the simplicity of the framework and the price is right for App Engine hosting.

I doubt I'll get enough traffic to have to worry about paying for the service if the app gets that popular I'll have to figure out how to get it to pay for itself. Any ideas?

{% endraw %}
