/**
 * @fileoverview Factory class to create a simple autocomplete that will match
 * from an array of data.
 *
 */

goog.provide('cld.ui.AutoComplete.Search');

goog.require('cld.ui.AutoComplete.SearchArrayMatcher');

goog.require('goog.events.KeyCodes');
goog.require('goog.ui.AutoComplete');
goog.require('goog.ui.AutoComplete.Renderer');
goog.require('goog.ui.AutoComplete.RichInputHandler');


/**
 * Factory class for building a basic autocomplete widget that autocompletes
 * an inputbox or text area from a data array.
 * @param {Array} data Data array.
 * @param {Element} input Input element or text area.
 * @constructor
 * @extends {goog.ui.AutoComplete}
 */
cld.ui.AutoComplete.Search = function(data, input) {
  // Create a custom renderer that renders rich rows.  The renderer calls
  // row.render(node, token) for each row.
  var customRenderer = {};
  customRenderer.renderRow = function(row, token, node) {
    return row.data.render(node, token);
  };

  /**
   * A standard renderer that uses a custom row renderer to display the
   * rich rows generated by this autocomplete widget.
   * @type {goog.ui.AutoComplete.Renderer}
   * @private
   */
  var renderer = new goog.ui.AutoComplete.Renderer(null, customRenderer);
  //var renderer = new goog.ui.AutoComplete.Renderer();
  this.renderer_ = renderer;

  var matcher = new cld.ui.AutoComplete.SearchArrayMatcher(data);


  /**
   * An input handler that calls select on a row when it is selected.
   * @type {goog.ui.AutoComplete.RichInputHandler}
   * @private
   */
  var inputhandler =
      new goog.ui.AutoComplete.RichInputHandler(null, null, false);
  inputhandler.handleKeyEvent = function(e) {
    if (e.keyCode !== goog.events.KeyCodes.TAB) {
      return this.constructor.prototype.handleKeyEvent.apply(this, arguments);
    }
    return false;
  };

  goog.ui.AutoComplete.call(this, matcher, renderer, inputhandler);

  inputhandler.attachAutoComplete(this);
  inputhandler.attachInputs(input);
};
goog.inherits(cld.ui.AutoComplete.Search, goog.ui.AutoComplete);
