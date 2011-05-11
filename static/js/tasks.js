/**
 * @fileoverview Google Tasks in Cuoluo Diary.
 *
 * @author lamengao@gmail.com (Lamengao)
 */
goog.provide('cld.Tasks');

goog.require('goog.net.ImageLoader');

/**
 * Tasks constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 */
cld.Tasks = function(opt_domHelper) {
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();
  this.elHeader = this.dom_.getElement('tasks-title');
  this.elContainer = this.dom_.getElement('tasks-container');

  this.loginTester();
};

/** @type {string} */
cld.Tasks.URL = 'https://mail.google.com/tasks/ig?pli=1';

/** @type {string} */
cld.Tasks.loginTesterImg = 'http://goo.gl/Wygy0';

/**
 * Test use whether loggin to gmail, if logged in load the iframe
 * if not display re login text.
 */
cld.Tasks.prototype.loginTester = function() {
  var loader = new goog.net.ImageLoader();
  loader.addImage('loginTester', cld.Tasks.loginTesterImg);
  var eventTypes = [
      goog.events.EventType.LOAD,
      goog.net.EventType.ERROR
  ];
  goog.events.listen(loader, eventTypes, function(e) {
      if (e.type == goog.events.EventType.LOAD) {
        this.showTasksIframe_();
      } else {
        this.showRelogin_();
      }
      loader.dispose();
  }, false, this);
  loader.start();
};

/**
 * Load tasks iframe assume use logged in to gmail.
 * @private
 */
cld.Tasks.prototype.showTasksIframe_ = function() {
  var html = '<iframe id="tasksiframe" name="tasksiframe" frameborder="0"' +
             'src="' + cld.Tasks.URL + '"></iframe>';
  var df = this.dom_.htmlToDocumentFragment(html);
  this.dom_.append(this.elContainer, df);
};

/**
 * Show relogin div assume use not logged in.
 * @private
 */
cld.Tasks.prototype.showRelogin_ = function() {
  var div = this.dom_.getElement('relogin');
  goog.dom.classes.remove(div, 'hidden');
};
