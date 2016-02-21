/**
 * @fileoverview Diary section menu button.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.DiarySectionPopupMenu');

goog.require('cld.SectionPopupMenu');

/**
 * Diary Section menu button
 * @param {cld.App} app the parent event target.
 * @param {cld.ui.NotesTreeControl} tree The tree control.
 * @constructor
 * @extends {cld.SectionPopupMenu}
 */
cld.DiarySectionPopupMenu = function(app, tree) {
  goog.base(this, app, 'diary');

  this.setTree(tree);
  this.attach();
};
goog.inherits(cld.DiarySectionPopupMenu, cld.SectionPopupMenu);

/**
 * Refresh tree, will be override in subclass.
 */
cld.DiarySectionPopupMenu.prototype.refresh = function() {
};
