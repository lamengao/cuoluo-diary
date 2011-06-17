/**
 * @fileoverview cld.Doc.EventType define.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.doc.EventType');

goog.require('goog.events');


/** @enum {string} */
cld.doc.EventType = {
  NEW_DOC_CREATED: goog.events.getUniqueId('new_doc_created'),
  DISCARD_NEW_NOTE: goog.events.getUniqueId('discard_new_note'),
  DELETED: goog.events.getUniqueId('deleted'),
  RESTORED: goog.events.getUniqueId('restored'),
  BACKTO: goog.events.getUniqueId('backto'),
  DATE_CHANGED: goog.events.getUniqueId('date_changed')
};
