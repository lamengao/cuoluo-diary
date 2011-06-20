/**
 * @fileoverview DocsList in Cuoluo Diary.
 *
 * @author lamengao@gmail.com (Lamengao)
 */
goog.provide('cld.DocsList');
goog.provide('cld.DocsList.EventType');

goog.require('cld.DiaryTree');
goog.require('cld.DocsTree');
goog.require('cld.ui.utils');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.string');


/**
 * DocsList constructor
 * @param {cld.App} app the parent event target.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.DocsList = function(app) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);
  this.dom_ = app.getDomHelper();

  this.element = this.dom_.getElement('docslist');
  this.elHeader = this.dom_.getElement('docslist-header');
  this.elContainer = this.dom_.getElement('docslist-container');
  this.elFooter = this.dom_.getElement('docslist-footer');

  this.elTitle = this.dom_.getElement('docslist-title');
  this.elSearchFor =
    this.dom_.getElementsByTagNameAndClass('em', undefined, this.elTitle)[0];
  this.elResultsCount = this.dom_.getElement('results-count');
  this.elCount = this.dom_.getElementByClass('count', this.elResultsCount);
  this.elQuery = this.dom_.getElementByClass('query', this.elResultsCount);

  this.elToolbar = this.dom_.getElement('docslist-toolbar');
  this.elDoclist = this.dom_.getElement('doclist');

  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handle = new goog.events.EventHandler(this);

  this.handle.listen(this.elDoclist, goog.events.EventType.CLICK,
                     this.handleDocSelect_, false, this);
};
goog.inherits(cld.DocsList, goog.events.EventTarget);

/**
 * Show docslist.
 * @param {string} type docs list type.
 * @param {string} title The title.
 * @param {Object} docs The docs Object.
 */
cld.DocsList.prototype.show = function(type, title, docs) {
  this.docs_ = docs;
  this.title_ = title;
  goog.dom.classes.remove(this.element, 'hidden');

  this.setTitle(type, title);
  if (!this.refreshButton) {
    this.createRefreshButton_();
  }

  this.dom_.removeChildren(this.elDoclist);
  var count = this.docs_['notes'].length + this.docs_['diaries'].length;
  if (count === 0) {
    this.dom_.setTextContent(this.elCount, '0');
    return;
  }
  var docsFragment = this.makeDocsFragment();
  this.elDoclist.appendChild(docsFragment);

  var docsCount = this.dom_.getElementsByTagNameAndClass('li',
                               null, this.elDoclist).length;
  this.dom_.setTextContent(this.elCount, docsCount + '');
};

/**
 * Set docs list title
 * @param {string} type docs list type.
 * @param {string} title The title.
 */
cld.DocsList.prototype.setTitle = function(type, title) {
  this.dom_.getDocument().title = 'Cuoluo Diary - Search results';

  this.dom_.setTextContent(this.elSearchFor, title);
  this.dom_.setTextContent(this.elQuery, title);
};


/**
 * make and return docs fragment
 * @return {!Node} The resulting document fragment.
 */
cld.DocsList.prototype.makeDocsFragment = function() {
  var htmlStr = '';
  goog.array.forEach(this.docs_['diaries'], function(date) {
      var fmtDate = date.substr(0, 4) + '/' +
                    date.substr(4, 2) + '/' +
                    date.substr(6);
      var node = cld.DocsTree.allNodes['diary:' + fmtDate];
      if (!node) {
        return;
      }
      var id = 'diary-' + date;
      var iconClass = 'day-icon-' + date.substr(6);
      var name = cld.DiaryTree.getDocTitleByDate(fmtDate);
      htmlStr += cld.DocsList.makeDocsHTML(id, iconClass, name);
  });
  goog.array.forEach(this.docs_['notes'], function(num) {
      var node = cld.DocsTree.allNodes['notes:' + num];
      if (!node) {
        return;
      }
      var id = 'note-' + num;
      var iconClass = 'note-icon';
      var name = goog.string.htmlEscape(node.getModel()['title']);
      htmlStr += cld.DocsList.makeDocsHTML(id, iconClass, name);
  });
  return this.dom_.htmlToDocumentFragment(htmlStr);
};

/**
 * Return docs html string.
 * @param {string} id The id.
 * @param {string} iconClass The icon class.
 * @param {string} name The title.
 * @return {string} The html string.
 */
cld.DocsList.makeDocsHTML = function(id, iconClass, name) {
  return goog.string.buildString('<li id="', id, '">',
    '<span class="goog-inline-block doclist-icon ', iconClass, '"> </span>',
    '<span class="goog-inline-block doclist-name">', name, '</span>',
    '</li>');
};

/**
 * Create search refresh button.
 * @private
 */
cld.DocsList.prototype.createRefreshButton_ = function() {
  this.refreshButton = cld.ui.utils.newButton('Refresh');
  this.refreshButton.render(this.elToolbar);
  this.refreshButton.getElement().id = 'searchrefresh';
  this.handle.
    listen(this.refreshButton, goog.ui.Component.EventType.ACTION,
      function(e) {
        this.dispatchEvent({
            type: cld.DocsList.EventType.REFRESH_SEARCH,
            query: this.title_
        });
    }, false, this);
};

/**
 * on click doc in doc list.
 * @param {goog.events.Event} e Click event.
 * @private
 */
cld.DocsList.prototype.handleDocSelect_ = function(e) {
  var li = /** @type {Element} */ (e.target);
  if (li.nodeName.toUpperCase() === 'UL') {
    return;
  }
  if (li.nodeName.toUpperCase() !== 'LI') {
    li = this.dom_.getAncestorByTagNameAndClass(li, 'LI');
  }
  var id = li.id;
  var event = {};
  event.type = cld.DocsList.EventType.DOC_SELECT;
  event.docType = id.split('-')[0];
  var key = id.split('-')[1];
  if (event.docType === 'diary') {
    event.key = key.substr(0, 4) + '/' +
                key.substr(4, 2) + '/' +
                key.substr(6);
  } else {
    event.key = key;
  }
  this.dispatchEvent(event);
};

/**
 * Hidden #docslist element.
 */
cld.DocsList.prototype.hidden = function() {
  goog.dom.classes.add(this.element, 'hidden');
};

/** @enum {string} */
cld.DocsList.EventType = {
  REFRESH_SEARCH: goog.events.getUniqueId('refresh_search'),
  DOC_SELECT: goog.events.getUniqueId('doc_select')
};
