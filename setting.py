#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import zoneinfo
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

from google.appengine.dist import use_library
use_library('django', '1.2')

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.api import users

from models import User


def login_required(handler_method):
	"""A decorator to validate request for /settings"""
	def check_login(self):
		user = User.get_current_user()
		if user is None:
			self.redirect(users.create_login_url("/"))
			return
		self.user = user
		handler_method(self)
	return check_login

def check_settings(**settings):
	for setting in settings:
		value = settings[setting]
		if setting == 'date_format' and value not in ['MDY', 'DMY', 'YMD']:
			return False
		elif setting == 'timezone':
			if not value in zoneinfo.timezone:
				return False
	return True


class MainHandler(webapp.RequestHandler):
	@login_required
	def get(self):
		base_path = os.path.dirname(__file__)
		path = os.path.join(base_path, 'templates', 'settings.html')
		template_values = {}
		template_values['email'] = self.user.email
		if hasattr(self.user, 'timezone'):
			template_values['timezone'] = self.user.timezone or 'America/Los_Angeles'
		if hasattr(self.user, 'date_format') and self.user.date_format:
			template_values['dateformat'] = self.user.date_format
		self.response.out.write(template.render(path, template_values))

	@login_required
	def post(self):
		timezone = self.request.get('cldTimezones')
		dateformat = self.request.get('cldDateFormat')
		if check_settings(timezone=timezone, date_format=dateformat):
			self.user.timezone = timezone
			self.user.date_format = dateformat
			self.user.put()
		else:
			self.error(400)
			return
		self.redirect("/")


application = webapp.WSGIApplication([('/setting', MainHandler)], debug=True)

def main():
	run_wsgi_app(application)

if __name__ == '__main__':
	main()
