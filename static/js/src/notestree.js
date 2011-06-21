/**
 * @fileoverview Notes tree menu.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.NotesTree');
goog.provide('cld.NotesTreeItem');

goog.require('cld.DocsTree');
goog.require('cld.DocsTree.NewDocEvent');
goog.require('cld.ui.NotesTreeControl');
goog.require('goog.date');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.ui.Button');
goog.require('goog.ui.LinkButtonRenderer');

/**
 * @typedef {{
 *     id:number,
 *     parent_id:number,
 *     title:string,
 *     created:number,
 *     last_modified:number,
 *     status:string
 *  }}
 */
cld.NotesTreeItem;

/**
 * Notes tree menu.
 * @param {cld.App} app the parent event target.
 * @constructor
 * @extends {cld.DocsTree}
 */
cld.NotesTree = function(app) {
  goog.base(this, app, 'notes');
};
goog.inherits(cld.NotesTree, cld.DocsTree);


/**
 * Initial notes tree.
 * @return {cld.ui.NotesTreeControl} the tree.
 * @inheritDoc
 */
cld.NotesTree.prototype.initTree = function() {
  var tree = this.tree = new cld.ui.NotesTreeControl('root');
  tree.render(this.elTreeContent);
  cld.DocsTree.allNodes['notes:root'] = tree;

  if (this.items_.length) {
    this.hiddenEmptyArea_();
    // map items for create tree
    goog.array.forEach(this.items_, function(item) {
        var id = item['id'];
        cld.NotesTree.itemsMap[id] = item;
    });
    // built tree
    goog.array.forEach(this.items_, function(item) {
        if (item['status'] === 'trashed') {
          return;
        }
        this.createTreeNodeByItem(item);
    }, this);
  } else {
    this.showEmptyArea_();
  }
  // update folder node icon class for fix the icon bug
  goog.array.forEach(tree.getChildren(), function(child) {
      if (child.hasChildren()) {
        child.toggle();
        child.toggle();
      }
  });

  cld.NotesTree.itemsMap = null;
  return this.tree;
};

/** @type {Object} */
cld.NotesTree.itemsMap = {};

/**
 * Create tree node by date, return the tree node.
 * @param {cld.NotesTreeItem} item The item of the note's data.
 * @return {goog.ui.tree.BaseNode} The new item.
 */
cld.NotesTree.prototype.createTreeNodeByItem = function(item) {
  var parentId = item['parent_id'];
  var id = item['id'];
  var parentNode;
  if (parentId === 0) {
    parentNode = this.tree;
  } else if ('notes:' + parentId in cld.DocsTree.allNodes) {
    parentNode = cld.DocsTree.allNodes['notes:' + parentId];
  } else if (parentId in cld.NotesTree.itemsMap) {
    parentNode =
      this.createTreeNodeByItem(cld.NotesTree.itemsMap[parentId]);
  } else {
    return null;
  }

  if (!parentNode) {
    return null;
  }
  var node = this.tree.createNode('');
  var title = goog.string.unescapeEntities(item['title']);
  node.setToolTip(title);
  node.setModel(item);
  node.setText(title);
  parentNode.add(node);
  cld.DocsTree.setNodeInMap(node);
  return node;
};

/**
 * Create new notes.
 * @param {goog.events.Event} e The event.
 */
cld.NotesTree.prototype.createNew = function(e) {
  this.createNewInternal();
};

/**
 * Create new notes internal.
 * @param {goog.ui.tree.BaseNode=} opt_referNode The refer node.
 * @param {string=} opt_type 'child' or 'sibling' node.
 * @protected
 */
cld.NotesTree.prototype.createNewInternal = function(opt_referNode, opt_type) {
  var referNode = opt_referNode || this.tree;
  var type = opt_type || 'child';
  var node = /** @type {!goog.ui.tree.BaseNode} */ (this.getNewNode());
  if (type === 'child') {
    var parentNode = referNode;
  } else {
    var parentNode = referNode.getParent();
  }
  if (parentNode != referNode.getTree()) {
    node.getModel()['parent_id'] = parentNode.getModel()['id'];
  }
  // add new node at first or last? that's a question.
  //parentNode.addChildAt(node, index);
  parentNode.expand();
  parentNode.add(node);
  cld.DocsTree.selectNode(node);
};

/**
 * Create and return a new node.
 * @param {string=} opt_title The node title.
 * @return {goog.ui.tree.BaseNode} The new item.
 */
cld.NotesTree.prototype.getNewNode = function(opt_title) {
  var title = opt_title || 'New Note';
  var node = this.tree.createNode('');
  node.setToolTip(title);
  node.setText(title);
  var model = {};
  model['title'] = title;
  node.setModel(model);
  return node;
};

/**
 * handle for tree selected node changed.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.NotesTree.prototype.onSelectChange_ = function(e) {
  var tree = e.target;
  var node = tree.getSelectedItem();
  if (node == null || node == node.getTree()) {
    return;
  }
  this.dispatchEvent(cld.DocsTree.EventType.SELECT_CHANGE);
};
