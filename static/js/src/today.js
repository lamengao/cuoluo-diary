/**
 * @fileoverview Today button.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.Today');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.ImagelessButtonRenderer');

/**
 * Today button.
 * @param {cld.App} app the parent event target.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Today = function(app, opt_domHelper) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);

  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  this.elContainer = this.dom_.getElement('today');

  this.button = new goog.ui.CustomButton(null,
    cld.ui.utils.getButtonRenderer());
  this.button.decorate(this.elContainer);
  this.button.setCaption('Today');

  goog.events.listen(this.button, goog.ui.Component.EventType.ACTION,
    goog.bind(this.goToday, this));
};
goog.inherits(cld.Today, goog.events.EventTarget);

/**
 * Go to the diary of today.
 * @param {goog.events.Event}} e toggle event.
 */
cld.Today.prototype.goToday = function(e) {
  alert('today');
};
