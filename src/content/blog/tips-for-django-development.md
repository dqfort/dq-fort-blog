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

An application in a Django project contains the logics how to handle the requests from client users, or it could be a group of background tasks. If you think it would deploy to different servers with different features, it should separate the features to different apps. For example, you might have `coreapp` app for public users and `myadmin` app for internal users, since `coreapp` deploy to more servers since more usage but `myadmin` should deploy fewer servers.

And an app should depend on apps as a stack to avoid circular import. That means `myadmin` depend on `coreapp` but `coreapp` should not depend on `myadmin`. You would also create a `scheduler` app depend on `coreapp` and `myadmin`.

## Encapsulate business logic
Web applications need to exchange data to database, usually about the business logic. It could be a good idea encapsulating that for readability and reusable. Django provides custom manger for structuring about it.

Let say there is a `BookingRoom` model to store booking rooms information. You might want to find the rooms not booked, and you can use a custom model manager like:
```python
class NonBookingRoomManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(booked_by__isnull=True)

    def get_available_regions(self):
        return self.get_queryset().values_list("region", flat=True).distinct()


class BookingRoom(models.Model):
    # ...
    region = model.CharField(max_length=40)
    booked_by = models.OneToOneField(User, on_delete=models.RESTRICT)
    non_booking_rooms = NonBookingRoomManager()
```

From the example above, we can define the manager that returns results fulfilling criterias in `get_queryset`. We can also define other methods in the manger for querying other information. The usage of the manger like:
```python
# Get all non-booking rooms
BookingRoom.non_booking_rooms.all()

# Get all regions for non-booking rooms
BookingRoom.non_booking_rooms.get_available_regions()
```

[More details of using managers](https://docs.djangoproject.com/en/5.0/topics/db/managers/)

## Local development
Usually you would need to override some settings for local development, like install Django debug toolbar. Add the following code in your project's `settings.py` can implement for that:
```python
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

local_settings_path = os.path.join(BASE_DIR, 'local_settings.py')

if os.path.exists(local_settings_path):
    from local_settings import *
```

Then create the `local_settings.py` in the project's root directory, config Django debug toolbar like:

```python
from settings import * 
INSTALLED_APPS += [ "debug_toolbar", ]
```