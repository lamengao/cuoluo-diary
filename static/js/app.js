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
  goog.events.listen(window, goog.events.EventType.RESIZE,
    this.handleResize_, this);
};

/**
 * adjust UI when window resize
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.App.prototype.handleResize_ = function(e) {
  //this.splitpane.handleResize(this.vsm.getSize());
  alert('yes');
};

cuoluoDiary = new cld.App();
cuoluoDiary.init();
