---
excerpt_separator: ""
layout: "archive-post"
title: "Database Vendor Political Landscape as of 2007"
date: "2007-09-11T12:19:00.000-04:00"
description: "> Please note this is simply my opinion. Companies are presented in random order. No official recommendations are being made. Oracle: Oracle the company has filed court proceedings against SAP citing that SAP has been st"
topics: ["software-design","society"]
original_labels: ["database","market analysis","opensource"]
original_url: "https://hartsock.blogspot.com/2007/09/database-vendor-political-landscape-as.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-09-11-database-vendor-political-landscape-as-of-2007/"
id: bafyr4ibqztws6oxwsf22o27npkoirluenibxnoj7lpix3lmkbupvvxddme
permalink: /posts/database-vendor-political-landscape-as-of-2007-pvvxddme/
---
{% raw %}

>

Please note this is simply my opinion. Companies are presented in random order. No official recommendations are being made.

Oracle: Oracle the company has filed court proceedings against SAP citing that SAP has been stealing Oracle intellectual property. Oracle 11g is still closed source and proprietary. Considered the leader in RDBMS technologies and offers unique features such as XML Publisher and XML SQL Java API's that allow java developers to do ORM in Oracle proprietary ways.

Microsoft: Owner of both Access and SQL Server products, SQL server is based on Transact-SQL which is an implementation of the ANSI SQL standard. It is favored by .NET developers because of its tight integration with the .NET Framework. SQL Server runs only on the Windows operating system and as such can only be used in production environments that are predominantly windows. Security vulnerabilities such as the "SQL slammer worm" have scared some shops away from this option as an internet application OLTP store.

IBM: acquired Informix and supports Informix along side DB2. DB2 now has an open source version. Informix and DB2 have started to share features. IBM's move to open source DB2 may indicate a shift in IBM's software development and support strategy. The acquisition of Informix may indicate a desire at IBM to freshen their database offerings. Informix is actively supported by IBM and has had a new release this year.

Sybase: Still a traditional software shop, their still closed and proprietary products based on Transact-SQL have confusing names such as OpenServer and OpenClient which typically are used in industry to indicate Open Source or at least a reviewable source code base. This is simply not the case with the Sybase products. These products are "Try and Buy" products which has absolutely nothing to do with Open Source. However, Sybase still has a strong following but their popularity is waning.

Firebird: an open source RDBMS that features ANSI SQL 2003 compliance is based on Inprise code base from Borland's now defunct InterBase database product. This project is extremely young and unproven by RDBMS standards.

MySQL AG: In addition to the unique MySQL product which has earned acclaim and scorn alike for its design, MySQL AG acquired MaxDB from SAP. MaxDB is an ANSI SQL 1992 compliant product. MySQL itself is partially ANSI SQL 1999 compliant... or rather MySQL does not comply entirely with ANSI standards but enjoys a 10 million user install base. That large install base has earned it the title of "The Open Source Database" since it has become a defacto standard for open source projects such as Ruby on Rails.

Ingres Corporation: Still enjoys a following, (judging from all the comments below to fix this post), but has not enjoyed much market attention. The survival of the product and company appears to be driven by legacy support.

PostgreSQL: Sun Microsystems provides support for Postgres which is an ORDBMS (Object-Relational Database Management System) which is an open source project based on Ingres. It has a much richer feature set than MySQL and commercial technical support available from Sun Microsystems. Among the database players it is unique for its support of multiple PL/SQL sub languages. While Postgres has not enjoyed the success that MySQL has it is used by clients such as BASF, IMDB, Skype, TiVo, USPS, Sony, VeriSign, and the US department of labor. Postgres continues to thrive but has no marketing buzz around it... it has a solid reputation in the Open Source community as a "real" database. (EDIT: Sun does not own PosgreSQL, they merely support it.)

Apache: The Derby RDBMS is actually the IBM Cloudscape database also known as the Sun Microsystems Java DB. The project has only emerged from Apache incubator status in 2004 and is relatively unproven.

The upshot

Oracle and Microsoft still are industry leaders and seem to be relatively comfortable each in their own niche. There doesn't seem to be a serious contender that could knock down either of them.

MySQL has achieved nearly total dominance and is currently the un-assailable king of the Open Source database market but this dominance is built on a non-standard and non-compliant database system that has serious issues with ACID compliance and major missing ANSI SQL features.

Several players (strangely, IBM is a small player in the open source database market niche) are challenging MySQL's dominance by open sourcing already proven, stable, and compliant databases. Serious technical contender Postgres can not seem to get a solid marketing based footing that could propel it to the front. Apache Derby and Firebird may prove to be serious competitors in five years. No other current players seriously factor in to the short term picture.

A fringe player DB4O (Database for Objects) is an interesting new technology but will not likely be a serious commercial space contender in the near future. The product is only 3 years old in production but has prominent users such as BMW, Boeing, Bosh, Intel, Ricoh, and Seagate.

{% endraw %}
