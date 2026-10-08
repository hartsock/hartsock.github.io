---
excerpt_separator: ""
layout: "archive-post"
title: "A Groovy GeoCoder.us Client for Grails"
date: "2008-04-03T14:08:00.016-04:00"
description: "I have a need for a Grails GeoCoder for a project I'm working on. I'm going to feed the GeoCodes to a RichUI front end using Google Maps. And, I'll have access to addresses in the format... 1600 Pennsylvania Ave Washingt"
topics: ["software-design"]
original_labels: ["geocode","grails","groovy","mapping","richUI","service"]
original_url: "https://hartsock.blogspot.com/2008/04/groovy-geocoderus-client-for-grails.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-04-03-a-groovy-geocoder-us-client-for-grails/"
id: bafyr4ihmpblaq45dlkptpz3owslcxktbgmryzcafrbftxcbbxkarktmrfu
permalink: /posts/a-groovy-geocoder-us-client-for-grails-arktmrfu/
---
{% raw %}

I have a need for a Grails GeoCoder for a project I'm working on. I'm going to feed the GeoCodes to a RichUI front end using Google Maps. And, I'll have access to addresses in the format...

```
1600 Pennsylvania Ave

Washington, DC 20502
```

... so I've written a simple front-controller service to take in an address as a string, wash it into the format used by [geocoder.us](http://geocoder.us/) and pass it to geocoder.us then take the result and build a marker for RichUI.

In the grails-app/services directory:

```

import groovy.net.xmlrpc.*

// Shawn Hartsock sez: don't just use the free service, buy a geocoder.us account!

class GeoCoderService {

    boolean transactional = true

    static final serviceUrl = "http://geocoder.us/service/xmlrpc"

    def geoCode(String address) {

       def query = queryClean(address)

       def proxy = new XMLRPCServerProxy(serviceUrl)

       def result = proxy.geocode(query)

       return result

    }

    def marker(String address) {

       def res = geoCode(address)

       if(res) {

           def marker = [:]

           marker['description'] = address.replaceAll("\n","<br/>")

           marker['latitude'] = res['lat']

           marker['longitude'] = res['long']

           return marker

       }

       return null

    }

    def queryClean(String string) {

       def query = string.replaceAll("\n",",")

       query = query.replaceAll(",,",",")

       return query

    }

}

```

You'll notice I used *groovy.net.xmlrpc.** that's not in Grails by default. You'll have to download [groovy-xmlrpc-0.3.jar](http://dist.codehaus.org/groovy/jars/groovy-xmlrpc-0.3.jar) from [http://dist.codehaus.org/groovy/jars/](http://dist.codehaus.org/groovy/jars/) and put the file in your Grails' project's *lib* directory. If you are using an IDE you'll have to put that new jar file in the build path for your particular IDE so you can test the service.

If you have a class:

```

class Address {

    Long id

    Long version

    String address1

    String address2

    String city

    String state

    String postalCode

    String postalRoutingCode

    /** please forgive the multi-line string wrapping */

    public String toString() {

       return """${address1}${(address2)?"\n$address2":''}

${city}, ${state} ${postalCode}${(postalRoutingCode)?'-':''}${postalRoutingCode}"""

     }

}

```

... *then* when you want to add a geocode location complete with a marker to your Grails [RichUI](http://docs.codehaus.org/display/GRAILS/RichUI+Plugin) project... all you have to do is ... from the controller:

```

class AddressController {

  // reference the service...

  GeoCoderService geoCoderService

  // and later on ...

  def show = {

    /* code skipped */

    return [

             address: address,

             markers: [geoCoderService.marker(address.toString())]

     ]

  }

  /* more code ... skipped for clarity */

}

```

... and in the *show.gsp* put at the top of the file:

```

<resource:googlemaps key="**myGoogleMapsKey**" />

```

*NOTE: you'll have to register for a Google Maps key... see: [RichUI-GoogleMaps](http://docs.codehaus.org/display/GRAILS/RichUI+Plugin#RichUIPlugin-GoogleMaps)*

... and somewhere inside the file:

```

 <g:if test="${markers}">

    <div class="mapPane">

       <richui:googlemaps markers="${markers}" zoomLevel="7" />

    </div>

 </g:if>

```

*NOTE: I've noticed Internet Explorer can have a hard time with the googlemaps tag in certain cases unless you wrap it in a div block.*

And that's it. I highly recommend that you cache query results from geocoder.us to avoid putting too much load on their free service. If you plan on using this on a heavily used site of any kind I highly advise that you **buy** an account from [GeoCoder](http://geocoder.us/blog/about/) it's a really fine service and deserves your support.

RichUI is a really nice tool kit to use and deserves some of your time too. Once you have this down you'll be geoCoding and google mapping so much you may have a hard time focusing on other features! Have fun!

EDIT: Check out these Google GeoCoder based posts by [Ken Kousen](http://kousenit.wordpress.com/2007/09/04/trivial-geocoding-with-google-and-groovy/) or [Justin Spradlin](https://gate.platinumsolutions.com/psblog/Geocoding-Made-Easy-With-Groovy-And-Google) for how to use the Google GeoCoding services instead.

{% endraw %}
