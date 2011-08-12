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
  //this.elHeader = this.dom_.getElement('tasks-title');
  //this.elContainer = this.dom_.getElement('tasks-container');
  this.elContainer = this.dom_.getElement('gbd1');

  // whether alrealy logged in gmail
  this.loggedIn = false;

  this.loginTester();
};

/** @type {string} */
cld.Tasks.URL = 'https://mail.google.com/tasks/ig?pli=1';

/** @type {string} */
cld.Tasks.loginTesterImg = 'https://bit.ly/m9PaPq';

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
        this.loggedIn = true;
        this.showTasksIframe_();
      } else {
        this.loggedIn = false;
        this.showRelogin_();
      }
      this.hiddenMsg_();
      this.setWrapFitHeight();
      loader.dispose();
  }, false, this);
  loader.start();
};

/**
 * Load tasks iframe assume use logged in to gmail.
 * @private
 */
cld.Tasks.prototype.showTasksIframe_ = function() {
  var iframe = this.dom_.createDom('iframe', {'id':'tasksiframe',
                                            'name':'tasksiframe',
                                            'frameborder':'0',
                                            'src': cld.Tasks.URL});
  this.dom_.append(/** @type {!Node} */ (this.elContainer), iframe);
};

/**
 * Hidden message.
 * @private
 */
cld.Tasks.prototype.hiddenMsg_ = function() {
  var msg = this.dom_.getElementByClass('gbmsg', this.elContainer);
  goog.style.showElement(msg, false);
};

/**
 * Set content div height.
 * @param {number} h The height.
 */
cld.Tasks.prototype.setWrapHeight = function(h) {
  var gbmc = this.dom_.getElementByClass('gbmc', this.elContainer);
  goog.style.setHeight(this.elContainer, h);
  goog.style.setHeight(gbmc, h);
};

/**
 * Set content div fit height.
 */
cld.Tasks.prototype.setWrapFitHeight = function() {
  if (this.loggedIn) {
    var viewportHeight = this.dom_.getViewportSize().height;
    if (viewportHeight > 450) {
      this.setWrapHeight(450);
    } else {
      this.setWrapHeight(viewportHeight * 0.8);
    }
  } else {
    this.setWrapHeight(190);
  }
};

/**
 * Show relogin div assume use not logged in.
 * @private
 */
cld.Tasks.prototype.showRelogin_ = function() {
  var div = this.dom_.getElement('relogin');
  div.style.display = 'block';
  //goog.style.showElement(div, true);
  //console.log(div.style.display);
};
