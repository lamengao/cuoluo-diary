#!/usr/bin/env python
# -*- coding: utf-8 -*-
#import logging

from google.appengine.api import namespace_manager
from google.appengine.ext.mapreduce import operation as op

from models import Note

def get_note_parents(note):
	if note.parent_id:
		parent_key_name = note.owner.id + '.' + note.parent_id
		parent_note = Note.get_by_key_name(parent_key_name)
		if not parent_note:
			return []
		parent_parents = get_note_parents(parent_note)
		if not parent_note.parent_id:
			parent_note_path = '/' + parent_note.id
		else:
			_p = '/' + parent_note.parent_id
			for parent_parent in parent_parents:
				if parent_parent.endswith(_p):
					parent_note_path = parent_parent + '/' + parent_note.id
		return parent_parents + [parent_note_path]
	else:
		return []

def update_note_parents(entity):
	"""Update note parents property"""
	namespace = namespace_manager.get_namespace()
	if namespace != 'newyear':
		namespace_manager.set_namespace('newyear')
	entity.parents = get_note_parents(entity)
	yield op.db.Put(entity)
