/**
 * @fileoverview Doc class for open diary/note.
 *
 * @author lamengao@gmail.com (Lamengao)
 */
goog.provide('cld.Doc');
goog.provide('cld.Doc.TEXT');

goog.require('cld.DiaryTree');
goog.require('cld.Editor');
goog.require('cld.api.Diary');
goog.require('cld.api.Docs');
goog.require('cld.api.Docs.EventType');
goog.require('cld.api.Notes');
goog.require('cld.doc.Event');
goog.require('cld.ui.utils');

goog.require('goog.Timer');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.Control');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Separator');
goog.require('goog.ui.decorate');


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

  this.element = this.dom_.getElement('doc');
  this.elHeader = this.dom_.getElement('doc-header');
  this.elContainer = this.dom_.getElement('doc-container');
  this.elFooter = this.dom_.getElement('doc-footer');
  this.elToolbar = /** @type {!Element} */
    (this.dom_.getElement('editortoolbar'));

  this.createActionsMenu_();
  this.createActionsButton_();

  this.editor = new cld.Editor('editortoolbar', 'editorarea');

  this.createSaveButton();
  this.changeSaveButtonState('Saved');

  this.elTitle = this.dom_.getElement('header-title');
  this.pathSpan = this.dom_.getElementByClass('path', this.elTitle);
  this.titleTextSpan = this.dom_.getElementByClass('text', this.elTitle);

  this.elEditName = this.dom_.getElement('edit-name');
  this.editNameInput = this.dom_.getElement('editname');

  goog.style.setUnselectable(this.pathSpan, true);
  goog.style.setUnselectable(this.elContainer, true);
  this.initTitleControl_();

  this.api = {};
  this.api.Docs = new cld.api.Docs(this);
  this.api.diary = new cld.api.Diary(this);
  this.api.notes = new cld.api.Notes(this);

  this.initBackToLink_();

  this.handle.listen(this.editor, 'manualsave', goog.bind(this.saveDoc, this));
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
    this.renameMenuItem = new goog.ui.MenuItem('Rename'),
    this.moveToMenuItem = new goog.ui.MenuItem('Move To')
  ];
  //this.refreshMenuItem.setId('refreshmenuitem');
  this.deleteMenuItem.setId('deletemenuitem');
  this.renameMenuItem.setId('renamemenuitem');
  this.moveToMenuItem.setId('movetomenuitem');
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
      } else if (id == 'movetomenuitem') {
        this.readyToMove();
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
 * Initial title control.
 * @private
 */
cld.Doc.prototype.initTitleControl_ = function() {
  this.titleControl = goog.ui.decorate(this.titleTextSpan);

  this.handle.listen(this.titleControl, goog.ui.Component.EventType.ACTION,
      function(e) {
        if (this.docType === 'note') {
          this.renameHandle(e);
        }
      }, false, this);
};

/**
 * Create and init back to link button.
 * @private
 */
cld.Doc.prototype.initBackToLink_ = function() {
  this.topBacktoLink = cld.ui.utils.newLinkButton(cld.Doc.TEXT.BACKTO_SEARCH);
  this.topBacktoLink.renderBefore(this.pathSpan);
  this.topBacktoLink.getElement().id = 'topbacktolink';
  goog.dom.classes.add(this.topBacktoLink.getElement(), 'backto');

  this.bottomBacktoLink =
    cld.ui.utils.newLinkButton(cld.Doc.TEXT.BACKTO_SEARCH);
  this.bottomBacktoLink.render(this.elFooter);
  this.bottomBacktoLink.getElement().id = 'bottombacktolink';
  goog.dom.classes.add(this.bottomBacktoLink.getElement(), 'backto');

  this.handle.
    listen(this.topBacktoLink, goog.ui.Component.EventType.ACTION,
      function(e) {
        this.dispatchEvent(cld.doc.EventType.BACKTO);
      }, false, this).
    listen(this.bottomBacktoLink, goog.ui.Component.EventType.ACTION,
      function(e) {
        this.dispatchEvent(cld.doc.EventType.BACKTO);
      }, false, this);
};

/**
 * Hidden all back to links.
 * @private
 */
cld.Doc.prototype.hiddenBackToLink_ = function() {
  goog.dom.classes.add(this.topBacktoLink.getElement(), 'hidden');
  goog.dom.classes.add(this.bottomBacktoLink.getElement(), 'hidden');
};

/**
 * Show all back to links.
 * @private
 */
cld.Doc.prototype.showBackToLink_ = function() {
  goog.dom.classes.remove(this.topBacktoLink.getElement(), 'hidden');
  goog.dom.classes.remove(this.bottomBacktoLink.getElement(), 'hidden');
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
    case 'Trashed':
      this.saveButton.setEnabled(false);
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

  if (goog.userAgent.WEBKIT) {
    var containerHeight = getHeight('doc-container', this.dom_);
    var elEditorArea = this.dom_.getElement('editorarea');
    elEditorArea.style.height = (containerHeight - toolbarHeight) + 'px';
  }
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
 * Is doc trashed?
 * @param {goog.ui.tree.BaseNode=} opt_node The doc node.
 * @return {boolean} is trashed.
 */
cld.Doc.prototype.isTrashed = function(opt_node) {
  var node = opt_node || this.openingNode_;
  return node.getModel()['status'] === 'trashed';
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
    title = goog.string.unescapeEntities(title);
  }
  this.dom_.setTextContent(this.pathSpan, path);
  this.dom_.setTextContent(this.titleTextSpan, title);
  this.dom_.getDocument().title = 'Cuoluo Diary - ' + path + ' - ' + title;
  goog.dom.classes.remove(this.titleTextSpan, 'hover');
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
  this.show();

  if ('source' in node.getModel()) {
    this.showBackToLink_();
    delete node.getModel()['source'];
  } else {
    this.hiddenBackToLink_();
  }
  this.setOpenNode(node);
  this.element.className = this.docType;
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

  if (node.getModel() && 'scrolltop' in node.getModel()) {
    var scrollTop = node.getModel()['scrolltop'];
  } else {
    var scrollTop = 0;
  }
  this.editor.setScrollTop(scrollTop);
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
  var xhr = this.api.Docs.newXhrIo(goog.bind(this.onDocLoadSuccess_, this));
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
 * @param {boolean=} onoff turn on or off all buttons.
 */
cld.Doc.prototype.updateButtons = function(onoff) {
  if (goog.isDef(onoff)) {
    this.actionsButton.setEnabled(onoff);
    this.saveButton.setEnabled(onoff);
    return;
  }
  // update action button
  if (this.docType === 'diary') {
    this.renameMenuItem.setEnabled(false);
    this.moveToMenuItem.setEnabled(false);
  } else if (this.docType === 'note') {
    this.renameMenuItem.setEnabled(true);
    this.moveToMenuItem.setEnabled(true);
  }
  if (this.isNew()) {
    this.actionsButton.setEnabled(false);
  } else if (this.isTrashed()) {
    this.actionsButton.setEnabled(false);
  } else {
    this.actionsButton.setEnabled(true);
  }

  // update save button
  if (this.isNew()) {
    this.changeSaveButtonState('Save');
  } else if (this.isTrashed()) {
    this.changeSaveButtonState('Trashed');
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
  var isNew = this.isNew(node);
  if (data) {
    this.updateNodeModel(data, node);
  }
  this.setNodeModel('modified', false, node);
  if (isNew) {
    this.dispatchEvent(new cld.doc.Event('newDocCreated', node));
  }
  if (node.getModel()['title']) {
    var title = goog.string.unescapeEntities(node.getModel()['title']);
  }
  if ('id' in node.getModel() && node.getText() !== title) {
    // note title renamed
    if (this.openingNode_ == node) {
      this.setTitle('note', /** @type {string} */ (title));
      this.cancelRename();
    }
    node.setText(/** @type {string} */ (title));
    // adjust node position
    this.dispatchEvent({
        type: cld.doc.EventType.RENAMED,
        node: node
    });
  }
  this.dispatchEvent(cld.api.Docs.EventType.LOADED);
  if (this.openingNode_ == node) {
    this.updateButtons();
  }
};

/**
 * Save doc.
 * @param {goog.events.Event} e toggle event.
 */
cld.Doc.prototype.saveDoc = function(e) {
  if (this.saveButton.getCaption() === 'Saving' || !this.isModified()) {
    return;
  }
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
  var xhr = this.api.Docs.newXhrIo(successCallback);
  if (this.docType === 'diary') {
    this.api.diary.update(xhr, nodeModel['date'], content);
  } else if (this.docType === 'note') {
    var title = goog.string.unescapeEntities(nodeModel['title']);
    if (this.isNew(node)) {
      var parentId = nodeModel['parent_id'];
      if (parentId) {
        this.api.notes.insert(xhr, nodeModel['id'], title, content, parentId);
      } else {
        this.api.notes.insert(xhr, nodeModel['id'], title, content);
      }
    } else if (node.getText() !== title) {
      this.api.notes.update(xhr, nodeModel['id'], title, undefined);
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
  this.editNameCancelButton = cld.ui.utils.newButton('Cancel');
  this.editNameCancelButton.render(this.elEditName);

  var keyHandler = new goog.events.KeyHandler(this.editNameInput);

  this.handle.
    listen(keyHandler, goog.events.KeyHandler.EventType.KEY,
      function(e) {
        var keyEvent = /** @type {goog.events.KeyEvent} */ (e);
        if (keyEvent.keyCode === goog.events.KeyCodes.ENTER ||
            keyEvent.keyCode === goog.events.KeyCodes.ESC) {
          this.renameInternal();
        }
      }, false, this).
    listen(this.editNameInput, goog.events.EventType.BLUR,
      function(e) {
        //this.cancelRename();
      }, false, this).
    listen(this.editNameButton, goog.ui.Component.EventType.ACTION,
      function(e) {
        this.renameInternal();
      }, false, this).
    listen(this.editNameCancelButton, goog.ui.Component.EventType.ACTION,
      function(e) {
        this.cancelRename();
      }, false, this);
};

/**
 * Cancel the rename action.
 */
cld.Doc.prototype.cancelRename = function() {
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
 * delete doc success callback.
 * @param {goog.ui.tree.BaseNode} node Which node saved.
 * @private
 */
cld.Doc.prototype.onDeletedSuccess_ = function(node) {
  var nodeModel = node.getModel();
  nodeModel['status'] = 'trashed';
  var type = 'id' in nodeModel ? 'note' : 'journal';
  if (node == this.getOpeningNode()) {
    cld.ui.utils.setToolTip(this.titleTextSpan,
      'This ' + type + ' has been moved to the trash');
    this.updateButtons();
  }
  this.dispatchEvent(new cld.doc.Event('deleted', node));
};

/**
 * Delete current doc.
 */
cld.Doc.prototype.deleteDoc = function() {
  this.stopSaveTimer_();
  goog.dom.classes.add(this.titleTextSpan, 'hover');

  this.updateButtons(false);
  this.editor.makeUneditable();
  var node = this.getOpeningNode();
  this.deleteDocInternal(node);
};

/**
 * restored doc success callback.
 * @param {goog.ui.tree.BaseNode} node Which node restored.
 * @private
 */
cld.Doc.prototype.onRestoredSuccess_ = function(node) {
  var nodeModel = node.getModel();
  nodeModel['status'] = 'private';
  var type = 'id' in nodeModel ? 'note' : 'diary';
  if (node == this.getOpeningNode()) {
    if (type === 'diary') {
      this.setTitle('diary', this.nodeModel['date']);
    } else {
      this.setTitle('note', this.nodeModel['title']);
    }
    this.updateButtons();
    this.editor.makeEditable();
  }
  this.dispatchEvent(new cld.doc.Event('restored', node));
};

/**
 * Restore deleted doc
 * @param {!goog.ui.tree.BaseNode} node The deleted doc node.
 */
cld.Doc.prototype.restoreDoc = function(node) {
  var nodeModel = node.getModel();
  var successCallback = goog.bind(this.onRestoredSuccess_, this, node);
  var xhr = this.api.Docs.newXhrIo(successCallback);
  if (this.docType === 'diary') {
    this.api.diary.restore(xhr, nodeModel['date']);
  } else if (this.docType === 'note') {
    this.api.notes.restore(xhr, nodeModel['id']);
  }
};

/**
 * Delete doc internal
 * @param {goog.ui.tree.BaseNode} node Which node saved.
 * @protected
 */
cld.Doc.prototype.deleteDocInternal = function(node) {
  var nodeModel = node.getModel();
  var successCallback = goog.bind(this.onDeletedSuccess_, this, node);
  var xhr = this.api.Docs.newXhrIo(successCallback);
  if (this.docType === 'diary') {
    this.api.diary.trash(xhr, nodeModel['date']);
  } else if (this.docType === 'note') {
    this.api.notes.trash(xhr, nodeModel['id']);
  }
};

/**
 * Rename current doc.
 */
cld.Doc.prototype.renameDoc = function() {
  if (this.isTrashed()) {
    return;
  }
  if (this.docType != 'note') {
    return;
  }
  if (!this.editNameButton) {
    this.createEditNameButtons_();
  }
  this.editNameInput.value = this.openingNode_.getText();
  goog.dom.classes.add(this.titleTextSpan, 'hidden');
  goog.dom.classes.remove(this.elEditName, 'hidden');
  this.editNameInput.focus();
  this.editNameButton.setEnabled(true);
  this.editNameCancelButton.setEnabled(true);
};

/**
 * Rename and update note title.
 * @protected
 */
cld.Doc.prototype.renameInternal = function() {
  if (!goog.style.isElementShown(this.elEditName)) {
    return;
  }
  var title = this.editNameInput.value;
  if (title == this.openingNode_.getText()) {
    this.cancelRename();
    return;
  }
  this.editNameButton.setEnabled(false);
  this.editNameCancelButton.setEnabled(false);
  this.setNodeModel('title', title);
  this.setNodeModel('modified', true);
  this.dispatchEvent(cld.api.Docs.EventType.LOADING);
  this.saveDoc_(this.openingNode_);
};

/**
 * Ready to move show dialog.
 */
cld.Doc.prototype.readyToMove = function() {
  var docType = this.docType;
  var node = this.getOpeningNode();
  this.dispatchEvent({
      type: cld.doc.EventType.READY_TO_MOVE,
      docType: docType,
      node: node
  });
};

/**
 * Move doc to new parent.
 * @param {string} id The doc id.
 * @param {string|number} parentId The new parentId.
 * @param {boolean=} isMoveBack Whether is move back.
 */
cld.Doc.prototype.moveDocTo = function(id, parentId, isMoveBack) {
  var node = cld.DocsTree.allNodes['notes:' + id];
  if (parentId) {
    var newParentNode = cld.DocsTree.allNodes['notes:' + parentId];
  } else {
    var newParentNode = node.getTree();
  }
  var xhr = this.api.Docs.newXhrIo(goog.bind(this.onDocMoved_,
                                             this,
                                             node,
                                             newParentNode,
                                             node.getParent(),
                                             !!isMoveBack));
  this.api.notes.moveTo(xhr, id, parentId);
};

/**
 * Move doc success callback.
 * @param {goog.ui.tree.BaseNode} node The moved node.
 * @param {goog.ui.tree.BaseNode} newParent The new parent node.
 * @param {goog.ui.tree.BaseNode} oldParent The old parent node.
 * @param {boolean} isMoveBack Whether is move back.
 * @param {Object} data The node model.
 * @private
 */
cld.Doc.prototype.onDocMoved_ = function(node, newParent,
                                         oldParent, isMoveBack, data) {
  this.updateNodeModel(data, node);
  this.dispatchEvent({
      type: cld.doc.EventType.MOVED,
      node: node,
      newParent: newParent,
      oldParent: oldParent,
      isMoveBack: isMoveBack
  });
};

/**
 * Clean and do immediately current actions for ready open a new node.
 */
cld.Doc.prototype.clearActions = function() {
  if (!this.openingNode_) {
    return;
  }
  this.cancelRename();
  // if current node not save, save it now
  this.stopSaveTimer_();
  if (this.isModified()) {
    this.saveDoc_(this.openingNode_);
  } else if (this.isNew() && this.docType === 'note') {
    // new note and not save, discard it
    this.dispatchEvent(new cld.doc.Event('discard', this.openingNode_));
  }
  if (this.nodeModel) {
    this.updateNodeModel({'scrolltop': this.editor.getScrollTop()});
  }
};

/**
 * whether the doc is opening.
 * @return {boolean} Is open?
 */
cld.Doc.prototype.isOpen = function() {
  return !goog.dom.classes.has(this.element, 'hidden');
};

/**
 * Hidden #doc element.
 */
cld.Doc.prototype.hidden = function() {
  goog.dom.classes.add(this.element, 'hidden');
};

/**
 * Show #doc element.
 */
cld.Doc.prototype.show = function() {
  goog.dom.classes.remove(this.element, 'hidden');
  this.setEditorAreaHeight();
};

/**
 * Date string to goog.date.Date.
 * @param {string} date The date string.
 * @return {goog.date.Date} The Date().
 */
cld.Doc.getGoogDate = function(date) {
  var d = date.split('/');
  return new goog.date.Date(parseInt(d[0], 10),
                            parseInt(d[1], 10) - 1,
                            parseInt(d[2], 10));
};

/**
 * Date string to goog.date.Date.
 * @param {goog.date.Date} date The date object.
 * @return {string} The date string.
 */
cld.Doc.getDateString = function(date) {
  if (!date) {
    return '';
  }
  var y = date.getFullYear() + '';
  var m = (date.getMonth() + 1) + '';
  var d = date.getDate() + '';
  if (m.length === 1) {
    m = '0' + m;
  }
  if (d.length === 1) {
    d = '0' + d;
  }
  return y + '/' + m + '/' + d;
};

/** @enum {string} */
cld.Doc.TEXT = {
  BACKTO_SEARCH: '« Back to Search Results',
  ARROW_SPAN: '<span class="arrow goog-inline-block">▼</span>'
};
