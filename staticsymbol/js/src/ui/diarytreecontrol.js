/**
 * @fileoverview Definition of the cld.ui.DiaryTreeControl class.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.ui.DiaryTreeControl');

goog.require('cld.ui.TreeControl');


/**
 * This creates a diary TreeControl object.
 * @param {string} html The HTML content of the node label.
 * @param {Object=} opt_config The configuration for the tree. See
 *    goog.ui.tree.TreeControl.DefaultConfig. If not specified, a default config
 *    will be used.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {cld.ui.TreeControl}
 */
cld.ui.DiaryTreeControl = function(html, opt_config, opt_domHelper) {
  cld.ui.TreeControl.call(this, html, opt_config, opt_domHelper);
};
goog.inherits(cld.ui.DiaryTreeControl, cld.ui.TreeControl);


/**
 * Handles mouse down event.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @protected
 * @override
 */
cld.ui.DiaryTreeControl.prototype.onMouseDown = function(e) {
  var el = e.target;
  if (this.hasChildren()) {
    if (this.isUserCollapsible_) {
      this.toggle();
    }
    return;
  }

  this.select();
  this.updateRow();
};

