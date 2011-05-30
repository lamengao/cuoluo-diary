/**
 * @fileoverview Utilities for DOM and UI.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.ui.utils');

goog.require('goog.userAgent');


cld.ui.utils.HAS_CSS3_GRADIENT =
  goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.2') ||
  goog.userAgent.OPERA && goog.userAgent.isVersion('11.10') ||
  goog.userAgent.WEBKIT && goog.userAgent.isVersion('532.1');

/**
 * Return the better button renderer.
 * @param {boolean=} isMenu whether return menu button renderer.
 * @return {goog.ui.ButtonRenderer} renderer.
 */
cld.ui.utils.getButtonRenderer = function(isMenu) {
  if (cld.ui.utils.HAS_CSS3_GRADIENT) {
    if (isMenu) {
      return goog.ui.Css3MenuButtonRenderer.getInstance();
    } else {
      return goog.ui.Css3ButtonRenderer.getInstance();
    }
  } else {
    if (isMenu) {
      return goog.ui.ImagelessMenuButtonRenderer.getInstance();
    } else {
      return goog.ui.ImagelessButtonRenderer.getInstance();
    }
  }
};

/**
 * Get element height by element id.
 * @param {string} id the element id.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @return {number} height.
 */
cld.ui.utils.getHeight = function(id, opt_domHelper) {
  var dom = opt_domHelper || goog.dom.getDomHelper();
  return goog.style.getSize(dom.getElement(id)).height;
};
