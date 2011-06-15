# -*- coding: utf-8 -*-
import time

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
#from google.appengine.api import memcache
from django.utils import simplejson

from models import User, Diary, Note

def login_required(handler_method):
	"""A decorator to validate request for /api/diary and /api/notes"""
	def check_login(self):
		user = User.get_current_user()
		if user is None:
			self.error(403)
			return
		self.user = user
		handler_method(self)
	return check_login

def json_verified(handler_method):
	"""A decorator to validate request body whether is a good json format"""
	def check_content(self, *args):
		try:
			json = simplejson.loads(self.request.body)
		except ValueError:
			self.error(400)
			return
		self.json = json
		handler_method(self, *args)
	return check_content


class DiaryListHandler(webapp.RequestHandler):
	'''URI: /api/diary'''
	user = None

	@login_required
	def get(self):
		'''List all diary'''
		self.response.headers['Content-type'] = 'application/json'
		self.response.out.write(self.user.get_diary_list())


def diary_validated(handler_method):
	"""A decorator to validate request for /api/diary/YYYYMMDD."""
	def check_request(self, url):
		user = User.get_current_user()
		if user is None:
			self.error(403)
			return
		if not self.check_url(url):
			self.error(400)
			return
		if not user.is_saved() and self.request.method != 'PUT':
			# new user
			self.error(404)
			return
		key_name = user.id + '.' + url
		self.diary = Diary.get_by_key_name(key_name)
		if self.diary is None and self.request.method != 'PUT':
			self.error(404)
			return
		self.user = user
		handler_method(self, url)
	return check_request


class DiaryHandler(webapp.RequestHandler):
	'''URI: /api/diary/YYYYMMDD'''
	user = None
	diary = None
	json = {}

	@diary_validated
	def get(self, url):
		'''get diary meta data and content'''
		self.response.headers['Content-type'] = 'application/json'
		if self.request.get('only_meta') == 'true':
			self.response.out.write(self.diary.to_json(True))
		else:
			self.response.out.write(self.diary.to_json())

	@json_verified
	@diary_validated
	def put(self, url):
		'''create new diary or modify diary'''
		if 'status' in self.json:
			self.diary.set_status(self.json['status'])
		elif self.diary.status == 'trashed':
			self.diary.set_status('private')
		if 'content' in self.json:
			content = self.json['content']
			if self.diary:
				# update diary
				self.diary.set_content(content)
				db.put([self.diary.content, self.diary])
				self.response.set_status(202)
			else:
				# new diary
				self.diary = Diary.create_new(self.user, url, content)
				self.response.set_status(201)
		else:
			self.diary.put()
		self.response.headers['Content-type'] = 'application/json'
		self.response.out.write(self.diary.to_json(True))

	@diary_validated
	def delete(self, url):
		'''delete diary'''
		# TODO: delete all children node
		if self.request.get('delete') == 'true':
			self.diary.remove(True)
		else:
			self.diary.remove()
	
	@staticmethod
	def check_url(date_str):
		'''check the url whether is a valid date format(YYYYMMDD)'''
		if len(date_str) != 8:
			return False
		try:
			time.strptime(date_str, '%Y%m%d')
		except ValueError:
			return False
		return True


class NotesListHandler(webapp.RequestHandler):
	'''URI: /api/notes'''
	user = None
	json = {}

	@login_required
	def get(self):
		'''List all notes'''
		self.response.headers['Content-type'] = 'application/json'
		self.response.out.write(self.user.get_notes_list())

	@json_verified
	@login_required
	def post(self):
		'''create new note no parent not in folder'''
		if ('title' not in self.json or
			'content' not in self.json):
			self.error(400)
			return
		title = self.json['title']
		content = self.json['content']
		note = Note.create_new(self.user, title, content)
		self.response.set_status(201)
		self.response.headers['Content-type'] = 'application/json'
		self.response.out.write(note.to_json(True))


def note_validated(handler_method):
	"""A decorator to validate request for /api/note/id ."""
	def check_request(self, id):
		user = User.get_current_user()
		if user is None:
			self.error(403)
			return
		if not id.isdigit():
			self.error(400)
			return
		if not user.is_saved():
			# new user
			self.error(404)
			return
		key_name = user.id + '.' + id
		self.note = Note.get_by_key_name(key_name)
		if self.note is None:
			self.error(404)
			return
		self.user = user
		handler_method(self, id)
	return check_request



class NoteHandler(webapp.RequestHandler):
	'''URI: /api/note/id'''
	user = None
	note = None
	json = {}

	@note_validated
	def get(self, id):
		'''get note meta data and content'''
		self.response.headers['Content-type'] = 'application/json'
		if self.request.get('only_meta') == 'true':
			self.response.out.write(self.note.to_json(True))
		else:
			self.response.out.write(self.note.to_json())

	@json_verified
	@note_validated
	def post(self, id):
		'''create new child note'''
		if ('title' not in self.json or
			'content' not in self.json):
			self.error(400)
			return
		title = self.json['title']
		content = self.json['content']
		note = Note.create_new(self.user, title, content, id)
		if note:
			self.response.set_status(201)
			self.response.headers['Content-type'] = 'application/json'
			self.response.out.write(note.to_json(True))
		else:
			self.error(400)

	@json_verified
	@note_validated
	def put(self, id):
		'''update note's content or move to another node'''
		if 'title' in self.json:
			self.note.set_title(self.json['title'])
		if 'parent_id' in self.json:
			# move to another folder
			parent_id = self.json['parent_id']
			if not self.note.check_parent_id(parent_id):
				self.error(400)
				return
		if 'status' in self.json:
			self.note.set_status(self.json['status'])
		if 'content' in self.json:
			content = self.json['content']
			self.note.set_content(content)
			db.put([self.note.content, self.note])
		else:
			self.note.put()
		self.response.set_status(202)
		self.response.headers['Content-type'] = 'application/json'
		self.response.out.write(self.note.to_json(True))
	
	@note_validated
	def delete(self, id):
		'''delete note'''
		# TODO: delete all children node
		if self.request.get('delete') == 'true':
			self.note.remove(True)
		else:
			self.note.remove()
	

class SearchHandler(webapp.RequestHandler):
	'''URI: /api/search'''
	@login_required
	def get(self):
		q = self.request.get('q')
		if not q:
			return
		result = self.user.search_contents(q)
		self.response.headers['Content-type'] = 'application/json'
		self.response.out.write(simplejson.dumps(result))


class EmailHandler(webapp.RequestHandler):
	'''URI: /api/email/send'''
	def post(self):
		self.response.out.write('email handler')


application = webapp.WSGIApplication([(r'/api/diary', DiaryListHandler),
	                                  (r'/api/diary/(.*)', DiaryHandler),
									  (r'/api/notes', NotesListHandler),
									  (r'/api/note/(.*)', NoteHandler),
									  (r'/api/search', SearchHandler),
									  (r'/api/email/send', EmailHandler)
									 ],
									 debug=True)

def main():
	run_wsgi_app(application)

if __name__ == '__main__':
	main()
