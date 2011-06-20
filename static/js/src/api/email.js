/**
 * @fileoverview email api class.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.api.Email');

goog.require('cld.api.Docs');


/**
 * send email.
 * @param {goog.events.EventTarget=} et the parent event target.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.api.Email = function(et) {
  goog.events.EventTarget.call(this);
  if (et) {
    this.setParentEventTarget(et);
  }
};
goog.inherits(cld.api.Email, goog.events.EventTarget);

/**
 * Base api url
 * @type {string}
 */
cld.api.Email.BASE_URL = '/api/email';

/**
 * search api
 * @param {string} to The address(es).
 * @param {string} subject The subject.
 * @param {string} body The mail body.
 * @param {Function=} onSuccess Success callback.
 * @param {Function=} onError Error callback.
 * @param {Function=} onTimeout timeout callback.
 */
cld.api.Email.prototype.send = function(to, subject, body,
                                        onSuccess, onError, onTimeout) {
  var xhr = cld.api.Docs.newXhrIo(onSuccess, onError, onTimeout);
  var url = cld.api.Email.BASE_URL;
  var json = {};
  json['to'] = to;
  json['subject'] = subject;
  json['body'] = body;
  xhr.send(url, 'POST', goog.json.serialize(json));
};
