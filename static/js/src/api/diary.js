/**
 * @fileoverview diary api class.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.api.Diary');

goog.require('cld.api.Docs');


/**
 * diary api class.
 * @param {goog.events.EventTarget=} et the parent event target.
 * @constructor
 * @extends {cld.api.Docs}
 */
cld.api.Diary = function(et) {
  goog.base(this, et);
};
goog.inherits(cld.api.Diary, cld.api.Docs);

/** @type {string} */
cld.api.Diary.BASE_URL = cld.api.Docs.BASE_URL + '/diary';

/**
 * Get docs list.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @override
 */
cld.api.Diary.prototype.list = function(xhr) {
  goog.base(this, 'list', xhr, cld.api.Diary.BASE_URL);
};

/**
 * Get doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} date The date format like '2011/06/01'.
 */
cld.api.Diary.prototype.get = function(xhr, date) {
  var url = cld.api.Diary.BASE_URL + '/' + date.replace(/\//g, '');
  goog.base(this, 'get', xhr, url);
};

/**
 * Create a new doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} date The date format like '2011/06/01'.
 * @param {string} content The diary content.
 */
cld.api.Diary.prototype.insert = function(xhr, date, content) {
  var url = cld.api.Diary.BASE_URL + '/' + date.replace(/\//g, '');
  var o = {'content': content};
  goog.base(this, 'insert', xhr, url, goog.json.serialize(o), 'PUT');
};

/**
 * Update doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} date The date format like '2011/06/01'.
 * @param {string} content POST/PUT data.
 */
cld.api.Diary.prototype.update = function(xhr, date, content) {
  var url = cld.api.Diary.BASE_URL + '/' + date.replace(/\//g, '');
  var o = {'content': content};
  goog.base(this, 'update', xhr, url, goog.json.serialize(o));
};

/**
 * Trash or delete a doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} date The date format like '2011/06/01'.
 * @param {boolean=} isDelete Delete or trash, default is trash.
 */
cld.api.Diary.prototype.trash = function(xhr, date, isDelete) {
  var url = cld.api.Diary.BASE_URL + '/' + date.replace(/\//g, '');
  if (isDelete) {
    url = url + '?delete=true';
  }
  goog.base(this, 'trash', xhr, url);
};

