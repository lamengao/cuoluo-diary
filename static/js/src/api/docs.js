/**
 * @fileoverview base api doc class.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.api.Docs');
goog.provide('cld.api.Docs.EventType');

goog.require('goog.events');
goog.require('goog.net.XhrIo');


/**
 * diary and notes api base class.
 * @param {goog.events.EventTarget=} et the parent event target.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.api.Docs = function(et) {
  goog.events.EventTarget.call(this);
  if (et) {
    this.setParentEventTarget(et);
  }

  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handle = new goog.events.EventHandler(this);
  /** @type {Array} */
  this.completeEventTypes = [
      goog.net.EventType.SUCCESS,
      goog.net.EventType.ERROR,
      goog.net.EventType.TIMEOUT
  ];
};
goog.inherits(cld.api.Docs, goog.events.EventTarget);

/**
 * Base api url
 * @type {string}
 */
cld.api.Docs.BASE_URL = '/api';

/** @type {Object} */
cld.api.Docs.POST_HEADER = {'Content-Type': 'application/json'};

/**
 * Create a new XhrIo and listen event and bind the callback.
 * @param {Function=} onSuccess Success callback.
 * @param {Function=} onError Error callback.
 * @param {Function=} onTimeout timeout callback.
 * @return {goog.net.XhrIo} XhrIo.
 */
cld.api.Docs.prototype.newXhrIo = function(onSuccess, onError, onTimeout) {
  var xhr = new goog.net.XhrIo();
  xhr.setTimeoutInterval(10000);
  this.handle.listenOnce(xhr, this.completeEventTypes, function(e) {
    var xhr = /** @type {goog.net.XhrIo} */ (e.target);
    if (e.type == goog.net.EventType.SUCCESS) {
      if (xhr.getResponseText()) {
        //this.lastResponseJson = xhr.getResponseJson();
        var data = goog.json.unsafeParse(xhr.getResponseText());
        if (goog.isDef(onSuccess)) {
          onSuccess(data);
        }
      }
    } else if (e.type == goog.net.EventType.ERROR) {
      if (goog.isDef(onError)) {
        onError();
      }
    } else if (e.type == goog.net.EventType.TIMEOUT) {
      if (goog.isDef(onTimeout)) {
        onTimeout();
      }
    }
    xhr.dispose();
  });
  return xhr;
};

/**
 * Get docs list.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} url Uri to make request to.
 */
cld.api.Docs.prototype.list = function(xhr, url) {
  xhr.send(url);
};

/**
 * Get doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} url Uri to make request to.
 */
cld.api.Docs.prototype.get = function(xhr, url) {
  xhr.send(url);
};

/**
 * Create a new doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} url Uri to make request to.
 * @param {string} json string POST/PUT data.
 * @param {string=} opt_method Send method, default: POST.
 */
cld.api.Docs.prototype.insert = function(xhr, url, json, opt_method) {
  var method = goog.isDef(opt_method) ? opt_method : 'POST';
  xhr.send(url, method, json, cld.api.Docs.POST_HEADER);
};

/**
 * Update doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} url Uri to make request to.
 * @param {string} json POST/PUT data.
 */
cld.api.Docs.prototype.update = function(xhr, url, json) {
  xhr.send(url, 'PUT', json, cld.api.Docs.POST_HEADER);
};

/**
 * Trash or delete a doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} url Uri to make request to.
 */
cld.api.Docs.prototype.trash = function(xhr, url) {
  xhr.send(url, 'DELETE');
};

/** @enum {string} */
cld.api.Docs.EventType = {
  LOADING: goog.events.getUniqueId('doc_loading'),
  LOADED: goog.events.getUniqueId('doc_loaded')
};
