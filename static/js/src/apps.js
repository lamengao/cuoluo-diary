/**
 * @fileoverview Apps manager.
 *
 * @author lamengao@gmail.com (Lamengao)
 */
goog.provide('cld.Apps');

goog.require('cld.ui.utils');

goog.require('goog.events');
goog.require('goog.events.EventTarget');

/**
 * Apps constructor
 * @param {cld.App} app the parent event target.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Apps = function(app) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);

  this.dom_ = app.getDomHelper();

  this.elHeader = this.dom_.getElement('apps-title');
  this.elContainer = this.dom_.getElement('apps-container');

  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handle = new goog.events.EventHandler(this);

  this.initAppsManagerLink_();
};
goog.inherits(cld.Apps, goog.events.EventTarget);

/**
 * Initinal apps manager link button.
 * @private
 */
cld.Apps.prototype.initAppsManagerLink_ = function() {
  this.managerLink = cld.ui.utils.newLinkButton('Manage apps');
  this.managerLink.render(this.elContainer);
  this.managerLink.getElement().id = 'appsmanagerlink';

  this.handle.listen(this.managerLink, goog.ui.Component.EventType.ACTION,
    function(){
      alert('Not available yet');
    });
};
