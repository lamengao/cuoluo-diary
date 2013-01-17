#!/usr/bin/env python
# -*- coding: utf-8 -*-
#import logging
import cgi
#import os
import re
import random
#import logging

from google.appengine.ext import db
from google.appengine.api import users
from django.utils import simplejson as json

#from html2text import html2text


def html_to_text(html):
    if not html:
        return ''
    html = html.strip()
    if not html:
        return ''
    br = r'<br ?/?>'
    html = re.sub(br, '\n', html)
    pattern = r"""<("[^"]*"|'[^']*'|[^'">])*>"""
    # TODO decode html entity
    return re.sub(pattern, '', html)


def get_random_str(length):
    allowed_chars = 'abcdefghijklmnopqrstuvwxyz'
    allowed_chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return ''.join([random.choice(allowed_chars) for i in range(length)])


class User(db.Model):
    """key name: user_id"""
    GAccount = db.UserProperty(auto_current_user_add=True)
    created = db.DateTimeProperty(auto_now_add=True)
    last_signin = db.DateTimeProperty(auto_now=True)
    timezone = db.StringProperty()
    date_format = db.StringProperty(default="YMD",
                                    choices=set(["MDY", "DMY", "YMD"]))

    @property
    def id(self):
        # id is a string
        return self.key().name()

    @property
    def email(self):
        return self.GAccount.email()

    @staticmethod
    def get_current_user():
        user = users.get_current_user()
        if user is None:
            return None
        #if 'yibing@cuoluo.com' == user.email():
            #user_id = '115680706968923119637'
        #elif 'xuyan@cuoluo.com' == user.email():
            #user_id = '108038034624975513101'
        #else:
        user_id = user.user_id()
        u = User.get_by_key_name(user_id)
        if u is None:
            # notice: the new user **NOT** insert(put) to datastore here
            u = User(key_name=user_id)
        return u

    def search_contents(self, q=''):
        result = {}
        result['diaries'] = []
        result['notes'] = []
        if q == '':
            return result
        q_lower = q.lower()
        for content in self.contents:
            if content.text and content.text.lower().find(q_lower) != -1:
                if content.type == 'diary':
                    result['diaries'].append(content.doc_key)
                elif content.type == 'note':
                    result['notes'].append(content.doc_key)
        return result

    def get_diary_list(self):
        """return diary list json data"""
        if not self.is_saved():
            # new user
            return '[]'
        diary_json_list = [diary.to_json(True) for diary in self.diary
                              if diary.status != 'trashed']
        return '[' + ','.join(diary_json_list) + ']'

    def get_notes_list(self):
        """return notes list json data"""
        if not self.is_saved():
            # new user
            return '[]'
        notes_json_list = [note.to_json(True) for note in self.notes
                                              if note.status != 'trashed']
        return '[' + ','.join(notes_json_list) + ']'


class Content(db.Model):
    '''key name: {user_id}.{type}.{key}'''
    owner = db.ReferenceProperty(User, collection_name='contents')
    html = db.TextProperty()
    text = db.TextProperty()
    type = db.StringProperty(default="diary",
                               choices=set(["diary", "note"]))
    @property
    def doc_key(self):
        return self.key().name().split('.')[2]


class Diary(db.Model):
    '''key name: {user_id}.{YYYYMMdd}'''
    owner = db.ReferenceProperty(User, collection_name='diary')
    title = db.StringProperty()
    content = db.ReferenceProperty(Content, collection_name='diary')
    created = db.DateTimeProperty(auto_now_add=True)
    last_modified = db.DateTimeProperty(auto_now=True)
    status = db.StringProperty(default="private",
                               choices=set(["private", "public", "trashed"]))

    @property
    def id(self):
        return self.key().name().split('.')[1]

    def set_title(self, date_str):
        self.title = date_str
        return self

    def set_status(self, status):
        if status in ["private", "public", "trashed"]:
            self.status = status
        return self

    def set_content(self, content):
        '''set rich text and auto fill plain text'''
        if not self.content:
            key_name = self.owner.id + '.diary.' + self.id
            self.content = Content(key_name=key_name, owner=self.owner)
        self.content.html = content
        self.content.text = html_to_text(content)
        return self

    def remove_children(self):
        return

    def remove(self, delete=False):
        if delete:
            db.delete([self.content, self])
        elif self.status != 'trashed':
            self.status = 'trashed'
            self.put()

    def to_json(self, only_meta=False):
        diary = {}
        diary['date'] = '/'.join([self.title[0:4],
                                  self.title[4:6],
                                  self.title[6:8]])
        diary['created'] = self.created.isoformat() + '+00:00'
        diary['last_modified'] = self.last_modified.isoformat() + '+00:00'
        diary['status'] = self.status
        if not only_meta:
            diary['content'] = self.content.html
        return json.dumps(diary)

    @staticmethod
    def create_new(user, date_str, content):
        key_name = user.id + '.' + date_str
        diary = Diary(key_name=key_name, owner=user)
        diary.set_title(date_str).set_content(content)
        if user.is_saved():
            db.put([diary.content, diary])
        else:
            Counter.update_counter('users')
            db.put([user, diary.content, diary])
        return diary


class Note(db.Model):
    '''key name: {user_id}.{hash}'''
    owner = db.ReferenceProperty(User, collection_name='notes')
    title = db.StringProperty()
    content = db.ReferenceProperty(Content, collection_name='note')
    created = db.DateTimeProperty(auto_now_add=True)
    last_modified = db.DateTimeProperty(auto_now=True)
    parent_id = db.StringProperty()
    parents = db.StringListProperty()
    status = db.StringProperty(default="private",
                               choices=set(["private", "public", "trashed"]))

    @property
    def id(self):
        return self.key().name().split('.')[1]

    @property
    def path(self):
        if not self.parent_id:
            return '/' + self.id
        _p = '/' + self.parent_id
        for parent in self.parents:
            if parent.endswith(_p):
                return parent + '/' + self.id

    def set_title(self, title):
        #self.title = title.strip()
        self.title = title
        return self

    def set_status(self, status):
        if status in ["private", "public", "trashed"]:
            self.status = status
        return self

    def set_content(self, content):
        '''set rich text and auto fill plain text'''
        if not self.content:
            key_name = self.owner.id + '.note.' + self.id
            self.content = Content(key_name=key_name, owner=self.owner)
            self.content.type = 'note'
        self.content.html = content
        self.content.text = html_to_text(content)
        return self

    @staticmethod
    def remove_children(user_id, note_path, delete=False):
        user_key = db.Key.from_path('User', user_id)
        q = Note.gql("WHERE owner = :u AND parents = :path",
                     u=user_key, path=note_path)
        if q.count() == 0:
            return
        #TODO: optimize here
        for child in q:
            child.remove(delete, False)

    def remove(self, delete=False, remove_children=True):
        if delete:
            self.delete()
        elif self.status != 'trashed':
            self.status = 'trashed'
            self.put()
        if remove_children:
            # TODO: remove children in taskqueue
            Note.remove_children(self.owner.id, self.path, delete)

    def to_json(self, only_meta=False):
        note = {}
        note['id'] = self.id
        note['title'] = cgi.escape(self.title)
        note['created'] = self.created.isoformat() + '+00:00'
        note['last_modified'] = self.last_modified.isoformat() + '+00:00'
        if self.parent_id:
            note['parent_id'] = self.parent_id
        else:
            note['parent_id'] = 0
        note['status'] = self.status
        if not only_meta:
            note['content'] = self.content.html
        return json.dumps(note)

    def check_parent_id(self, parent_id):
        """if parent_id is valid, 
        auto set the parent_id and parents fields
        """
        if not parent_id:
            self.parent_id = ''
            self.parents = []
            return True
        if self.id == parent_id:
            return False
        key_name = self.owner.id + '.' + parent_id
        parent_note = Note.get_by_key_name(key_name)
        if parent_note is None or parent_note.status == 'trashed':
            return False
        if self.is_saved() and self.path in parent_note.parents:
            return False
        self.parent_id = parent_id
        #parent_path = parent_note.path
        #if parent_note.parents:
            #self.parents = parent_note.parents + [parent_path]
        #else:
            #self.parents = [parent_path]
        return True

    @staticmethod
    def create_new(user, title, content, parent_id=None):
        key_name = user.id + '.' + Note.make_hash()
        note = Note(key_name=key_name, owner=user)
        note.set_title(title).set_content(content)
        if parent_id and not note.check_parent_id(parent_id):
            return False
        if user.is_saved():
            db.put([note.content, note])
        else:
            Counter.update_counter('users')
            db.put([user, note.content, note])
        return note

    @staticmethod
    def make_hash():
        return get_random_str(6)


class Counter(db.Model):
    """key name: counter name"""
    count = db.IntegerProperty()
    created = db.DateTimeProperty(auto_now_add=True)
    last_increased = db.DateTimeProperty(auto_now=True)

    @staticmethod
    def update_counter(name, opt='+'):
        counter = Counter.get_by_key_name(name)
        if counter is None:
            counter = Counter(key_name=name);
            counter.count = 1
        else:
            if opt == '+':
                counter.count = counter.count + 1
            elif opt == '-':
                counter.count = counter.count - 1
        counter.put()
        return counter.count
