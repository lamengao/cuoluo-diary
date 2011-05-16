/**
 * @fileoverview Definition of the cld.ui.TreeControl class.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.ui.TreeControl');

goog.require('goog.ui.tree.TreeControl');


/**
 * This creates a docs TreeControl object.
 * @param {string} html The HTML content of the node label.
 * @param {Object=} opt_config The configuration for the tree. See
 *    goog.ui.tree.TreeControl.DefaultConfig. If not specified, a default config
 *    will be used.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.tree.TreeControl}
 */
cld.ui.TreeControl = function(html, opt_config, opt_domHelper) {
  goog.ui.tree.TreeControl.call(this, html, opt_config, opt_domHelper);
};
goog.inherits(cld.ui.TreeControl, goog.ui.tree.TreeControl);

