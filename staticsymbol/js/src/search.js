/**
 * @fileoverview Search diary and notes or search the web.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.Search');
goog.provide('cld.Search.EventType');

goog.require('cld.DocsTree');
goog.require('cld.api.Search');
goog.require('cld.ui.AutoComplete.Search');
goog.require('cld.ui.utils');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.string');


/**
 * Search.
 * @param {cld.App} app the parent event target.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Search = function(app) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);
  this.dom_ = app.getDomHelper();

  this.elSearchForm = this.dom_.getElement('search');
  this.elInput = this.dom_.getElement('search-input');
  this.elSearchDiary = this.dom_.getElement('search-diary-button');
  this.elSearchWeb = this.dom_.getElement('search-web-button');

  this.createSearchDiaryButton();
  this.createSearchWebButton();

  goog.events.listen(this.elSearchForm, goog.events.EventType.SUBMIT,
    function(e) {
      this.searchDocs();
      e.preventDefault();
  }, false, this);

  this.searchApi = new cld.api.Search();

  this.lastQuery = '';
};
goog.inherits(cld.Search, goog.events.EventTarget);

/** @type {Object} */
cld.Search.cache = {};

/**
 * Create search diary button.
 */
cld.Search.prototype.createSearchDiaryButton = function() {
  this.searchDocsButton = cld.ui.utils.newButton(null);
  this.searchDocsButton.decorate(this.elSearchDiary);
  this.searchDocsButton.setCaption('Search Diary and Notes');
  this.searchDocsButton.setCollapsed(goog.ui.ButtonSide.START);
  goog.events.listen(this.searchDocsButton,
    goog.ui.Component.EventType.ACTION,
    function(e) {
      this.searchDocs();
  }, false, this);
};

/**
 * Create search web button.
 */
cld.Search.prototype.createSearchWebButton = function() {
  this.searchWebButton = cld.ui.utils.newButton(null);
  this.searchWebButton.decorate(this.elSearchWeb);
  this.searchWebButton.setCaption('Search the Web');
  goog.events.listen(this.searchWebButton, goog.ui.Component.EventType.ACTION,
    goog.bind(this.searchWeb, this));
};

/**
 * Initial search auto complete.
 */
cld.Search.prototype.initAutoComplete = function() {
  var searchRows = this.getSearchRows();
  this.autoComplete =
    new cld.ui.AutoComplete.Search(searchRows, this.elInput);
};

/**
 * Return rows for search
 * @return {Array} search rows.
 */
cld.Search.prototype.getSearchRows = function() {
  var searchRows = [];
  searchRows.push(this.makeSearchDocsRow('default'));
  for (var key in cld.DocsTree.allNodes) {
    if (!goog.string.startsWith(key, 'notes:') || key === 'notes:root') {
      continue;
    }
    var node = cld.DocsTree.allNodes[key];
    if ('status' in node.getModel() &&
        node.getModel()['status'] === 'trashed') {
      continue;
    }
    var title = goog.string.unescapeEntities(node.getModel()['title']);
    searchRows
      .push(this.makeSearchDocsRow('note', title, key));
  }
  return searchRows;
};

/**
 * Update search rows for auto complete when doc added or deleted.
 */
cld.Search.prototype.updateSearchRows = function() {
  var searchRows = this.getSearchRows();
  this.autoComplete.matcher_.setRows(searchRows);
};

/**
 * Create search row.
 * @param {string} type The doc type.
 * @param {string=} opt_name The doc name.
 * @param {string=} opt_key The doc key.
 * @return {Object} The row.
 */
cld.Search.prototype.makeSearchDocsRow = function(type, opt_name, opt_key) {
  var row = {};
  row.name = opt_name || '';
  row.type = type;
  row.key = opt_key || 'default';
  row.select = goog.partial(cld.Search.searchRowSelect, this);
  row.render = cld.Search.searchRowRender;
  row.toString = cld.Search.searchRowToString;
  return row;
};
/**
 * search row toString method.
 * @this {Object}
 * @return {string} The row name.
 */
cld.Search.searchRowToString = function() {
  return this.name;
};

/**
 * search row select method.
 * @param {cld.Search} search The search instance.
 * @this {Object}
 */
cld.Search.searchRowSelect = function(search) {
  if (this.type === 'default') {
    search.searchDocs();
  } else if (this.type === 'note' && this.key in cld.DocsTree.allNodes) {
    search.cleanInput();
    cld.DocsTree.allNodes[this.key].select();
  }
  search.elInput.blur();
};

/**
 * search row render method
 * @this {Object}
 * @param {Node} node The node to render into.
 * @param {string} token Token to highlight.
 */
cld.Search.searchRowRender = function(node, token) {
  var dom_ = goog.dom.getDomHelper(node);

  var typeNode =
    dom_.createDom('span', 'goog-inline-block icon ' + this.type + '-icon');
  var starNode = dom_.createDom('span', 'goog-inline-block icon');
  var nameNode = dom_.createDom('span');
  var content = '';
  if (this.type === 'default') {
    content = 'Search for all items containing \'' + token + '\'';
  } else {
    content = this.name;
    dom_.appendChild(node, starNode);
  }
  dom_.appendChild(nameNode, dom_.createTextNode(content));
  dom_.appendChild(node, typeNode);
  dom_.appendChild(node, nameNode);
};

/**
 * search web and submit the form.
 */
cld.Search.prototype.searchWeb = function() {
  this.elSearchForm.submit();
};

/**
 * search diary and notes
 * @param {string=} query The query for search.
 * @param {boolean=} refresh True no use cache.
 */
cld.Search.prototype.searchDocs = function(query, refresh) {
  if (query) {
    var q = query;
    this.elInput.value = query;
  } else {
    var q = this.elInput.value;
  }
  this.lastQuery = q;
  if (q == '') {
    return;
  }
  if (refresh || !(q in cld.Search.cache)) {
    this.dispatchEvent(cld.Search.EventType.SEARCHING);
    var successCallback = goog.bind(this.onSearchSuccess_, this, q);
    this.searchApi.search(q, successCallback);
  } else {
    this.dispatchEvent({
        type: cld.Search.EventType.SEARCHED,
        query: q,
        results: cld.Search.cache[q]
      });
  }
};

cld.Search.prototype.back = function() {
  this.searchDocs(this.lastQuery);
};

/**
 * search successful callback
 * @param {string} q The token to search.
 * @param {Object} results The result.
 * @private
 */
cld.Search.prototype.onSearchSuccess_ = function(q, results) {
  cld.Search.cache[q] = results;
  this.dispatchEvent({
      type: cld.Search.EventType.SEARCHED,
      query: q,
      results: results
  });
};

/**
 * clean the search input.
 */
cld.Search.prototype.cleanInput = function() {
  this.elInput.value = '';
};

/** @enum {string} */
cld.Search.EventType = {
  SEARCHING: goog.events.getUniqueId('searching'),
  SEARCHED: goog.events.getUniqueId('searched')
};
