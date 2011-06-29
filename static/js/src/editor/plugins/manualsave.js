/**
 * @fileoverview shortcut ctrl-S for save.
 *
 */

goog.provide('cld.editor.plugins.ManualSave');

goog.require('goog.editor.Plugin');


/**
 * Manual save content.
 * @constructor
 * @extends {goog.editor.Plugin}
 */
cld.editor.plugins.ManualSave = function() {
  goog.editor.Plugin.call(this);
};
goog.inherits(cld.editor.plugins.ManualSave, goog.editor.Plugin);


/** @inheritDoc */
cld.editor.plugins.ManualSave.prototype.getTrogClassId = function() {
  return 'ManualSave';
};

/**
 * Command implemented by the plugin.
 * @type {string}
 */
cld.editor.plugins.ManualSave.COMMAND = 'manualSave';


/**
 * @inheritDoc
 */
cld.editor.plugins.ManualSave.prototype.handleKeyboardShortcut = function(
    e, key, isModifierPressed) {
  if (isModifierPressed && key === 's') {
    this.fieldObject.dispatchEvent('manualsave');
    return true;
  }
  return false;
};

/**
 * @inheritDoc
 */
cld.editor.plugins.ManualSave.prototype.isSupportedCommand = function(command) {
  return command == cld.editor.plugins.ManualSave.COMMAND;
};
