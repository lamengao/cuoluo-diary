/**
 * @fileoverview notes api class.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.api.Notes');

goog.require('cld.api.Docs');


/**
 * notes api class.
 * @param {goog.events.EventTarget=} et the parent event target.
 * @constructor
 * @extends {cld.api.Docs}
 */
cld.api.Notes = function(et) {
  goog.base(this, et);
};
goog.inherits(cld.api.Notes, cld.api.Docs);

/** @type {string} */
cld.api.Notes.NOTES_URL = cld.api.Docs.BASE_URL + '/notes';

/** @type {string} */
cld.api.Notes.NOTE_URL = cld.api.Docs.BASE_URL + '/note';

/**
 * Get docs list.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @override
 */
cld.api.Notes.prototype.list = function(xhr) {
  goog.base(this, 'list', xhr, cld.api.Notes.NOTES_URL);
};

/**
 * Get doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string|number} id The note id.
 */
cld.api.Notes.prototype.get = function(xhr, id) {
  var url = cld.api.Notes.NOTE_URL + '/' + id;
  goog.base(this, 'get', xhr, url);
};

/**
 * Create a new doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string|number} id The note id.
 * @param {string} title The note title.
 * @param {string} content The note content.
 * @param {string|number=} parentId The note's parent id if any.
 */
cld.api.Notes.prototype.insert = function(xhr, id, title, content, parentId) {
  var url = cld.api.Notes.NOTES_URL;
  if (goog.isDef(parentId)) {
    url = url + '/' + parentId;
  }
  var o = {'title': title, 'content': content};
  goog.base(this, 'insert', xhr, url, goog.json.serialize(o), 'POST');
};

/**
 * Upid doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} id The note id.
 * @param {string=} title The note title.
 * @param {string=} content The note content.
 * @param {string|number=} parentId The note's parent id if any.
 */
cld.api.Notes.prototype.update = function(xhr, id, title, content, parentId) {
  var url = cld.api.Notes.NOTE_URL + '/' + id;
  var o = {};
  if (goog.isDef(title)) {
    o['title'] = title;
  }
  if (goog.isDef(content)) {
    o['content'] = content;
  }
  if (goog.isDef(parentId)) {
    o['parent_id'] = parentId;
  }
  goog.base(this, 'update', xhr, url, goog.json.serialize(o));
};

/**
 * Trash or delete a doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} id The note id.
 * @param {boolean=} isDelete Delete or trash, default is trash.
 */
cld.api.Notes.prototype.trash = function(xhr, id, isDelete) {
  var url = cld.api.Notes.NOTE_URL + '/' + id;
  if (isDelete) {
    url = url + '?delete=true';
  }
  goog.base(this, 'trash', xhr, url);
};

