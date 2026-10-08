---
excerpt_separator: ""
layout: "archive-post"
title: "Competing Mental Models: Object-Relational"
date: "2006-06-27T11:10:00.000-04:00"
description: "In order to deal with complex issues, humans create models. The models we make deliberately ignore certain aspects of a real-world \"thing\" we deem as irrelevant. In this way we simplify a more complex problem enough to d"
topics: ["personal-notes"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2006/06/competing-mental-models-object.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2006-06-27-competing-mental-models-object-relational/"
id: bafyr4idbygldds4na3v5h4gpd2ujkvsgkqsh774o2meo4lme2mr4lxe4h4
permalink: /posts/competing-mental-models-object-relational-r4lxe4h4/
---
{% raw %}

In order to deal with complex issues, humans create models. The models we make deliberately ignore certain aspects of a real-world "thing" we deem as irrelevant. In this way we simplify a more complex problem enough to deal with it.

For example, when you try and solve the classic "If train A leaves city 1 at 8 am traveling 60 mph and train B leaves city 2 traveling at 40 mph at 8:30 am and the cities are 100 miles apart, when will the trains pass each other?" You ignore many facts about the trains, the cities, and train travel. How big are the trains? Was it raining? Did the passengers enjoy the ride?

In mathematics we have various models of the universe (sometimes called maths). Each new type of math has its own symbols and rules. Different kinds of math we find our selves using in [computer science](http://http://en.wikipedia.org/wiki/Computer_science#Mathematical_foundations) include [graph theory](http://http://en.wikipedia.org/wiki/Graph_theory) and [set theory](http://http://en.wikipedia.org/wiki/Set_theory). These different views of the world have generated different paradigms of computing that can compete with each other in the mind of the programmer.

In particular, I deal with (on nearly a daily basis) the competition between the non-complimentary techniques used in modeling data for [Relational Databases](http://en.wikipedia.org/wiki/Relational_database) and [Object Oriented Programming](http://http://en.wikipedia.org/wiki/Object_Oriented_Programming) languages. The term for this mental conflict is called the [Object-Relational impedance mismatch.](http://en.wikipedia.org/wiki/Object-Relational_impedance_mismatch)

I've observed this mismatch to yield some pretty strange ideas in the heads of my peers. I've seen designs that match one table per object with inheritance declared illegal because you can't model it "properly" in a database. I've seen developers completely ditch the concept of a database in favor of "pure" object designs that persist data in either serialized files or XML. And, I've even heard of doing away with Objects entirely in favor of "Data Oriented" designs.

If the model makes for more complexity than it solves... isn't it a bad model? At the end of a long day, it appears to me that the problem isn't in our heads it's in our [languages](http://hartsock.blogspot.com/2006/06/lingua.html). What our languages can communicate molds in part what our minds can model.

{% endraw %}
