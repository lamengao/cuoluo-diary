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
  var config = opt_config || goog.ui.tree.TreeControl.defaultConfig;
  config.cleardotPath = '/images/tree/cleardot.gif';
  goog.ui.tree.TreeControl.call(this, html, config, opt_domHelper);
};
goog.inherits(cld.ui.TreeControl, goog.ui.tree.TreeControl);

/**
 * Map of nodes in existence.
 * @type {Object}
 * @protected
 */
cld.ui.TreeControl.allNodes = {};

/**
 * Handles mouse events.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @private
 */
cld.ui.TreeControl.prototype.handleMouseEvent_ = function(e) {
  this.logger_.fine('Received event ' + e.type);
  var node = this.getNodeFromEvent_(e);
  if (node) {
    switch (e.type) {
      case goog.events.EventType.MOUSEDOWN:
        goog.bind(this.onMouseDown, node)(e);
        break;
      case goog.events.EventType.CLICK:
        goog.bind(this.onClick_, node)(e);
        break;
      case goog.events.EventType.DBLCLICK:
        goog.bind(this.onDoubleClick_, node)(e);
        break;
    }
  }
};

/**
 * Handles a double click event.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @protected
 * @suppress {underscore}
 * @override
 */
cld.ui.TreeControl.prototype.onDoubleClick_ = function(e) {
};
