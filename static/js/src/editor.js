/**
 * @fileoverview Doc rich editor.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.Editor');

goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
//goog.require('goog.editor.SeamlessField');
goog.require('goog.editor.plugins.BasicTextFormatter');
goog.require('goog.editor.plugins.EnterHandler');
goog.require('goog.editor.plugins.HeaderFormatter');
goog.require('goog.editor.plugins.LinkBubble');
goog.require('goog.editor.plugins.LinkDialogPlugin');
goog.require('goog.editor.plugins.ListTabHandler');
//goog.require('goog.editor.plugins.LoremIpsum');
goog.require('goog.editor.plugins.RemoveFormatting');
goog.require('goog.editor.plugins.SpacesTabHandler');
//goog.require('goog.editor.plugins.UndoRedo');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.editor.DefaultToolbar');
goog.require('goog.ui.editor.ToolbarController');

/**
 * annotation
 * @param {string} toolbar The toolbar element id.
 * @param {string} editorArea The editor area element id.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Editor = function(toolbar, editorArea) {
  goog.events.EventTarget.call(this);

  this.field = new goog.editor.Field(editorArea);
  this.registerPlugins();

  this.toolbar = goog.ui.editor.DefaultToolbar.makeToolbar(cld.Editor.buttons,
    /** @type {!Element} */ (goog.dom.getElement(toolbar)));

  // Hook the toolbar into the field.
  this.toolbarController =
    new goog.ui.editor.ToolbarController(this.field, this.toolbar);
};
goog.inherits(cld.Editor, goog.events.EventTarget);

/**
 * Register plugins for editor field.
 */
cld.Editor.prototype.registerPlugins = function() {
  this.field.registerPlugin(new goog.editor.plugins.BasicTextFormatter());
  this.field.registerPlugin(new goog.editor.plugins.RemoveFormatting());
  //this.field.registerPlugin(new goog.editor.plugins.UndoRedo());
  this.field.registerPlugin(new goog.editor.plugins.ListTabHandler());
  this.field.registerPlugin(new goog.editor.plugins.SpacesTabHandler());
  this.field.registerPlugin(new goog.editor.plugins.EnterHandler());
  this.field.registerPlugin(new goog.editor.plugins.HeaderFormatter());
  this.field.registerPlugin(new goog.editor.plugins.LinkDialogPlugin());
  this.field.registerPlugin(new goog.editor.plugins.LinkBubble());
};

/**
 * Specify the buttons to add to the toolbar, using built in default buttons.
 * @type {!Array}
 */
cld.Editor.buttons = [
  goog.editor.Command.BOLD,
  goog.editor.Command.ITALIC,
  goog.editor.Command.UNDERLINE,
  goog.editor.Command.FONT_COLOR,
  goog.editor.Command.BACKGROUND_COLOR,
  goog.editor.Command.FONT_FACE,
  goog.editor.Command.FONT_SIZE,
  goog.editor.Command.LINK,
  //goog.editor.Command.UNDO,
  //goog.editor.Command.REDO,
  goog.editor.Command.UNORDERED_LIST,
  goog.editor.Command.ORDERED_LIST,
  goog.editor.Command.INDENT,
  goog.editor.Command.OUTDENT,
  goog.editor.Command.JUSTIFY_LEFT,
  goog.editor.Command.JUSTIFY_CENTER,
  goog.editor.Command.JUSTIFY_RIGHT,
  //goog.editor.Command.SUBSCRIPT,
  //goog.editor.Command.SUPERSCRIPT,
  goog.editor.Command.STRIKE_THROUGH,
  goog.editor.Command.REMOVE_FORMAT
];
