#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import re
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

from google.appengine.dist import use_library
use_library('django', '1.2')

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.api import users

from models import User

template.register_template_library('templatetags.filters')


class MainHandler(webapp.RequestHandler):
	def get(self):
		user = User.get_current_user()
		if user is None:
			self.redirect(users.create_login_url("/"))
			return
		try:
			is_dev = os.environ['SERVER_SOFTWARE'].startswith('Dev')
		except:
			is_dev = False
		is_prod = not(is_dev)
		path = os.path.join(os.path.dirname(__file__), 
							'templates', 'main.html')
		template_values = {}
		template_values['user'] = {}
		template_values['user']['id'] = user.id
		template_values['user']['email'] = user.email
		template_values['diary_list'] = user.get_diary_list()
		template_values['notes_list'] = user.get_notes_list()
		if is_prod:
			template_values['develop'] = False
		elif self.request.get("dev") == 'true':
			template_values['develop'] = True
		else:
			template_values['develop'] = False
		template_values['browser'] = getBrowserDetails(
			self.request.headers['User-Agent'])
		self.response.out.write(template.render(path, template_values))
	

class LogoutHandler(webapp.RequestHandler):
	def get(self):
		user = users.get_current_user()
		if user:
			self.redirect(users.create_logout_url("http://diary.cuoluo.com/"))
		else:
			self.redirect('http://diary.cuoluo.com/')


class LoginHandler(webapp.RequestHandler):
	def get(self):
		self.redirect(users.create_login_url('/'))


def getBrowserDetails(userAgent):
	result = {}
	# Regexp for most used "User-Agent"s built using "http://www.useragentstring.com/"
	browsersRegexps = [
		['Internet Explorer', 'MSIE (\S+)'],
		['Opera', 'Opera[ /](\S+)'],
		['Konqueror', 'KHTML/(\S+)'],
		['Firefox', 'Gecko/\S+ Firefox/(\S+)'],
		['Chrome','AppleWebKit/\S+ (KHTML, like Gecko) Chrome/(\S+) Safari/\S+'],
		['Safari', 'Version/\S+ Safari/(\S+)'],
		['Mozilla', 'Gecko/(\S+)'],
		['WebKit', 'AppleWebKit/(\S+)']
	]
	# Search for the Browser that matches, if any
	for browser in browsersRegexps:
		compiledRegexp = re.compile( browser[1] )
		searchResult = compiledRegexp.search( userAgent )
		if searchResult:
			result['name'] = browser[0]
			result['version'] = searchResult.group(1)
			return result
	# If nothing matches, return "unknown"
	result['name'] = "unknown"
	result['version'] = "unknown"
	return result


application = webapp.WSGIApplication([('/', MainHandler),
									  ('/login', LoginHandler),
									  ('/logout', LogoutHandler)
									  ],
									  debug=True)

def main():
	run_wsgi_app(application)

if __name__ == '__main__':
	main()
