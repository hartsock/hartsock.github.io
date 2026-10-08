---
excerpt_separator: ""
layout: "archive-post"
title: "Linux Forgotten Root Password"
date: "2007-10-17T19:46:00.000-04:00"
description: "Oh no, you've forgotten the root password to your laptop or other Linux desktop. If they are set up with grub all is not lost. At the grub splash screen key in 'e' for edit. You'll now be able to edit the boot options. S"
topics: ["software-design"]
original_labels: ["administration","beginner","linux","tip"]
original_url: "https://hartsock.blogspot.com/2007/10/linux-forgotten-root-password.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-10-17-linux-forgotten-root-password/"
id: bafyr4if4ovdxi3zm47g6bwrx6ooqyyyqhlu4o2hgxjmpuoa3zy4a6vfwwa
permalink: /posts/linux-forgotten-root-password-4a6vfwwa/
---
{% raw %}

Oh no, you've forgotten the root password to your laptop or other Linux desktop.

If they are set up with grub all is not lost. At the grub splash screen key in 'e' for edit. You'll now be able to edit the boot options. Select the line with the kernel on it and add the word 'single' as the last parameter. When you hit enter the edit mode will exit. Striking the 'b' for boot command will boot this configuration and your kernel will boot into the magical single user mode where you can type 'password' to change root's password without having to know what that forgotten original password was.

Now you can use the awesome power of root to change the other forgotten passwords on the system. If you think this presents a security hole and don't want to allow 'e' from the grub splash... you can [secure grub with a password](http://www.linux.com/articles/53569).

{% endraw %}
