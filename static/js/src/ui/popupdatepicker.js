/**
 * @fileoverview Popup Date Picker implementation.  Pairs a goog.ui.DatePicker
 * with a goog.ui.Popup allowing the DatePicker to be attached to elements.
 *
 */

goog.provide('cld.ui.PopupDatePicker');

goog.require('goog.events.EventType');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.DatePicker');
goog.require('goog.ui.DatePicker.Events');
goog.require('goog.ui.Popup');
goog.require('goog.ui.PopupBase.EventType');



/**
 * Popup date picker widget.
 *
 * @param {goog.ui.DatePicker=} opt_datePicker Optional DatePicker.  This
 *     enables the use of a custom date-picker instance.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {goog.ui.Component}
 * @constructor
 */
cld.ui.PopupDatePicker = function(opt_datePicker, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  this.datePicker_ = opt_datePicker || new goog.ui.DatePicker();
};
goog.inherits(cld.ui.PopupDatePicker, goog.ui.Component);


/**
 * Instance of a date picker control.
 * @type {goog.ui.DatePicker?}
 * @private
 */
cld.ui.PopupDatePicker.prototype.datePicker_ = null;


/**
 * Instance of goog.ui.Popup used to manage the behavior of the date picker.
 * @type {goog.ui.Popup?}
 * @private
 */
cld.ui.PopupDatePicker.prototype.popup_ = null;


/**
 * Reference to the element that triggered the last popup.
 * @type {Element}
 * @private
 */
cld.ui.PopupDatePicker.prototype.lastTarget_ = null;


/**
 * Whether the date picker can move the focus to its key event target when it
 * is shown.  The default is true.  Setting to false can break keyboard
 * navigation, but this is needed for certain scenarios, for example the
 * toolbar menu in trogedit which can't have the selection changed.
 * @type {boolean}
 * @private
 */
cld.ui.PopupDatePicker.prototype.allowAutoFocus_ = true;


/** @inheritDoc */
cld.ui.PopupDatePicker.prototype.createDom = function() {
  cld.ui.PopupDatePicker.superClass_.createDom.call(this);
  this.getElement().className = goog.getCssName('goog-popupdatepicker');
  this.popup_ = new goog.ui.Popup(this.getElement());
};


/** @inheritDoc */
cld.ui.PopupDatePicker.prototype.enterDocument = function() {
  cld.ui.PopupDatePicker.superClass_.enterDocument.call(this);
  // Create the DatePicker, if it isn't already.
  // Done here as DatePicker assumes that the element passed to it is attached
  // to a document.
  if (!this.datePicker_.isInDocument()) {
    var el = this.getElement();
    // Make it initially invisible
    el.style.visibility = 'hidden';
    goog.style.showElement(el, false);
    this.datePicker_.decorate(el);
  }
  this.getHandler().listen(this.datePicker_, goog.ui.DatePicker.Events.CHANGE,
                           this.onDateChanged_);
  this.getHandler().listen(this.popup_, goog.ui.PopupBase.EventType.HIDE,
    function(e) {
      if (!e.target || (this.elAttach_ && e.target != this.elAttach_ &&
                        e.target.parentNode != this.elAttach_)) {
        goog.dom.classes.remove(this.elAttach_, 'datepicker-on');
      }
    }, false, this);
};


/** @inheritDoc */
cld.ui.PopupDatePicker.prototype.disposeInternal = function() {
  cld.ui.PopupDatePicker.superClass_.disposeInternal.call(this);
  if (this.popup_) {
    this.popup_.dispose();
    this.popup_ = null;
  }
  this.datePicker_.dispose();
  this.datePicker_ = null;
  this.lastTarget_ = null;
};


/**
 * DatePicker cannot be used to decorate pre-existing html, since they're
 * not based on Components.
 * @param {Element} element Element to decorate.
 * @return {boolean} Returns always false.
 */
cld.ui.PopupDatePicker.prototype.canDecorate = function(element) {
  return false;
};


/**
 * @return {goog.ui.DatePicker} The date picker instance.
 */
cld.ui.PopupDatePicker.prototype.getDatePicker = function() {
  return this.datePicker_;
};


/**
 * @return {goog.date.Date?} The selected date, if any.  See
 *     goog.ui.DatePicker.getDate().
 */
cld.ui.PopupDatePicker.prototype.getDate = function() {
  return this.datePicker_.getDate();
};


/**
 * Sets the selected date.  See goog.ui.DatePicker.setDate().
 * @param {goog.date.Date?} date The date to select.
 */
cld.ui.PopupDatePicker.prototype.setDate = function(date) {
  this.datePicker_.setDate(date);
};


/**
 * @return {Element} The last element that triggered the popup.
 */
cld.ui.PopupDatePicker.prototype.getLastTarget = function() {
  return this.lastTarget_;
};


/**
 * Attaches the popup date picker to an element.
 * @param {Element} element The element to attach to.
 */
cld.ui.PopupDatePicker.prototype.attach = function(element) {
  this.elAttach_ = element;
  this.getHandler().listen(element, goog.events.EventType.MOUSEDOWN,
                           this.showPopup_);
};


/**
 * Detatches the popup date picker from an element.
 * @param {Element} element The element to detach from.
 */
cld.ui.PopupDatePicker.prototype.detach = function(element) {
  this.getHandler().unlisten(element, goog.events.EventType.MOUSEDOWN,
                             this.showPopup_);
};


/**
 * Sets whether the date picker can automatically move focus to its key event
 * target when it is set to visible.
 * @param {boolean} allow Whether to allow auto focus.
 */
cld.ui.PopupDatePicker.prototype.setAllowAutoFocus = function(allow) {
  this.allowAutoFocus_ = allow;
};


/**
 * @return {boolean} Whether the date picker can automatically move focus to
 * its key event target when it is set to visible.
 */
cld.ui.PopupDatePicker.prototype.getAllowAutoFocus = function() {
  return this.allowAutoFocus_;
};


/**
 * Show the popup at the bottom-left corner of the specified element.
 * @param {Element} element Reference element for displaying the popup -- popup
 *     will appear at the bottom-left corner of this element.
 */
cld.ui.PopupDatePicker.prototype.showPopup = function(element) {
  if (!goog.dom.classes.has(element, 'datepicker-on')) {
    goog.dom.classes.add(element, 'datepicker-on');
  }
  this.lastTarget_ = element;
  this.popup_.setPinnedCorner(goog.positioning.Corner.TOP_RIGHT);
  this.popup_.setPosition(new goog.positioning.AnchoredPosition(
      element, goog.positioning.Corner.BOTTOM_END));

  // Don't listen to date changes while we're setting up the popup so we don't
  // have to worry about change events when we call setDate().
  this.getHandler().unlisten(this.datePicker_, goog.ui.DatePicker.Events.CHANGE,
                             this.onDateChanged_);
  //this.datePicker_.setDate(null);

  // Forward the change event onto our listeners.  Done before we start
  // listening to date changes again, so that listeners can change the date
  // without firing more events.
  this.dispatchEvent(goog.ui.PopupBase.EventType.SHOW);

  this.getHandler().listen(this.datePicker_, goog.ui.DatePicker.Events.CHANGE,
                           this.onDateChanged_);
  this.popup_.setVisible(true);
  if (this.allowAutoFocus_) {
    this.getElement().focus();  // Our element contains the date picker.
  }
};


/**
 * Handles click events on the targets and shows the date picker.
 * @param {goog.events.Event} event The click event.
 * @private
 */
cld.ui.PopupDatePicker.prototype.showPopup_ = function(event) {
  var element = /** @type {Element} */ (event.currentTarget);
  goog.dom.classes.toggle(element, 'datepicker-on');
  if (goog.dom.classes.has(element, 'datepicker-on')) {
    this.showPopup(element);
  } else {
    this.hidePopup();
  }
};


/**
 * Hides this popup.
 */
cld.ui.PopupDatePicker.prototype.hidePopup = function() {
  this.popup_.setVisible(false);
  if (this.allowAutoFocus_ && this.lastTarget_) {
    this.lastTarget_.focus();
  }
};


/**
 * Called when the date is changed.
 *
 * @param {goog.events.Event} event The date change event.
 * @private
 */
cld.ui.PopupDatePicker.prototype.onDateChanged_ = function(event) {
  this.hidePopup();

  // Forward the change event onto our listeners.
  this.dispatchEvent(event);
};
