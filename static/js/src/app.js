/**
 * @fileoverview App.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.App');

goog.require('cld.Creation');
goog.require('cld.DiaryTree');
goog.require('cld.Doc');
goog.require('cld.DocsList');
goog.require('cld.DocsTree');
goog.require('cld.DocsTree.EventType');
goog.require('cld.NotesTree');
goog.require('cld.Search');
goog.require('cld.SplitPane');
goog.require('cld.Tasks');
goog.require('cld.Today');
goog.require('cld.Zippy');
goog.require('cld.doc.EventType');
goog.require('cld.message');
goog.require('cld.ui.utils');

goog.require('goog.History');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Zippy');


/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.App = function() {
  goog.events.EventTarget.call(this);

  this.dom_ = goog.dom.getDomHelper();
  this.history = new goog.History();

  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handle = new goog.events.EventHandler(this);
  /** @type {cld.SplitPane} */
  this.splitpane = new cld.SplitPane(this.dom_);
  /** @type {cld.Zippy} */
  this.diaryZippy =
    new cld.Zippy('diary-tree-header', 'diary-tree-content', this.dom_);
  /** @type {cld.Zippy} */
  this.notesZippy =
    new cld.Zippy('notes-tree-header', 'notes-tree-content', this.dom_);
  /** @type {cld.Zippy} */
  this.tasksZippy =
    new cld.Zippy('tasks-title', 'tasks-container', this.dom_);
  //this.tasks = new cld.Tasks(this.dom_);
};
goog.inherits(cld.App, goog.events.EventTarget);
goog.addSingletonGetter(cld.App);

/**
 * Returns the dom helper that is being used on this component.
 * @return {!goog.dom.DomHelper} The dom helper used on this component.
 */
cld.App.prototype.getDomHelper = function() {
  return this.dom_;
};

/**
 * When all component loaded change the UI
 */
cld.App.prototype.loaded = function() {
  // display main and search area and hidden loading message
  goog.dom.classes.remove(this.dom_.getElement('main'), 'vh');
  goog.dom.classes.remove(this.dom_.getElement('search'), 'vh');
  cld.message.hiddenLoading();

  // create new event handle
  var newNoteEvents = [
    cld.Creation.EventType.NEW_NOTE,
    cld.Creation.EventType.NEW_CHILDNOTE,
    cld.Creation.EventType.NEW_SIBLINGNOTE
  ];
  this.handle.listen(this, newNoteEvents, this.onNewNote_);

  // doc events
  this.handle.
    listen(this, cld.doc.EventType.NEW_DOC_CREATED, this.onNewDocCreated_).
    listen(this, cld.doc.EventType.DISCARD_NEW_NOTE, this.onDiscardNewNote_).
    listen(this, cld.doc.EventType.DELETED, this.onDocDeleted_).
    listen(this, cld.doc.EventType.RESTORED, this.onDocRestored_).
    listen(this, cld.ui.TreeControl.EventType.NODE_CHANGED, function(e) {
        this.search.updateSearchRows();
    }).
    listen(this, cld.doc.EventType.DATE_CHANGED, function(e) {
        this.diaryTree.selectNodeByDate(/** @type {string} */ (e.date));
    });

  // search events
  this.handle.
    listen(this, cld.Search.EventType.SEARCHED, this.onSearched_).
    listen(this, cld.DocsList.EventType.REFRESH_SEARCH, this.onRefreshSearch_).
    listen(this, cld.doc.EventType.BACKTO, function(e) {
        this.search.back();
    });

  // docs list events
  this.handle.
    listen(this, cld.DocsList.EventType.DOC_SELECT, this.onDocListSelect_);

  // creation events
  this.handle.
    listen(this, cld.Creation.EventType.NEW_DIARY, this.onNewDiary_);


  this.handle.
    listen(this.history, goog.history.EventType.NAVIGATE, this.navCallback_).
    listen(this, cld.DocsTree.EventType.SELECT_CHANGE, this.onDocSelected_).
    listen(this, cld.DocsTree.EventType.NEW_DOC, this.onNewDoc_).
    listen(this, cld.DocsTree.EventType.NODE_NOT_FOUND, this.onNodeNotFound_).
    listen(this, cld.Today.EventType.GOTO_TODAY, this.onGotoToday_).
    listen(this.dom_.getWindow(), goog.events.EventType.RESIZE,
      goog.bind(this.handleResize_, this));

  var loadingEvents = [
    cld.api.Docs.EventType.LOADING,
    cld.Search.EventType.SEARCHING
  ];
  var loadedEvents = [
    cld.api.Docs.EventType.LOADED,
    cld.Search.EventType.SEARCHED
  ];
  this.handle.
    listen(this, loadingEvents, function(e) {
        cld.message.showLoading();
    }).
    listen(this, loadedEvents, function(e) {
        cld.message.hiddenLoading();
    });

  this.history.setEnabled(true);
};

/**
 * adjust UI when window resize
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.handleResize_ = function(e) {
  this.splitpane.fitSize();
  goog.array.forEach(cld.Zippy.list, function(zippy) {
    zippy.resetContentHeight();
  });
  if (this.doc) {
    this.doc.setEditorAreaHeight();
  }
};

/** @type {boolean} */
cld.App.hashtagChanged = false;

/**
 * Last url hash tag.
 * @type {string}
 */
cld.App.lastToken = '';

/**
 * URL routing using hashtag.
 * @param {goog.events.Event} e The history event.
 * @private
 */
cld.App.prototype.navCallback_ = function(e) {
  var token = e.token;
  if (e.isNavigation) {
    // when user manual change the url hash tag.
    this.controller(token);
  } else if (cld.App.hashtagChanged === false) {
    cld.App.hashtagChanged = true;
    if (token == '') {
      // home page redirect to today diary.
      this.diaryTree.selectTodayNode();
    } else {
      // request the url with hashtag.
      this.controller(token);
    }
  }
  cld.App.lastToken = this.history.getToken();
};

/**
 * controller for url hash tag.
 * @param {string} token The hash tag.
 */
cld.App.prototype.controller = function(token) {
  var type = token.split('/')[0];
  if (type === 'diary' && token.length > 6) {
    var date = cld.DiaryTree.getValidDate(token.substr(6));
    if (date && date != token.substr(6)) {
      this.history.replaceToken('diary/' + date);
    }
    this.diaryTree.selectNodeByDate(date);
  } else if (token === 'notes/new') {
    this.newNote();
  } else if (type === 'notes' && token.length > 6) {
    var id = token.substr(6);
    this.notesTree.selectByKey('notes:' + id);
  } else if (type === 'search' && token.length > 7) {
    var query = token.substr(7);
    this.search.searchDocs(decodeURIComponent(query));
  }
};

/**
 * Open doc when a node of doc tree selected.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onDocSelected_ = function(e) {
  var docsTree = /** @type {!cld.DocsTree} */ (e.target);
  var docType = docsTree.type;
  if (docType === 'diary') {
    this.diaryZippy.zippy.expand();
    //this.notesTree.tree.setSelectedItem(null);
    this.notesTree.tree.select();
    this.createNew.updateMenu('diary');
  } else if (docType === 'notes') {
    this.notesZippy.zippy.expand();
    //this.diaryTree.tree.setSelectedItem(null);
    this.diaryTree.tree.select();
    this.createNew.updateMenu('note');
  }

  var node = docsTree.tree.getSelectedItem();

  if (!this.doc) {
    this.doc = new cld.Doc(cld.App.getInstance());
  }
  this.beforeOpenDoc();
  this.doc.open(node);
  if (this.doc.isNew()) {
    this.createNew.updateMenu('newnote');
  }
  var token = cld.DocsTree.getTokenByNode(node);
  if (token) {
    this.history.setToken(token);
  }
};

/**
 * Create a new doc.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onNewDoc_ = function(e) {
  var type = e.docType;
  var node = /** @type {goog.ui.tree.BaseNode} */ (e.node);
  if (!this.doc) {
    this.doc = new cld.Doc(cld.App.getInstance());
  }
  if (type === 'diary') {
    // new diary
    this.diaryZippy.zippy.expand();
    var token = cld.DocsTree.getTokenByNode(node);
    if (token) {
      this.history.setToken(token);
    }
    this.createNew.updateMenu('diary');
    this.beforeOpenDoc();
    this.doc.open(node);
    this.notesTree.tree.select();
  } else if (type === 'note') {
    // new note
  }
};

/**
 * A new doc created.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onNewDocCreated_ = function(e) {
  var type = e.docType;
  var node = /** @type {!goog.ui.tree.BaseNode} */ (e.node);
  if (type === 'diary') {
    this.diaryTree.addNewNode(node);
    if (this.doc.getOpeningNode() == node) {
      cld.DocsTree.selectNode(node);
    }
  } else {
    if (this.doc.getOpeningNode() == node) {
      var id = node.getModel()['id'];
      cld.DocsTree.setNodeInMap(node);
      this.history.replaceToken('notes/' + id);
      this.createNew.updateMenu('note');
    }
  }
};

/**
 * Discard create new note.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onDiscardNewNote_ = function(e) {
  var node = /** @type {!goog.ui.tree.BaseNode} */ (e.node);
  cld.DocsTree.discardNewNode(node);
};

/**
 * Restored doc.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onDocRestored_ = function(e) {
  var node = /** @type {!goog.ui.tree.BaseNode} */ (e.node);
  cld.DocsTree.restore(node);
  cld.message.hiddenLoading();
};

/**
 * Doc deleted.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onDocDeleted_ = function(e) {
  var node = /** @type {!goog.ui.tree.BaseNode} */ (e.node);
  var deletedNode = cld.DocsTree.deleteNode(node);
  var text = 'id' in node.getModel() ?
    cld.message.TEXT.NOTE_DELETED : cld.message.TEXT.DIARY_DELETED;
  var restoreHandler = goog.bind(this.doc.restoreDoc, this.doc);
  cld.message.show(text, true, function(e) {
      cld.message.hidden();
      var key = cld.DocsTree.getNodeKey(node);
      if (key in cld.DocsTree.allNodes) {
        return;
      }
      cld.message.showLoading();
      restoreHandler(node);
  }, 60);
};


/**
 * Handle goto today event, when click the today button.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onGotoToday_ = function(e) {
  this.diaryTree.selectTodayNode();
};

/**
 * Handle for node not found. Example when manual change the
 * URL hash tag.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onNodeNotFound_ = function(e) {
  if (cld.App.lastToken == '') {
    this.history.replaceToken('diary/' + this.diaryTree.today);
    this.diaryTree.selectTodayNode();
  } else {
    this.history.replaceToken(cld.App.lastToken);
  }
  cld.message.simpleShow(cld.message.TEXT.NODE_NOT_FOUND, 5);
};


/**
 * Create new note callback.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onNewNote_ = function(e) {
  if (e.type === cld.Creation.EventType.NEW_NOTE) {
    this.notesTree.createNewInternal();
    return;
  }
  var referNode = this.notesTree.tree.getSelectedItem();
  if (e.type === cld.Creation.EventType.NEW_CHILDNOTE) {
    var newNoteType = 'child';
  } else {
    var newNoteType = 'sibling';
  }
  this.notesTree.createNewInternal(referNode, newNoteType);
};

/**
 * Search successful callback.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onSearched_ = function(e) {
  var docs = /** @type {Object} */ (e.results);
  var query = /** @type {string} */ (e.query);
  if (this.doc) {
    this.doc.hidden();
  }
  this.notesTree.tree.select();
  this.diaryTree.tree.select();
  this.docsList.show('search', query, docs);
  this.history.setToken('search/' + encodeURIComponent(query));
};

/**
 * Refresh search.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onRefreshSearch_ = function(e) {
  var query = /** @type {string} */ (e.query);
  this.search.searchDocs(query, true);
};

/**
 * Doc selected in doc list.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onDocListSelect_ = function(e) {
  var docType = e.docType;
  if (docType === 'diary') {
    var node = cld.DocsTree.allNodes['diary:' + e.key];
  } else {
    var node = cld.DocsTree.allNodes['notes:' + e.key];
  }
  if (!node) {
    return;
  }
  node.getModel()['source'] = 'search';
  cld.DocsTree.selectNode(node);
};

/**
 * New diary.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.onNewDiary_ = function(e) {
  if (this.doc.isOpen() && this.doc.docType === 'diary') {
    this.doc.showDatePicker();
  } else {
    this.diaryTree.selectTodayNode();
    this.doc.showDatePicker();
  }
};

/**
 * Create new note callback.
 */
cld.App.prototype.newNote = function() {
  this.notesTree.createNewInternal();
};

/**
 * Before open doc action.
 */
cld.App.prototype.beforeOpenDoc = function() {
  this.doc.clearActions();
  this.docsList.hidden();
  this.search.cleanInput();
  cld.message.hidden();
};

/**
 * Run app, assume all file were loaded.
 * @param {cld.App=} opt_app The cld.App instance.
 */
cld.App.prototype.install = function(opt_app) {
  var app = opt_app || cld.App.getInstance();

  this.createNew = new cld.Creation(app);
  this.today = new cld.Today(app);
  this.diaryTree = new cld.DiaryTree(app);
  this.notesTree = new cld.NotesTree(app);
  this.search = new cld.Search(app);
  this.search.initAutoComplete();

  this.docsList = new cld.DocsList(cld.App.getInstance());

  this.loaded();
};

cld.App.getInstance().install();
