/**
 * @fileoverview 程序初始化和主要入口.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.App');

/**
 * @constructor
 */
cld.App = function() {
  this.dom_ = goog.dom.getDomHelper();
  /**
   * @type {cld.SplitPane}
   */
  this.splitpane = new cld.SplitPane(this.dom_);
};

/**
 * Run app, assume all file were loaded.
 */
cld.App.prototype.init = function() {
  goog.events.listen(this.dom_.getWindow(), goog.events.EventType.RESIZE,
    goog.bind(this.handleResize_, this));
};

/**
 * adjust UI when window resize
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.handleResize_ = function(e) {
  this.splitpane.fitSize();
};

cuoluoDiary = new cld.App();
cuoluoDiary.init();
