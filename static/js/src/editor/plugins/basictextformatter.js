/**
 * @fileoverview Functions to style text.
 *
 */

goog.provide('cld.editor.plugins.BasicTextFormatter');

goog.require('goog.editor.plugins.BasicTextFormatter');

/**
 * Functions to style text (e.g. underline, make bold, etc.)
 * @constructor
 * @extends {goog.editor.plugins.BasicTextFormatter}
 */
cld.editor.plugins.BasicTextFormatter = function() {
  goog.base(this);
};
goog.inherits(cld.editor.plugins.BasicTextFormatter,
              goog.editor.plugins.BasicTextFormatter);

/**
 * @inheritDoc
 */
cld.editor.plugins.BasicTextFormatter.prototype.handleKeyboardShortcut =
    function(e, key, isModifierPressed) {
  // hacker for compiled bug
  return goog.base(this, 'handleKeyboardShortcut',
                   arguments[0], arguments[1], arguments[2]);
};
