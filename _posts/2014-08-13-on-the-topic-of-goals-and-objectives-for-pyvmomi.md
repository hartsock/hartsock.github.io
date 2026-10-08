---
excerpt_separator: ""
layout: "archive-post"
title: "On the topic of Goals and Objectives for pyVmomi"
date: "2014-08-13T12:30:00.000-04:00"
description: "As long as I'm working on the pyVmomiproject, its goal will be to become the single best way to talk to vSphere technologies. This is a broad and hard to measure thing, and with luck as VMware technologies evolve, it's a"
topics: ["python"]
original_labels: ["pyvmomi","pyvmomi-tools"]
original_url: "https://hartsock.blogspot.com/2014/08/on-topic-of-goals-and-objectives-for.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-08-13-on-the-topic-of-goals-and-objectives-for-pyvmomi/"
id: bafyr4ihzgavr6mh4pihyrn7xivpbngt4ovaoyomsr7p73citcs4rwcrahq
permalink: /posts/on-the-topic-of-goals-and-objectives-for-pyvmomi-4rwcrahq/
---
{% raw %}

As long as I'm working on the [pyVmomi](http://vmware.github.io/pyvmomi/)project, its goal will be to become the single best way to talk to vSphere technologies. This is a broad and hard to measure thing, and with luck as VMware technologies evolve, it's also a moving target. Once we arrive at one location there will be a new version to sail toward. In order to steer accurately, we must set a course by some kind of metaphorical guiding star, and this is what *objectives* are meant to be.

 While the goal is the destination we are sailing our metaphorical ship toward, our near-term objectives are the metaphorical stars we choose to help guide us toward that goal. Just as sailing a ship may require course corrections, which implies choosing different stars; so too might managing a project require course corrections which implies choosing different near term objectives. When we course-correct ourselves, our projects, our teams, or our careers, we are changing the objectives much as a ship navigator might choose a different guiding star at different times during a ships journey toward a distant destination.

 In common parlance, the terms goal and objective are virtually synonymous but it makes sense to make a distinction between them when we're talking about conducting the daily business of building software. Being "the best" is kind of hard to measure, it implies quality, adaptiveness, and nimbleness in the library as well as a breadth of uses for the library. This requires us to choose some guiding stars with wisdom.

 How do you design a library for these attributes? How do you pick the correct guiding stars?

####  A little philosophy

 A little philosophy is necessary to guide how we go about setting our objectives to achieve our goals. Just a little philosophy is necessary, too much and we spend our days navel gazing, too little and we flail about wildly wondering why we work so hard and accomplish so little. Regular periods of slack followed by pressure are best for this. Creativity can only come when you are free to explore but productivity only really truly solidifies itself under threat of deadline.

 So what are some philosophies I could hold in this case?

####  A few contrary points of view

 I might think that audience size is the best measure of project success. That might mean I would have less priority on other aspects of the software and more on things that make the software appeal to a wide audience. In other words, a bug's priority only matters as a measure of the number of new users it can net.

 *Examples of projects guided by this principle to the exclusion of others might include things like [PHP](http://blog.codinghorror.com/the-php-singularity/). The design choices in PHP were early on driven by getting broad adoption and rapidly securing mind-share. Very little time was spent thinking about the long-term impact of design decisions. The result is PHP is the [most successful programming language (in its niche) of all time](http://w3techs.com/technologies/overview/programming_language/all) and one of the [most](http://devhell.info/post/2011-12-10/what-we-hate-about-php/) [hated](http://eev.ee/blog/2012/04/09/php-a-fractal-of-bad-design/).*

 I might choose to believe that 'feature count' was a better measure for project success. If I believed that cranking out code was the way to 'get stuff done', then I would probably believe that anything that got in your way of 'getting stuff done' was a waste of time. That would probably mean I would be after the largest volume of code in the shortest amount of time. More code means more function right?

 *The problem with this is [feature creep](http://www.agileweboperations.com/how-non-negotiable-features-kill-software-products). If you want to keep a light nimble software project that can respond quickly to changes in its environment a small modular project is best. You keep the project itself [small](http://en.wikipedia.org/wiki/Broken_Age#Game_development) or [suffer the consequences](http://en.wikipedia.org/wiki/The_Elder_Scrolls:_Arena#Design_goals). There's usually an 80/20 rule for features and following it can result in faster release cycles.*

 After years of working on software systems big and small, with tiny audiences and accidental audiences of millions, I've come to believe a few things.

####  In Generalities

 I feel that the competition between Xbox versus Playstation in the marketplace is a good case-study of these philosophical disagreements in action. The results have mostly played out in the marketplace for us all to study. If we take a lesson from this history we might be able to improve our own state of practice.

 In 2012 it was hard to tell if there was a marketplace winner in the video game console market. The three top video game consoles of the time period had traded top position on [various metrics](http://www.geekwire.com/2013/xbox-360-wii-ps3-won-console-generation/) repeatedly but by Q2 2014 there is a [clear winner in market sales](http://www.forbes.com/sites/davidthier/2014/07/31/sony-reveals-playstation-outselling-xbox-31/) (only time will tell if this is a permanent state of affairs).

 Sony had always invested in a complete engineering package for its consoles and frequently talked about [10 year plans](http://www.edge-online.com/features/why-sonys-10-year-plan-makes-sense/) with its ecosystem. Ironically, this same business strategy had failed them before. When it came to [BetaMax versus VHS](http://youtu.be/ddYZITaxlTQ) this same strategy of 'technical superiority' did not pay off, however, and that's a cautionary tale. The entire *engineering process* matters.

 When building a system you have to take into account *all the pertinent* forces shaping its market share. These include *multiple *product audiences, shareholders, and customers, as well as multiple engineering considerations about how the product functions. Not the least of which includes the process by which you create the product itself.

####  Engineering Objectives

 Audience size matters, feature count matters, and perceived quality matters. Each affects the other and each affects the total impact of your software project. [Minmaxing](http://en.wikipedia.org/wiki/Minimax) on only one dimension or another doesn't necessarily equate to a lasting victory. So we need to find ways to incorporate all these elements into our daily choices. That's what setting objectives is all about.

 Over the years, I've been thoroughly impressed at how products generated by very bad engineering can sometimes capture and dominate markets when very good engineering fails. I believe the problem comes from improperly balancing objectives. A single dimension of engineering and design has been maximized at the expense of balancing concerns. It's far too easy to make an easy to measure metric, set it as an objective, and steer the metaphorical ship by a star that has nothing to do with the goal. Such engineering produces something that is arguably beautiful yet broken.

####  Broken Strategy

 For example, a typical strategy used to solve quality issues in software systems is to increase [test coverage](http://martinfowler.com/bliki/TestCoverage.html). Coverage is an easy number to measure. It makes nice charts and gives a wonderful feeling of progress to developers. It's also a trap.

 Merely increasing code coverage does not universally improve the code in all its dimensions. In fact, improperly applied test coverage can create tightly coupled systems that are worse suited. This is perhaps the starkest lesson you can learn about successfully reaching a 100% code-coverage goal: you can end up with *more technical debt not less*. (I could call out certain open source projects here but I won't for brevity's sake.)

 If no metric can measure this concept of tight coupling to balance the code coverage metric, then, merely measuring code coverage percentages pushes the software design in the wrong direction. Your team will optimize for coverage at the expense of other attributes. One of those attributes can actually be code quality (in that fixing a simple bug can take an inordinately long time) and flexibility (in the sense that your code can lose the ability to respond to new requirements).

 I have come to believe Test Driven Development just as code coverage can also become a trap. Improperly applied, it similarly optimizes systems for unit tests which may not reflect the real design forces that the unit of code is under. These circumstances the code developed can end up very far from the intended destination just as high code coverage numbers can degrade actual quality of a software system.

####  Actively Compensating

 Agile methodologies were *intended* as a tool to compensate for this dis-joint between the steering stars of objectives and the actual destination. The ability to course correct is vital. That means one set of objectives are perfect for a certain season while the same objectives might be completely wrong for another season.

 To effectively use these tools (agile or otherwise) you can't fly by instrument. You need to get a feel for the real market and engineering forces at play in building your software product. These are things that require a sense of *taste and refined aesthetics*. You don't get these from a text book, you get them from experience.

 My experience has taught me that you actually don't want to write *more code* you actually want to write *less*. You want to accomplish as much as possible while writing as little code as necessary without falling into [code golf](http://en.wikipedia.org/wiki/Code_golf). That means that the most effective programmer may have some of the worst numbers on your leader board. Negative lines of code might be more productive than positive, fewer commits may be more profound than more. The mark of good engineering is [doing a great deal with very little](http://youtu.be/4j4Q_YBRJEI) and that's what we strive for in software engineering.

####  From Philosophy to Concrete Objective

 In the case of [pyVmomi](https://github.com/vmware/pyvmomi), we have no open sourced tests that shipped with [version 5.5.0](https://github.com/vmware/pyvmomi/tree/v5.5.0) as released from VMware's core API team. (Note: there are tests but they are fenced off from public contributors and this is a problem when it comes to getting quality contributions from the general population.) With no unit tests available it is almost impossible for a contributor to independently determine if their change positively or negatively impacts the project's goals. Some over-steer in the area of code coverage would be forgivable.

 I also want to avoid solidifying library internals around dynamic package and class creation as well as internal aspects of the SOAP parser and its details. This puts me in an awkward position because the simplest most naive way to fence off units and begin [busting-gut](http://idioms.thefreedictionary.com/bust+a+gut)on test coverage would also force the tests to tightly couple onto the classes currently defined in what long-time pyVmomi developers refer to as the pyVmomi infrastructure.

####  Separation of Concerns

 The fact that there is *even* a term '*pyVmomi infrastructure*' means that there is an aspect of the library that some people need to talk about separately from some other aspect of the library. That indicates a conflation of [separate concerns](http://en.wikipedia.org/wiki/Separation_of_concerns). This particular point in itself would be a lovely talking point for a whole different article on how software engineering becomes [social engineering](http://en.wikipedia.org/wiki/Conway's_law) after a certain point. To become a highly used, trusted, and distributed library; pyVmomi should disambiguate these concerns. But, I digress.

####  Application of Philosophy as Strategy

 I spent no less than [three weeks](http://hartsock.blogspot.com/2014/08/what-every-developer-should-know-about.html) developing the [test strategy](https://github.com/vmware/pyvmomi/commit/e93a6e0a7ff08e29e1501b632b8d89734a10e946) for pyVmomi that will allow us to test without boxing in the library itself. The strategy leans heavily on [fixture based testing](http://en.wikipedia.org/wiki/Test_fixture#Test_fixture_in_xUnit) and specifically on the [vcrpy](https://pypi.python.org/pypi/vcrpy) library. In our case, the nuance is that our fixture needs to setup a fake socket with all the correct information in it to simulate an interaction with vCenter and/or ESXi without requiring mocked, stubbed, or simulated versions of each.

 If we avoid testing directly design elements (things like the XML parser itself), and we avoid testing in isolation concerns that are deemed *infrastructure* versus not-infrastructure, then we are left with testing the API "surface" as exposed by pyVmomi. The unit tests call on the *actual* symbols we want to expose to developers and these are the API *surfaces* as I call them. The outermost exposed interface intended for end consumption.

 The shape of these fixture-based tests are virtually identical to [targeted samples](https://github.com/vmware/pyvmomi/blob/19e5029d14677c639175ca0806aa718c1f8c9cc1/tests/test_connect.py#L56) of the API pyVmomi is binding. Given a large enough volume of use-cases these unit tests with fixtures might eventually encompass a body of official samples. Existing as tests means that these samples will also validate the fitness of any changes against known uses of the library.

 This strategy effectively retro-fits tests onto the library without locking in design decisions that may not have had very much thought. It frees us to build use-cases and eventually fearlessly refactor the library since the tests will not tightly couple to implementation specifics and instead the tests couple to interface symbols.

####  Objectives Accomplished

 We want pyVmomi to continue to exist long enough that it can accomplish its goal of being the *best* library for working with vSphere. To survive, we need the library to have a lifespan beyond Python 2. We need the library to allow contributors to objectively measure the quality and fitness of their own contributions so it attracts enough developers to evolve and spread toward its goal.

 So far we've accomplished the following objectives in the up-coming release due to come out in mere days:

- [Python 3 support](https://github.com/vmware/pyvmomi/issues/55)gives the pyVmomi library time to live and flexibility to grow
- [Fixture based tests](https://github.com/vmware/pyvmomi/tree/master/tests/fixtures) give users and contributors confidence to develop while also...

- avoiding design detail lock-in
- hiding irrelevant library *infrastructure* details
- providing official samples based on actual API units that will not break as the API changes

- we also established [contribution standards](https://github.com/vmware/pyvmomi/wiki/Contributions)

####  Objectives to Accomplish

 While we want [pyVmomi community samples](https://github.com/vmware/pyvmomi-community-samples) to evolve unrestricted and rapidly, it is also the source for [requirements](http://en.wikipedia.org/wiki/Software_requirements) for the library. The samples project is separate so that it can welcome all comers with a low barrier to entry. But, it is very important as it will feed the main pyvmomi project in a very vital way. The samples become the requirements for pyVmomi.

 The samples and the [pyvmomi unit tests](https://github.com/vmware/pyvmomi/tree/master/tests) need not have a 1-to-1 relationship between sample script and test, but each sample should have a set of corollary unit tests with fixtures that give basic examples and tests for the use case illustrated in the parent sample. That means one sample might inspire a large number of unit tests.

 These are some of the high level objectives to reach going forward on pyVmomi:

- remain highly reliable and worthy of trust

- cover all major vSphere API use cases in unit tests with fixtures
- squash all high priority bugs rapidly which implies releasing fixes rapidly

- reach feature parity with all competing and cooperating API bindings
 To reach these new objectives we'll need to do some leg work to find way-points along the way. We may change some of our finer targeted objectives later, but these objectives help us reach the goal of being so good nobody working in this space can ignore us, being so good we deserve the title *the best*.

 More on that in a future post...

{% endraw %}
