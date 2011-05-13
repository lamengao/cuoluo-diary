/**
 * @fileoverview Create new button.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.Creation');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.CustomButton');
//goog.require('goog.ui.CustomButtonRenderer');
goog.require('goog.ui.Css3ButtonRenderer');

/**
 * Create new.
 * @param {cld.App} app the parent event target.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Creation = function(app, opt_domHelper) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);

  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  this.elContainer = this.dom_.getElement('createnew');
  
  this.button = new goog.ui.CustomButton(null,
    goog.ui.Css3ButtonRenderer.getInstance());
  this.button.decorate(this.elContainer);
  this.button.setCaption('Create new');
};
goog.inherits(cld.Creation, goog.events.EventTarget);
