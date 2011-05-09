/**
 * @fileoverview Zippy.
 *
 * @author lamengao@gmail.com (Lamengao)
 */
goog.provide('cld.Zippy');

goog.require('goog.ui.Zippy');

/**
 * Zippy constructor
 * @param {string} header that is zippy header id.
 * @param {string} content that is zippy content id.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 */
cld.Zippy = function(header, content, opt_domHelper) {
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();
  this.elHeader = this.dom_.getElement(header);
  this.elContent = this.dom_.getElement(content);

  goog.style.setUnselectable(this.elHeader, true, true);
  goog.style.setUnselectable(this.elContent, true, true);

  this.resetContentHeight();
  this.zippy = new goog.ui.Zippy(this.elHeader, this.elContent);
  cld.Zippy.list[cld.Zippy.list.length] = this;

  goog.events.listen(this.zippy, goog.ui.Zippy.Events.TOGGLE,
    this.handleZippyToggle_, false, this);
};

/** @type {Array.<goog.ui.Zippy>} */
cld.Zippy.list = [];

/**
 * Set content height.
 * @param {number} height to set.
 * @private
 */
cld.Zippy.prototype.setContentHeight_ = function(height) {
  goog.style.setHeight(this.elContent, height);
};

/**
 * Set content fit height.
 */
cld.Zippy.prototype.resetContentHeight = function() {
  var height = this.getFitHeight_();
  this.setContentHeight_(height);
};

/**
 * Return fit content height to set.
 * @return {number} to set.
 * @private
 */
cld.Zippy.prototype.getFitHeight_ = function() {
  var splitpaneHeight = this.dom_.getViewportSize().height - 96;
  return splitpaneHeight - 30 - 25 - 21 - 21;
};

/**
 * Only one zippy can expande.
 * @param {goog.events.Event}} e toggle event.
 * @private
 */
cld.Zippy.prototype.handleZippyToggle_ = function(e) {
  if (e.expanded) {
    goog.array.forEach(cld.Zippy.list, function(zippy) {
      if (this !== zippy) {
        zippy.zippy.setExpanded(false);
      }
    }, this);
  }
};
