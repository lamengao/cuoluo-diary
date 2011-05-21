/**
 * @fileoverview Definition of the cld.ui.NotesTreeControl class.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.ui.NotesTreeControl');

goog.require('cld.ui.TreeControl');


/**
 * This creates a notes TreeControl object.
 * @param {string} html The HTML content of the node label.
 * @param {Object=} opt_config The configuration for the tree. See
 *    goog.ui.tree.TreeControl.DefaultConfig. If not specified, a default config
 *    will be used.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {cld.ui.TreeControl}
 */
cld.ui.NotesTreeControl = function(html, opt_config, opt_domHelper) {
  cld.ui.TreeControl.call(this, html, opt_config, opt_domHelper);
};
goog.inherits(cld.ui.NotesTreeControl, cld.ui.TreeControl);


/**
 * Handles mouse down event.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @protected
 * @override
 */
cld.ui.NotesTreeControl.prototype.onMouseDown = function(e) {
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
