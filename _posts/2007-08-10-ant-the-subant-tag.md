---
excerpt_separator: ""
layout: "archive-post"
title: "Ant: the subant tag"
date: "2007-08-10T13:26:00.000-04:00"
description: "In SVN I have this hierarchy: trunk/ --+ | | | + subProjectA/ -+ | | | +- build.xml | | + subProjectB/ -+ | +- build.xml under trunk I've added a build.xml file and using the Ant 1.6 tutorial I've added this build.xml fi"
topics: ["software-design"]
original_labels: ["ant","build","ci","java"]
original_url: "https://hartsock.blogspot.com/2007/08/ant-subant-tag.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2007-08-10-ant-the-subant-tag/"
id: bafyr4ih42643bu2vtegzw2tupdulc3ulperhrf4di7nwkk6jiinyqqkwty
permalink: /posts/ant-the-subant-tag-nyqqkwty/
---
{% raw %}

In SVN I have this hierarchy:

```

trunk/ --+

             |

             |

             |

             + subProjectA/ -+

             |               |

             |               +- build.xml

             |

             |

             + subProjectB/ -+

                             |

                             +- build.xml

```

under trunk I've added a build.xml file and using the Ant 1.6 [tutorial](http://ant.apache.org/manual/CoreTasks/subant.html) I've added this build.xml file:

```

<?xml version="1.0" encoding="UTF-8"?>

<project default="dist" name="My Project">

            <macrodef name="iterate">

                <attribute name="target"/>

                <sequential>

                    <subant target="@{target}">

                        <fileset dir="." includes="*/build.xml"/>

                    </subant>

                </sequential>

            </macrodef>

            <target name="dist">

                <iterate target="dist"/>

            </target>

            <target name="compile">

                <iterate target="compile"/>

            </target>

            <target name="clean">

                <iterate target="clean"/>

            </target>

</project>

```

This presumes all sub projects have a compile, clean, and dist target. I may add a test target as well.

{% endraw %}
