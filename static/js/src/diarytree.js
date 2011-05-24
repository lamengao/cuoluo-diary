/**
 * @fileoverview Diary tree menu.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.DiaryTree');
goog.provide('cld.DiaryTreeItem');

goog.require('cld.DocsTree');
goog.require('cld.ui.DiaryTreeControl');
goog.require('goog.date');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.ui.Button');
goog.require('goog.ui.LinkButtonRenderer');

/**
 * @typedef {{
 *     date:string,
 *     created:number,
 *     last_modified:number,
 *     status:string
 *  }}
 */
cld.DiaryTreeItem;

/**
 * Diary tree menu.
 * @param {cld.App} app the parent event target.
 * @constructor
 * @extends {cld.DocsTree}
 */
cld.DiaryTree = function(app) {
  goog.base(this, app, 'diary');
};
goog.inherits(cld.DiaryTree, cld.DocsTree);


/**
 * Initial diary tree.
 * @return {cld.ui.DiaryTreeControl} the tree.
 * @inheritDoc
 */
cld.DiaryTree.prototype.initTree = function() {
  var tree = this.tree = new cld.ui.DiaryTreeControl('root');
  tree.render(this.elTreeContent);
  cld.DocsTree.allNodes['diary:root'] = tree;

  if (this.items_.length) {
    this.hiddenEmptyArea_();
    goog.array.forEach(this.items_, function(item) {
        this.createTreeNodeByDate(item['date'], item);
    }, this);
  } else {
    this.showEmptyArea_();
  }
  return this.tree;
};


/**
 * Create new diary.
 * @param {goog.events.Event} e The event.
 */
cld.DiaryTree.prototype.createNew = function(e) {
  alert('create new diary now');
};

/**
 * Create tree node by date, return the tree node.
 * @param {string} date The date format like '2011/05/19'
 * or '2011/05' or '2011'.
 * @param {cld.DiaryTreeItem=} opt_item The item of the day's data.
 * @return {goog.ui.tree.BaseNode} The new item.
 */
cld.DiaryTree.prototype.createTreeNodeByDate = function(date, opt_item) {
  var node = this.getTreeNodeByDate(date);
  if (node) {
    return node;
  }
  var parentDate = this.getParentDate_(date);
  var parentNode = this.getTreeNodeByDate(parentDate);
  if (goog.isNull(parentNode)) {
    parentNode = this.createTreeNodeByDate(parentDate);
  }
  node = this.tree.createNode(this.getTitleFromDate_(date));
  if (opt_item) {
    node.setModel(opt_item);
  } else {
    node.setModel({'date': date});
  }
  parentNode.add(node, this.getAfterNode_(node, parentNode));
  this.setIconClassForNode_(node);
  cld.DocsTree.allNodes['diary:' + date] = node;
  return node;
};

/**
 * Return tree node by date.
 * @param {string} date Which date node will be return.
 * the date format like '2011/05/19' or '2011/05' or '2011'.
 * @return {goog.ui.tree.BaseNode} The date node.
 */
cld.DiaryTree.prototype.getTreeNodeByDate = function(date) {
  var key = 'diary:' + date;
  if (key in cld.DocsTree.allNodes) {
    return cld.DocsTree.allNodes[key];
  } else {
    return null;
  }
};

/**
 * Find the node for parentNode.add(node, before).
 * @param {goog.ui.tree.BaseNode} node The node will be add.
 * @param {goog.ui.tree.BaseNode} parentNode The node's parent.
 * @return {goog.ui.tree.BaseNode} The node's after node.
 * @private
 */
cld.DiaryTree.prototype.getAfterNode_ = function(node, parentNode) {
  var afterNode = null;
  var date = node.getModel()['date'];
  var children = parentNode.getChildren();
  if (children.length) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.getModel()['date'] > date) {
        afterNode = child;
        break;
      }
    }
  }
  return afterNode;
};

/**
 * Set diary tree node icon class.
 * @param {!goog.ui.tree.BaseNode} node The node will set icon class.
 * @private
 */
cld.DiaryTree.prototype.setIconClassForNode_ = function(node) {
  var iconClass = 'doctree-icon diarytree-icon ';
  var model = node.getModel();
  if (model['date']) {
    var d = model['date'].split('/');
  } else {
    return;
  }
  switch (d.length) {
    case 1:
      iconClass += 'year-icon';
      break;
    case 2:
      iconClass += 'month-icon';
      break;
    case 3:
      iconClass += 'day-icon day-icon-' + d[2];
  }
  node.setIconClass(iconClass);
  node.setExpandedIconClass(iconClass);
};

/**
 * Return the date's month or year,
 * if the date is year return 'root'.
 * @param {string} date Which date node will be return.
 * @return {string} parent date like '2011/05' or '2011'.
 * @private
 */
cld.DiaryTree.prototype.getParentDate_ = function(date) {
  var d = date.split('/');
  var parentDate = 'root';
  switch (d.length) {
    case 2:
      parentDate = d[0];
      break;
    case 3:
      parentDate = d[0] + '/' + d[1];
  }
  return /** @type {string} */ (parentDate);
};

/**
 * Return display title of tree node.
 * @param {string} date The date format like '2011/05/19'
 * or '2011/05' or '2011'.
 * @return {string} the title.
 * @private
 */
cld.DiaryTree.prototype.getTitleFromDate_ = function(date) {
  var d = date.split('/');
  var title = '';
  switch (d.length) {
    case 1:
      title = date;
      break;
    case 2:
      title = goog.i18n.DateTimeSymbols.MONTHS[parseInt(d[1], 10) - 1];
      break;
    case 3:
      var gDate = new goog.date.Date(parseInt(d[0], 10),
        parseInt(d[1], 10) - 1, parseInt(d[2], 10));
      title = goog.i18n.DateTimeSymbols.WEEKDAYS[gDate.getWeekday()];
  }
  return title;
};

/**
 * handle for tree selected node changed.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.DiaryTree.prototype.onSelectedChange_ = function(e) {
  var tree = e.target;
  var node = tree.getSelectedItem();
  if (node === this.selectedDiary_) {
    return;
  }
  if (this.isDayNode_(node)) {
    this.selectedDiary_ = node;
    alert(node.getText() + ' selected');
  } else {
  }
};

/**
 * Whether the node is day.
 * @param {goog.ui.tree.BaseNode} node will check.
 * @return {boolean} Whether is day node.
 * @private
 */
cld.DiaryTree.prototype.isDayNode_ = function(node) {
  var date = node.getModel()['date'];
  if (date.split('/').length === 3) {
    return true;
  } else {
    return false;
  }
};

/**
 * handle for tree node expand event.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.DiaryTree.prototype.handlerExpand_ = function(e) {
  var node = e.target;
  if (this.selectedDiary_ && node.contains(this.selectedDiary_)) {
    var parentNode = this.selectedDiary_.getParent();
    if (parentNode != node && parentNode.getExpanded() == false) {
      parentNode.expand();
    }
    this.selectedDiary_.select();
  }
};
