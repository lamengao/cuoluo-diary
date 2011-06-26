#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template

from models import Counter

template.register_template_library('templatetags.filters')


class MonitorHandler(webapp.RequestHandler):
	def get(self):
		try:
			is_dev = os.environ['SERVER_SOFTWARE'].startswith('Dev')
		except:
			is_dev = False
		path = os.path.join(os.path.dirname(__file__), 
							'templates', 'monitor.html')
		template_values = {}
		template_values['users'] = {}
		users_counter = Counter.get_by_key_name('users')
		if users_counter is None:
			template_values['users']['count'] = 1
		else:
			template_values['users']['count'] = users_counter.count
		self.response.out.write(template.render(path, template_values))


application = webapp.WSGIApplication([('/monitor', MonitorHandler),
									  ],
									  debug=True)

def main():
	run_wsgi_app(application)

if __name__ == '__main__':
	main()
