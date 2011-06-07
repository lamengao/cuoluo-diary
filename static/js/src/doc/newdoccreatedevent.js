/**
 * @fileoverview The event object dispatched when the new doc created.
 *
 */


goog.provide('cld.doc.NewDocCreatedEvent');

goog.require('cld.doc.EventType');
goog.require('goog.events.Event');


/**
 * Event object dispatched when the new doc created.
 * @param {goog.ui.tree.BaseNode} node The new node.
 * @constructor
 * @extends {goog.events.Event}
 */
cld.doc.NewDocCreatedEvent = function(node) {
  goog.events.Event.call(this, cld.doc.EventType.NEW_DOC_CREATED);

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
goog.inherits(cld.doc.NewDocCreatedEvent, goog.events.Event);
