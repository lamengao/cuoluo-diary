#!/usr/bin/env python
# -*- coding: utf-8 -*-
#import os
#import sys

#os.environ['DJANGO_SETTINGS_MODULE'] = 'djangosettings'
#for k in [k for k in sys.modules if k.startswith('django')]:
    #del sys.modules[k]

#from google.appengine.dist import use_library
#use_library('django', '1.2')


def namespace_manager_default_namespace_for_request():
    return 'newyear'


remoteapi_CUSTOM_ENVIRONMENT_AUTHENTICATION = (
    'HTTP_X_APPENGINE_INBOUND_APPID', ['cuoluodiary', 'cuoluo-diary'])
