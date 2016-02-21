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
  RENAMED: goog.events.getUniqueId('renamed'),
  BACKTO: goog.events.getUniqueId('backto'),
  READY_TO_MOVE: goog.events.getUniqueId('ready_to_move'),
  MOVED: goog.events.getUniqueId('moved')
};
