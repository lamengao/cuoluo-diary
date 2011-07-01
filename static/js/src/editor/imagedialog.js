/**
 * @fileoverview Image dialog for insert image in rich editor.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.editor.ImageDialog');

goog.require('goog.ui.editor.AbstractDialog');

/**
 * Creates a dialog for the user to enter the URL of an image to insert.
 * @param {goog.dom.DomHelper} dom DomHelper to be used to create the dialog's
 * DOM structure.
 * @constructor
 * @extends {goog.ui.editor.AbstractDialog}
 */
cld.editor.ImageDialog = function(dom) {
  goog.base(this, dom);
};
goog.inherits(cld.editor.ImageDialog, goog.ui.editor.AbstractDialog);

/** @inheritDoc */
cld.editor.ImageDialog.prototype.createDialogControl = function() {
  var builder = new goog.ui.editor.AbstractDialog.Builder(this);
  var DIALOG_TITLE = goog.getMsg('Add an Image');
  builder.setTitle(DIALOG_TITLE).setContent(this.createContent_());
  return builder.build();
};

/**
 * Input element where the user will type the image URL.
 * @type {Element}
 * @private
 */
cld.editor.ImageDialog.prototype.input_;

/**
 * Creates the DOM structure that makes up the dialog's content area.
 * @return {Element} The DOM structure that makes up the dialog's content area.
 * @private
 */
cld.editor.ImageDialog.prototype.createContent_ = function() {
  this.input_ = this.dom.createDom(goog.dom.TagName.INPUT,
    {size: 25, value: 'http://'});
  var DIALOG_PROMPT = goog.getMsg('Enter the url to the image');
  return this.dom.createDom(goog.dom.TagName.DIV, null,
    [DIALOG_PROMPT, this.input_]);
};

/**
 * Returns the image URL typed into the dialog's input.
 * @return {?string} The image URL currently typed into the dialog's input.
 * @private
 */
cld.editor.ImageDialog.prototype.getImageUrl_ = function() {
  return this.input_ && this.input_.value();
};

/**
 * Creates and returns the event object to be used when dispatching the OK
 * event to listeners, or returns null to prevent the dialog from closing.
 * @param {goog.events.Event} e The event object dispatched by
 * the wrapped dialog.
 * @return {goog.events.Event} The event object to be used
 * when dispatching the OK event to listeners.
 * @protected
 * @override
 */
cld.editor.ImageDialog.prototype.createOkEvent = function(e) {
  var url = this.getImageUrl_();
  if (url) {
    var event =
      new goog.events.Event(goog.ui.editor.AbstractDialog.EventType.OK);
    event.url = url;
    return event;
  } else {
    var DIALOG_ERROR = goog.getMsg('You must input an image URL');
    this.dom.getWindow().alert(DIALOG_ERROR);
    return null; // Prevents the dialog from closing.
  }
};
