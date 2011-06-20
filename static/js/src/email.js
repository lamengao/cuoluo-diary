/**
 * @fileoverview Create new email in Cuoluo Diary.
 *
 * @author lamengao@gmail.com (Lamengao)
 */
goog.provide('cld.Email');
goog.provide('cld.Email.EventType');

goog.require('cld.api.Email');
goog.require('cld.ui.utils');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.format.EmailAddress');


/**
 * Email constructor
 * @param {cld.App} app the parent event target.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Email = function(app) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);
  this.dom_ = app.getDomHelper();

  this.element = this.dom_.getElement('email');
  this.elHeader = this.dom_.getElement('email-header');
  this.elContainer = this.dom_.getElement('email-container');
  this.elFooter = this.dom_.getElement('email-footer');

  this.elFrom = this.dom_.getElement('email-from');
  this.elTo = this.dom_.getElement('email-to');
  this.elSubject = this.dom_.getElement('email-subject');
  this.elBody = this.dom_.getElement('email-body');

  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handle = new goog.events.EventHandler(this);
  this.emailApi = new cld.api.Email();

  this.userEmail = goog.global['_USER_EMAIL'];
  this.userNickname = this.userEmail.split('@')[0];

  var from = this.userNickname + ' <' + this.userEmail + '>';
  this.dom_.setTextContent(this.elFrom, from);
};
goog.inherits(cld.Email, goog.events.EventTarget);

/**
 * Adjust field size.
 */
cld.Email.prototype.adjustFieldSize = function() {
  var containerSize = goog.style.getSize(this.elContainer);
  var height = containerSize.height;
  var width = containerSize.width;

  this.elBody.style.width = (width - 25 - 3) + 'px';
  this.elBody.style.height = (height - 35 * 3 - 5 - 16) + 'px';
  var inputWidth = width - 67 - 8;
  this.elTo.style.width = inputWidth + 'px';
  this.elSubject.style.width = inputWidth + 'px';
};

/**
 * Open compose email.
 * @param {string=} backto When discard where to go.
 */
cld.Email.prototype.open = function(backto) {
  this.backto = backto || '';
  if (this.isOpen()) {
    return;
  }
  this.show();
  this.adjustFieldSize();
  if (!this.sendButton) {
    this.initButtons_();
  }
};

/**
 * Create send button and discard button.
 * @private
 */
cld.Email.prototype.initButtons_ = function() {
  var newButton = function(content, parent, id) {
    var button = cld.ui.utils.newButton(content);
    button.render(parent);
    button.getElement().id = id;
    goog.dom.classes.add(button.getElement(), 'emailbutton');
    return button;
  };
  this.sendButton = newButton('Send', this.elHeader, 'sendbutton');
  this.discardButton = newButton('Discard', this.elHeader, 'discardbutton');
  this.btmSendButton = newButton('Send', this.elFooter, 'btmsendbutton');
  this.btmDiscardButton =
    newButton('Discard', this.elFooter, 'btmdiscardbutton');

  this.handle.
    listen(this.sendButton, goog.ui.Component.EventType.ACTION,
      this.send_, false, this).
    listen(this.btmSendButton, goog.ui.Component.EventType.ACTION,
      this.send_, false, this).
    listen(this.discardButton, goog.ui.Component.EventType.ACTION,
      this.discard_, false, this).
    listen(this.btmDiscardButton, goog.ui.Component.EventType.ACTION,
      this.discard_, false, this);
};

/**
 * Send email.
 * @param {goog.events.Event} e toggle event.
 * @private
 */
cld.Email.prototype.send_ = function(e) {
  var addresses = this.elTo.value;
  var subject = this.elSubject.value;
  var body = this.elBody.value;
  if (addresses == '') {
    alert(cld.Email.TEXT.EMPTY_ADD);
    return;
  }
  if (body == '' && !confirm(cld.Email.TEXT.SEND_NO_BODY)) {
    return;
  }
  var emails = [];
  var emailAddresses = goog.format.EmailAddress.parseList(addresses);
  for (var i = 0; i < emailAddresses.length; i++) {
    var email = emailAddresses[i];
    if (email.isValid()) {
      emails.push(email.toString());
    } else {
      var msg = 'Error:\n' +
                cld.Email.TEXT.ADD_ERR.replace(/{add}/, email.getAddress());
      alert(msg);
      return;
    }
  }
  var to = emails.join(',');
  this.dispatchEvent(cld.Email.EventType.SENDING);
  var successCallback = goog.bind(this.onMailSent_, this, this.backto);
  this.emailApi.send(to, subject, body, successCallback);
};

/**
 * Email sent callback.
 * @param {string} backto The backto.
 * @param {goog.events.Event} e toggle event.
 * @private
 */
cld.Email.prototype.onMailSent_ = function(backto, e) {
  this.cleanField();
  this.dispatchEvent({
      type: cld.Email.EventType.SENT,
      backto: backto
  });
};

/**
 * Discard email.
 * @param {goog.events.Event} e toggle event.
 * @private
 */
cld.Email.prototype.discard_ = function(e) {
  this.cleanField();
  var backto = this.backto;
  this.dispatchEvent({
      type: cld.Email.EventType.DISCARD,
      backto: backto
  });
};

/**
 * Clean email field.
 */
cld.Email.prototype.cleanField = function() {
  this.elTo.value = '';
  this.elSubject.value = '';
  this.elBody.value = '';
};

/**
 * whether the compose email is opening.
 * @return {boolean} Is open?
 */
cld.Email.prototype.isOpen = function() {
  return !goog.dom.classes.has(this.element, 'hidden');
};

/**
 * Show #email element.
 */
cld.Email.prototype.show = function() {
  goog.dom.classes.remove(this.element, 'hidden');
};

/**
 * Hidden #email element.
 */
cld.Email.prototype.hidden = function() {
  goog.dom.classes.add(this.element, 'hidden');
};

/** @enum {string} */
cld.Email.EventType = {
  SENDING: goog.events.getUniqueId('sending'),
  SENT: goog.events.getUniqueId('sent'),
  DISCARD: goog.events.getUniqueId('discard')
};

/** @enum {string} */
cld.Email.TEXT = {
  ADD_ERR: 'The address "{add}" in the "To" field was not recognized.' +
           'Please make sure that all addresses are properly formed.',
  SENT: 'Your message has been sent.',
  SEND_NO_BODY: 'Send this message without text in the body?',
  EMPTY_ADD: 'Please specify at least one recipient.'
};
