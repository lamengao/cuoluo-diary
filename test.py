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

class TestHandler(webapp.RequestHandler):
	def get(self):
		#user = models.User.get_current_user()
		#if not user:
			#self.redirect(users.create_login_url("/testscript"))
			#return
		##namespace_manager.set_namespace('newyear')
		#if not user.is_saved():
			#user.put()
		#namespace = namespace_manager.get_namespace()
		#self.response.out.write('<a href="%s">sign out</a><br> %s <br>' % (users.create_logout_url("/testscript"),user.GAccount))
		#self.response.out.write('namespace: %s <br>' % namespace)
		#self.response.out.write('author.GAccount.user_id: %s <br>' % user.GAccount.__dict__)
		cssfile = os.path.join(os.path.dirname(__file__), 'staticsymbol', 'css', 'cld.dev.css')
		filestat = os.stat(cssfile)
		self.response.out.write('namespace: %s <br>' % filestat.st_mtime)


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
