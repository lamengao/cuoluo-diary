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
        this.createTreeNodeByItem(item);
    }, this);
  } else {
    this.showEmptyArea_();
  }
  // update folder node icon class for fix the bug
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
 * Create new notes.
 * @param {goog.events.Event} e The event.
 */
cld.NotesTree.prototype.createNew = function(e) {
  alert('create new notes now');
};

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
  var node = this.tree.createNode(item['title']);
  parentNode.add(node);
  node.setModel(item);
  cld.DocsTree.allNodes['notes:' + id] = node;
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
  if (node == null) {
    return;
  }
  this.dispatchEvent(cld.DocsTree.EventType.SELECT_CHANGE);
};
