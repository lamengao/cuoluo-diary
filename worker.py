#!/usr/bin/env python
# -*- coding: utf-8 -*-
import logging
import os

import lib.cloudstorage as gcs

from google.appengine.ext import webapp
from google.appengine.api import app_identity

from models import User

# Retry can help overcome transient urlfetch or GCS issues, such as timeouts.
my_default_retry_params = gcs.RetryParams(initial_delay=0.2,
                                          max_delay=5.0,
                                          backoff_factor=2,
                                          max_retry_period=15)
# All requests to GCS using the GCS client within current GAE request and
# current thread will use this retry params as default. If a default is not
# set via this mechanism, the library's built-in default will be used.
# Any GCS client function can also be given a more specific retry params
# that overrides the default.
# Note: the built-in default is good enough for most cases. We override
# retry_params here only for demo purposes.
gcs.set_default_retry_params(my_default_retry_params)


class ArchiveHandler(webapp.RequestHandler):
    def post(self):
        default_bucket_name = app_identity.get_default_gcs_bucket_name()
        bucket_name = os.environ.get('BUCKET_NAME', default_bucket_name)
        user_id = self.request.headers['X-AppEngine-TaskName'].split('-')[0]
        user = User.get_by_key_name(user_id)
        bucket = '/' + bucket_name
        filename = bucket + '/gcsfiletest.txt'
        gcs_file = gcs.open(filename,
                            'w',
                            content_type='text/plain',
                            options={'x-goog-meta-foo': 'foo',
                                     'x-goog-meta-bar': 'bar'})
        gcs_file.write('wahahahahahahhaha\n')
        gcs_file.close()
        logging.info(user.email)
        logging.info(bucket_name)
        logging.info(filename)


app = webapp.WSGIApplication([
    ('/worker/archive', ArchiveHandler),
], debug=True)
