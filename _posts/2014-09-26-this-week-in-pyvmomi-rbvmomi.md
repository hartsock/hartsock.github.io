---
excerpt_separator: ""
layout: "archive-post"
title: "This week in pyVmomi & rbVmomi"
date: "2014-09-26T12:38:00.002-04:00"
description: "pyVmomi Not much motion this week. I've spent the majority of the week focused on coming up to speed on rbVmomi. Of note we did have a bug report of sockets getting left open and I'll be spending quality time debugging t"
topics: ["python"]
original_labels: ["pyvmomi","rbvmomi"]
original_url: "https://hartsock.blogspot.com/2014/09/this-week-in-pyvmomi-rbvmomi.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-09-26-this-week-in-pyvmomi-rbvmomi/"
id: bafyr4iecpijzq3b4ygrmtiqy6qtbfz52sbqtaqhyjozkxinfbnvjgzb4hm
permalink: /posts/this-week-in-pyvmomi-rbvmomi-vjgzb4hm/
---
{% raw %}

#####  pyVmomi

 Not much motion this week. I've spent the majority of the week focused on coming up to speed on [rbVmomi](https://twitter.com/rbvmomi). Of note we did have a bug report of sockets getting left open and I'll be spending quality time debugging that next week.

- The next major revision of pyVmomi is slipped to December now in light of my new work commitments. I will keep github up to date on how these projects are going.
- [Disconnect doesn't close socket](https://github.com/vmware/pyvmomi-community-samples/issues/118) is this a pervasive bug or a quirk? TBD I'll carve time from my schedule next week to attempt to reproduce and resolve the bug as either a quirk or create a fix. The fix will go in 2014.2 at minimum but might be bad enough to cut 2014.1.2 if needed.
- We need some more education and evolution [on tasks](https://github.com/vmware/pyvmomi-community-samples/issues/113). I've shelved my work on [pyvmomi-tools](https://github.com/vmware/pyvmomi-tools) temporarily while I come up to speed on rbVmomi. But, tasks are one of those areas I feel the raw API is too *rich* for new developers to grasp right away. Some syntax sugar should help.
- Currently stalled on my desktop is an effort to introduce an SMS "plugin" (plugin isn't the right word but it's close) which I wanted to introduce through pyvmomi-tools. I'll ask for review inside VMware and from key thought leaders in the python and pyVmomi communities before shipping it to pypi ... more on this as we have time.
- We changed version conventions [yet again](https://github.com/vmware/pyvmomi/pull/175). On pyVmomi we wanted the version number to communicate freshness and compatibility. So the year-dot-quarter method was used. Then releases moved to every six months so it's 1st half and 2nd half now. Then we found out `-` means something in pypi so now it's just a `.` character. Finally we have 5.5.0.2014.1 and 5.5.0.2014.1.1 to indicate 1st half of 2014 bug fix 1 is compatible with vSphere 5.5.0. Part of this is we still don't know precisely how pyVmomi github and pyVmomi vSphere will interact on a code-base level going forward. That's TBD be the vSphere teams in charge of that. The admittedly complex interaction between these two things

#####  rbVmomi

 Just coming up to speed on the modern state of [Ruby gem management](https://rubygems.org/profiles/hartsock) since it's been a number of years since I've had to work with them. I'm also moving cautiously since there's a standing development practice and tradition in place that I need to be mindful of.

- A [prerelease](https://github.com/vmware/rbvmomi/releases/tag/v1.8.2.pre) for [rbVmomi 1.8.2](https://github.com/vmware/rbvmomi/issues/56) is available on [rubygems now](https://rubygems.org/gems/rbvmomi/versions/1.8.2.pre) please test!
- A regular release for 1.8.2 will happen October 1st barring any negative testing results
- A [1.8.3 release](https://github.com/vmware/rbvmomi/milestones/v1.8.3)is tentatively set to got to pre-release October 17th (or so) depending on how well we can manage the process of upstreaming pull requests and this is very tentative. Note: this is a change I had intended to hold the release 2 weeks for myself to gain familiarity first. Instead I like this pre-release, delay for 3rd party testing/review, then release strategy and I'll likely adopt it as my normal operating style from now on.
- Long term planning will have to happen for a 1.9.1 release but I'll not comment much on that until I know what my long term relationship to the project looks like.
- I opened a low priority research ticket for [higher performance XML](https://github.com/vmware/rbvmomi/issues/57) which seems to be a minor scalability problem rbVmomi faces. My initial research is in the ticket. It's a help wanted item so feedback is much appreciated.
- NOTE: any item I tag 'help wanted' is an area I feel a 3rd party can either easily help with (usually also tagged 'low hanging fruit') or an area we can't really move on without outside help.
- NOTE: any item I tag 'VMware staff assistance needed' is something that I feel a 3rd party should probably avoid working on since the issue is fuzzy and bleeds into VMware internal technical details, decisions, or other issues muddy the ticket such that it's not going to move without someone (usually me) bridging the Open Source and VMware internal engineering communities.

#####  General Status

 My Friday posts will probably take this two part pyvmomi then rbvmomi flavor as long as I'm bridging both communities. Sorry if that confuses things but that's a function of [Conway's law](http://en.wikipedia.org/wiki/Conway's_law) and at the moment the Open Source to VMware and back communications conduit is basically *me *for both projects so you have to expect a bit of that.

 Thanks for your support! The following freenode IRC channels will at least have my IRC 'bot in them #pyvmomi , #pyvmomi-dev , #rbvmomi , #rbvmomi-dev , #govmomi , #govmomi-dev and I'll eventually see IRC messages in those channels through my 'bots. The -dev channels are for advanced programming topics while the other channels will be open for newblings and will need community support since I'm pretty bad at dealing with neophyte level problems these days.

 More on each of these threads as progress is made...

{% endraw %}
