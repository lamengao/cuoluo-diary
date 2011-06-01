/**
 * @fileoverview Doc class for open diary/note.
 *
 * @author lamengao@gmail.com (Lamengao)
 */
goog.provide('cld.Doc');

goog.require('cld.api.Docs');
goog.require('cld.api.Docs.EventType');
goog.require('cld.api.Diary');
goog.require('cld.api.Notes');
goog.require('cld.DiaryTree');
goog.require('cld.Editor');
goog.require('cld.ui.utils');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Separator');


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
  this.elToolbar = /** @type {!Element} */
    (this.dom_.getElement('editortoolbar'));

  this.createActionsMenu_();
  this.renameMenuItem.setEnabled(false);
  this.createActionsButton_();
  this.createSaveButton();

  this.editor = new cld.Editor('editortoolbar', 'editorarea');
  //this.editor.field.makeEditable();
  this.setEditorAreaHeight();

  this.elTitle = this.dom_.getElement('header-title');
  this.pathSpan = this.dom_.getElementByClass('path', this.elTitle);
  this.titleTextSpan = this.dom_.getElementByClass('text', this.elTitle);

  this.api = {};
  this.api.diary = new cld.api.Diary(this);
  this.api.notes = new cld.api.Notes(this);
};
goog.inherits(cld.Doc, goog.events.EventTarget);

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
  this.actionsButton = cld.ui.utils.newButton('Actions', this.menu);
  this.actionsButton.render(this.elHeader);
  this.actionsButton.getElement().id = 'doc-actions';
};

/**
 * Create and init save button.
 */
cld.Doc.prototype.createSaveButton = function() {
  this.button = cld.ui.utils.newButton('Save');
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
 * which doc node if opening.
 * @type {goog.ui.tree.BaseNode}
 * @private
 */
cld.Doc.prototype.openingNode_ = null;

/**
 * Set opening doc node
 * @param {goog.ui.tree.BaseNode} node The doc's tree node.
 */
cld.Doc.prototype.setOpenNode = function(node) {
  this.openingNode_ = node;
  if (node) {
    this.nodeModel = node.getModel();
    if ('date' in this.nodeModel) {
      this.docType = 'diary';
    } else {
      this.docType = 'note';
    }
  } else {
    this.nodeModel = null;
    this.docType = '';
  }
};

/**
 * Open a exist doc.
 * @param {!goog.ui.tree.BaseNode} node The doc's tree node.
 */
cld.Doc.prototype.open = function(node) {
  this.setOpenNode(node);

  // set title
  if (this.docType === 'diary') {
    this.setTitle('diary', this.nodeModel['date']);
  } else if (this.docType === 'note') {
    this.setTitle('note', this.nodeModel['title']);
  }

  // loading doc content and show it
  if ('content' in this.nodeModel) {
    this.updateDocContent();
  } else {
    this.showLoading();
    this.loadAndShowDocContent();
  }
  //this.updateButtons();
};

/**
 * Set doc's title
 * @param {string} type The doc type.
 * @param {string} title The doc title, If diary the title is date.
 */
cld.Doc.prototype.setTitle = function(type, title) {
  if (type === 'diary') {
    var path = 'Diary';
    var toolTip = title.replace(/\//g, '-');
    title = cld.DiaryTree.getDocTitleByDate(title);
  } else {
    var path = 'Notes';
    var toolTip = 'Click to edit';
  }
  this.dom_.setTextContent(this.pathSpan, path);
  this.dom_.setTextContent(this.titleTextSpan, title);
  cld.ui.utils.setToolTip(this.titleTextSpan, toolTip);
};

/**
 * Show loading message in editor area, and make field uneditable.
 */
cld.Doc.prototype.showLoading = function() {
  if (!this.editor.field.isUneditable()) {
    this.editor.field.makeUneditable();
  }
  this.editor.field.setHtml(false, 'Loading...');
  this.dispatchEvent(cld.api.Docs.EventType.LOADING);
};

/**
 * Display or update doc content in editor area.
 * @param {string=} content The doc content.
 */
cld.Doc.prototype.updateDocContent = function(content) {
  if (this.editor.field.isUneditable()) {
    this.editor.field.makeEditable();
  }
  if (goog.isDef(content)) {
    this.editor.field.setHtml(false, content);
  } else {
    this.editor.field.setHtml(false, this.nodeModel['content']);
  }
};

/**
 * Update current opening node model.
 * @param {Object} data The node model.
 */
cld.Doc.prototype.updateNodeModel = function(data) {
  for (var key in data) {
    this.nodeModel[key] = data[key];
  }
  this.openingNode_.setModel(this.nodeModel);
};

/**
 * Load doc success callback.
 * @param {Object} data The node model.
 * @private
 */
cld.Doc.prototype.onDocLoadSuccess_ = function(data) {
    this.updateNodeModel(data);
    this.updateDocContent();
    this.dispatchEvent(cld.api.Docs.EventType.LOADED);
};

/**
 * Load doc content and show it.
 */
cld.Doc.prototype.loadAndShowDocContent = function() {
  var xhr = this.api.diary.newXhrIo(
    goog.bind(this.onDocLoadSuccess_, this));
  if (this.docType === 'diary') {
    this.api.diary.get(xhr, this.nodeModel['date']);
  } else if (this.docType === 'note') {
    this.api.notes.get(xhr, this.nodeModel['id']);
  }
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
