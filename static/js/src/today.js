/**
 * @fileoverview Today button.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.Today');
goog.provide('cld.Today.EventType');

goog.require('cld.DiaryTree');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.ImagelessButtonRenderer');

/**
 * Today button.
 * @param {cld.App} app the parent event target.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Today = function(app) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);

  this.dom_ = app.getDomHelper();

  this.elContainer = this.dom_.getElement('today');

  this.button = new goog.ui.CustomButton(null,
    cld.ui.utils.getButtonRenderer());
  this.button.decorate(this.elContainer);
  this.button.setCaption('Today');

  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handle = new goog.events.EventHandler(this);

  this.history = app.history;

  this.handle.
    listen(this.history, goog.history.EventType.NAVIGATE, this.isToday).
    listen(this.button, goog.ui.Component.EventType.ACTION,
      goog.bind(this.gotoToday, this));

};
goog.inherits(cld.Today, goog.events.EventTarget);

/**
 * Check if today, and change the today button.
 * @param {goog.events.Event} e toggle event.
 * @return {boolean} is today?
 */
cld.Today.prototype.isToday = function(e) {
  var token = e.token;
  if (token == 'diary/' + cld.DiaryTree.getTodayDate()) {
    this.button.setEnabled(false);
    return true;
  } else {
    this.button.setEnabled(true);
    return false;
  }
};

/**
 * Go to the diary of today.
 * @param {goog.events.Event} e toggle event.
 */
cld.Today.prototype.gotoToday = function(e) {
  this.dispatchEvent(cld.Today.EventType.GOTO_TODAY);
};

/** @enum {string} */
cld.Today.EventType = {
  GOTO_TODAY: goog.events.getUniqueId('goto_today')
};
