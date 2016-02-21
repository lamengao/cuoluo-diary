/**
 * @fileoverview Notes section menu button.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.NotesSectionPopupMenu');

goog.require('cld.SectionPopupMenu');

/**
 * Notes Section menu button
 * @param {cld.App} app the parent event target.
 * @param {cld.ui.NotesTreeControl} tree The tree control.
 * @constructor
 * @extends {cld.SectionPopupMenu}
 */
cld.NotesSectionPopupMenu = function(app, tree) {
  goog.base(this, app, 'notes');

  this.setTree(tree);
  this.attach();
};
goog.inherits(cld.NotesSectionPopupMenu, cld.SectionPopupMenu);

/**
 * Refresh tree, will be override in subclass.
 */
cld.NotesSectionPopupMenu.prototype.refresh = function() {
};
