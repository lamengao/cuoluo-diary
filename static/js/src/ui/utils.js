/**
 * @fileoverview Utilities for DOM and UI.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.ui.utils');

goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.Css3MenuButtonRenderer');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.ImagelessButtonRenderer');
goog.require('goog.ui.ImagelessMenuButtonRenderer');
goog.require('goog.ui.LinkButtonRenderer');
goog.require('goog.ui.MenuButton');
goog.require('goog.userAgent');

/**
 * Whether this browser support css3 gradient.
 * @type {boolean}
 */
cld.ui.utils.HAS_CSS3_GRADIENT =
  goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.2') ||
  goog.userAgent.OPERA && goog.userAgent.isVersion('11.10') ||
  goog.userAgent.WEBKIT && goog.userAgent.isVersion('532.1');

//cld.ui.utils.HAS_CSS3_GRADIENT = false;

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
 * Create a new custom button.
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 * structure to display as the button's caption.
 * @param {goog.ui.Menu=} menu Whether create a menu button.
 * @return {goog.ui.Button} The new button.
 */
cld.ui.utils.newButton = function(content, menu) {
  if (menu) {
    return new goog.ui.MenuButton(content, menu,
      cld.ui.utils.getButtonRenderer(true));
  } else {
    return new goog.ui.CustomButton(content, cld.ui.utils.getButtonRenderer());
  }
};

/**
 * Create a new link button.
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 * structure to display as the button's caption.
 * @return {goog.ui.Button} The new button.
 */
cld.ui.utils.newLinkButton = function(content) {
  return new goog.ui.Button(content,
    goog.ui.LinkButtonRenderer.getInstance());
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

/**
 * Sets the text of the tooltip.
 * @param {Element} el The element to change the title.
 * @param {string} s The tooltip text to set.
 */
cld.ui.utils.setToolTip = function(el, s) {
  if (el) {
    el.title = s;
  }
};

