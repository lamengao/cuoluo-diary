/**
 * @fileoverview The doc event object.
 *
 */


goog.provide('cld.doc.Event');

goog.require('cld.doc.EventType');
goog.require('goog.events.Event');


/**
 * Doc Event object.
 * @param {string} type The event type.
 * @param {goog.ui.tree.BaseNode} node The new node.
 * @constructor
 * @extends {goog.events.Event}
 */
cld.doc.Event = function(type, node) {
  if (type === 'discard') {
    goog.events.Event.call(this, cld.doc.EventType.DISCARD_NEW_NOTE);
  } else if (type === 'newDocCreated') {
    goog.events.Event.call(this, cld.doc.EventType.NEW_DOC_CREATED);
  } else if (type === 'deleted') {
    goog.events.Event.call(this, cld.doc.EventType.DELETED);
  } else if (type === 'restored') {
    goog.events.Event.call(this, cld.doc.EventType.RESTORED);
  }

  /**
   * The type of new doc, current support 'diary' and 'note'.
   * @type {string}
   */
  this.docType = '';
  var nodeModel = node.getModel();
  if ('date' in nodeModel) {
    this.docType = 'diary';
  } else {
    this.docType = 'note';
  }

  /** @type {goog.ui.tree.BaseNode} */
  this.node = node;
};
goog.inherits(cld.doc.Event, goog.events.Event);
