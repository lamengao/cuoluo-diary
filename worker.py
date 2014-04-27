#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import logging
import os
import StringIO
import zipfile
import random
import urllib2

import cloudstorage as gcs
#import httplib2 as httplib2

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.api import app_identity
from google.appengine.api import mail
#from google.appengine.api import urlfetch

#from google.appengine.api import memcache
#from oauth2client.appengine import AppAssertionCredentials
#from apiclient import discovery

from models import User

# Retry can help overcome transient urlfetch or GCS issues, such as timeouts.
my_default_retry_params = gcs.RetryParams(initial_delay=0.2,
                                          max_delay=5.0,
                                          backoff_factor=2,
                                          max_retry_period=15)
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
        bucket = '/' + bucket_name + '/'
        object_name = ('archive/%s/cuoluodiary.archive.zip' %
                       get_random_string(32))
        filename = bucket + object_name

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
                            options={
                                str('x-goog-acl'): 'bucket-owner-full-control',
                                str('x-goog-meta-user'): user.email})
        gcs_file.write(stringio.getvalue())
        stringio.close()
        gcs_file.close()

        download_url = 'https://storage.cloud.google.com' + filename
        #set_archive_acl(bucket_name, object_name, user_id)
        setacl_by_email(user.email, filename)
        send_archive_email(user.email, download_url)
        logging.info(download_url)


def set_archive_acl(service, bucket_name, object_name, user_id):
    req = service.objectAccessControls().insert(
        bucket=bucket_name,
        object=object_name,
        body={'entity': 'user-' + user_id, 'role': 'READER'})
    req.execute()


def setacl_by_email(email, filename):
    url = "173.230.147.217:8766/UexV9RaBTT/%s%s" % (email, filename)
    try:
        result = urllib2.urlopen(url)
    except urllib2.URLError:
        result = False
    #result = urlfetch.fetch(url)
    logging.info(url)
    return result


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
