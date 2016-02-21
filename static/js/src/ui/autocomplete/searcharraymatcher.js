/**
 * @fileoverview Basic class for matching words in an array.
 *
 */


goog.provide('cld.ui.AutoComplete.SearchArrayMatcher');

goog.require('goog.iter');
goog.require('goog.string');
goog.require('goog.ui.AutoComplete');



/**
 * Basic class for matching words in an array
 * @constructor
 * @param {Array} rows Dictionary of items to match.  Can be objects if they
 *     have a toString method that returns the value to match against.
 */
cld.ui.AutoComplete.SearchArrayMatcher = function(rows) {
  this.rows_ = rows;
};


/**
 * Replaces the rows that this object searches over.
 * @param {Array} rows Dictionary of items to match.
 */
cld.ui.AutoComplete.SearchArrayMatcher.prototype.setRows = function(rows) {
  this.rows_ = rows;
};


/**
 * Function used to pass matches to the autocomplete
 * @param {string} token Token to match.
 * @param {number} maxMatches Max number of matches to return.
 * @param {Function} matchHandler callback to execute after matching.
 * @param {string=} opt_fullString The full string from the input box.
 */
cld.ui.AutoComplete.SearchArrayMatcher.prototype.requestMatchingRows =
    function(token, maxMatches, matchHandler, opt_fullString) {
  var matches = [];

  if (token != '') {
    var escapedToken = goog.string.regExpEscape(token);
    var matcher = new RegExp('(^|\\W+)' + escapedToken, 'i');

    goog.iter.some(this.rows_, function(row) {
      if (row.type === 'default' || row.name.match(matcher)) {
        matches.push(row);
      }
      if (row.type === 'default') {
        row.name = token;
      }
      return matches.length >= maxMatches;
    });
  }
  matchHandler(token, matches);
};
