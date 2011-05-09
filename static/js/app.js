/**
 * @fileoverview 程序初始化和主要入口.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.App');

goog.require('goog.ui.Zippy');

/**
 * @constructor
 */
cld.App = function() {
  this.dom_ = goog.dom.getDomHelper();
  /** @type {cld.SplitPane} */
  this.splitpane = new cld.SplitPane(this.dom_);
  /** @type {cld.Zippy} */
  this.diaryZippy = new cld.Zippy('diary-tree-header',
                                  'diary-tree-content', this.dom_);
  /** @type {cld.Zippy} */
  this.notesZippy = new cld.Zippy('notes-tree-header',
                                  'notes-tree-content', this.dom_);

};

/**
 * Run app, assume all file were loaded.
 */
cld.App.prototype.init = function() {
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

cuoluoDiary = new cld.App();
cuoluoDiary.init();
