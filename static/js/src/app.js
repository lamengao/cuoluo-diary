/**
 * @fileoverview App.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.App');

goog.require('cld.Creation');
goog.require('cld.DiaryTree');
goog.require('cld.NotesTree');
goog.require('cld.Search');
goog.require('cld.SplitPane');
goog.require('cld.Tasks');
goog.require('cld.Today');
goog.require('cld.Zippy');
goog.require('cld.ui.utils');

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

  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handle = new goog.events.EventHandler(this);
  /** @type {cld.SplitPane} */
  this.splitpane = new cld.SplitPane(this.dom_);
  /** @type {cld.Zippy} */
  this.diaryZippy = new cld.Zippy('diary-tree-header',
                                  'diary-tree-content', this.dom_);
  /** @type {cld.Zippy} */
  this.notesZippy = new cld.Zippy('notes-tree-header',
                                  'notes-tree-content', this.dom_);
  /** @type {cld.Zippy} */
  this.tasksZippy = new cld.Zippy('tasks-title',
                                  'tasks-container', this.dom_);
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
  goog.events.listen(this.dom_.getWindow(), goog.events.EventType.RESIZE,
    goog.bind(this.handleResize_, this));

  goog.dom.classes.remove(this.dom_.getElement('main'), 'vh');
  goog.dom.classes.remove(this.dom_.getElement('search'), 'vh');
  goog.dom.classes.add(this.dom_.getElement('loadingStatus'), 'hidden');
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
};

/**
 * Run app, assume all file were loaded.
 */
cld.App.prototype.install = function() {
  var app = cld.App.getInstance();
  this.createNew = new cld.Creation(app);
  this.today = new cld.Today(app);
  this.search = new cld.Search(app);
  this.diaryTree = new cld.DiaryTree(app);
  this.notesTree = new cld.NotesTree(app);

  this.loaded();
};

cld.App.getInstance().install();
