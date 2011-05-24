/**
 * @fileoverview Docs tree menu.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.DocsTree');

goog.require('goog.date');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.ui.Button');
goog.require('goog.ui.LinkButtonRenderer');


/**
 * An abstract base class for docs tree.
 * @param {cld.App} app the parent event target.
 * @param {string} type The type of tree diary or notes.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.DocsTree = function(app, type) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);
  this.dom_ = app.getDomHelper();
  this.type = type;

  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handle = new goog.events.EventHandler(this);
  this.elTreeContent = this.getTreeContentElement();

  this.initCreateFistButton();

  var itemsName = ('_' + type + '_list').toUpperCase();
  /**
   * @type {Array}
   * @private
   */
  this.items_ = /** @type {Array} */
    (goog.object.get(this.dom_.getWindow(), itemsName, []));

  var tree = this.initTree();
  tree.setShowRootNode(false);
  tree.setShowLines(false);
  tree.setSelectedItem(null);
  goog.style.setUnselectable(tree.getElement(), true, true);

  /**
   * @type {goog.ui.tree.BaseNode}
   * @private
   */
  this.selectedDoc_ = null;

  this.handle.
    listen(tree, goog.events.EventType.CHANGE, this.onSelectedChange_).
    listen(tree, goog.ui.tree.BaseNode.EventType.EXPAND,
      this.handlerExpand_);
};
goog.inherits(cld.DocsTree, goog.events.EventTarget);

/**
 * Map of nodes in existence.
 * @type {Object}
 * @protected
 */
cld.DocsTree.allNodes = {};

/**
 * Initial docs tree and return the tree.
 */
cld.DocsTree.prototype.initTree = goog.abstractMethod;

/**
 * @return {Element} The tree content element.
 */
cld.DocsTree.prototype.getTreeContentElement = function() {
  return this.dom_.getElement(this.type + '-tree-content');
};

/**
 * @return {Array} All the item on the list.
 */
cld.DocsTree.prototype.getItems = function() {
  return goog.array.clone(this.items_);
};

/**
 * Initial "create new note now" link button.
 */
cld.DocsTree.prototype.initCreateFistButton = function() {
  this.elEmpty = this.dom_.getElementsByTagNameAndClass('div',
      'empty', this.elTreeContent)[0];
  this.elCreate1st = this.dom_.getElement('create1st' + this.type);
  this.create1st = new goog.ui.Button(null,
    goog.ui.LinkButtonRenderer.getInstance());
  this.create1st.decorate(this.elCreate1st);
  this.handle.listen(this.create1st, goog.ui.Component.EventType.ACTION,
    this.createNew);
};

/**
 * Show empty element.
 * @private
 */
cld.DocsTree.prototype.showEmptyArea_ = function() {
    goog.dom.classes.remove(this.elEmpty, 'hidden');
};

/**
 * hidden empty element.
 * @private
 */
cld.DocsTree.prototype.hiddenEmptyArea_ = function() {
    goog.dom.classes.add(this.elEmpty, 'hidden');
};

/**
 * Create new docs.
 * @param {goog.events.Event} e toggle event.
 */
cld.DocsTree.prototype.createNew = function(e) {
  alert('create new docs now');
};

/**
 * handle for tree selected node changed.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.DocsTree.prototype.onSelectedChange_ = function(e) {};

/**
 * handle for tree node expand event.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.DocsTree.prototype.handlerExpand_ = function(e) {};
