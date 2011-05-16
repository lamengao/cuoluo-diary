/**
 * @fileoverview Search diary and notes or search the web.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.Search');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.ImagelessButtonRenderer');

/**
 * Search.
 * @param {cld.App} app the parent event target.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Search = function(app, opt_domHelper) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  this.elSearchForm = this.dom_.getElement('search');
  this.elInput = this.dom_.getElement('search-input');
  this.elSearchDiary = this.dom_.getElement('search-diary-button');
  this.elSearchWeb = this.dom_.getElement('search-web-button');

  this.createSearchDiaryButton();
  this.createSearchWebButton();

  goog.events.listen(this.elSearchForm, goog.events.EventType.SUBMIT,
    function(e) {
      alert('submited');
      e.preventDefault();
  });
};
goog.inherits(cld.Search, goog.events.EventTarget);

/**
 * Create search diary button.
 */
cld.Search.prototype.createSearchDiaryButton = function() {
  this.searchDiaryButton = new goog.ui.CustomButton(null,
    cld.ui.utils.getButtonRenderer());
  this.searchDiaryButton.decorate(this.elSearchDiary);
  this.searchDiaryButton.setCaption('Search Diary and Notes');
  this.searchDiaryButton.setCollapsed(goog.ui.Button.Side.START);
  goog.events.listen(this.searchDiaryButton,
    goog.ui.Component.EventType.ACTION,
    goog.bind(this.searchDiary, this));
};

/**
 * Create search web button.
 */
cld.Search.prototype.createSearchWebButton = function() {
  this.searchWebButton = new goog.ui.CustomButton(null,
    cld.ui.utils.getButtonRenderer());
  this.searchWebButton.decorate(this.elSearchWeb);
  this.searchWebButton.setCaption('Search the Web');
  goog.events.listen(this.searchWebButton, goog.ui.Component.EventType.ACTION,
    goog.bind(this.searchWeb, this));
};

/**
 * search web and submit the form.
 */
cld.Search.prototype.searchWeb = function() {
  this.elSearchForm.submit();
};

/**
 * search diary and notes
 */
cld.Search.prototype.searchDiary = function() {
  alert('search diary and notes');
};

/**
 * clean the search input.
 */
cld.Search.prototype.cleanInput = function() {
  this.elInput.value = '';
};
