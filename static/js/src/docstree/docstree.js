/**
 * @fileoverview Docs tree menu.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.DocsTree');
goog.provide('cld.DocsTree.EventType');

goog.require('goog.date');
goog.require('goog.events');
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
  tree.setParentEventTarget(this);
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
    listen(tree, goog.events.EventType.CHANGE, this.onSelectChange_).
    listen(tree, goog.ui.tree.BaseNode.EventType.EXPAND, this.handlerExpand_);
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
 * Get node's url token using node's model.
 * @param {goog.ui.tree.BaseNode} node The node.
 * @return {string} The token.
 */
cld.DocsTree.getTokenByNode = function(node) {
  var model = node.getModel();
  if ('date' in model) {
    return 'diary/' + model['date'];
  } else if ('id' in model) {
    return 'notes/' + model['id'];
  } else {
    return 'notes/new';
  }
};

/**
 * Get node key
 * @param {!goog.ui.tree.BaseNode} node The node.
 * @return {string} The key
 */
cld.DocsTree.getNodeKey = function(node) {
  var key = '';
  var model = node.getModel();
  if ('date' in model) {
    key = 'diary:' + model['date'];
  } else {
    key = 'notes:' + model['id'];
  }
  return key;
};

/**
 * Get node's type 'diary' or 'note'
 * @param {goog.ui.tree.BaseNode} node The node.
 * @return {string} The type.
 */
cld.DocsTree.getNodeType = function(node) {
  var model = node.getModel();
  if ('id' in model) {
    return 'note';
  }
  return 'diary';
};

/**
 * Static function select the give node and expand all parents.
 * @param {!goog.ui.tree.BaseNode} node The node will be select.
 */
cld.DocsTree.selectNode = function(node) {
  var parentNode = node.getParent();
  while (parentNode) {
    parentNode.expand();
    parentNode = parentNode.getParent();
  }
  node.select();
};

/**
 * Select node by doc key(allNodes key).
 * @param {string} key The doc key.
 */
cld.DocsTree.prototype.selectByKey = function(key) {
  if (key in cld.DocsTree.allNodes) {
    cld.DocsTree.selectNode(cld.DocsTree.allNodes[key]);
  } else {
    this.dispatchEvent(cld.DocsTree.EventType.NODE_NOT_FOUND);
  }
};

/**
 * Set node in map.
 * @param {!goog.ui.tree.BaseNode} node The node.
 * @param {boolean=} isDelete Is delete?
 */
cld.DocsTree.setNodeInMap = function(node, isDelete) {
  var key = cld.DocsTree.getNodeKey(node);
  if (isDelete === true && key in cld.DocsTree.allNodes) {
    delete cld.DocsTree.allNodes[key];
  } else if (!isDelete) {
    cld.DocsTree.allNodes[key] = node;
  }
};

/**
 * Static function for discard created new note node.
 * @param {!goog.ui.tree.BaseNode} node The node.
 */
cld.DocsTree.discardNewNode = function(node) {
  if ('created' in node.getModel()) {
    return;
  }
  node.getParent().removeChild(node);
};

/**
 * Static function for delete node.
 * @param {!goog.ui.tree.BaseNode} node The node will be deleted.
 * @return {goog.ui.tree.BaseNode} The removed node, if any.
 */
cld.DocsTree.deleteNode = function(node) {
  var parentNode = node.getParent();
  var index = parentNode.indexOfChild(node);
  var nodeModel = node.getModel();
  nodeModel['parent_node'] = parentNode;
  nodeModel['index'] = index;
  cld.DocsTree.setNodeInMap(node, true /* isDelete */);
  node.getTree().select();
  return /** @type {goog.ui.tree.BaseNode} */ (parentNode.removeChild(node));
};

/**
 * Static function for restore node.
 * @param {!goog.ui.tree.BaseNode} node The node restored.
 */
cld.DocsTree.restore = function(node) {
  var model = node.getModel();
  if (model['parent_node']) {
    var parentNode = model['parent_node'];
    delete model['parent_node'];
  }
  if (model['index']) {
    var index = model['index'];
    delete model['index'];
  }
  parentNode.addChildAt(node, index);
  cld.DocsTree.setNodeInMap(node);

  cld.DocsTree.selectNode(node);
};

/**
 * handle for tree select node changed.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.DocsTree.prototype.onSelectChange_ = function(e) {
  this.dispatchEvent(cld.DocsTree.EventType.SELECT_CHANGE);
};

/**
 * handle for tree node expand event.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.DocsTree.prototype.handlerExpand_ = function(e) {};

/** @enum {string} */
cld.DocsTree.EventType = {
  SELECT_CHANGE: goog.events.getUniqueId('select_change'),
  NEW_DOC: goog.events.getUniqueId('new_doc'),
  NODE_CHANGED: goog.events.getUniqueId('node_changed'),
  NODE_NOT_FOUND: goog.events.getUniqueId('node_not_found')
};
