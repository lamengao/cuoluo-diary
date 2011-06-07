/**
 * @fileoverview Doc class for open diary/note.
 *
 * @author lamengao@gmail.com (Lamengao)
 */
goog.provide('cld.Doc');

goog.require('cld.DiaryTree');
goog.require('cld.Editor');
goog.require('cld.api.Diary');
goog.require('cld.api.Docs');
goog.require('cld.api.Docs.EventType');
goog.require('cld.api.Notes');
goog.require('cld.doc.NewDocCreatedEvent');
goog.require('cld.doc.DiscardNewNoteEvent');
goog.require('cld.ui.utils');

goog.require('goog.Timer');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.object');
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

  this.elDoc = this.dom_.getElement('doc');
  this.elHeader = this.dom_.getElement('doc-header');
  this.elToolbar = /** @type {!Element} */
    (this.dom_.getElement('editortoolbar'));

  this.createActionsMenu_();
  this.createActionsButton_();

  this.editor = new cld.Editor('editortoolbar', 'editorarea');
  this.setEditorAreaHeight();

  this.createSaveButton();
  this.changeSaveButtonState('Saved');

  this.elTitle = this.dom_.getElement('header-title');
  this.pathSpan = this.dom_.getElementByClass('path', this.elTitle);
  this.titleTextSpan = this.dom_.getElementByClass('text', this.elTitle);

  this.elEditName = this.dom_.getElement('edit-name');
  this.editNameInput = this.dom_.getElement('editname');
  this.handle.listen(this.titleTextSpan, goog.events.EventType.CLICK,
      goog.bind(this.renameHandle, this));

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
    //this.refreshMenuItem = new goog.ui.MenuItem('Refresh'),
    this.deleteMenuItem = new goog.ui.MenuItem('Delete'),
    this.renameMenuItem = new goog.ui.MenuItem('Rename')
  ];
  //this.refreshMenuItem.setId('refreshmenuitem');
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
  this.saveButton = cld.ui.utils.newButton('Saved');
  this.saveButton.render(this.elToolbar);
  this.saveButton.getElement().id = 'savebutton';
  this.handle.listen(this.saveButton, goog.ui.Component.EventType.ACTION,
      goog.bind(this.saveDoc, this));
};

/**
 * Create a timer do once(clean exist) for auto save.
 * @private
 */
cld.Doc.prototype.restartSaveTimer_ = function() {
  this.stopSaveTimer_();
  var saveNode = this.openingNode_;
  this.saveTimerHander = goog.Timer.callOnce(function() {
      this.saveDoc_(saveNode);
    }, 5000, this);
};

/**
 * Stop the auto save call once timer.
 * @private
 */
cld.Doc.prototype.stopSaveTimer_ = function() {
  if (this.saveTimerHander) {
    goog.Timer.clear(this.saveTimerHander);
  }
};

/**
 * Change save button's state.
 * @param {string} state The state.
 */
cld.Doc.prototype.changeSaveButtonState = function(state) {
  switch (state) {
    case 'Save':
      this.saveButton.setEnabled(true);
      if (!(this.isNew() && !this.isModified())) {
        this.restartSaveTimer_();
      }
      break;
    case 'Saved':
      this.saveButton.setEnabled(false);
      break;
    case 'Saving':
      this.saveButton.setEnabled(false);
      this.stopSaveTimer_();
      break;
  }
  this.saveButton.setCaption(state);
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
 * Return the node of current openning.
 * @return {goog.ui.tree.BaseNode} node Opening node.
 */
cld.Doc.prototype.getOpeningNode = function() {
  return this.openingNode_;
};

/**
 * Is new doc node?
 * @param {goog.ui.tree.BaseNode=} opt_node The doc node.
 * @return {boolean} is new.
 */
cld.Doc.prototype.isNew = function(opt_node) {
  var node = opt_node || this.openingNode_;
  return !('created' in node.getModel());
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
  this.editor.makeUneditable();
  this.editor.field.setHtml(false, 'Loading...');
  this.dispatchEvent(cld.api.Docs.EventType.LOADING);
};

/**
 * Display or update doc content in editor area.
 * @param {string=} content The doc content.
 */
cld.Doc.prototype.updateDocContent = function(content) {
  this.editor.makeEditable();
  if (goog.isDef(content)) {
    this.editor.field.setHtml(false, content);
  } else if (this.isNew()) {
    this.editor.field.setHtml(false, '');
    this.editor.field.focusAndPlaceCursorAtStart();
    this.setNodeModel('content', this.editor.field.getCleanContents());
  } else {
    this.editor.field.setHtml(false, this.nodeModel['content']);
  }
};

/**
 * Set the opening node model.
 * @param {string} key The key.
 * @param {*} val The val..
 * @param {goog.ui.tree.BaseNode=} opt_node The node's model will be set.
 */
cld.Doc.prototype.setNodeModel = function(key, val, opt_node) {
  var node = opt_node || this.openingNode_;
  var nodeModel = node.getModel();
  nodeModel[key] = val;
  node.setModel(nodeModel);
};
/**
 * Update current opening node model.
 * @param {Object} data The node model.
 * @param {goog.ui.tree.BaseNode=} opt_node The node's model will be set.
 */
cld.Doc.prototype.updateNodeModel = function(data, opt_node) {
  var node = opt_node || this.openingNode_;
  var nodeModel = node.getModel();
  for (var key in data) {
    nodeModel[key] = data[key];
  }
  node.setModel(nodeModel);
};

/**
 * Open a exist doc.
 * @param {!goog.ui.tree.BaseNode} node The doc's tree node.
 */
cld.Doc.prototype.open = function(node) {
  this.setOpenNode(node);

  this.elDoc.className = this.docType;
  // set title
  if (this.docType === 'diary') {
    this.setTitle('diary', this.nodeModel['date']);
  } else if (this.docType === 'note') {
    this.setTitle('note', this.nodeModel['title']);
  }

  // disable all buttons before doc content loaded.
  this.setButtonsEnabled(false);

  // loading doc content and show it
  if (this.isNew()) {
    // open a new doc
    this.openInternal();
  } else if ('content' in this.nodeModel) {
    this.openInternal();
  } else {
    this.showLoading();
    this.loadAndShowDocContent();
  }
};

/**
 * Open doc internal.
 * @protected
 */
cld.Doc.prototype.openInternal = function() {
  this.updateDocContent();
  this.updateButtons();
  this.editor.listenChangeEvent(goog.bind(this.onFieldChange_, this));
};

/**
 * On field change callback function.
 * @private
 */
cld.Doc.prototype.onFieldChange_ = function() {
  if (this.editor.field.isUneditable() ||
      this.nodeModel['content'] == this.editor.field.getCleanContents()) {
    return;
  }

  this.setNodeModel('content', this.editor.field.getCleanContents());
  this.setNodeModel('modified', true);
  this.changeSaveButtonState('Save');
};

/**
 * Load doc success callback.
 * @param {Object} data The node model.
 * @private
 */
cld.Doc.prototype.onDocLoadSuccess_ = function(data) {
    this.updateNodeModel(data);
    this.openInternal();
    this.dispatchEvent(cld.api.Docs.EventType.LOADED);
};

/**
 * Load doc content and show it.
 */
cld.Doc.prototype.loadAndShowDocContent = function() {
  var xhr = cld.api.Docs.newXhrIo(goog.bind(this.onDocLoadSuccess_, this));
  if (this.docType === 'diary') {
    this.api.diary.get(xhr, this.nodeModel['date']);
  } else if (this.docType === 'note') {
    this.api.notes.get(xhr, this.nodeModel['id']);
  }
};

/**
 * Set doc buttons enable or unenable.
 * @param {boolean} b true or false.
 */
cld.Doc.prototype.setButtonsEnabled = function(b) {
  this.actionsButton.setEnabled(b);
  this.saveButton.setEnabled(b);
};

/**
 * Update buttons
 */
cld.Doc.prototype.updateButtons = function() {
  // update action button
  if (this.docType === 'diary') {
    this.renameMenuItem.setEnabled(false);
  } else if (this.docType === 'note') {
    this.renameMenuItem.setEnabled(true);
  }
  if (this.isNew()) {
    this.actionsButton.setEnabled(false);
  } else {
    this.actionsButton.setEnabled(true);
  }

  // update save button
  if (this.isNew()) {
    this.changeSaveButtonState('Save');
  } else {
    var state = this.isModified() ? 'Save' : 'Saved';
    this.changeSaveButtonState(state);
  }
};

/**
 * Whether the doc modified.
 * @return {boolean} is modified?
 */
cld.Doc.prototype.isModified = function() {
  return (this.nodeModel && 'modified' in this.nodeModel &&
    this.nodeModel['modified']);
};

/**
 * Load doc success callback.
 * @param {goog.ui.tree.BaseNode} node Which node saved.
 * @param {Object=} data The node model.
 * @private
 */
cld.Doc.prototype.onSavedSuccess_ = function(node, data) {
  if (this.openingNode_ == node) {
    this.changeSaveButtonState('Saved');
  }
  var isNew = this.isNew(node);
  if (data) {
    this.updateNodeModel(data, node);
  }
  this.setNodeModel('modified', false, node);
  if (isNew) {
    this.dispatchEvent(new cld.doc.NewDocCreatedEvent(node));
  }
  var title = node.getModel()['title'];
  if ('id' in node.getModel() && node.getText() !== title) {
    // note title renamed
    if (this.openingNode_ == node) {
      this.setTitle('note', title);
      this.cancleRename();
    }
    node.setText(title);
  }
  this.dispatchEvent(cld.api.Docs.EventType.LOADED);
};

/**
 * Save doc.
 * @param {goog.events.Event} e toggle event.
 */
cld.Doc.prototype.saveDoc = function(e) {
  this.changeSaveButtonState('Saving');
  this.saveDoc_(this.openingNode_);
};

/**
 * Save doc.
 * @param {goog.ui.tree.BaseNode} node Which node will be save.
 * @private
 */
cld.Doc.prototype.saveDoc_ = function(node) {
  var nodeModel = node.getModel();
  var content = nodeModel['content'];
  var successCallback = goog.bind(this.onSavedSuccess_, this, node);
  var xhr = cld.api.Docs.newXhrIo(successCallback);
  if (this.docType === 'diary') {
    this.api.diary.update(xhr, nodeModel['date'], content);
  } else if (this.docType === 'note') {
    var title = nodeModel['title'];
    if (this.isNew(node)) {
      this.api.notes.insert(xhr, nodeModel['id'], title, content);
    } else if (node.getText() !== title) {
      this.api.notes.update(xhr, nodeModel['id'], title);
    } else {
      this.api.notes.update(xhr, nodeModel['id'], undefined, content);
    }
  }
};

/**
 * Handle for click title text.
 * @param {goog.events.Event} e toggle event.
 */
cld.Doc.prototype.renameHandle = function(e) {
  this.renameDoc();
};

/**
 * Create edit name buttons.
 * @private
 */
cld.Doc.prototype.createEditNameButtons_ = function() {
  if (this.editNameButton) {
    return;
  }
  this.editNameButton = cld.ui.utils.newButton('OK');
  this.editNameButton.render(this.elEditName);
  this.editNameCancleButton = cld.ui.utils.newButton('Cancle');
  this.editNameCancleButton.render(this.elEditName);

  var keyHandler = new goog.events.KeyHandler(this.editNameInput);

  this.handle.
    listen(keyHandler, goog.events.KeyHandler.EventType.KEY,
      function(e) {
        var keyEvent = /** @type {goog.events.KeyEvent} */ (e);
        if (keyEvent.keyCode === goog.events.KeyCodes.ENTER) {
          this.renameInternal();
        }
      }, false, this).
    listen(this.editNameInput, goog.events.EventType.BLUR,
      function(e) {
        //this.cancleRename();
      }, false, this).
    listen(this.editNameButton, goog.ui.Component.EventType.ACTION,
      function(e) {
        this.renameInternal();
      }, false, this).
    listen(this.editNameCancleButton, goog.ui.Component.EventType.ACTION,
      function(e) {
        this.cancleRename();
      }, false, this);
};

/**
 * Cancle the rename action.
 */
cld.Doc.prototype.cancleRename = function() {
  goog.dom.classes.add(this.elEditName, 'hidden');
  goog.dom.classes.remove(this.titleTextSpan, 'hidden');
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
  if (this.docType != 'note') {
    return;
  }
  if (!this.editNameButton) {
    this.createEditNameButtons_();
  }
  var title = this.dom_.getTextContent(this.titleTextSpan);
  this.editNameInput.value = title;
  goog.dom.classes.add(this.titleTextSpan, 'hidden');
  goog.dom.classes.remove(this.elEditName, 'hidden');
  this.editNameInput.focus();
  this.editNameButton.setEnabled(true);
  this.editNameCancleButton.setEnabled(true);
};

/**
 * Rename and update note title.
 * @protected
 */
cld.Doc.prototype.renameInternal = function() {
  if (!goog.style.isElementShown(this.elEditName)) {
    return;
  }
  this.editNameButton.setEnabled(false);
  this.editNameCancleButton.setEnabled(false);
  var title = this.editNameInput.value;
  this.setNodeModel('title', title);
  this.setNodeModel('modified', true);
  this.dispatchEvent(cld.api.Docs.EventType.LOADING);
  this.saveDoc_(this.openingNode_);
};

/**
 * Clean and do immediately current actions for ready open a new node.
 */
cld.Doc.prototype.clearActions = function() {
  if (!this.openingNode_) {
    return;
  }
  this.cancleRename();
  // if current node not save, save it now
  this.stopSaveTimer_();
  if (this.isModified()) {
    this.saveDoc_(this.openingNode_);
  } else if (this.isNew() && this.docType === 'note') {
    // new note and not save, discard it
    this.dispatchEvent(new cld.doc.DiscardNewNoteEvent(this.openingNode_));
  }
};
