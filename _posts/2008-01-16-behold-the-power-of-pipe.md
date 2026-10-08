---
excerpt_separator: ""
layout: "archive-post"
title: "Behold the Power of Pipe!"
date: "2008-01-16T10:02:00.000-05:00"
description: "This is a repost of an article on pipe I posted several years ago. Pipe is a very powerful tool, behold: tar -czf - [list of dirs and files] | \\ ssh [user]@[server] \"cd /path/to/place/files; tar -xzf -\" I learned this on"
topics: ["software-design"]
original_labels: ["administration","linux","pipe","repost","unix"]
original_url: "https://hartsock.blogspot.com/2008/01/behold-power-of-pipe.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2008-01-16-behold-the-power-of-pipe/"
id: bafyr4ignuqflmvdnnlzctiscmizo6phpnkbzork2rn3eihbwrc5g3sjh7a
permalink: /posts/behold-the-power-of-pipe-5g3sjh7a/
---
{% raw %}

This is a repost of an article on pipe I posted several years ago. Pipe is a very powerful tool, behold:

```

tar -czf - [list of dirs and files] | \

    ssh [user]@[server] "cd /path/to/place/files; tar -xzf -"

```

I learned this one from one of my bosses a few jobs back. There are a few unixy tricks in that command that took me a while to grasp. I've been using this trick for years now and I thought perhaps you would like to see it.

You create a tar archive and specify the file "-" which is your standard out. Then you list the dirs and files you wish to grab. Since the compressed tar is being sent to stdout you can catch it with a pipe "|" and send it to ssh (the "\" is just a way of breaking a command between lines).

With ssh we log into a server as a given user. Then we ask ssh to run a command for us. Since the ssh session will login to the machine at the user's home dir we ask the command session to change to a path, then run the tar command. This time we are extracting the tar archive we caught with pipe by specifying the file "-" to the tar command.

The result is that the files get tarred, compressed, and shot over the network to a remote machine which then immediately untarrs decompresses and drops the files in place. We let tar do all the work of error handling and handling non-regular files, compression is optional, and there are no archives left over.

If, however, we wanted to create a remote archive without ever consuming storage on the local machine we could instead do this:

```

tar -czf - [list of dirs and files] | \

    ssh [user]@[server] "cat > /path/to/place/file.tar.gz"

```

If processing power was limited on the local machine then we could do this:

```

tar -cf - [list of dirs and files] | \

    ssh [user]@[server] "gzip -c > /path/to/place/file.tar.gz"

```

{% endraw %}
