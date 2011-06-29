/**
 * @fileoverview Doc rich editor.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.Editor');

//goog.require('cld.editor.plugins.ManualSave');
goog.require('goog.Timer');
goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
//goog.require('goog.editor.SeamlessField');
goog.require('goog.editor.plugins.BasicTextFormatter');
goog.require('goog.editor.plugins.EnterHandler');
//goog.require('goog.editor.plugins.HeaderFormatter');
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

  goog.editor.Field.DELAYED_CHANGE_FREQUENCY = 100;
  this.field = new goog.editor.Field(editorArea);
  this.field.setParentEventTarget(this);
  //this.field = new goog.editor.SeamlessField(editorArea);
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
  //this.field.registerPlugin(new cld.editor.plugins.ManualSave());
  this.field.registerPlugin(new goog.editor.plugins.BasicTextFormatter());
  this.field.registerPlugin(new goog.editor.plugins.RemoveFormatting());
  //this.field.registerPlugin(new goog.editor.plugins.UndoRedo());
  this.field.registerPlugin(new goog.editor.plugins.ListTabHandler());
  this.field.registerPlugin(new goog.editor.plugins.SpacesTabHandler());
  this.field.registerPlugin(new goog.editor.plugins.EnterHandler());
  //this.field.registerPlugin(new goog.editor.plugins.HeaderFormatter());
  this.field.registerPlugin(new goog.editor.plugins.LinkDialogPlugin());
  this.field.registerPlugin(new goog.editor.plugins.LinkBubble());

};

/**
 * Set editor field initial style.
 * @private
 */
cld.Editor.prototype.setFieldInitStyle_ = function() {
  var field = this.field.getElement();
  if (field) {
    var style = {'font-size': '15px', 'font-family': 'Arial,Sans-serif'};
    goog.style.setStyle(field, style);
  }
};

/**
 * Make field editable and set initial style.
 */
cld.Editor.prototype.makeEditable = function() {
  if (this.field.isUneditable()) {
    this.field.makeEditable();
  }
  this.setFieldInitStyle_();
};

/**
 * Make field uneditable.
 */
cld.Editor.prototype.makeUneditable = function() {
  if (!this.field.isUneditable()) {
    this.field.makeUneditable();
  }
};

/**
 * Start listen the change event.
 * @param {Function} handlerChange The change callback.
 */
cld.Editor.prototype.listenChangeEvent = function(handlerChange) {
  if (this.isListeningChangeEvent_) {
    return;
  }
  this.field.clearDelayedChange();

  if (goog.userAgent.WEBKIT || goog.userAgent.OPERA) {
  //if (goog.userAgent.OPERA) {
    if (this.delayedChangeTimer) {
      this.delayedChangeTimer.dispose();
    }
    this.delayedChangeTimer =
      new goog.Timer(goog.editor.Field.DELAYED_CHANGE_FREQUENCY);
    this.delayedChangeTimer.start();
    this.lastFieldContents = this.field.getCleanContents();
    this.isListeningChangeEvent_ =
      goog.events.listen(this.delayedChangeTimer, goog.Timer.TICK,
        function(e) {
          if (this.lastFieldContents == this.field.getCleanContents()) {
            return;
          }
          this.lastFieldContents = this.field.getCleanContents();
          handlerChange();
        }, false, this);
  } else {
    this.isListeningChangeEvent_ =
      goog.events.listen(this.field,
        goog.editor.Field.EventType.DELAYEDCHANGE,
        function(e) {
          handlerChange();
        }, false, this);
  }
};

/**
 * Stop listen change event.
 */
cld.Editor.prototype.stopListenChangeEvent = function() {
  if (this.isListeningChangeEvent_) {
    goog.events.unlistenByKey(this.isListeningChangeEvent_);
  }
};

/**
 * Specify the buttons to add to the toolbar, using built in default buttons.
 * @type {!Array}
 */
cld.Editor.buttons = [
  goog.editor.Command.FONT_FACE,
  goog.editor.Command.FONT_SIZE,
  goog.editor.Command.BOLD,
  goog.editor.Command.ITALIC,
  goog.editor.Command.UNDERLINE,
  goog.editor.Command.FONT_COLOR,
  goog.editor.Command.BACKGROUND_COLOR,
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
