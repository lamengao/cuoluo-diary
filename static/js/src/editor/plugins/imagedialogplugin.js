/**
 * @fileoverview A plugin for the ImageDialog.
 *
 * @author Lamengao@gmail.com
 */

goog.provide('cld.editor.plugins.ImageDialogPlugin');

goog.require('cld.editor.ImageDialog');
goog.require('goog.editor.Command');
goog.require('goog.editor.plugins.AbstractDialogPlugin');
goog.require('goog.events.EventHandler');
goog.require('goog.functions');
goog.require('goog.ui.editor.AbstractDialog.EventType');


/**
 * A plugin that opens the image dialog.
 * @constructor
 * @extends {goog.editor.plugins.AbstractDialogPlugin}
 */
cld.editor.plugins.ImageDialogPlugin = function() {
  goog.base(this, cld.editor.plugins.ImageDialogPlugin.COMMAND);
};
goog.inherits(cld.editor.plugins.ImageDialogPlugin,
    goog.editor.plugins.AbstractDialogPlugin);

/**
 * Command implemented by the plugin.
 * @type {string}
 */
cld.editor.plugins.ImageDialogPlugin.COMMAND = 'cldImagePluginCommand';

/**
 * Creates a new instance of the dialog and registers a listener for
 * the ok event.
 * @param {goog.dom.DomHelper} dom The dom helper to use to build the dialog.
 * @return {goog.ui.editor.AbstractDialog} The newly created dialog.
 * @override
 * @protected
 */
cld.editor.plugins.ImageDialogPlugin.prototype.createDialog = function(dom) {
  var dialog = new cld.editor.ImageDialog(dom);
  dialog.addEventListener(goog.ui.editor.AbstractDialog.EventType.OK,
    this.handleOK_, false, this);
  return dialog;
};

/**
 * Handle the OK event from the dialog.
 * Inserts the image with the src provided by the user.
 * @param {goog.events.Event} e The OK event.
 * @private
 */
cld.editor.plugins.ImageDialogPlugin.prototype.handleOk_ = function(e) {
  this.fieldObject.dispatchBeforeChange();
  var image = this.getFieldDomHelper().createElement(goog.dom.TagName.IMG);
  image.src = e.url;

  this.restoreOriginalSelection();
  var range = this.fieldObject.getRange();
  image = range.replaceContentsWithNode(image);

  this.fieldObject.dispatchChange();

  goog.editor.range.placeCursorNextTo(image, false);

  this.fieldObject.dispatchSelectionChangeEvent();
};
