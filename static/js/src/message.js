/**
 * @fileoverview Display message for user.
 *
 * @author lamengao@gmail.com (Lamengao)
 */
goog.provide('cld.message');

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
  goog.dom.classes.add(cld.message.loadingElement, 'hidden');
};

/**
 * Show message.
 * @param {string} msg The display message.
 * @param {number=} opt_timeout After timeout second,
 * the msg will be disappear,if timeout = 0,
 * message wouldn't be disappear.
 */
cld.message.show = function(msg, opt_timeout) {
  var el = cld.message.msgElement;
  goog.dom.setTextContent(el, msg);
  var width = goog.style.getSize(el).width;
  el.style.marginLeft = '-' + (width / 2) + 'px';
  goog.dom.classes.remove(el, 'hidden');
  var timeout = opt_timeout || 0;
  if (timeout) {
    setTimeout(function() {
      cld.message.hidden();
    }, timeout * 1000);
  }
};

/**
 * hidden message.
 */
cld.message.hidden = function() {
  goog.dom.classes.add(cld.message.msgElement, 'hidden');
};

/** @enum {string} */
cld.message.TEXT = {
  LOADING: 'Loading...',
  NODE_NOT_FOUND: 'The document that you requested no longer exists.'
};
