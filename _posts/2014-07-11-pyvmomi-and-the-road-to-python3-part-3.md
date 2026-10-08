---
excerpt_separator: ""
layout: "archive-post"
title: "pyVmomi and the road to Python3 - part 3"
date: "2014-07-11T16:09:00.000-04:00"
description: "The Good News It works! And without major surgery! I currently have a working branch of the pyVmomi code base that runs on python 3.x interpreters. We are working to get this version usable under Python 2.6, 2.7, 3.3, an"
topics: ["testing","python","software-design"]
original_labels: ["python 3","pyvit","pyvmomi","testing","unicode"]
original_url: "https://hartsock.blogspot.com/2014/07/pyvmomi-and-road-to-python3-part-3.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2014-07-11-pyvmomi-and-the-road-to-python3-part-3/"
id: bafyr4icyfj36h5qug5cgdf3meyjnmkrsaclckxnfpv3q2d3qjd6go4lz4e
permalink: /posts/pyvmomi-and-the-road-to-python3-part-3-6go4lz4e/
---
{% raw %}

####  The Good News

 It *works*! And without *major* surgery!

 I currently have a working branch of the pyVmomi code base that runs on python 3.x interpreters. We are working to get this version usable under Python 2.6, 2.7, 3.3, and 3.4 as well and hope to post on that next week. I'd also like to thank [Rackspace](http://www.rackspace.com/) for offering to host our [CI](http://en.wikipedia.org/wiki/Continuous_integration) servers. Kudos to [Michael Rice](https://github.com/michaelrice) for getting that to happen.

####

####  The bad bits...

 One of the most frustrating aspects of porting pyVmomi on to Python 3.x has been the fact that many of the language changes caused pyVmomi to fail to load or fail silently. This is in part due to design considerations made in the library early on, and in part due to how the language has changed.

 In particular the way imports are done were instrumental in basically masking the failures. The try-except-swallow pattern is frequently used and it tended to hide why a vim.* or vmodl.* data type wasn't loading into memory.

 [(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgfG5QcHw8Pt5iBakTv1VIJWSw_G3U5nSMA4Wz0nQmIiWVV5mSFv3LAAjUSGqUHY9chblznzFnmpcWkQrMAnaYtDFgFY09-mArErvMA6H3xuX7J1fmZ5Un1GNwKzfcgYzzBUkAe-w/s1600/Screen+Shot+2014-07-11+at+3.35.20+PM.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgfG5QcHw8Pt5iBakTv1VIJWSw_G3U5nSMA4Wz0nQmIiWVV5mSFv3LAAjUSGqUHY9chblznzFnmpcWkQrMAnaYtDFgFY09-mArErvMA6H3xuX7J1fmZ5Un1GNwKzfcgYzzBUkAe-w/s1600/Screen+Shot+2014-07-11+at+3.35.20+PM.png)

 Simple porting techniques and tools also helped mask the problems, however, now that they are known I may back off some of the changes in favor of cleaner more generic solutions.

####

####  Simple 2 to 3

 A number of changes are rather trivial, take the case of exceptions for example...

 [(image removed, alt: "replacing a ',' with the key word 'as' is enough to 'fix' a python 2 to 3 exception block in some cases.", src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEid2pgRSTGn1kt3-QbgfEMsbgm8TcPyB_pJIDKw3azDTpuym6zgEsHaeIXiAlpOOAfb6ugL95_iUnAzU0M83b51nWWQ9Y2jhffrVqx0jrHRmgJDzGtw-6UkxM69JiGoLSks5nIqfQ/s1600/Screen+Shot+2014-07-10+at+2.53.11+PM.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEid2pgRSTGn1kt3-QbgfEMsbgm8TcPyB_pJIDKw3azDTpuym6zgEsHaeIXiAlpOOAfb6ugL95_iUnAzU0M83b51nWWQ9Y2jhffrVqx0jrHRmgJDzGtw-6UkxM69JiGoLSks5nIqfQ/s1600/Screen+Shot+2014-07-10+at+2.53.11+PM.png) ... there were a number of these trivial cases where tools like the [2 to 3](https://www.youtube.com/watch?v=1GcJTugBnzE) tool could help. But, in general libraries like [six](https://pypi.python.org/pypi/six/1.7.3) and tools like [2to3](https://docs.python.org/2/library/2to3.html) tended to mask underlying problems with more complex issues such as unicode and type inheritance in the library.

 There were a number of these kinds of changes

####

####  When is a Type not a Type?

 Inheriting off of base classes is considered very bad practice. It tends to gain you very little and tends to complicate code unnecessarily. Consider the Link class in pyVmomi's VmomiSupport.py which very naughtily extends the core unicode class in Python.

 [(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEirjyaEoVS0fTAvzRaY-gy9t_D9SI1jzvcDxQVuEliDz8Yt9Zd47XGu2kqc6d3_z8Xs1ZdAT4Mjjk9QrxZk9HWM0HS0vWo5dQ2XXTLxEJoBj6O0WZSGAdSxvl__CBCSSE-tuVooGg/s1600/Screen+Shot+2014-07-11+at+1.40.58+PM.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEirjyaEoVS0fTAvzRaY-gy9t_D9SI1jzvcDxQVuEliDz8Yt9Zd47XGu2kqc6d3_z8Xs1ZdAT4Mjjk9QrxZk9HWM0HS0vWo5dQ2XXTLxEJoBj6O0WZSGAdSxvl__CBCSSE-tuVooGg/s1600/Screen+Shot+2014-07-11+at+1.40.58+PM.png)  The Link class here serves the sole purpose of allowing a string to be recognized as a type temporarily so that when we do type mapping during SOAP deserialization we have a type to latch on to in [key branching logic](https://github.com/vmware/pyvmomi/blob/v5.5.0/pyVmomi/VmomiSupport.py#L931).

 [(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg1kH1_2E7UpgQtOpFyMZmdT0dK_JLOO3yonH3C-lr5ghBu26ZKwKJVmtGhplJv88LarjpSSOF_YBKqg0jxBHDUYl9BfueqdG1zFJ3NYq-4ycZSuYTaJGgd6zzMDrmeUxPBtyf2DQ/s1600/Screen+Shot+2014-07-11+at+3.01.43+PM.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg1kH1_2E7UpgQtOpFyMZmdT0dK_JLOO3yonH3C-lr5ghBu26ZKwKJVmtGhplJv88LarjpSSOF_YBKqg0jxBHDUYl9BfueqdG1zFJ3NYq-4ycZSuYTaJGgd6zzMDrmeUxPBtyf2DQ/s1600/Screen+Shot+2014-07-11+at+3.01.43+PM.png)

 This is clearly not within the use cases most people are thinking about when they are thinking about Python 2to3 and while the practice is naughty, it does provide an interesting orthogonality to the mapping code.

 So, because of that, while it's bad practice to extend a built in type I can't think of something cleaner that wouldn't immediately ugly up the code-base. However, I'm *also* not sure how that bit of logic currently performs since any use of Link is going to return ostensibly a string (albeit a unicode one) and said string is *never* going to to be of type Link. So the first point still stands... extending a base class is more confusing than it is useful.

 That's just out of scope for strictly Python portability work, so for the time being the class stays in. It also seems mostly benign at the moment. There's a significant lack of testing around the lib and that needs to be addressed before I will be confident doing any major refactoring work. IMHO: The python 3 support work is pushing our luck as it is.

####

####  Unicode uncoded

 Of particular interest is in testing our Unicode related code no longer make sense in Python 3.

 [(image removed, src was: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh_-I3iAok2F70XOdOlx9F6RbZzwzURRgstFpMT-jcFUZwnuzGTUS8tW1feNXyR_am2YAwg1xXPariuEkMBfzkfZ93JTh06sK-d4JBc1ocMO8eUhZylq_J8m1BrxO45YhPe8jhM_Q/s1600/Screen+Shot+2014-07-10+at+3.48.48+PM.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh_-I3iAok2F70XOdOlx9F6RbZzwzURRgstFpMT-jcFUZwnuzGTUS8tW1feNXyR_am2YAwg1xXPariuEkMBfzkfZ93JTh06sK-d4JBc1ocMO8eUhZylq_J8m1BrxO45YhPe8jhM_Q/s1600/Screen+Shot+2014-07-10+at+3.48.48+PM.png)

 Hopefully, we can do away with the uglier bits I've hacked on here to make things work. We will also need to back-track the assumptions made when the 'unicode' and 'basestring' symbols were used and make sure they still hold.

####  Special thanks to the friendly folks on [#python](http://webchat.freenode.net/?channels=#python) for their help with understanding the issues around Python and unicode.

####

####  Next steps: testing, testing, testing

 My next set of tasks will be to clean up and refine the python 3 related changes to try and make them as targeted an small as possible. I can't realistically do this with much confidence if I can't make assertions about the library's operation. While VMware has internal build systems and tests that validate and verify the library against a variety of product builds I can't realistically expose these since they are intimately related to shipping product itself.

 The [pyVit](https://github.com/hartsock/pyvmomi-integration-tests) (pronounced pi-vət) project is a first step toward creating a test suite for pyVmomi that a 3rd party could easily consume to validate the library and their environments. This will help us move the library from its current status of beta to a 'stable' category. I also hope this will enable broader stewardship of the pyVmomi library allowing it to take on a life of its own. Ideally, this will also enable anyone to *fearlessly* refactor the library.

 More on that next week...

{% endraw %}
