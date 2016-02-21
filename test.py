#!/usr/bin/env python
# coding=utf-8

#import os

import models

#from google.appengine.api import namespace_manager
#from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.ext import webapp
#from google.appengine.ext.webapp.util import run_wsgi_app
#from google.appengine.ext.webapp import template
#from django.utils import simplejson as json

#from models import User, Diary, Note


class TestHandler(webapp.RequestHandler):
    def get(self):
        user = models.User.get_current_user()
        self.response.out.write('done')


class TestScriptHandler(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if user:
            self.response.out.write(user.email() + '<br/>')
            self.response.out.write(user.user_id())
        else:
            self.response.out.write('not loging')


app = webapp.WSGIApplication([('/testscript', TestScriptHandler),
                              ('/test', TestHandler)], debug=True)
