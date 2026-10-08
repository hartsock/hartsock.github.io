---
excerpt_separator: ""
layout: "archive-post"
title: "Deploying Grails on JBoss 4.2.1"
date: "2008-01-18T16:46:00.001-05:00"
description: "I'm deploying Grails applications into a shared JBoss environment. Now if you've read the Grails FAQ there's a nice bit in there about deployment isolation in JBoss. Specifically you'll use jboss-web.xml and isolate the "
topics: ["software-design"]
original_labels: ["administration","grails","groovy","jar","java","jboss"]
original_url: "https://hartsock.blogspot.com/2008/01/deploying-grails-on-jboss-421.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-01-18-deploying-grails-on-jboss-4-2-1/"
id: bafyr4ib35d5th7kxll6ufu4pgrm4f2jj75pckvqfqi2wcvwqg7vsvcopbe
permalink: /posts/deploying-grails-on-jboss-4-2-1-vsvcopbe/
---
{% raw %}

I'm deploying Grails applications into a shared JBoss environment. Now if you've read [the Grails FAQ](http://grails.codehaus.org/FAQ) there's a nice bit in there about deployment isolation in JBoss. Specifically you'll use jboss-web.xml and isolate the deployment. If that works for you kudos. Didn't work for me.

When I isolate my deployment I see this error:

```

17:02:08,115 INFO  [STDOUT] [5] digester.Digester Digester.getParser:

java.lang.ClassCastException: org.apache.xerces.jaxp.SAXParserFactoryImpl

        at javax.xml.parsers.SAXParserFactory.newInstance(SAXParserFactory.java:107)

        at org.apache.tomcat.util.digester.Digester.getFactory(Digester.java:487)

        at org.apache.tomcat.util.digester.Digester.getParser(Digester.java:692)

        at org.apache.tomcat.util.digester.Digester.getXMLReader(Digester.java:900)

        at org.apache.tomcat.util.digester.Digester.parse(Digester.java:1562)

        at org.apache.catalina.startup.TldConfig.tldScanStream(TldConfig.java:507)

        at org.apache.catalina.startup.TldConfig.tldScanTld(TldConfig.java:544)

        at org.apache.catalina.startup.TldConfig.execute(TldConfig.java:294)

        at org.apache.catalina.core.StandardContext.processTlds(StandardContext.java:4450)

        at org.apache.catalina.core.StandardContext.start(StandardContext.java:4257)

        at org.apache.catalina.core.ContainerBase.addChildInternal(ContainerBase.java:761)

        at org.apache.catalina.core.ContainerBase.addChild(ContainerBase.java:741)

        at org.apache.catalina.core.StandardHost.addChild(StandardHost.java:553)

        at sun.reflect.GeneratedMethodAccessor233.invoke(Unknown Source)

        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)

        at java.lang.reflect.Method.invoke(Method.java:585)

        at org.apache.tomcat.util.modeler.BaseModelMBean.invoke(BaseModelMBean.java:297)

        at org.jboss.mx.server.RawDynamicInvoker.invoke(RawDynamicInvoker.java:164)

        at org.jboss.mx.server.MBeanServerImpl.invoke(MBeanServerImpl.java:659)

        at org.apache.catalina.core.StandardContext.init(StandardContext.java:5310)

        at sun.reflect.GeneratedMethodAccessor229.invoke(Unknown Source)

        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)

        at java.lang.reflect.Method.invoke(Method.java:585)

        at org.apache.tomcat.util.modeler.BaseModelMBean.invoke(BaseModelMBean.java:297)

        at org.jboss.mx.server.RawDynamicInvoker.invoke(RawDynamicInvoker.java:164)

        at org.jboss.mx.server.MBeanServerImpl.invoke(MBeanServerImpl.java:659)

        at org.jboss.web.tomcat.service.TomcatDeployer.performDeployInternal(TomcatDeployer.java:301)

        at org.jboss.web.tomcat.service.TomcatDeployer.performDeploy(TomcatDeployer.java:104)

        at org.jboss.web.AbstractWebDeployer.start(AbstractWebDeployer.java:375)

        at org.jboss.web.WebModule.startModule(WebModule.java:83)

        at org.jboss.web.WebModule.startService(WebModule.java:61)

        at org.jboss.system.ServiceMBeanSupport.jbossInternalStart(ServiceMBeanSupport.java:289)

        at org.jboss.system.ServiceMBeanSupport.jbossInternalLifecycle(ServiceMBeanSupport.java:245)

        at sun.reflect.GeneratedMethodAccessor3.invoke(Unknown Source)

        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)

        at java.lang.reflect.Method.invoke(Method.java:585)

        at org.jboss.mx.interceptor.ReflectedDispatcher.invoke(ReflectedDispatcher.java:155)

        at org.jboss.mx.server.Invocation.dispatch(Invocation.java:94)

        at org.jboss.mx.server.Invocation.invoke(Invocation.java:86)

        at org.jboss.mx.server.AbstractMBeanInvoker.invoke(AbstractMBeanInvoker.java:264)

        at org.jboss.mx.server.MBeanServerImpl.invoke(MBeanServerImpl.java:659)

        at org.jboss.system.ServiceController$ServiceProxy.invoke(ServiceController.java:978)

        at $Proxy0.start(Unknown Source)

        at org.jboss.system.ServiceController.start(ServiceController.java:417)

        at sun.reflect.GeneratedMethodAccessor9.invoke(Unknown Source)

        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)

        at java.lang.reflect.Method.invoke(Method.java:585)

        at org.jboss.mx.interceptor.ReflectedDispatcher.invoke(ReflectedDispatcher.java:155)

        at org.jboss.mx.server.Invocation.dispatch(Invocation.java:94)

        at org.jboss.mx.server.Invocation.invoke(Invocation.java:86)

        at org.jboss.mx.server.AbstractMBeanInvoker.invoke(AbstractMBeanInvoker.java:264)

        at org.jboss.mx.server.MBeanServerImpl.invoke(MBeanServerImpl.java:659)

        at org.jboss.mx.util.MBeanProxyExt.invoke(MBeanProxyExt.java:210)

        at $Proxy182.start(Unknown Source)

        at org.jboss.web.AbstractWebContainer.start(AbstractWebContainer.java:466)

        at sun.reflect.GeneratedMethodAccessor212.invoke(Unknown Source)

        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)

        at java.lang.reflect.Method.invoke(Method.java:585)

        at org.jboss.mx.interceptor.ReflectedDispatcher.invoke(ReflectedDispatcher.java:155)

        at org.jboss.mx.server.Invocation.dispatch(Invocation.java:94)

        at org.jboss.mx.interceptor.AbstractInterceptor.invoke(AbstractInterceptor.java:133)

        at org.jboss.mx.server.Invocation.invoke(Invocation.java:88)

        at org.jboss.mx.interceptor.ModelMBeanOperationInterceptor.invoke(ModelMBeanOperationInterceptor.java:142)

        at org.jboss.mx.interceptor.DynamicInterceptor.invoke(DynamicInterceptor.java:97)

        at org.jboss.system.InterceptorServiceMBeanSupport.invokeNext(InterceptorServiceMBeanSupport.java:238)

        at org.jboss.ws.integration.jboss42.DeployerInterceptor.start(DeployerInterceptor.java:93)

        at org.jboss.deployment.SubDeployerInterceptorSupport$XMBeanInterceptor.start(SubDeployerInterceptorSupport.java:188)

        at org.jboss.deployment.SubDeployerInterceptor.invoke(SubDeployerInterceptor.java:95)

        at org.jboss.mx.server.Invocation.invoke(Invocation.java:88)

        at org.jboss.mx.server.AbstractMBeanInvoker.invoke(AbstractMBeanInvoker.java:264)

        at org.jboss.mx.server.MBeanServerImpl.invoke(MBeanServerImpl.java:659)

        at org.jboss.mx.util.MBeanProxyExt.invoke(MBeanProxyExt.java:210)

        at $Proxy183.start(Unknown Source)

        at org.jboss.deployment.MainDeployer.start(MainDeployer.java:1025)

        at org.jboss.deployment.MainDeployer.deploy(MainDeployer.java:819)

        at org.jboss.deployment.MainDeployer.deploy(MainDeployer.java:782)

        at sun.reflect.GeneratedMethodAccessor25.invoke(Unknown Source)

        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)

        at java.lang.reflect.Method.invoke(Method.java:585)

        at org.jboss.mx.interceptor.ReflectedDispatcher.invoke(ReflectedDispatcher.java:155)

        at org.jboss.mx.server.Invocation.dispatch(Invocation.java:94)

        at org.jboss.mx.interceptor.AbstractInterceptor.invoke(AbstractInterceptor.java:133)

        at org.jboss.mx.server.Invocation.invoke(Invocation.java:88)

        at org.jboss.mx.interceptor.ModelMBeanOperationInterceptor.invoke(ModelMBeanOperationInterceptor.java:142)

        at org.jboss.mx.server.Invocation.invoke(Invocation.java:88)

        at org.jboss.mx.server.AbstractMBeanInvoker.invoke(AbstractMBeanInvoker.java:264)

        at org.jboss.mx.server.MBeanServerImpl.invoke(MBeanServerImpl.java:659)

        at org.jboss.mx.util.MBeanProxyExt.invoke(MBeanProxyExt.java:210)

        at $Proxy9.deploy(Unknown Source)

        at org.jboss.deployment.scanner.URLDeploymentScanner.deploy(URLDeploymentScanner.java:421)

        at org.jboss.deployment.scanner.URLDeploymentScanner.scan(URLDeploymentScanner.java:634)

        at org.jboss.deployment.scanner.AbstractDeploymentScanner$ScannerThread.doScan(AbstractDeploymentScanner.java:263)

        at org.jboss.deployment.scanner.AbstractDeploymentScanner$ScannerThread.loop(AbstractDeploymentScanner.java:274)

        at org.jboss.deployment.scanner.AbstractDeploymentScanner$ScannerThread.run(AbstractDeploymentScanner.java:225)

```

My first guess is this has something to do with a conflicting version of the Xerces libraries between JBoss and Grails. But I'd rather not resolve this issue...

If I turn off deployment isolation and then hit a JSP page in a **non-Grails** application (carefully selecting a JSP that has never been hit before) I get this error:

```

Caused by: java.lang.AbstractMethodError: javax.servlet.jsp.JspFactory.getJspApplicationContext(Ljavax/servlet/ServletContext;)Ljavax/servlet/jsp/JspApplicationContext;

        at org.apache.jasper.runtime.PageContextImpl.proprietaryEvaluate(PageContextImpl.java:903)

17:11:58,316 INFO  [STDOUT] [2008-01-18 17:11:58,314] DEBUG core.ApplicationDispatcher.:185 servletPath=/Login.jsp, pathInfo=null, queryString=null, name=null

17:11:58,317 INFO  [STDOUT] [2008-01-18 17:11:58,316] DEBUG core.ApplicationDispatcher.doForward:375  Path Based Forward

17:11:58,319 INFO  [STDOUT] [2008-01-18 17:11:58,318] DEBUG servlet.JspServlet.service:249 JspEngine --> /Login.jsp

17:11:58,321 INFO  [STDOUT] [2008-01-18 17:11:58,320] DEBUG servlet.JspServlet.service:250           ServletPath: /Login.jsp

17:11:58,323 INFO  [STDOUT] [2008-01-18 17:11:58,321] DEBUG servlet.JspServlet.service:251              PathInfo: null

17:11:58,325 INFO  [STDOUT] [2008-01-18 17:11:58,324] DEBUG servlet.JspServlet.service:252              RealPath: /home/shawn/jboss/jboss-opengate/server/default/./deploy/VIF.war/Login.jsp

17:11:58,327 INFO  [STDOUT] [2008-01-18 17:11:58,326] DEBUG servlet.JspServlet.service:253            RequestURI: /VIF/Login.jsp

17:11:58,329 INFO  [STDOUT] [2008-01-18 17:11:58,328] DEBUG servlet.JspServlet.service:254           QueryString: null

17:11:58,331 INFO  [STDOUT] [2008-01-18 17:11:58,330] DEBUG servlet.JspServlet.service:255        Request Params:

17:11:58,335 ERROR [STDERR] [2008-01-18 17:11:58,333] ERROR [/VIF].[jsp].invoke:719 Servlet.service() for servlet jsp threw exception

java.lang.AbstractMethodError: javax.servlet.jsp.JspFactory.getJspApplicationContext(Ljavax/servlet/ServletContext;)Ljavax/servlet/jsp/JspApplicationContext;

        at org.apache.jsp.Login_jsp._jspInit(Login_jsp.java:25)

        at org.apache.jasper.runtime.HttpJspBase.init(HttpJspBase.java:52)

        at org.apache.jasper.servlet.JspServletWrapper.getServlet(JspServletWrapper.java:159)

        at org.apache.jasper.servlet.JspServletWrapper.service(JspServletWrapper.java:323)

        at org.apache.jasper.servlet.JspServlet.serviceJspFile(JspServlet.java:320)

        at org.apache.jasper.servlet.JspServlet.service(JspServlet.java:266)

        at javax.servlet.http.HttpServlet.service(HttpServlet.java:803)

        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:290)

        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:206)

        at org.apache.catalina.core.ApplicationDispatcher.invoke(ApplicationDispatcher.java:687)

        at org.apache.catalina.core.ApplicationDispatcher.processRequest(ApplicationDispatcher.java:469)

        at org.apache.catalina.core.ApplicationDispatcher.doForward(ApplicationDispatcher.java:403)

        at org.apache.catalina.core.ApplicationDispatcher.forward(ApplicationDispatcher.java:301)

        at org.apache.catalina.authenticator.FormAuthenticator.forwardToLoginPage(FormAuthenticator.java:316)

        at org.apache.catalina.authenticator.FormAuthenticator.authenticate(FormAuthenticator.java:244)

        at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:491)

        at org.jboss.web.tomcat.security.JaccContextValve.invoke(JaccContextValve.java:84)

        at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:128)

        at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:104)

        at org.jboss.web.tomcat.service.jca.CachedConnectionValve.invoke(CachedConnectionValve.java:157)

        at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:109)

        at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:241)

        at org.apache.coyote.ajp.AjpProcessor.process(AjpProcessor.java:437)

        at org.apache.coyote.ajp.AjpProtocol$AjpConnectionHandler.process(AjpProtocol.java:381)

        at org.apache.tomcat.util.net.JIoEndpoint$Worker.run(JIoEndpoint.java:447)

        at java.lang.Thread.run(Thread.java:595)

17:11:58,336 WARN  [FormAuthenticator] Unexpected error forwarding to login page

javax.servlet.ServletException: java.lang.AbstractMethodError: javax.servlet.jsp.JspFactory.getJspApplicationContext(Ljavax/servlet/ServletContext;)Ljavax/servlet/jsp/JspApplicationContext;

        at org.apache.jasper.servlet.JspServlet.service(JspServlet.java:274)

        at javax.servlet.http.HttpServlet.service(HttpServlet.java:803)

        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:290)

        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:206)

        at org.apache.catalina.core.ApplicationDispatcher.invoke(ApplicationDispatcher.java:687)

        at org.apache.catalina.core.ApplicationDispatcher.processRequest(ApplicationDispatcher.java:469)

        at org.apache.catalina.core.ApplicationDispatcher.doForward(ApplicationDispatcher.java:403)

        at org.apache.catalina.core.ApplicationDispatcher.forward(ApplicationDispatcher.java:301)

        at org.apache.catalina.authenticator.FormAuthenticator.forwardToLoginPage(FormAuthenticator.java:316)

        at org.apache.catalina.authenticator.FormAuthenticator.authenticate(FormAuthenticator.java:244)

        at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:491)

        at org.jboss.web.tomcat.security.JaccContextValve.invoke(JaccContextValve.java:84)

        at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:128)

        at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:104)

        at org.jboss.web.tomcat.service.jca.CachedConnectionValve.invoke(CachedConnectionValve.java:157)

        at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:109)

        at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:241)

        at org.apache.coyote.ajp.AjpProcessor.process(AjpProcessor.java:437)

        at org.apache.coyote.ajp.AjpProtocol$AjpConnectionHandler.process(AjpProtocol.java:381)

        at org.apache.tomcat.util.net.JIoEndpoint$Worker.run(JIoEndpoint.java:447)

        at java.lang.Thread.run(Thread.java:595)

Caused by: java.lang.AbstractMethodError: javax.servlet.jsp.JspFactory.getJspApplicationContext(Ljavax/servlet/ServletContext;)Ljavax/servlet/jsp/JspApplicationContext;

        at org.apache.jsp.Login_jsp._jspInit(Login_jsp.java:25)

        at org.apache.jasper.runtime.HttpJspBase.init(HttpJspBase.java:52)

        at org.apache.jasper.servlet.JspServletWrapper.getServlet(JspServletWrapper.java:159)

        at org.apache.jasper.servlet.JspServletWrapper.service(JspServletWrapper.java:323)

        at org.apache.jasper.servlet.JspServlet.serviceJspFile(JspServlet.java:320)

        at org.apache.jasper.servlet.JspServlet.service(JspServlet.java:266)

        ... 20 more

```

Which I know thanks to [this post](http://www.palbrattberg.com/2007/02/20/tomcat-and-abstractmethoderror/) has something to do with the Jasper compiler. So I turn off isolation remove the jasper, xalan, and xerces libs and viola it all works.

That's because JBoss has this Unified Class Loader... or something. Once a class is seen it's loaded and available to all the non-isolated archives on the system. That's what is solving that first exception when we tried to deploy the WAR while it was isolated. Instead of having our copy of the class and JBoss's copy of the class we have one and only one copy of any given class.

It turns out that the deployment needs to hand back a copy of a *org.apache.xerces.jaxp.SAXParserFactoryImpl* to the JBoss environment. The classes don't match and boom! your deploy blows up. Remove isolation and you get the Jasper problem. Which doesn't manifest until after you try and use a JSP *outside* Grails that has never been used before.

The second stack trace is caused by the Jasper libraries embedded in your Grails WAR bleeding out into JBoss land and generally mucking up the JSP compilers in the JBoss container. To stop this remove all the jasper Jars from your application.

This doesn't strike me as best practice but it's the best I've got on short notice.

So the short answer? Remove these JAR files from your Grails WAR when deploying into JBoss 4.2.1GA if you don't use jboss-web.xml:

- jasper-compiler-5.5.15.jar
- jasper-compiler-jdt-5.5.15.jar
- jasper-runtime-5.5.15.jar
- xalan.jar
- xerces-2.8.1.jar
- xercesImpl-2.6.2.jar
- xercesImpl.jar

Without deployment isolation on a newer JBoss you don't need any of the hibernate JARs either and it's tempting to remove even more JARs to trim the deploy. I haven't done this yet but it seems that because Grails doesn't know what your deployment environment already has in it you can't expect grails to find this combination of classes for you.

If you do use jboss-web.xml to isolate your deployments then you need to make certain your xercesImpl.jar, xalan.jar, and other XML jars are the same version or at least compatible with the JBoss libs.

EDIT

I don't have to do any of this when using Grails 1.0 so this only applies to older Grails versions.

{% endraw %}
