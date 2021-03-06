/**
 * @fileoverview The event object dispatched when the new doc create.
 *
 */


goog.provide('cld.DocsTree.NewDocEvent');

goog.require('cld.DocsTree.EventType');
goog.require('goog.events.Event');


/**
 * Event object dispatched when the new doc create.
 * @param {string} docType The type of new doc.
 * @param {goog.ui.tree.BaseNode} node The new node.
 * @constructor
 * @extends {goog.events.Event}
 */
cld.DocsTree.NewDocEvent = function(docType, node) {
  goog.events.Event.call(this, cld.DocsTree.EventType.NEW_DOC);

  /**
   * The type of new doc, current support 'diary' and 'note'.
   * @type {string}
   */
  this.docType = docType;

  /** @type {goog.ui.tree.BaseNode} */
  this.node = node;
};
goog.inherits(cld.DocsTree.NewDocEvent, goog.events.Event);
