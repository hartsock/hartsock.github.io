---
excerpt_separator: ""
layout: "archive-post"
title: "JUnit and JPA"
date: "2007-08-02T17:24:00.000-04:00"
description: "So, we have a need to test EntityManager driven classes from inside our JUnit tests. How do you set this up? Well, I for one added a testDb persistence unit to my persistence.xml file and then set up this abstract class."
topics: ["testing"]
original_labels: ["j5ee","jpa","junit","testing"]
original_url: "https://hartsock.blogspot.com/2007/08/junit-and-jpa.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-08-02-junit-and-jpa/"
id: bafyr4ihw2gyu3wkfx54lv6mpumb236y6u6jaztnq3m5w6loo5dkr3woowm
permalink: /posts/junit-and-jpa-kr3woowm/
---
{% raw %}

So, we have a need to test EntityManager driven classes from inside our JUnit tests. How do you set this up? Well, I for one added a testDb persistence unit to my persistence.xml file and then set up this abstract class...

```

package com.vifprogram.tie.test;

import javax.persistence.EntityManager;

import javax.persistence.EntityManagerFactory;

import javax.persistence.Persistence;

import org.junit.After;

import org.junit.Before;

/**

 * This testCase object works in conjunction with a test persistence unit you

 * define in your persistence.xml. It sets up an entity manager that is aware

 * of all the classes in your build path.

 *

 * Inherit from this class to build unit tests which need an entity manager.

 *

 * @author shawn

 *

 */

public abstract class EMTestCase {

 private static final String TEST_PERSISTENCE_UNIT = "testDb";

 private EntityManagerFactory emf;

 protected EntityManager em;

 public EMTestCase() {

  super();

 }

 @Before

 public void initEmfAndEm() {

     emf = Persistence.createEntityManagerFactory(TEST_PERSISTENCE_UNIT);

     em = emf.createEntityManager();

 }

 @After

 public void closeEmfAndEm() {

     em.close();

     emf.close();

 }

}

```

{% endraw %}
