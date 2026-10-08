---
excerpt_separator: ""
layout: "archive-post"
title: "Getting Fit and Groovy"
date: "2007-08-24T10:02:00.000-04:00"
description: "Fitnesse + Groovy + Hudson Today I'm going to talk about my Continuous Integration environment and Acceptance Testing Framework. We are using Fitnesse to write acceptance tests that run in Fit, Hudson (running ant) to cr"
topics: ["testing","software-design","documentation"]
original_labels: ["ant","ci","code","fit","fitnesse","groovy","howto","hudson","idea","java","testing"]
original_url: "https://hartsock.blogspot.com/2007/08/getting-fit-and-groovy.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-08-24-getting-fit-and-groovy/"
id: bafyr4iaiewo5m3jzbw53rnheun2dinflpuj25sjpnkx4nxajj4af5m4r6u
permalink: /posts/getting-fit-and-groovy-af5m4r6u/
---
{% raw %}

Fitnesse + Groovy + Hudson

Today I'm going to talk about my Continuous Integration environment and Acceptance Testing Framework. We are using Fitnesse to write acceptance tests that run in Fit, Hudson (running ant) to create our builds, and we're writing our Fitnesse Fixtures in Groovy.

The big picture

The Fitnesse Acceptance testing suite paired with the right tools becomes an absolute authoritative documentation of all business processes implemented in the software under test. It becomes not only a tool for validating software but also a tool for quantifying formal and informal business processes. For some companies this can provide a light weight tool for business analysts to understand their business where no formal tool provided any such insight before.

References:

- [Hudson](https://hudson.dev.java.net/) - a continuous integration server that is extremely easy to set up and manage

- [Fitnesse](http://fitnesse.org/) - a stand alone wiki that is a server and wiki all in one which makes life easy for neophyte administrators but harder on experienced admins and developers... yes I know they spelled fitness wrong.

- [Groovy](http://groovy.codehaus.org/) - a revolutionary new scripting language that compiles to Java byte code.
Why should I care?

Hudson: Because continuous integration facilitates testing early and often and prevents software projects from getting into a broken state. You want to know where your problems will be early since fixing unit level bugs is easier earlier in the development cycle rather than later.

Fitnesse: Because acceptance testing should test function of the code independent of presentation of code. We sing the praise of Model View Controller separation in code... why not in test? Business users can understand spreadsheets and fitnesse tests are just wiki spreadsheets. Fixtures are just preambles to calling your re-usable API. So all business features can be encoded into the fitnesse framework leading to automated functional regression testing. That means easy business visibility to programmer's progress and an easy way to update changes in requirements.

Groovy: Because traditional Java Bean code doesn't "facilitate expressing *what* a program is really trying to accomplish" and that is not something you want to get bogged down by in your fixtures... fixtures are not "real" or "permanent" code! Groovy lets you crank out fixtures quickly so you can focus on the important code that going to get called by that fixture.

Some business process details

Typically what happens in software projects that age is the documentation that expresses what the business thinks the project should do becomes less and less accurate of what the software does do. This happens either because the business expresses a requirement change outside the documentation or because the regression testing system does not look at business level acceptance tests for the system as a whole.

Using continuous integration and an automated acceptance testing solution that expresses requirements in business level language means that all business cases are tested each build. The system does not "drift" from requirements. If the business changes the requirements that is expressed in a way that demonstrates how much "breakage" the change represents. This affords the business an objective way to measure the cost of the change in an unambiguous way.

The Fitnesse wiki becomes the repository for all knowledge about the business rules expressed in the software system. This documentation of a business rule is automatically validated against the system and the code either operates this way or not. There is no disparity between what the business thinks the business rule the software supports is and what the code implements as a business rule.

Making it happen

As of this writing, Hudson and Fitnesse should share the same file system to make writing your ant build scripts easier. Hudson will call the ant build script for your project, I've specified a "fitnesse" target in the script that deploys all the classes for the project into the fitnesse files directory allowing you to run fitnesse tests from the wiki on the code base.

Tasks overview

- deploy hudson.war into a servlet container... that could be Apache+Tomcat, Jetty, JBoss + Tomcat, or whatever your heart desires as long as it can deploy war files. The servlet container for hudson should not use the same port as fitnesse. Typically users want fitnesse to run on port 80.

- "deploy" fitnesse to an established and stable directory that ant and hudson can reliably access. You will set up fitnesse to either grab port 80 or catch port 80 forwarded traffic so that fitnesse is easy for your business users to get to.

- set up your ant build script to compile groovy to class files and to deploy classes into the fitnesse file system for execution by fitnesse wiki pages.

- tweaking the classpath of the fitnesse wiki pages to include the groovy embeddable jar file.
On deployment

I've [posted before](http://hartsock.blogspot.com/2007/07/symbolic-link-joy.html) on deploying software to Linux boxes so I won't spend any time on that issue here. I should think you can find good tutorials on how to configure Fitnesse and Hudson for your environment. Instead I'll talk about the unique features of my configuration.

The secret sauce

The ant build script has the following

```
 <property name="fitnesse-dir" location="/usr/local/fitnesse/FitNesseRoot/files/OLA"/>

<taskdef name="groovyc"

        classname="org.codehaus.groovy.ant.Groovyc"

        classpathref="classpath"/>

```

You can add a line to a FitNesse wiki page that adds classes to the class path for the test runner. For example on our fitness server we have groovy installed (via symbolic link) under /usr/local/groovy and fitnesse installed under /usr/local/fitnesse.

Hudson runs an ant build script that has a fitnesse-dir property, a groovyc task definition, and a fitnesse target after build.

We set up Groovy tasks like this:

```

<taskdef name="groovy"

          classname="org.codehaus.groovy.ant.Groovy"

          classpathref="classpath"/>

<taskdef name="groovyc"

          classname="org.codehaus.groovy.ant.Groovyc"

          classpathref="classpath"/>

```

And build the groovy files to classes by doing this:

```

   <groovyc destdir="${build}" srcdir="${src}" classpath="${build}">

       <include name="**/*.groovy"/>

       <include name="**/*.java"/>

   </groovyc>

```

... instead of calling javac, we are using groovyc so we get java and groovy compiled side-by-side able to work with each other seamlessly.

Next, we set up the fitnesse dir property as:

```
<property name="fitnesse-dir" location="/usr/local/fitnesse/FitNesseRoot/files/MyProj"/>

```

So that later we can do this:

```
<target name="fitnesse" description="Set up for FitNesse tests" depends="build">

   <mkdir dir="${fitnesse-dir}">

   <delete file="${fitnesse-dir}/proj-fitnesse.jar">

   <jar jarfile="${dist}/proj.jar" basedir="${build}">

   <jar jarfile="${fitnesse-dir}/proj-fitnesse.jar">

    <fileset dir="${build}">

    <fileset dir="${test-dir}">

   </jar>

</target>

```

Now on the wiki pages we set the path to include our project jar *and* the groovy jar...

```
!path /usr/local/fitnesse/FitNesseRoot/files/MyProj/myproj-fitnesse.jar:/usr/local/groovy/embeddable/groovy-all-1.1-beta-2.jar

```

There isn't really anything special to get Fitnesse to use Groovy fixtures. Groovy compiles to class files and Fitnesse will look on its class path for class names that match the fixture name. For example if we create a fitnesse table that looks like this:

```

|MyFixture |

| param1 | param2 | param3 |

| joe | | blogs |

| mary | joesephine | blogs |

```

Now when you run the test the page will look for MyFixture.class in your jar file. It won't care whether the class is Java or Groovy. If your fixture is a groovy class, you have provided the groovy jar to the classpath and it will just run.

{% endraw %}
