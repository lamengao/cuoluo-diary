#!/usr/bin/env python
# -*- coding: utf-8 -*-
import re

from google.appengine.ext import webapp
#from google.appengine.api import users

from models import User


class BaseHandler(webapp.RequestHandler):

    def get_current_user(self):
        user = User.get_current_user(self.request.get('testuser'))
        return user

    def getBrowserDetails(self):
        userAgent = self.request.headers['User-Agent']
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
