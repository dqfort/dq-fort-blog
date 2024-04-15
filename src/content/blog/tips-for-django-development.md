---
title: Tips for Django development
author: Eric Cheung
pubDatetime: 2024-04-16T01:49:50Z
slug: tips-for-django-development
featured: false
draft: false
tags:
  - Django
description:
  Some tips about using Django for development
---

Django is a great framework for web development, with build-in ORM, MVC architecture and a large ecosystem with many external plugins.

However, it would be a bit complicated if you are new to it. There are some tips would help.

## Managing apps
You can create an app with this command:
```shell
python manage.py startapp `app_name`
```

An application in a Django project contains the logics how to handle the requests from client users, or it could be a group of background tasks. If you think it would deploy to different servers with different features, it should separate the features to different apps. For example, you might have `coreapp` app for public users and `myadmin` app for internal users, since `coreapp` deploy to more servers since more uage but `myadmin` should deploy fewer servers.

And an app should depend on apps as a stack to avoid circular import. That means `myadmin` depend on `coreapp` but `coreapp` should not depend on `myadmin`. You would also create a `scheduler` app depend on `coreapp` and `myadmin`.
