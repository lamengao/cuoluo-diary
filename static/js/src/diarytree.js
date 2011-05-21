/**
 * @fileoverview Diary tree menu.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.DiaryTree');
goog.provide('cld.DiaryTreeItem');

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
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.DiaryTree = function(app, opt_domHelper) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handle = new goog.events.EventHandler(this);
  this.elTreeContent = this.dom_.getElement('diary-tree-content');
  this.initCreateFistButton();

  /**
   * @type {Array.<cld.DiaryTreeItem>}
   * @private
   */
  this.items_ = /** @type {Array} */
    (goog.object.get(this.dom_.getWindow(), '_DIARY_LIST', []));

  var tree = this.initTree();
  tree.setShowRootNode(false);
  tree.setShowLines(false);
  tree.setSelectedItem(null);
  goog.style.setUnselectable(tree.getElement(), true, true);

  /** @type {goog.ui.tree.BaseNode} */
  this.selectedDiary_ = null

  this.handle.
    listen(tree, goog.events.EventType.CHANGE, this.onSelectedChange_).
    listen(tree, goog.ui.tree.BaseNode.EventType.BEFORE_EXPAND,
      this.handlerBeforeExpand_).
    listen(tree, goog.ui.tree.BaseNode.EventType.EXPAND,
      this.handlerExpand_).
    listen(tree, goog.ui.tree.BaseNode.EventType.BEFORE_COLLAPSE,
      this.handlerBeforeCollapse_);
};
goog.inherits(cld.DiaryTree, goog.events.EventTarget);

/**
 * Map of nodes in existence.
 * @type {Object}
 * @protected
 */
cld.DiaryTree.allNodes = {};

/**
 * Initial diary tree.
 * @return {cld.ui.DiaryTreeControl} the tree.
 */
cld.DiaryTree.prototype.initTree = function() {
  this.tree = new cld.ui.DiaryTreeControl('root');
  this.tree.render(this.elTreeContent);
  cld.DiaryTree.allNodes['root'] = this.tree;

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
 * @return {Array.<cld.DiaryTreeItem>} All the item on the list.
 */
cld.DiaryTree.prototype.getItems = function() {
  return goog.array.clone(this.items_);
};

/**
 * Initial "create new diary now" link button.
 */
cld.DiaryTree.prototype.initCreateFistButton = function() {
  this.elEmpty = this.dom_.getElementsByTagNameAndClass('div',
      'empty', this.elTreeContent)[0];
  this.elCreate1st = this.dom_.getElement('create1stdiary');
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
cld.DiaryTree.prototype.showEmptyArea_ = function() {
    goog.dom.classes.remove(this.elEmpty, 'hidden');
};

/**
 * hidden empty element.
 * @private
 */
cld.DiaryTree.prototype.hiddenEmptyArea_ = function() {
    goog.dom.classes.add(this.elEmpty, 'hidden');
};

/**
 * Create new diary.
 * @param {goog.events.Event} e toggle event.
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
  cld.DiaryTree.allNodes[date] = node;
  return node;
};

/**
 * Return tree node by date.
 * @param {string} date Which date node will be return.
 * the date format like '2011/05/19' or '2011/05' or '2011'.
 * @return {goog.ui.tree.BaseNode} The date node.
 */
cld.DiaryTree.prototype.getTreeNodeByDate = function(date) {
  return goog.object.get(cld.DiaryTree.allNodes, date, null);
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
 * handle for tree node before expand.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.DiaryTree.prototype.handlerBeforeExpand_ = function(e) {
  var node = e.target;
  //alert(node.getText());
  //e.preventDefault();
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

/**
 * handle for tree node before collapse.
 * @param {goog.events.Event} e The event.
 * @private
 */
cld.DiaryTree.prototype.handlerBeforeCollapse_ = function(e) {
  var node = e.target;
};
