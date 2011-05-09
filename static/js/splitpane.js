/**
 * @fileoverview Split Pane class.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.SplitPane');

goog.require('goog.ui.SplitPane');

/**
 * Split Pane
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 */
cld.SplitPane = function(opt_domHelper) {
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();
  /** @type {goog.ui.Component} */
  var lhs = new goog.ui.Component();
  /** @type {goog.ui.Component} */
  var rhs = new goog.ui.Component();

  /**
   * @type {goog.ui.SplitPane}
   */
  this.component = new goog.ui.SplitPane(lhs, rhs,
    goog.ui.SplitPane.Orientation.HORIZONTAL);

  goog.events.listen(this.component, goog.ui.Component.EventType.CHANGE,
    this.handleSplitPaneChange_, false, this);

  this.component.setInitialSize(this.initialSize);
  this.component.setHandleSize(this.handleSize);

  this.component.decorate(this.dom_.getElement('main'));
};

/** type {number} */
cld.SplitPane.prototype.initialSize = 230;
/** type {number} */
cld.SplitPane.prototype.handleSize = 5;

/**
 * adjust UI when split pane changed
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.SplitPane.prototype.handleSplitPaneChange_ = function(e) {
};

/**
 * set splitpane size when window resized
 */
cld.SplitPane.prototype.fitSize = function() {
  var size = this.getSplitPaneFitSize_();
  this.component.setSize(size);
};

/**
 * get cur window fit size for split pane
 * @return {goog.math.Size} the size for set to split pane
 */
cld.SplitPane.prototype.getSplitPaneFitSize_ = function() {
  var viewportElement = goog.style.getClientViewportElement();
  var viewportSize = this.dom_.getViewportSize();
  var height = viewportSize.height - 96;
  return new goog.math.Size(viewportSize.width, height);
};
