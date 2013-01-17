#!/usr/bin/env python
# coding=utf-8

import os

import models

from google.appengine.api import namespace_manager
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from django.utils import simplejson as json

from models import User, Diary, Note


class TestHandler(webapp.RequestHandler):
    def get(self):
        user = models.User.get_current_user()
        #if not user:
            #self.response.out.write('nonono')
            #return
        #elif user.email != 'yibing@cuoluo.com' and user.email != 'xuyan@cuoluo.com':
            #self.response.out.write('nonono')
            #return
        #ori_user = User.get_by_key_name('115680706968923119637')
        #new_user = User.get_by_key_name('108038034624975513101')
        ## get ori diaries
        #for diary in ori_user.diary:
            #if diary.status == 'trashed':
                #continue
            #Diary.create_new(new_user, diary.title, diary.content.html)
        # new user create new
        self.response.out.write('done')


class TestScriptHandler(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if user:
            self.response.out.write(user.email() + '<br/>')
            self.response.out.write(user.user_id())
        else:
            self.response.out.write('not loging')


def main():
    application = webapp.WSGIApplication([
        ('/testscript', TestScriptHandler),
        ('/test', TestHandler)
        ], debug=True)
    run_wsgi_app(application)

if __name__ == '__main__':
    main()
