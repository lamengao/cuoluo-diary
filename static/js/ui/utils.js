/**
 * @fileoverview Utilities for DOM and UI.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.ui.utils');

goog.require('goog.userAgent');

/**
 * If browser support CSS3 gradient return true, else return false.
 * @return {boolean} boolean.
 */
cld.ui.utils.canUseCSS3Button = function() {
  //if (goog.userAgent.GECKO || goog.userAgent.WEBKIT || goog.userAgent.OPERA) {
  if (goog.userAgent.GECKO || goog.userAgent.WEBKIT) {
    return true;
  } else {
    return false;
  }
};

/**
 * Return the better button renderer.
 * @param {boolean=} isMenu whether return menu button renderer.
 * @return {goog.ui.ButtonRenderer} renderer.
 */
cld.ui.utils.getButtonRenderer = function(isMenu) {
  if (cld.ui.utils.canUseCSS3Button()) {
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
