---
excerpt_separator: ""
layout: "archive-post"
title: "The answer is 5"
date: "2012-04-18T12:00:00.001-04:00"
description: "Many, many, years ago I got the chance to work with a highly seasoned developer. This guy had helped write tools like make. Yes kids... he worked on an early version of make. So as he came up to speed on our new system I"
topics: ["personal-notes"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2012/04/answer-is-5.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2012-04-18-the-answer-is-5/"
id: bafyr4iekemstzg56cr22pspwhywquegdol7ai7agiyna3kaaf7yxuinnmy
permalink: /posts/the-answer-is-5-yxuinnmy/
---
{% raw %}

Many, many, years ago I got the chance to work with a highly seasoned developer. This guy had helped write tools like *make*. Yes kids... he worked on an early version of *make*. So as he came up to speed on our new system I left him be, figuring who the heck was I to direct his work at all? I was just some schlub who started at the company earlier.

 This seasoned developer got under the gun on his first project at our little company and we had a monthly UAT cycle. In the process this company used: two weeks out, you would freeze new development and then turn the whole system over to test. The new system development would start on a new branch as we practiced "clean trunk, dirty branch" style of version management. (Today I prefer dirty trunk, clean branch but I digress.)

 UAT went badly and as was the policy in this company the responsible developer had to turn around and fix the bugs found by the human testers (and turn it around rapidly) so the whole *human* driven Testing Cycle could start all over again. Some cycles went smooth. Some cycles were hell as the release date never moved and people would have to work longer and longer hours as deadlines loomed closer and closer.

 As was typical, a client might hold off on their contractual obligations to test. They might wait until the day before delivery to test. We had no automated testing at this little company. In those days things like that were not common. There was no clause that let us move the deadline. That meant if that client reported something that prevented the project from shipping we would have to work through the night to fix the bug an then sit attentively waiting for the client to test again and approve.

 So when this seasoned paragon of coders came upon just such a situation what did he do? He fixed the bug in nothing flat and got everything through UAT late that night. He was a hero.

 The UAT scripts were run that night were all written to test for "**5**" and so there was a bug in the UAT process. We did not retest *everything* after a failure. We only retested *the failed things.* We did not retest everything before we shipped... *we only tested the failures*. But, can you blame the testers? They were tired. They had been up late for days testing. They had to repeat the same boring actions over and over and over... can you blame them for beginning to short cut tests?

 I looked over the changes and perhaps it was because I was a fresh pair of eyes... but I swear... I could see it right away. Somehow, the code entered a tautological loop that I don't remember exactly suffice to say... the only answer it could ever return was "**5**". But, because of the process I couldn't stop the deploy and I couldn't slip-stream the changes because I had to wait for the next cycle of UAT.

 We would end up in an *eight month long ***non-stop*** fire-fight* due to that *one* mistake. When the fires finally died down we would have a staff party and celebrate our *victory*. Yet we would do little about our mistake other than remember it and make jokes about "**5**" being the right answer to everything.

 To this day if you ask me a question and I'm tired I may respond with a whimsical "**5**" ... and all my coworkers from that name-less and thank-less job (you know who you are) will chuckle along with me. We all learned a valuable lesson none of us will ever forget because it is burned into our foreheads with the brand "**5**" as its name.

 So every time I think: "eh, I'll skip the tests." I remember what it is like to have no automated testing at all. I remember what its like to not be able to quickly tell that you've just made a mistake that means your method only returns *5*. I remember 8 months forged in hell, that nearly crashed that company, and I run the tests again anyway.

{% endraw %}
