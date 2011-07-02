/**
 * @fileoverview Image dialog for insert image in rich editor.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.editor.ImageDialog');

goog.require('goog.editor.focus');
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

  /**
   * The event handler for this dialog.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);
};
goog.inherits(cld.editor.ImageDialog, goog.ui.editor.AbstractDialog);

/** @inheritDoc */
cld.editor.ImageDialog.prototype.createDialogControl = function() {
  var content = this.dom.createDom(goog.dom.TagName.DIV);
  var builder = new goog.ui.editor.AbstractDialog.Builder(this);
  var DIALOG_TITLE = goog.getMsg('Add an Image');
  builder.setTitle(DIALOG_TITLE).setContent(content);

  this.tabPane_ = new goog.ui.editor.TabPane(this.dom);
  this.tabPane_.addTab(cld.editor.ImageDialog.Id_.UPLOAD_TAB,
      goog.getMsg('My Computer'),
      goog.getMsg('Add one of your images to your doc'),
      this.buildTabUpload_());
  this.tabPane_.addTab(cld.editor.ImageDialog.Id_.WEB_ADDRESS_TAB,
      goog.getMsg('Web address (URL)'),
      goog.getMsg('Add an image from the web'),
      this.buildTabOnTheWeb_());
  this.tabPane_.render(content);
  return builder.build();
};

/** @inheritDoc */
cld.editor.ImageDialog.prototype.disposeInternal = function() {
  this.eventHandler_.dispose();
  this.eventHandler_ = null;

  this.urlInputHandler_.dispose();
  this.urlInputHandler_ = null;
  //this.emailInputHandler_.dispose();
  //this.emailInputHandler_ = null;
  this.input_ = null;
  this.imagePreview_ = null;
  this.previewImage_ = null;

  goog.base(this, 'disposeInternal');
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
cld.editor.ImageDialog.prototype.buildTabOnTheWeb_ = function() {
  var onTheWebDiv = this.dom.createElement(goog.dom.TagName.DIV);
  this.input_ = this.dom.createDom(goog.dom.TagName.INPUT,
    {id: 'imagedialog-web-input'});
  var DIALOG_PROMPT = this.dom.createTextNode(goog.getMsg('Image URL'));
  this.createPreviewDom_();
  onTheWebDiv.appendChild(DIALOG_PROMPT);
  onTheWebDiv.appendChild(this.input_);
  onTheWebDiv.appendChild(this.imagePreview_);

  this.urlInputHandler_ = new goog.events.InputHandler(this.input_);
  this.eventHandler_.listen(this.urlInputHandler_,
      goog.events.InputHandler.EventType.INPUT,
      this.onUrlInputChange_, false, this);

  return onTheWebDiv;
};

/**
 * Creates the DOM structure that makes up the dialog's content area.
 * @private
 */
cld.editor.ImageDialog.prototype.createPreviewDom_ = function() {
  this.imagePreview_ = this.dom.createDom(goog.dom.TagName.DIV,
    {id: 'tr_image-dialog-external-image-preview',
    className: 'image-preview'});
  this.previewNote_ = this.dom.createDom(goog.dom.TagName.P, 'previewnote',
    cld.editor.MESSAGE_.PREVIEW_NOTE);
  this.imagePreview_.appendChild(this.previewNote_);
  this.imagePreview_.appendChild(this.dom.createDom(goog.dom.TagName.P, null,
                                 this.dom.createTextNode(
                                 cld.editor.MESSAGE_.PREVIEW_WARNING)));
};

/**
 * Called on a change to the url input. If either one of those tabs
 * is active, sets the OK button to enabled/disabled accordingly.
 * @private
 */
cld.editor.ImageDialog.prototype.syncOkButton_ = function() {
  var inputValue;
  if (this.tabPane_.getCurrentTabId() ==
      cld.editor.ImageDialog.Id_.WEB_ADDRESS_TAB) {
    inputValue = this.input_.value;
    this.getOkButtonElement().disabled = !this.isValidImage_;
  } else if (this.tabPane_.getCurrentTabId() ==
      cld.editor.ImageDialog.Id_.UPLOAD_TAB) {
    this.getOkButtonElement().disabled = false;
  } else {
    return;
  }
};

/**
 * @private
 */
cld.editor.ImageDialog.prototype.onUrlInputChange_ = function() {
  this.isValidImage_ = false;
  this.makePreviewImage_();
  if (this.dom.contains(this.imagePreview_, this.previewImage_)) {
    this.imagePreview_.removeChild(this.previewImage_);
  }
  this.previewImage_.src = this.getImageUrl_();
  //goog.dom.classes.remove(this.previewNote_, 'hidden');
  goog.style.showElement(this.previewNote_, true);
  this.syncOkButton_();
};

/**
 * Create preview image and listen load event if the image url is valid.
 * @private
 */
cld.editor.ImageDialog.prototype.makePreviewImage_ = function() {
  if (this.previewImage_) {
    return;
  }
  this.previewImage_ = this.dom.createDom(goog.dom.TagName.IMG);
  this.eventHandler_.listen(this.previewImage_,
      goog.events.EventType.LOAD, function(e) {
        //goog.dom.classes.add(this.previewNote_, 'hidden');
        goog.style.showElement(this.previewNote_, false);
        this.fitImageSize_();
        this.imagePreview_.insertBefore(this.previewImage_, this.previewNote_);
        this.isValidImage_ = true;
        this.syncOkButton_();
      }, false, this);
};

/**
 * Set image's max width and height.
 * @private
 */
cld.editor.ImageDialog.prototype.fitImageSize_ = function() {
  if (!this.previewImage_) {
    return;
  }
  var img = this.previewImage_;
  var fitWidth = 424;
  var fitHeight = 400;
  img.removeAttribute('width');
  img.removeAttribute('height');
  img.style.width = 'auto';
  img.style.height = 'auto';
  var w = img.width;
  var h = img.height;
  if (w && h) {
    if ((w / h) >= (fitWidth / fitHeight)) {
      if (w > fitWidth) {
        img.style.width = fitWidth + 'px';
        img.style.height = ((h * fitWidth) / w) + 'px';
      } else {
        img.style.width = w + 'px';
        img.style.height = h + 'px';
      }
    } else {
      if (h > fitHeight) {
        img.style.height = fitHeight + 'px';
        img.style.width = ((w * fitHeight) / h) + 'px';
      } else {
        img.style.width = w + 'px';
        img.style.height = h + 'px';
      }
    }
  }
};

/**
 * Returns the image URL typed into the dialog's input.
 * @return {?string} The image URL currently typed into the dialog's input.
 * @private
 */
cld.editor.ImageDialog.prototype.getImageUrl_ = function() {
  return this.input_ && this.input_.value;
};

/**
 * Creates the DOM structure for upload image tab.
 * @return {Element} The DOM structure that makes up the dialog's content area.
 * @private
 */
cld.editor.ImageDialog.prototype.buildTabUpload_ = function() {
  return this.dom.createDom(goog.dom.TagName.DIV);
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

/** @inheritDoc */
cld.editor.ImageDialog.prototype.show = function() {
  goog.base(this, 'show');

  this.tabPane_.setSelectedTabId(cld.editor.ImageDialog.Id_.WEB_ADDRESS_TAB);

  // Focus on the input field in the selected tab.
  goog.editor.focus.focusInputField(this.input_);

  this.syncOkButton_();
};

/**
 * IDs for relevant DOM elements.
 * @enum {string}
 * @private
 */
cld.editor.ImageDialog.Id_ = {
  WEB_ADDRESS_TAB: 'imagedialog-web',
  UPLOAD_TAB: 'imagedialog-upload'
};

/**
 * @enum {string}
 * @private
 */
cld.editor.MESSAGE_ = {
  PREVIEW_NOTE: 'If your URL is correct, you\'ll see an image preview here.' +
                'Large images may take a few minutes to appear.',
  PREVIEW_WARNING: 'Remember: Using others\' images on the web without ' +
                   'their permission may be bad manners, or worse, ' +
                   'copyright infringement.'
};
