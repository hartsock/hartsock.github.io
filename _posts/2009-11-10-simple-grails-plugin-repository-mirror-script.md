---
excerpt_separator: ""
layout: "archive-post"
title: "Simple Grails Plugin Repository Mirror Script"
date: "2009-11-10T12:23:00.008-05:00"
description: "We needed a local offline repository for Grails plugins. I thought this would be a good chance to contribute a grails application to the community. It turns out there already is one called plugrepo that you can just down"
topics: ["software-design","organizations"]
original_labels: ["grails","groovy","plugin","repository"]
original_url: "https://hartsock.blogspot.com/2009/11/simple-repository-mirror-script.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2009-11-10-simple-grails-plugin-repository-mirror-script/"
id: bafyr4iafkith6xorgttogvfrlaknlch6t72akmm7ie7wjkmmywbqof3uru
permalink: /posts/simple-grails-plugin-repository-mirror-script-bqof3uru/
---
{% raw %}

We needed a local offline repository for Grails plugins. I thought this would be a good chance to contribute a grails application to the community. It turns out there already is one called [plugrepo](http://github.com/jetztgradnet/plugrepo) that you can just download and use.

The plugrepo grails application is a very nice looking and if I'd known about it I wouldn't have spent the effort building my own.

What started this is a command line Groovy script I had hooked to a cron job on our Ubuntu Linux Apache server to create a mirror. I'll go ahead and post this here in case someone would rather have a flat Apache served archive... otherwise take a look at plugrepo.

To use the archive setup your grails app with this additional configuration file:

```

// grails-app/conf/BuildConfig.groovy

grails.plugin.repos.discovery.myRepository="http://myhost.test.com/grails/"

```

The following groovy script is meant to be run on the Ubuntu command line and

populate the /var/www/grails directory as if it were a grails plugin repository.

```

#!/usr/bin/env groovy

import groovy.xml.MarkupBuilder

/**

 * Shawn Hartsock

 *

 * This is a quick and dirty Groovy CLI script for creating Grails plugin

 * repository mirrors.

 */

def uri = "http://myhostname.test.com/grails"

def destinationRoot = "/var/www/grails"

def version = "grails-1.1.1"

def separator = System.getProperty("file.separator")

def latestOnly = true

if(!args) {

println """

    this script is designed to take plugins-list.xml files (as arguments) from

    a ~${separator}grails${separator}1.1.1 (or other version) folder and download each

    plugin to the $root working directory.

    It will then output a modified a $destinationRoot${separator}.plugin-meta${separator}plugins-list.xml

    file modified to reflect the new locations of the files.

"""

   System.exit(1);

}

try {

    def destination = destinationRoot + separator + version

    new File(destination).mkdir()

    def writer = new StringWriter()

    def xml = new MarkupBuilder(writer)

    List files = []

    args.each { arg ->

        if(arg == "-a") {

            latestOnly = false

        }

        if(new File(arg).exists()) {

            files.add(arg)

        }

    }

    xml.plugins(revision:2) {

        files.each { file ->

            process(file, destination, separator, uri + "/" + version, xml, latestOnly)

        }

    }

    new File(destinationRoot + separator + ".plugin-meta").mkdir()

    def outFile = destinationRoot + separator + ".plugin-meta" + separator + "plugins-list.xml"

    def out = new File( outFile )

    if(out.exists()) {

        if(out.delete()) {

            out = new File( outFile )

        }

    }

    out << writer.toString()

} catch(Exception ex) {

    System.err.println(ex.message);

    System.exit(0);

}

void process(String fileName, String destination, String separator, String uri, xml, latestOnly) throws Exception {

    def text = new File(fileName).text // may throw file access exceptions

    def plugins

    try {

        plugins = new XmlParser().parseText(text)

        assert plugins?.plugin.size() > 0

        assert plugins.plugin[0].release != null

        assert plugins.plugin[0].release.file != null

    } catch(java.lang.AssertionError ae) {

        throw new Exception("File $fileName does not contain plugin definitions: " + ae.message)

    } catch(Exception ex) {

        throw new Exception("File $fileName could not be parsed as plugin XML: " + ex.message)

    }

    println "${plugins.plugin.size()} plugins found in $fileName "

    println "\t"

        plugins.plugin.each { p ->

            xml.plugin( name:p.'@name', 'latest-release':p.'@latest-release') {

                p.release.each { r ->

                   def get = true

                   if(latestOnly) get = (r.'@version' == p.'@latest-release')?true:false

                   if(get) {

                       def f = download(r.file.text(), destination, separator)

                       if( f ) {

                            def url =  uri + "/" + f

                            println "\tregistering:\n\t " + url

                            release(type:r.'@type',tag:r.'@tag',version:r.'@version') {

                                title(r.title.text())

                                author(r.author.text())

                                authorEmail(r.authorEmail.text())

                                description(r.description.text())

                                documentation(r.documentation.text())

                                file(url)

                            }

                       }

                   }

                }

            }

        }

}

def download(String urlString, String dest, String separator) {

    // note: this is a web URL so you tokenize on "/" not file.separator

    def fileName = urlString.tokenize("/")[-1] // last name on URL

    def destFileName = dest + separator + fileName

    if( new File(destFileName).exists() ) {

        println "\t $destFileName already present in the repository"

        return fileName

    }

    print "\tdownloading $fileName to $dest directory\t"

    def file = new FileOutputStream( destFileName )

    def out = new BufferedOutputStream(file)

    out << new URL(urlString).openStream()

    out.close()

    println "."

    return fileName

}

```

{% endraw %}
