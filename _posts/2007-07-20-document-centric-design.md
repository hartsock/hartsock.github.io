---
excerpt_separator: ""
layout: "archive-post"
title: "Document Centric Design?"
date: "2007-07-20T11:15:00.000-04:00"
description: "The Idea is that documents represent a single common data format for all processes. All processes produce or consume documents. A process that consumes no documents is called an originating process. A process that only c"
topics: ["software-design"]
original_labels: ["Software Design","jBPM","java"]
original_url: "https://hartsock.blogspot.com/2007/07/document-centric-design.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-07-20-document-centric-design/"
id: bafyr4ia2ipvt7kaeon2qbgv4bhb5zfra72rl2jydhdmxhfxacrddlulnre
permalink: /posts/document-centric-design-ddlulnre/
---
{% raw %}

The Idea is that documents represent a single common data format for all processes. All processes produce or consume documents. A process that consumes no documents is called an originating process. A process that only consumes documents is called a terminating process.

#### Key Concepts:

1. **Business Processes shall produce documents**

- documents can never be changed
- documents record answers & decisions
- not necessarily *real* documents (like *.xml, *.pdf, *.doc) but perhaps table structure

2. **Business Processes consume documents**

- documents from other processes may feed this process
- processes may develop natural dependencies based on the documents they need
- processes may raise alerts based on the documents they need
- some processes may not require any documents, these are **originating processes**

3. **Originating Processes begin a new workflow**

- they originate a new workflow
- they have no prerequisite documents

4. **Business Processes are versioned *and* concurrent**

- clients default to starting the newest defined process under a given name
- documents in process will finish in the version they started in (this is not to say you couldn't terminate processes to force people to use a new version )

5. **Interviews are Processes concerned with asking questions**

- Interviewees are the people taking an interview
- An Interviewer is a person filling in an interview form for a person
- A Self-Directed Interview is an online interview with no human interviewer (the computer is conducting the interview)
- answers are unique to an interviewee
- answers relate to facts that we can assert about an interviewee.****

In addition consider that all updates should themselves be a new process and document.

{% endraw %}
