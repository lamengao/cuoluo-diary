/**
 * @fileoverview base api doc class.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.api.Docs');
goog.provide('cld.api.Docs.EventType');

goog.require('goog.array');
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
cld.api.Docs.newXhrIo = function(onSuccess, onError, onTimeout) {
  var xhr = new goog.net.XhrIo();
  xhr.setTimeoutInterval(20000);
  var successStatusCode = [200, 201, 202, 204, 304];
  goog.events.listenOnce(xhr, goog.net.EventType.COMPLETE, function(e) {
    var xhr = /** @type {goog.net.XhrIo} */ (e.target);
    if (goog.array.contains(successStatusCode, xhr.getStatus())) {
      // Success!
      if (xhr.getResponseText()) {
        //this.lastResponseJson = xhr.getResponseJson();
        var data = goog.json.unsafeParse(xhr.getResponseText());
        if (goog.isDef(onSuccess)) {
          onSuccess(data);
        }
      } else {
        if (goog.isDef(onSuccess)) {
          onSuccess();
        }
      }
    } else if (xhr.getLastErrorCode() === goog.net.ErrorCode.TIMEOUT) {
      // Timeout!
      if (goog.isDef(onTimeout)) {
        onTimeout();
      } else if (goog.isDef(onError)) {
        onError(e);
      }
    } else if (goog.isDef(onError)) {
      // Some other error occurred.
      onError(e);
    }
    xhr.dispose();
  });

  return xhr;
};

/**
 * Create a new XhrIo and listen event and bind the callback.
 * @param {Function=} onSuccess Success callback.
 * @param {Function=} onError Error callback.
 * @param {Function=} onTimeout timeout callback.
 * @return {goog.net.XhrIo} XhrIo.
 */
cld.api.Docs.prototype.newXhrIo = function(onSuccess, onError, onTimeout) {
  if (!goog.isDef(onError)) {
    onError = goog.bind(function(e) {
        var xhr = /** @type {goog.net.XhrIo} */ (e.target);
        if (xhr.getStatus() == 403) {
          // the current user is not logged in.
          this.dispatchEvent(cld.api.Docs.EventType.NOT_LOGGED_IN);
        } else {
          this.dispatchEvent(cld.api.Docs.EventType.ERROR);
        }
    }, this);
  }
  if (!goog.isDef(onTimeout)) {
    onTimeout = goog.bind(function(e) {
        this.dispatchEvent(cld.api.Docs.EventType.ERROR_TIMEOUT);
    }, this);
  }
  return cld.api.Docs.newXhrIo(onSuccess, onError, onTimeout);
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

/**
 * Restore deleted doc.
 * @param {goog.net.XhrIo} xhr The listened events xhr.
 * @param {string} url Uri to make request to.
 */
cld.api.Docs.prototype.restore = function(xhr, url) {
  var json = {};
  json['status'] = 'private';
  xhr.send(url, 'PUT', goog.json.serialize(json));
};

/** @enum {string} */
cld.api.Docs.EventType = {
  LOADING: goog.events.getUniqueId('doc_loading'),
  LOADED: goog.events.getUniqueId('doc_loaded'),
  ERROR_TIMEOUT: goog.events.getUniqueId('error_timeout'),
  ERROR: goog.events.getUniqueId('error'),
  NOT_LOGGED_IN: goog.events.getUniqueId('not_logged_in')
};
