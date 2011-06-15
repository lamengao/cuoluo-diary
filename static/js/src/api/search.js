/**
 * @fileoverview search api class.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.api.Search');

goog.require('cld.api.Docs');


/**
 * diary and notes api base class.
 * @param {goog.events.EventTarget=} et the parent event target.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.api.Search = function(et) {
  goog.events.EventTarget.call(this);
  if (et) {
    this.setParentEventTarget(et);
  }
};
goog.inherits(cld.api.Search, goog.events.EventTarget);

/**
 * Base api url
 * @type {string}
 */
cld.api.Search.BASE_URL = '/api/search?q=';

/**
 * search api
 * @param {string} q The query to search.
 * @param {Function=} onSuccess Success callback.
 * @param {Function=} onError Error callback.
 * @param {Function=} onTimeout timeout callback.
 */
cld.api.Search.prototype.search = function(q, onSuccess, onError, onTimeout) {
  var xhr = cld.api.Docs.newXhrIo(onSuccess, onError, onTimeout);
  q = encodeURIComponent(q);
  var url = cld.api.Search.BASE_URL + q;
  xhr.send(url);
};
