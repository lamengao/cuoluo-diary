/**
 * @fileoverview Display message for user.
 *
 * @author lamengao@gmail.com (Lamengao)
 */
goog.provide('cld.message');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.ui.Button');
goog.require('goog.ui.LinkButtonRenderer');


/** @type {Element} */
cld.message.loadingElement = goog.dom.getElement('loadingStatus');

/** @type {Element} */
cld.message.msgElement = goog.dom.getElement('mbox');

/**
 * show loading message.
 * @param {string=} opt_msg The display message.
 */
cld.message.showLoading = function(opt_msg) {
  var msg = opt_msg || cld.message.TEXT.LOADING;
  var el = cld.message.loadingElement;
  goog.dom.setTextContent(el, msg);
  var width = goog.style.getSize(el).width;
  el.style.marginLeft = '-' + (width / 2) + 'px';
  goog.dom.classes.remove(el, 'hidden');
};

/**
 * hidden loading message.
 */
cld.message.hiddenLoading = function() {
  goog.dom.classes.remove(cld.message.loadingElement, 'errormsg');
  goog.dom.classes.add(cld.message.loadingElement, 'hidden');
};

/**
 * Show message not undo action.
 * @param {string} msg The display message.
 * @param {number=} opt_timeout After timeout second,
 * the msg will be disappear,if timeout = 0,
 * message wouldn't be disappear.
 */
cld.message.simpleShow = function(msg, opt_timeout) {
  cld.message.show(msg, false, undefined, opt_timeout);
};

/**
 * Show message.
 * @param {string} msg The display message.
 * @param {boolean=} isResumable Can undo?
 * @param {Function=} undoHandle The undo callback.
 * @param {number=} opt_timeout After timeout second,
 * the msg will be disappear,if timeout = 0,
 * message wouldn't be disappear.
 */
cld.message.show = function(msg, isResumable, undoHandle, opt_timeout) {
  cld.message.hidden();
  var el = cld.message.msgElement;
  var textSpan = goog.dom.getElementByClass('text', el);
  goog.dom.setTextContent(textSpan, msg);
  var width = goog.style.getSize(el).width;
  el.style.marginLeft = '-' + (width / 2) + 'px';
  goog.dom.classes.remove(el, 'hidden');
  if (isResumable && goog.isFunction(undoHandle)) {
    var undoLink = cld.message.getUndoLink();
    goog.style.showElement(undoLink.getElement(), true);
    cld.message.undoLinkKey = goog.events.listenOnce(undoLink,
      goog.ui.Component.EventType.ACTION, undoHandle);
  }
  var timeout = opt_timeout || 0;
  if (timeout) {
    // TODO: use goog.async.Delay
    setTimeout(function() {
      cld.message.hidden();
    }, timeout * 1000);
  }
};

/**
 * Create the undo link button.
 */
cld.message.createUndoLink = function() {
  var lb = cld.message.undoLink = new goog.ui.Button('Undo',
    goog.ui.LinkButtonRenderer.getInstance());
  lb.render(cld.message.msgElement);
  var el = lb.getElement();
  el.id = 'undolink';
};

/**
 * return the single undo link button.
 * @return {goog.ui.Button} the undo link.
 */
cld.message.getUndoLink = function() {
  if (cld.message.undoLink) {
    return cld.message.undoLink;
  }
  cld.message.createUndoLink();
  return cld.message.undoLink;
};

/**
 * hidden message.
 */
cld.message.hidden = function() {
  if (cld.message.undoLinkKey) {
    goog.events.unlistenByKey(cld.message.undoLinkKey);
    goog.style.showElement(cld.message.undoLink.getElement(), false);
  }
  goog.dom.classes.add(cld.message.msgElement, 'hidden');
};

/**
 * show error message.
 * @param {string} type The error type.
 * @param {string=} opt_msg The error msg.
 */
cld.message.error = function(type, opt_msg) {
  cld.message.hiddenLoading();
  var msg = cld.message.TEXT.SERVER_ERROR;
  if (type === 'error') {
    msg = cld.message.TEXT.API_ERROR;
  } else if (type === 'timeout') {
    msg = cld.message.TEXT.API_TIMEOUT;
  }
  goog.dom.classes.add(cld.message.loadingElement, 'errormsg');
  cld.message.showLoading(msg);
  setTimeout(function() {
    cld.message.hiddenLoading();
  }, 8 * 1000);
};

/** @enum {string} */
cld.message.TEXT = {
  LOADING: 'Loading...',
  DIARY_DELETED: 'The diary has been moved to the trash',
  NOTE_DELETED: 'The note has been moved to the trash',
  NODE_NOT_FOUND: 'The document that you requested no longer exists.',
  SERVER_ERROR: 'The server encountered an error. Please try again later.',
  API_ERROR: 'Oops...an error occurred. Please try again in a few seconds.',
  API_TIMEOUT: 'Unable to reach Cuoluo Diary. ' +
               'Please check your internet connection.'
};
