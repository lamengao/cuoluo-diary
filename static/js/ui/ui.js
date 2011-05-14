/**
 * @fileoverview Utilities for DOM and UI.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.ui');

goog.require('goog.userAgent');

/**
 * If browser support CSS3 gradient return true, else return false.
 * @return {boolean} boolean.
 */
cld.ui.canUseCSS3Button = function() {
  if (goog.userAgent.GECKO || goog.userAgent.WEBKIT || goog.userAgent.OPERA) {
    return true;
  } else {
    return false;
  }
};
