---
excerpt_separator: ""
layout: "archive-post"
title: "Suse Java5 install notes"
date: "2007-07-13T15:25:00.000-04:00"
description: "I wrote this tutorial a while ago for our services group to help them setup Java on our production servers. If you are on OpenSuSE: Open yast2 (CLI or GUI), and choose Software -> Software Management, next you'll search "
topics: ["software-design","organizations"]
original_labels: ["howto","install","java","linux","suse","tutorial"]
original_url: "https://hartsock.blogspot.com/2007/07/suse-java5-install-notes.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-07-13-suse-java5-install-notes/"
id: bafyr4icorrcf7rfjngbh255gxaxhgjitc54pz3f6q267rdxjambmlhsbz4
permalink: /posts/suse-java5-install-notes-bmlhsbz4/
---
{% raw %}

I wrote this tutorial a while ago for our services group to help them setup Java on our production servers.

If you are on OpenSuSE:

 Open yast2 (CLI or GUI), and choose Software -> Software Management, next you'll search for java. Find a version of java that is 1.5.0_06 or better and install it. If java version 1.5 is not in your list then you'll have to add on more software sources (see: AddingSoftwareSources) then try again.

If you are on SLES10:

 Download the Java EE 5 SDK from java.sun.com and follow the install instructions. Install path should be /usr/lib/jvm/ you could have the installer drop the jvm in a temporary location and then move it to /usr/lib/jvm/ later.

Note: Just because Java 5 is installed does not mean it is active.

A Standard Java Directory

If you are manually working with distributions of Java without an installer, all versions of java should end up in the /usr/java directory. Then you create two symbolic links... the "default" and the "latest" link. When linking the java binaries make sure to use the link passing through the /usr/java/default symbolic path. That way you can change which java the system is using by default simply by changing the default link in /usr/java without following the rest of the instructions for /etc/alternatives

```

$ ls -l

total 1

lrwxrwxrwx  1 root  root   11 2007-06-13 14:33 default -> jdk1.5.0_09

drwxr-xr-x  9 root  root  376 2006-10-12 16:01 jdk1.5.0_09

drwxr-xr-x 10 root  root  472 2007-04-23 15:29 jdk1.6.0_01

lrwxrwxrwx  1 root  root   21 2007-04-23 15:29 latest -> /usr/java/jdk1.6.0_01

```

This advice only applies if you don't already have a /usr/lib/jvm directory or you aren't relying on RPMs to manage your java versions. I believe later versions of OpenSuse have started to ship with RPMs that set up this /usr/java directory structure. Either way I'll point you at either /usr/lib/jvm or /usr/java as standard directories to use.

Manipulating the Distro

Fortunately, the SuSE distribution maintainers at Novell have done a good job of separating out the symbolic links for various programs, java being one of them. To activate one version or another of java in the SuSE distributions we can take advantage of the /etc/alternatives directory. By changing the sym links in this directory you change the active version of these programs.

Try the following:

```

$ whereis java

java: /usr/bin/java /etc/java /usr/lib/java /usr/share/java /usr/share/man/man1/java.1.gz

$ ls -hal /usr/bin/java

lrwxrwxrwx 1 root root 22 2006-06-29 16:06 /usr/bin/java -> /etc/alternatives/java

$ cd /etc/alternatives/

$ ls -hal java*

lrwxrwxrwx 1 root root 35 2006-07-05 10:04 java -> /usr/lib/jvm/java-1_4_2-sun-1.4.2.11/bin/java

lrwxrwxrwx 1 root root 37 2006-08-25 09:53 javac -> /usr/lib/jvm/java-1_4_2-sun-1.4.2.11/bin/javac

lrwxrwxrwx 1 root root 39 2006-08-25 09:53 javadoc -> /usr/lib/jvm/java-1_4_2-sun-1.4.2.11/bin/javadoc

lrwxrwxrwx 1 root root 37 2006-08-25 09:53 javah -> /usr/lib/jvm/java-1_4_2-sun-1.4.2.11/bin/javah

lrwxrwxrwx 1 root root 37 2006-08-25 09:53 javap -> /usr/lib/jvm/java-1_4_2-sun-1.4.2.11/bin/javap

lrwxrwxrwx 1 root root 37 2006-07-05 10:04 javaws -> /usr/lib/jvm/java-1_4_2-sun-1.4.2.11/bin/javaws

```

Uh oh. We have the wrong version of java active. Is Java 5 even installed?

```

$ cd /usr/lib/jvm/

$ ls

java                    java-1.4.2-sun           java-1.5.0-sun           jre            jre-1.4.2-sun  jre-gcj

java-1.4.2              java-1_4_2-sun-1.4.2.11  java-1.5.0-sun-1.5.0_06  jre-1.4.2      jre-1.5.0      jre-sun

java-1.4.2-gcj-1.4.2.0  java-1.5.0               java-sun                 jre-1.4.2-gcj  jre-1.5.0-sun

```

Yes it is. I see java-1.5.0-sun-1.5.0_06 and that's just the java we need. Let's see what binaries we have...

```

$ cd java-1.5.0-sun-1.5.0_06/bin

$ ls

appletviewer  HtmlConverter  java     javap         jdb    jsadebugd  keytool  native2ascii  rmic         servertool

apt           idlj           javac    java-rmi.cgi  jinfo  jstack     kinit    orbd          rmid         tnameserv

ControlPanel  jar            javadoc  javaws        jmap   jstat      klist    pack200       rmiregistry  unpack200

extcheck      jarsigner      javah    jconsole      jps    jstatd     ktab     policytool    serialver

```

... these are the binaries we're going to symbolically link in /etc/alternatives. But, there are already symbolic links in the way we'll need to remove them and then set come back here to recreate the links.

```

$ pushd .

/usr/lib/jvm/java-1.5.0-sun-1.5.0_06/bin /usr/lib/jvm/java-1.5.0-sun-1.5.0_06/bin

$ cd /etc/alternatives

$ sudo rm `ls /usr/lib/jvm/java-1.5.0-sun-1.5.0_06/bin`

password:

$ popd

$ pwd

/usr/lib/jvm/java-1.5.0-sun-1.5.0_06/bin

$ sudo ln -s * /etc/alternatives/

$ cd /etc/alternatives

$ ls -hal java*

lrwxrwxrwx 1 root root 35 2006-07-05 10:04 java -> /usr/lib/jvm/jre-1.5.0-sun/bin/java

lrwxrwxrwx 1 root root 37 2006-08-25 09:53 javac -> /usr/lib/jvm/java-1.5.0-sun/bin/javac

lrwxrwxrwx 1 root root 39 2006-08-25 09:53 javadoc -> /usr/lib/jvm/java-1.5.0-sun/bin/javadoc

lrwxrwxrwx 1 root root 37 2006-08-25 09:53 javah -> /usr/lib/jvm/java-1.5.0-sun/bin/javah

lrwxrwxrwx 1 root root 37 2006-08-25 09:53 javap -> /usr/lib/jvm/java-1.5.0-sun/bin/javap

```

And now we have the right symbolic links in place. Test the default version of java:

```

$ java -version

java version "1.5.0_06"

Java(TM) 2 Runtime Environment, Standard Edition (build 1.5.0_06-b05)

Java HotSpot(TM) Server VM (build 1.5.0_06-b05, mixed mode)

```

good. Now we have the right version active.

NOTE: The Novell software that depends on Java 1.4 should be smart enough to pick out the right JVM for itself given the /usr/lib/jvm directory structure. We've just set the default java to 1.5.0_06 which works fine with our JBoss tools. If there is a problem in the future, knowing where the other JVM are located will be valuable. The word on the street is that Novell's QA couldn't finish their last round of testing in time for release.

NOTE: the environment variable $JAVA_HOME must point to the home directory of the Java install

{% endraw %}
