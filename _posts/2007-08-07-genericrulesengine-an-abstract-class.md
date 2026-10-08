---
excerpt_separator: ""
layout: "archive-post"
title: "GenericRulesEngine: an Abstract Class"
date: "2007-08-07T11:21:00.000-04:00"
description: "This is my take on how to implement rules engines in a project. I'm still working a few things out but you get the idea. package com.vifprogram.tie; import java.io.InputStream; import java.rmi.RemoteException; import jav"
topics: ["software-design"]
original_labels: ["code","java","rules engine","sample"]
original_url: "https://hartsock.blogspot.com/2007/08/genericrulesengine-abstract-class.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-08-07-genericrulesengine-an-abstract-class/"
id: bafyr4igocjkhvfxtuenjqp2aaafvjxk2n4douh6drw3nm3xjzdsnhq64ly
permalink: /posts/genericrulesengine-an-abstract-class-snhq64ly/
---
{% raw %}

This is my take on how to implement rules engines in a project. I'm still working a few things out but you get the idea.

```

package com.vifprogram.tie;

import java.io.InputStream;

import java.rmi.RemoteException;

import javax.rules.InvalidRuleSessionException;

import javax.rules.RuleRuntime;

import javax.rules.RuleServiceProvider;

import javax.rules.RuleServiceProviderManager;

import javax.rules.StatelessRuleSession;

import javax.rules.admin.LocalRuleExecutionSetProvider;

import javax.rules.admin.RuleAdministrator;

import javax.rules.admin.RuleExecutionSet;

import javax.rules.admin.RuleExecutionSetDeregistrationException;

import org.drools.jsr94.rules.RuleServiceProviderImpl;

/**

* This is the base class for you to write your own rules driven things.

* @author shawn

*

*/

public abstract class GenericRulesEngine {

 private final String RULE_SERVICE_PROVIDER = "http://drools.org/";

 protected String RULE_URI = null;

 protected StatelessRuleSession _statelessRuleSession;

 protected RuleAdministrator _ruleAdministrator;

 private boolean _clean = false;

 public GenericRulesEngine() {

  super();

  RULE_URI = getRuleURI();

 }

 /**

  * Returns the string such as MyClassName.drl

  * @return

  */

 protected abstract String getRuleURI();

 /**

  * you could implement just this...

  *  return AssignmentManager.class.getResourceAsStream(RULE_URI);

  * or invent some fancier method of loading the resources...

  * @return

  */

 protected abstract InputStream getRules();

 /**

  * runs the cleanup

  */

 protected void finalize() throws Throwable {

  if(!_clean) {

   cleanUp();

  }

 }

 /**

  * set up the rules engine

  *

  */

 protected void prepare() throws Exception {

     RuleServiceProviderManager.registerRuleServiceProvider(

             RULE_SERVICE_PROVIDER, RuleServiceProviderImpl.class );

     RuleServiceProvider ruleServiceProvider =

             RuleServiceProviderManager.getRuleServiceProvider(RULE_SERVICE_PROVIDER);

     _ruleAdministrator = ruleServiceProvider.getRuleAdministrator( );

     LocalRuleExecutionSetProvider ruleSetProvider =

             _ruleAdministrator.getLocalRuleExecutionSetProvider(null);

     /*

      * This is the point at which the rules file is loaded. If you wanted

      * the rules file to load from a different location you would change

      * this here:

      */

     InputStream rules = getRules();

     RuleExecutionSet ruleExecutionSet =

             ruleSetProvider.createRuleExecutionSet(rules, null);

     _ruleAdministrator.registerRuleExecutionSet(RULE_URI, ruleExecutionSet, null);

     RuleRuntime ruleRuntime = ruleServiceProvider.getRuleRuntime();

     _statelessRuleSession =

             (StatelessRuleSession) ruleRuntime.createRuleSession(

                     RULE_URI, null, RuleRuntime.STATELESS_SESSION_TYPE );

 }

 /**

  * @throws RemoteException

  * @throws InvalidRuleSessionException

  * @throws RuleExecutionSetDeregistrationException

  */

 private void cleanUp() throws InvalidRuleSessionException, RemoteException, RuleExecutionSetDeregistrationException {

  _clean = true;

  _statelessRuleSession.release();

  _ruleAdministrator.deregisterRuleExecutionSet(RULE_URI, null);

 }

```

BTW: I ripped off most of this I'm sure. I just can't remember who from.

{% endraw %}
