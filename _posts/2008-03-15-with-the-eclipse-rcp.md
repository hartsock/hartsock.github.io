---
excerpt_separator: ""
layout: "archive-post"
title: "... with the Eclipse RCP"
date: "2008-03-15T21:46:00.009-04:00"
description: "I've been working with Eclipse RCP and the SWT on a project lately. I started writing software in C/C++ about a decade ago. I remember working with C programs and UI back then as state machines. Essentially the UI would "
topics: ["software-design"]
original_labels: ["RCP","SWT","UI","eclipse","java"]
original_url: "https://hartsock.blogspot.com/2008/03/with-eclipse-rcp.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-03-15-with-the-eclipse-rcp/"
id: bafyr4if6b25jpg4zyap2lpx6rxilwr6qg424njt7zqnvmjlymw7vxqi64i
permalink: /posts/with-the-eclipse-rcp-7vxqi64i/
---
{% raw %}

I've been working with Eclipse RCP and the SWT on a project lately.

I started writing software in C/C++ about a decade ago. I remember working with C programs and UI back then as state machines. Essentially the UI would set states that a processing thread would later act upon. If you think about it this was an early form of Model View Controller separation.

I understood this type of separation well because the main process and the UI process essentially communicated through a set of state variables. If you were smart you nailed down these state variables and kept them in a central location and made them easy to understand.

I actually worked this way for most of my career... except for a few years back around 2000 when I joined the Internet hordes... and except for the last 4 years when I started working on Ajax applications (well, we didn't call them Ajax applications until recently).

I was pretty well familiar with Ajax by the time an opportunity to work with SWT came around. I had one project in Swing in the fall of 2001 but since then Java UIs weren't in the picture for me. I'll tell you *EJB3* was a welcome change from the J2EE work I had done back in 2001 but that's another post entirely. Let me focus on the SWT in this post.

When I was given the chance to take apart and enhance an Eclipse RCP project I saw it as a golden opportunity to gain familiarity again with Java desktop applications. That's not an area that I personally get to work with much. Most of my time is spent working with server-side and database projects... ironically my university emphasis was on 3D graphics in OpenGL... so a chance to work with graphics again was really welcome.

The SWT and Eclipse are not kind to new comers though. In particular you need to be careful of "kitchen sinking" your Eclipse IDE when you go to develop on it. The rule for how to keep Eclipse from getting "kitchen sunk" seems to be to keep the plugin base as minimal as possible. A bit of a pain especially since the Eclipse plugin manager will let you break Eclipse out-right by letting you get into a configuration that "*does not contain the platform*" (whatever that means) so that you have a nicely dead eclipse.

I hadn't realized that I had been lucky with eclipse up to this point. Most of my projects being server side didn't need advanced Eclipse features such as the GEF. Apparently if you try to use VE, GEF, jface, and eclipse.ui in the same project you're going to be doing some juggling.

Soon after I launched into this project I decided I needed training material since I wasn't intuitively picking up on SWT. The Visual Editor (VE) works with both SWT and Swing components but that's no consolation if you don't know either very well. It still isn't easy to make progress.

And this is where I think I'm starting to change my mind about a few things. I'm sure you've seen the GWT (that's the [Google Web Toolkit](http://code.google.com/webtoolkit/) if you didn't know) and it's basically a Swing/SWT type of web programming UI library. This is great if you like that kind of UI work... but really... I don't think I do.

I think I actually *like* Ajax and that mess of HTML and I think I like it because it's so easy to see what a UI element is going to look like. I think the HTML forces such a clean break between the controller and the view that it's actually beneficial. It's a disconcerting view for me to entertain because I actually come from a C/C++ background and I would probably prefer a more rigorous UI development environment.

In my utopia VRML would actually have lead somewhere instead of dying out. The concept behind a VRML interface and a web page is that presentation *should* be scripted. The idea of a mark up language hinting at a layout for a render engine is some what radical by itself but once you accept the idea ... you have to wonder why not use it *everywhere*?

I've actually had to write postscript drivers and code generators for postscript code. Postscript is actually a remarkable display oriented language. It is also far from a mark up language looking more like a custom graphics DSL than anything. So it's no shock to me that it may have taken two decades for the industry to accept the idea of markup for describing how to display things.

Consider that HTML and VRML are concerned with general descriptions of elements and leave the particulars of display up to the render engine. And this is the liberating feature of the markup language you get to care about only the particulars you want to. That frees the designer to paint with a broad brush and can separate the design and implementation functions very nicely.

Certainly the same discipline can be applied to work done with SWT, GWT, and Swing but that requires the effort and attention of the programmer. The web interface and its restrictions actually force the issue of the separation of design and function.

*sigh* but, design and function *aren't* actually separate are they... design dictates what a function must do and a function is only comprehended through the design of the interface to the function. A chair must have the shape of a chair... a cup must be a cup. Handles and legs and decoration can be added without too much troubling the core purpose of the artifact but ... really the design and function are one and the same.

So what am I saying about the SWT, GWT, Swing, or any other UI design API for that matter? I guess I'm trying to get at this idea that you need to be able to describe the UI in graphical terms. Component UI toolkits procedurally describe how a UI is built up in steps... and it's still procedural even if the procedures are encapsulated in objects.

Consider in all the UI toolkits I know (other than the Ajax ones) you build a menu object, build a menu item object, give the menu item object a code, enum, or pointer to a method to call, and then inject it into the menu object at menu initialization. This is very procedural and has virtually nothing to do with what a menu *is* graphically.

Now consider an Ajax design: You mark up a set of blocks to hold the menu items and apply style guides to them and then hook the onclick event to the appropriate action or link. The trick here is we are describing visual elements and the only thing that makes anything a menu is *how* it is used. That's a subtle but important paradigm shift.

It's subtle because a menu element and a menu object aren't conceptually that different. It's important because a menu element is really just a display block primitive with some style guides and a menu object is a much heavier complex and rich thing. But in the end they both do the same thing. It's just that one way is describing a thing that happens to get *shown* in a particular way graphically and the other is describing a graphical thing that happens to get *used* in a particular way programmatically.

The markups are interested in describing visual elements given a handful of visual primitives but the toolkits are focused on the aggregation of visual elements in a prescribed taxonomic hierarchy. That means that the toolkits are actually in danger of creating an *impedance mismatch* akin to the famous [object-relational impedance mismatch](http://en.wikipedia.org/wiki/Object-relational_impedance_mismatch) that we've fought in OOP and RDBMS circles for the last decade or so.

I wonder if we won't see talk of a UI-Object impedence mismatch or other metaphorical terminology for the mismatch between UI and UX expressions and the creation of component based taxonomic object hierarchies that pervade the practice of OOP. This is an especially ironic argument to make since OOP was created to better match a graphical environment. It's actually almost silly to make the argument against using OOP for GUI work... but here I am entertaining the notion.

I am looking to technologies like ZUML in the [Zk Framework](http://en.wikipedia.org/wiki/ZK_Framework) to start showing us if markup-componentized hybrid frameworks are actually feasible in a non-proprietary system. For now it's simply not practical for a "main stream" application to entertain the use of a Zk based design. Unless you and your users are ready to surf the cutting edge you will have to ride along with the rest of us and our component based frameworks.

Or you could go with Ajax.

For now I've decided to continue slogging through my work with SWT and Eclipse but it's really because I've got too much into this particular direction to back out now. I will say I have high hopes for the [GroovySWT](http://groovy.codehaus.org/GroovySWT) project and I've already sampled the Groovy Swing project. These are very nifty projects that promise the creation of a builder or markup-like way to express GUIs in both Swing and SWT. Hopefully both projects can find ways to "macro" or simplify UI building in the process of providing a new way to rapidly build up UI. The SWT builder already provides a very intuitive container syntax that eliminates some of that counter-intuitive procedural buildup code you find in Eclipse RCP Perspective and Activator objects.

I for one welcome our new groovy-builder overlords.

{% endraw %}
