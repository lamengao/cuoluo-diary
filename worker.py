#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import logging
import os
import StringIO
import zipfile
import random

import lib.cloudstorage as gcs

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.api import app_identity
from google.appengine.api import mail

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


def get_random_string(length=12,
                      allowed_chars='abcdefghijklmnopqrstuvwxyz'
                                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'):
    return ''.join(random.choice(allowed_chars) for i in range(length))


class ArchiveHandler(webapp.RequestHandler):

    def post(self):
        user_id = self.request.headers['X-AppEngine-TaskName'].split('-')[0]
        user = User.get_by_key_name(user_id)

        default_bucket_name = app_identity.get_default_gcs_bucket_name()
        bucket_name = os.environ.get('BUCKET_NAME', default_bucket_name)
        bucket = '/' + bucket_name
        filename = bucket + ('/archive/%s/cuoluodiary.archive.zip' %
                             get_random_string(32))

        path = os.path.join(os.path.dirname(__file__),
                            'templates', 'archive.html')

        stringio = StringIO.StringIO()
        zipstream = zipfile.ZipFile(stringio, 'w')
        # Archive diary
        for diary in user.diary:
            template_values = {
                'title': diary.title,
                'content': diary.content.html,
                'trashed': diary.status == 'trashed'
            }
            filecontent = template.render(path, template_values).encode('utf8')
            zipstream.writestr('cuoluodiary/diary/%s.html' % diary.title,
                               filecontent)
        # Archive notes
        for note in user.notes:
            template_values = {
                'title': note.title,
                'content': note.content.html,
                'trashed': note.status == 'trashed'
            }
            filecontent = template.render(path, template_values).encode('utf8')
            zipstream.writestr('cuoluodiary/note/%s.html' % note.title,
                               filecontent)
        zipstream.close()

        gcs_file = gcs.open(filename, 'w',
                            content_type='application/zip',
                            options={str('x-goog-acl'): 'public-read'})
        gcs_file.write(stringio.getvalue())
        stringio.close()
        gcs_file.close()

        download_url = 'https://storage.cloud.google.com' + filename
        send_archive_email(user.email, download_url)
        logging.info(download_url)


def send_archive_email(to, download_url):
    """docstring for send_archive_email"""
    path = os.path.join(os.path.dirname(__file__),
                        'templates', 'archive.email.txt')
    body = template.render(path, {'download_url': download_url}).encode('utf8')
    sender = 'Cuoluo Diary <admin@cuoluo.com>'
    subject = 'Your Cuoluo Diary download is ready'
    mail.send_mail(sender=sender, to=to, subject=subject, body=body)


app = webapp.WSGIApplication([
    ('/worker/archive', ArchiveHandler),
], debug=True)
