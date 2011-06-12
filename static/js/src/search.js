/**
 * @fileoverview Search diary and notes or search the web.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.Search');

goog.require('cld.DocsTree');
goog.require('cld.ui.AutoComplete.Search');
goog.require('cld.ui.utils');

goog.require('goog.events');
goog.require('goog.events.EventTarget');


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
      alert('submited');
      e.preventDefault();
  });
};
goog.inherits(cld.Search, goog.events.EventTarget);

/**
 * Create search diary button.
 */
cld.Search.prototype.createSearchDiaryButton = function() {
  this.searchDiaryButton = cld.ui.utils.newButton(null);
  this.searchDiaryButton.decorate(this.elSearchDiary);
  this.searchDiaryButton.setCaption('Search Diary and Notes');
  this.searchDiaryButton.setCollapsed(goog.ui.ButtonSide.START);
  goog.events.listen(this.searchDiaryButton,
    goog.ui.Component.EventType.ACTION,
    goog.bind(this.searchDiary, this));
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
    searchRows
      .push(this.makeSearchDocsRow('note', node.getModel()['title'], key));
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
    search.searchDiary();
  } else if (this.type === 'note' && this.key in cld.DocsTree.allNodes) {
    search.cleanInput();
    cld.DocsTree.allNodes[this.key].select();
  }
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
 */
cld.Search.prototype.searchDiary = function() {
  alert('search diary and notes');
};

/**
 * clean the search input.
 */
cld.Search.prototype.cleanInput = function() {
  this.elInput.value = '';
};
