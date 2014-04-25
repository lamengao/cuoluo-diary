#!/usr/bin/env python
# -*- coding: utf-8 -*-
import logging
import os
import re

from google.appengine.ext import webapp
#from google.appengine.ext.webapp.util import run_wsgi_app
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
        elif self.request.get("d"):
            template_values['develop'] = True
        elif self.request.get("e") == 'true':
            template_values['develop'] = True
        else:
            template_values['develop'] = False
        logging.info(self.request.get("d"))
        logging.info(template_values['develop'])
        template_values['browser'] = getBrowserDetails(
            self.request.headers['User-Agent'])
        self.response.out.write(template.render(path, template_values))


class LogoutHandler(webapp.RequestHandler):
    def get(self):
        try:
            is_dev = os.environ['SERVER_SOFTWARE'].startswith('Dev')
        except:
            is_dev = False
        url = "http://diary.cuoluo.com/"
        user = users.get_current_user()
        if not is_dev:
            if user:
                self.redirect(users.create_logout_url(url))
            else:
                self.redirect(url)
        else:
            if user:
                self.redirect(users.create_logout_url("/"))
            else:
                self.redirect('/')


class LoginHandler(webapp.RequestHandler):
    def get(self):
        self.redirect(users.create_login_url('/'))


class TasksLoginHandler(webapp.RequestHandler):
    def get(self):
        url = 'https://mail.google.com/tasks/ig'
        self.redirect(users.create_login_url(url))


def getBrowserDetails(userAgent):
    result = {}
    # Regexp for most used "User-Agent"s built using
    # "http://www.useragentstring.com/"
    browsersRegexps = [
        ['Internet Explorer', 'MSIE (\S+)'],
        ['Opera', 'Opera[ /](\S+)'],
        ['Konqueror', 'KHTML/(\S+)'],
        ['Firefox', 'Gecko/\S+ Firefox/(\S+)'],
        ['Chrome',
            'AppleWebKit/\S+ (KHTML, like Gecko) Chrome/(\S+) Safari/\S+'],
        ['Safari', 'Version/\S+ Safari/(\S+)'],
        ['Mozilla', 'Gecko/(\S+)'],
        ['WebKit', 'AppleWebKit/(\S+)']
    ]
    # Search for the Browser that matches, if any
    for browser in browsersRegexps:
        compiledRegexp = re.compile(browser[1])
        searchResult = compiledRegexp.search(userAgent)
        if searchResult:
            result['name'] = browser[0]
            result['version'] = searchResult.group(1)
            return result
    # If nothing matches, return "unknown"
    result['name'] = "unknown"
    result['version'] = "unknown"
    return result


app = webapp.WSGIApplication([('/', MainHandler),
                              ('/login', LoginHandler),
                              ('/taskslogin', TasksLoginHandler),
                              ('/logout', LogoutHandler)
                              ], debug=True)
