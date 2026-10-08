---
excerpt_separator: ""
layout: "archive-post"
title: "Multiple versions of Grails in Hudson"
date: "2008-05-06T08:38:00.002-04:00"
description: "I have an interesting situation. I have a Hudson CI server that has to work with two different versions of Grails. I have a somewhat inelegant but functional solution. First, Grails is set up in: /usr/local/grails-versio"
topics: ["software-design"]
original_labels: ["grails","groovy","hudson"]
original_url: "https://hartsock.blogspot.com/2008/05/multiple-versions-of-grails-in-hudson.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-05-06-multiple-versions-of-grails-in-hudson/"
id: bafyr4ibd5peqeyetnh3cwimba3wvprxx76dyq2fzowclmudnhn4mw7c3ei
permalink: /posts/multiple-versions-of-grails-in-hudson-4mw7c3ei/
---
{% raw %}

I have an interesting situation. I have a [Hudson CI](https://hudson.dev.java.net/) server that has to work with two different versions of Grails. I have a somewhat inelegant but functional solution.

First, Grails is set up in:

```
/usr/local/grails-versions/
```

each version of grails lives in here so that we have...

```
/usr/local/grails-versions/grails-0.6

/usr/local/grails-versions/grails-1.0

/usr/local/grails-versions/grails-1.0.1

/usr/local/grails-versions/grails-1.0.2

```

I create a symbolic link to the current version like so:

```
 $ ln -s /usr/local/grails-versions/grails-1.0.1 /usr/local/grails
```

 now you can write your hudson jobs to run */usr/local/grails/bin/grails* and if you upgrade simply move the symbolic link. Like so:

```
 $ rm /usr/local/grails && ln -s /usr/local/grails-versions/grails-1.0.2 /usr/local/grails
```

Next. Set up your hudson project to ping your SVN server or whatever specifics are needed in your environment to get the code to build. Be sure to name your project a single word ... for example my_project. When you get to the *"Build"* section you are going to select the "Command" option.

For the sake of argument let's say that you older Grails application is written in Grails 0.6. The command will look something like...

```

cd my_project &&

GRAILS_HOME="/usr/local/grails-versions/grails-0.6" &&

/usr/local/grails-versions/grails-0.6/bin/grails prod war &&

mv *.war /path/to/build/archive

```

... where I move my Hudson produced War files to an archive to get picked up by other programs later. You might choose to do something else.

The odd thing I noticed by experimentation is that it's not enough to call on the right grails command... you have to also set the GRAILS_HOME for that command context. If you don't do *both* then you won't run the right version of Grails.

{% endraw %}
