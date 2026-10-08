---
excerpt_separator: ""
layout: "archive-post"
title: "OpenStack + vSphere 5.0 - how to solve the WSDL parsing issue"
date: "2013-08-09T22:39:00.001-04:00"
description: "If you're attempting to use the OpenStack nova-compute driver for vCenter or ESXi and you're running version 5.0 of the API's on your VMware products, you might see a stack trace like this... Example trace: 2013-08-09 19"
topics: ["software-design"]
original_labels: []
original_url: "https://hartsock.blogspot.com/2013/08/openstack-vsphere-50-how-to-solve-wsdl.html"
authors: [{"name":"Shawn Hartsock","role":"author"}]
ai: "none"
republished: true
redirect_from: "/posts/archive/2013-08-09-openstack-vsphere-5-0-how-to-solve-the-wsdl-parsing-issue/"
id: bafyr4ifgnqenks2jqpx5qpc63aup27gsfwv462up4phjn4rathppimmksy
permalink: /posts/openstack-vsphere-5-0-how-to-solve-the-wsdl-parsing-issue-ppimmksy/
---
{% raw %}

If you're attempting to use the OpenStack nova-compute driver for vCenter or ESXi and you're running version 5.0 of the API's on your VMware products, you might see a stack trace like this...

 [Example trace](https://gist.github.com/hartsock/6198758):

```

2013-08-09 19:12:36.184 CRITICAL nova [-] imported schema (urn:reflect) at (https://192.168.14.22/sdk/reflect-messagetypes.xsd), failed
2013-08-09 19:12:36.184 TRACE nova Traceback (most recent call last):
2013-08-09 19:12:36.184 TRACE nova   File "/usr/local/bin/nova-compute", line 10, in
2013-08-09 19:12:36.184 TRACE nova     sys.exit(main())
2013-08-09 19:12:36.184 TRACE nova   File "/opt/stack/nova/nova/cmd/compute.py", line 68, in main
2013-08-09 19:12:36.184 TRACE nova     db_allowed=False)
2013-08-09 19:12:36.184 TRACE nova   File "/opt/stack/nova/nova/service.py", line 260, in create
2013-08-09 19:12:36.184 TRACE nova     db_allowed=db_allowed)
2013-08-09 19:12:36.184 TRACE nova   File "/opt/stack/nova/nova/service.py", line 142, in __init__
2013-08-09 19:12:36.184 TRACE nova     self.manager = manager_class(host=self.host, *args, **kwargs)
2013-08-09 19:12:36.184 TRACE nova   File "/opt/stack/nova/nova/compute/manager.py", line 395, in __init__
2013-08-09 19:12:36.184 TRACE nova     self.driver = driver.load_compute_driver(self.virtapi, compute_driver)
2013-08-09 19:12:36.184 TRACE nova   File "/opt/stack/nova/nova/virt/driver.py", line 1003, in load_compute_driver
2013-08-09 19:12:36.184 TRACE nova     virtapi)
2013-08-09 19:12:36.184 TRACE nova   File "/opt/stack/nova/nova/openstack/common/importutils.py", line 52, in import_object_ns
2013-08-09 19:12:36.184 TRACE nova     return import_class(import_value)(*args, **kwargs)
2013-08-09 19:12:36.184 TRACE nova   File "/opt/stack/nova/nova/virt/vmwareapi/driver.py", line 399, in __init__
2013-08-09 19:12:36.184 TRACE nova     super(VMwareVCDriver, self).__init__(virtapi)
2013-08-09 19:12:36.184 TRACE nova   File "/opt/stack/nova/nova/virt/vmwareapi/driver.py", line 173, in __init__
2013-08-09 19:12:36.184 TRACE nova     api_retry_count, scheme=scheme)
2013-08-09 19:12:36.184 TRACE nova   File "/opt/stack/nova/nova/virt/vmwareapi/driver.py", line 483, in __init__
2013-08-09 19:12:36.184 TRACE nova     self._create_session()
2013-08-09 19:12:36.184 TRACE nova   File "/opt/stack/nova/nova/virt/vmwareapi/driver.py", line 520, in _create_session
2013-08-09 19:12:36.184 TRACE nova     raise exception.NovaException(excep)
2013-08-09 19:12:36.184 TRACE nova NovaException: imported schema (urn:reflect) at (https://192.168.14.22/sdk/reflect-messagetypes.xsd), failed

```

 The key trace here is:

```
NovaException: imported schema (urn:reflect) at (https://<IP_ADDRESS>/sdk/reflect-messagetypes.xsd), failed
```

 ... this issue might crop up in Grizzly or Havana releases.

 The issue is with a very picky Python parser. Fortunately the vSphere 5.1 based WSDL have been carefully curated so they work with Python, but for 5.0 there's nothing to be done except to work around the problem.

 So, here's how to prevent the problem from popping up.

 The driver has had a WSDL location parameter in it since the early days of Grizzly. That parameter is still present today. You just have to set the WSDL location to a local file system cache of the XML files that compose the WSDL. Some very clever people are posting work-arounds involving Tomcat and Apache servers, but seriously, we don't need to be *quite* that smart.

 What we're going to do is pull down the WSDL files from the vSphere server and put them in a local directory. Then we're going to add a couple missing files. Next, we'll set wsdl_loc for the driver in nova.conf and finally, we'll start nova watching for parse errors (if there are any) and we'll clean the files by hand as needed (you can usually skip the last part).

 If you don't feel like doing this manually, you can always download the [vSphere 5.0 SDK](https://my.vmware.com/web/vmware/details?productId=229&downloadGroup=WEBSDK50) and pull out the WSDL files, hosting them locally.

 Okay, so here's what we do step-by-step.

```

$ cd ~/devstack
$ source localrc
$ echo $VMWAREAPI_IP

```

 ... should echo your vCenter or ESXi host IP address ...

 Now we need a local directory to store the WSDL in.

```

$ mkdir -p /op/stack/wsdl
$ cd /opt/stack/wsdl

```

 [Copy the WSDL files off of the server](https://gist.github.com/hartsock/6198768) (assuming $VMWAREAPI_IP holds the correct IP address)

```

$ wget  --no-check-certificate https://$VMWAREAPI_IP/sdk/vimService.wsdl
$ wget  --no-check-certificate https://$VMWAREAPI_IP/sdk/vim.wsdl
$ wget  --no-check-certificate https://$VMWAREAPI_IP/sdk/core-types.xsd
$ wget  --no-check-certificate https://$VMWAREAPI_IP/sdk/query-messagetypes.xsd
$ wget  --no-check-certificate https://$VMWAREAPI_IP/sdk/query-types.xsd
$ wget  --no-check-certificate https://$VMWAREAPI_IP/sdk/reflect-messagetypes.xsd
$ wget  --no-check-certificate https://$VMWAREAPI_IP/sdk/reflect-types.xsd
$ wget  --no-check-certificate https://$VMWAREAPI_IP/sdk/vim-messagetypes.xsd

```

 Next you'll have to create the missing files reflect-messagetypes.xsd and reflect-types.xsd in the /opt/stack/wsdl directory. If even a *single* character is out of place (even invisible characters) then the parser will fail with a cryptic error like :2:79 where  is the filename the parser *thinks* its looking at (may not be real), the line number and the column number where the parser failed.

 Contents for [reflect-messagetypes.xsd](https://gist.github.com/hartsock/6198781) and [reflect-types.xsd](https://gist.github.com/hartsock/6198781) ...

```

<?xml version="1.0" encoding="UTF-8"?>
<schema targetNamespace="urn:reflect" xmlns="http://www.w3.org/2001/XMLSchema" xmlns:xsd="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified">
</schema>

```

 Finally! We're ready to use the override in /etc/nova/nova.conf and how you set it depends on how new your driver is. The latest generation driver uses a

```
[vmware]
```

 configuration section in the driver.

 Add to the end of nova.conf pre-Havana

```
vmwareapi_wsdl_loc = file:///opt/stack/wsdl/vimService.wsdl
```

 Add to the [vmware] section of the nova.conf post-Havana

```
wsdl_loc = file:///opt/stack/wsdl/vimService.wsdl
```

{% endraw %}
