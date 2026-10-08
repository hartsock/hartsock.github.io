---
excerpt_separator: ""
layout: "archive-post"
title: "the vessel of ideas"
date: "2008-01-19T18:49:00.000-05:00"
description: "Earlier I said: > The word is the vessel of ideas. The written word is the preservation of ideas. The computerized word is the execution of ideas. Programming is about thinking. It is nothing else. Programs only execute "
topics: ["software-design","philosophy"]
original_labels: ["ORM","code","design","object","philosophy"]
original_url: "https://hartsock.blogspot.com/2008/01/vessel-of-ideas.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-01-19-the-vessel-of-ideas/"
id: bafyr4idr2d2kxuhn7an2gua6t4xerv33qicl5bbmbacr6vtpmaokwi3gc4
permalink: /posts/the-vessel-of-ideas-okwi3gc4/
---
{% raw %}

Earlier I [said](http://hartsock.blogspot.com/2006/05/word.html):

> The word is the vessel of ideas. The written word is the preservation of ideas. The computerized word is the execution of ideas.

Programming is about thinking. It is nothing else. Programs only execute the rules we believe to be true as we have written them down. What do we know? What do we believe?

Take the idea of *person*, *parent*, or *child* these are very basic ideas on the surface but surprisingly few people understand in context the ironic trap that the idea of an

*Object* then introduces. In the sense of a program...

An Object is a thing.

An Object may have things.

So it seems natural that a parent is a person and a child is a person. That makes sense. A parent has children. A child has parents. That all makes perfect sense. In the now.

We might say:

```

class Person {

  def name

  def birthday

  def gender

}

```

... to say a person has a name, a birthday, a gender...

```

class Parent extends Person {

 static hasMany = [children:Person]

}

```

... to say a parent has one or more children ...

```

class Child extends Person {

 Person mother

 Person father

}

```

... to say a child has one and only one mother and one and only one father... (in the real world we would probably fold Child attributes back into Person)

The terms I've used so far are more or less permanent. Once you become a parent you are never not one. Once you become someone's child that status is never removed. But sometimes there are statuses that are more flexible that aren't modeled correctly by using the "is a" idea. This becomes more apparent when dealing with a term such as employee.

A person is an employee as long as they are employed. You might be employed, unemployed, and re-employed multiple times with the same employer. So should "person is a parent" be modeled the same as "person is an employee" or is being an employee different?

Could it be that ...

```

class Employee extends Person {

 static hasMany = [employers:Employer]

}

```

... such that we we would add and remove employers over time to an employee?

But that doesn't really get at the idea of being an employee. You are one from one date to another and you might be again. So really you would want to say:

```

class Employment {

 Person employee

 Employer employer

 Date start

 Date end

}

```

So that a person is an employee if a person has an employment that has a start before now and an end after now. So many other relationships turn out share this same kind of temporal basis. Sadly, marriage does too... some of the data I have to model deals with people who have children and get divorced. The parent-child relationship is unbreakable and begins on the date of birth of the child. However, marriages don't work that way and at least once we've had the problem of modeling a marriage, divorce, and re-marriage. The systems can't handle that idea because they weren't built to hold it. They are poor vessels for these ideas.

It stands to reason that the attribute of being something when it comes to people is not in fact the same as being something when it comes to objects. People are objects in every sense but the being is not the same. A person has attached to them attributes ... like tags more than attributes ...which makes them one thing or another.

The relationship itself is an entity or an object.

The person is an employee by the virtue of possession of a relationship. Once in existence the relationship of employment carries its own being. It has its own data, attributes, and validity independent of the employee or employer.

Likewise the idea of a relationship between people carries similar intrinsic existence independent of the people. For example parent. The person as an object is not really modified but rather a new external relationship is created. In this case a child is created that then points back to the parent.

That means the "class Parent" is actually redundant. A person is a parent if any other people point back to them as a mother or father. If you wanted you could add a deceased date that would remain unused inside the person class and leave it undefined during life and set after death. But that's getting into the morbid.

Consider the employee again. This is a person object who has a record of employment. The employment is distinct and independent of the person. The relationship itself can have attributes without involving the people.

This is all pretty basic but if you continue to expand these ideas shifting your attitude about what an object is you find that mapping objects and relationships starts to get easier. You get to a model that has fewer impedance mis-matches with a relational database for example.

If the vessel will not hold your ideas change the vessel not your ideas.

{% endraw %}
