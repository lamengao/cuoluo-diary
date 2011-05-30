/**
 * @fileoverview Doc class for open diary/note.
 *
 * @author lamengao@gmail.com (Lamengao)
 */
goog.provide('cld.Doc');

goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
//goog.require('goog.editor.SeamlessField');
goog.require('goog.editor.plugins.BasicTextFormatter');
goog.require('goog.editor.plugins.EnterHandler');
goog.require('goog.editor.plugins.HeaderFormatter');
goog.require('goog.editor.plugins.LinkBubble');
goog.require('goog.editor.plugins.LinkDialogPlugin');
goog.require('goog.editor.plugins.ListTabHandler');
goog.require('goog.editor.plugins.LoremIpsum');
goog.require('goog.editor.plugins.RemoveFormatting');
goog.require('goog.editor.plugins.SpacesTabHandler');
//goog.require('goog.editor.plugins.UndoRedo');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.Css3MenuButtonRenderer');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.ImagelessMenuButtonRenderer');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Separator');
goog.require('goog.ui.editor.DefaultToolbar');
goog.require('goog.ui.editor.ToolbarController');

/**
 * Doc class for open diary or note.
 * @param {cld.App} app the parent event target.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Doc = function(app) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);
  this.dom_ = app.getDomHelper();
  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handle = new goog.events.EventHandler(this);

  this.elHeader = this.dom_.getElement('doc-header');
  this.elContainer = this.dom_.getElement('doc-container');
  this.elToolbar = /** @type {!Element} */
    (this.dom_.getElement('editortoolbar'));
  this.elEditorArea = this.dom_.getElement('editorarea');
  this.elFooter = this.dom_.getElement('doc-footer');

  this.createActionsMenu_();
  this.renameMenuItem.setEnabled(false);
  this.createActionsButton_();
  this.createSaveButton();

  this.initEditor();
  this.field.makeEditable();
};
goog.inherits(cld.Doc, goog.events.EventTarget);


/**
 * Initial editor.
 */
cld.Doc.prototype.initEditor = function() {
  this.field = new goog.editor.Field('editorarea', this.dom_.getDocument());
  //this.field = new goog.editor.SeamlessField('editorarea',
    //this.dom_.getDocument());

  this.field.registerPlugin(new goog.editor.plugins.BasicTextFormatter());
  this.field.registerPlugin(new goog.editor.plugins.RemoveFormatting());
  //this.field.registerPlugin(new goog.editor.plugins.UndoRedo());
  this.field.registerPlugin(new goog.editor.plugins.ListTabHandler());
  this.field.registerPlugin(new goog.editor.plugins.SpacesTabHandler());
  this.field.registerPlugin(new goog.editor.plugins.EnterHandler());
  this.field.registerPlugin(new goog.editor.plugins.HeaderFormatter());
  this.field.registerPlugin(
    new goog.editor.plugins.LoremIpsum('Click here to edit'));
  this.field.registerPlugin(
    new goog.editor.plugins.LinkDialogPlugin());
  this.field.registerPlugin(new goog.editor.plugins.LinkBubble());

  // Specify the buttons to add to the toolbar, using built in default buttons.
  var buttons = [
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
  this.toolbar = goog.ui.editor.DefaultToolbar.makeToolbar(buttons,
    this.elToolbar);

  // Hook the toolbar into the field.
  this.toolbarController =
    new goog.ui.editor.ToolbarController(this.field, this.toolbar);

  this.setEditorAreaHeight();
};

/**
 * Create actions menu
 * @private
 */
cld.Doc.prototype.createActionsMenu_ = function() {
  this.menu = new goog.ui.Menu();
  var items = [
    this.refreshMenuItem = new goog.ui.MenuItem('Refresh'),
    this.deleteMenuItem = new goog.ui.MenuItem('Delete'),
    this.renameMenuItem = new goog.ui.MenuItem('Rename')
  ];
  this.refreshMenuItem.setId('refreshmenuitem');
  this.deleteMenuItem.setId('deletemenuitem');
  this.renameMenuItem.setId('renamemenuitem');
  goog.array.forEach(items, function(item) {
      this.menu.addItem(item);
  }, this);
  var el = this.menu.getElement();
  el.id = 'actionsmenu';

  this.handle.listen(this.menu, goog.ui.Component.EventType.ACTION,
    function(e) {
      var id = e.target.getId();
      if (id === 'refreshmenuitem') {
        this.refreshDoc();
      } else if (id == 'deletemenuitem') {
        this.deleteDoc();
      } else if (id == 'renamemenuitem') {
        this.renameDoc();
      }
  }, false, this);
};

/**
 * Create actions menu button.
 * @private
 */
cld.Doc.prototype.createActionsButton_ = function() {
  this.actionsButton = new goog.ui.MenuButton('Actions', this.menu,
    cld.ui.utils.getButtonRenderer(true));
  this.actionsButton.render(this.elHeader);
  this.actionsButton.getElement().id = 'doc-actions';
};

/**
 * Create and init save button.
 */
cld.Doc.prototype.createSaveButton = function() {
  this.button = new goog.ui.CustomButton('Save',
    cld.ui.utils.getButtonRenderer());
  this.button.render(this.elToolbar);
  this.button.getElement().id = 'savebutton';
  //this.button.setCaption('Save');
  this.handle.listen(this.button, goog.ui.Component.EventType.ACTION,
      goog.bind(this.saveDoc, this));
};

/**
 * Set editor area's height.
 */
cld.Doc.prototype.setEditorAreaHeight = function() {
  var getHeight = cld.ui.utils.getHeight;
  var el = this.dom_.getElement('doc-container');
  var toolbarHeight = getHeight('editortoolbar', this.dom_);
  el.style.paddingTop = toolbarHeight + 'px';
};

/**
 * Save doc.
 * @param {goog.events.Event} e toggle event.
 */
cld.Doc.prototype.saveDoc = function(e) {
  alert('hello');
};


/**
 * Refresh current doc.
 */
cld.Doc.prototype.refreshDoc = function() {
  alert('refresh');
};

/**
 * Delete current doc.
 */
cld.Doc.prototype.deleteDoc = function() {
  alert('delete');
};

/**
 * Rename current doc.
 */
cld.Doc.prototype.renameDoc = function() {
  alert('rename');
};
