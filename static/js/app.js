/**
 * @fileoverview App.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.App');

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
  this.tasks = new cld.Tasks(this.dom_);

};
goog.inherits(cld.App, goog.events.EventTarget);
goog.addSingletonGetter(cld.App);

/**
 * Run app, assume all file were loaded.
 */
cld.App.prototype.init = function() {
  var app = cld.App.getInstance();
  this.createNew = new cld.Creation(app, this.dom_);
  this.today = new cld.Today(app, this.dom_);
  this.search = new cld.Search(app, this.dom_);

  this.loaded();
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

cuoluoDiary = cld.App.getInstance();
cuoluoDiary.init();
