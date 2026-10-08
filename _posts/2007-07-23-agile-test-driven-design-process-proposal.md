---
excerpt_separator: ""
layout: "archive-post"
title: "Agile Test Driven Design Process Proposal"
date: "2007-07-23T13:52:00.000-04:00"
description: "I am proposing the following software development pattern to our team next Monday. The idea is to create an environment where testing comes first, expresses business rules on a one-to-one and onto manner (borrowing a ter"
topics: ["testing","software-design","organizations"]
original_labels: ["Software Engineering","agile","idea","testing"]
original_url: "https://hartsock.blogspot.com/2007/07/agile-test-driven-design-process.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-07-23-agile-test-driven-design-process-proposal/"
id: bafyr4if2sjqx6l7aylzhjefequpg7izajogz7t5umiv7ctpocnamx23y74
permalink: /posts/agile-test-driven-design-process-proposal-amx23y74/
---
{% raw %}

I am proposing the following software development pattern to our team next Monday. The idea is to create an environment where testing comes first, expresses business rules on a one-to-one and onto manner (borrowing a term from set theory). If a design element does not fulfill an acceptance test it is not developed. And, all development starts at test and ends in code.

1. Business expresses a need.
2. Business Analyst determines a use case.
3. Software Engineer and Tester collaborate to create an acceptance test using business terms that will map down to classes or class structure. They use [fitness](http://fitnesse.org/) to do this. Driving down from fitness tests Unit tests should provide 100% coverage. Code that is not covered should either get covered by a new acceptance test or get deleted. All tests of unimplemented code should fail on unimplemented method calls or null classes... in fact some initial tests will fail to compile since the classes simply don't exist. All tests that fail should represent one functional deliverable.
4. Software Engineer partitions work between development teams. Teams fill out classes so tests pass. Weekly reports show the teams' progress. Each test maps onto each business need... as business needs get filled the number of passed tests increases. The ratio of passed to failed tests indicates the percentage of completeness of the project. Projects can go backwards... this is not good but it is possible.
5. Once a number of passed acceptance tests reaches 100% the project is done. The version is branched and marked as a release and the software is shipped. Then the process starts over.
The practicalities need to get worked out but these are the basics.

{% endraw %}
