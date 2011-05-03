#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

from google.appengine.dist import use_library
use_library('django', '1.2')

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.api import users

template.register_template_library('templatetags.filters')                      

class MainHandler(webapp.RequestHandler):
	def get(self):
		path = os.path.join(os.path.dirname(__file__), 
				            'templates', 'main.html')
		template_values = {}
		self.response.out.write(template.render(path, template_values))
	

class LogoutHandler(webapp.RequestHandler):
	def get(self):
		user = users.get_current_user()
		if user:
			self.redirect(users.create_logout_url("/"))
		else:
			self.redirect('/')


class LoginHandler(webapp.RequestHandler):
	def get(self):
		self.redirect(users.create_login_url('/'))


application = webapp.WSGIApplication([('/', MainHandler),
	                                  ('/login', LoginHandler),
	                                  ('/logout', LogoutHandler)
									  ],
									  debug=True)

def main():
	run_wsgi_app(application)

if __name__ == '__main__':
	main()
