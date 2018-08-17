/**
 * @fileoverview Today button.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.Today');
goog.provide('cld.Today.EventType');

goog.require('cld.DiaryTree');
goog.require('cld.ui.PopupDatePicker');
goog.require('cld.ui.utils');

goog.require('goog.events');
goog.require('goog.events.EventTarget');


/**
 * Today button.
 * @param {cld.App} app the parent event target.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Today = function(app) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);

  this.dom_ = app.getDomHelper();

  this.elContainer = this.dom_.getElement('contentcreationpane');
  this.elToday = this.dom_.getElement('today');

  this.button = cld.ui.utils.newButton(null);
  this.button.decorate(this.elToday);
  this.button.setCaption('Today');
  this.button.setCollapsed(goog.ui.ButtonSide.END);

  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handle = new goog.events.EventHandler(this);

  this.history = app.history;

  this.handle.
    listen(this.history, goog.history.EventType.NAVIGATE, this.isToday).
    listen(this.button, goog.ui.Component.EventType.ACTION,
      goog.bind(this.gotoToday, this));

  this.initDatePickerButton_();
  this.initPopupDatePicker_();
};
goog.inherits(cld.Today, goog.events.EventTarget);

/**
 * Initial date picker button.
 * @private
 */
cld.Today.prototype.initDatePickerButton_ = function() {
  var dropdown = this.dom_.createDom('div',
    'goog-css3-button-dropdown goog-inline-block');
  this.datePickerButton = cld.ui.utils.newToggleButton(dropdown);
  this.datePickerButton.render(this.elContainer);
  this.datePickerButton.getElement().id = 'datepickerbutton';
  this.datePickerButton.setCollapsed(goog.ui.ButtonSide.START);

  this.datePickerButton.setDispatchTransitionEvents(
    goog.ui.Component.State.ALL, true);
};


/**
 * Initial date picker for diary.
 * @private
 */
cld.Today.prototype.initPopupDatePicker_ = function() {
  this.popupDatePicker = new cld.ui.PopupDatePicker(null, this.dom_);
  this.popupDatePicker.render();
  this.popupDatePicker.setAllowAutoFocus(false);
  this.datePicker = this.popupDatePicker.getDatePicker();
  this.datePicker.setAllowNone(false);
  this.datePicker.setShowToday(false);
  this.datePicker.setShowWeekNum(false);
  this.datePicker.setUseSimpleNavigationMenu(true);
  this.datePicker.setUseNarrowWeekdayNames(true);

  this.popupDatePicker.attachButton(this.datePickerButton);

  this.handle.listen(this.popupDatePicker, goog.ui.DatePicker.Events.CHANGE,
      function(e) {
        var date = cld.Doc.getDateString(e.date);
        this.dispatchEvent({
            type: cld.Today.EventType.DATE_CHANGED,
            date: date
        });
      }, false, this);
};

/**
 * Show date picker.
 */
cld.Today.prototype.showDatePicker = function() {
  this.datePickerButton.setChecked(true);
};

/**
 * Check if today, and change the today button.
 * @param {goog.events.Event} e toggle event.
 * @return {boolean} is today?
 */
cld.Today.prototype.isToday = function(e) {
  var token = e.token;
  if (token === 'diary/' + cld.DiaryTree.getTodayDate()) {
    this.button.setEnabled(false);
    return true;
  } else {
    this.button.setEnabled(true);
    return false;
  }
};

/**
 * Go to the diary of today.
 * @param {goog.events.Event} e toggle event.
 */
cld.Today.prototype.gotoToday = function(e) {
  this.dispatchEvent(cld.Today.EventType.GOTO_TODAY);
};

/** @enum {string} */
cld.Today.EventType = {
  GOTO_TODAY: goog.events.getUniqueId('goto_today'),
  DATE_CHANGED: goog.events.getUniqueId('date_changed')
};
