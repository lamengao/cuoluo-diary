/**
 * @fileoverview Diary tree menu.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.DiaryTree');
goog.provide('cld.DiaryTreeItem');

goog.require('cld.DocsTree');
goog.require('cld.DocsTree.NewDocEvent');
goog.require('cld.ui.DiaryTreeControl');
goog.require('goog.date');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.string');
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

  /**
   * today's date like '2011/05/25'
   * @type {string}
   */
  this.today = cld.DiaryTree.getTodayDate();
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
 * Return parent node by date.
 * @param {string} date Child node's date.
 * the date format like '2011/05/19' or '2011/05' or '2011'.
 * @return {goog.ui.tree.BaseNode} The date node.
 */
cld.DiaryTree.prototype.getParentNodeByDate = function(date) {
  var parentDate = this.getParentDate_(date);
  return this.getTreeNodeByDate(parentDate);
};

/**
 * Select today's diary node.
 */
cld.DiaryTree.prototype.selectTodayNode = function() {
  this.selectNodeByDate(this.today);
};

/**
 * Select diary node by date.
 * @param {string} date The node's date.
 */
cld.DiaryTree.prototype.selectNodeByDate = function(date) {
  date = cld.DiaryTree.getValidDate(date);
  if (date == '') {
    this.dispatchEvent(cld.DocsTree.EventType.NODE_NOT_FOUND);
    return;
  }
  var node = this.getTreeNodeByDate(date);
  if (node) {
    this.selectNode(node);
  } else {
    var month = this.getParentDate_(date);
    var year = this.getParentDate_(month);
    var monthNode = this.getTreeNodeByDate(month);
    var yearNode = this.getTreeNodeByDate(year);
    if (monthNode) {
      this.selectNode(monthNode);
    } else if (yearNode) {
      this.selectNode(yearNode);
    } else {
      this.tree.setSelectedItem(null);
    }
    alert('new diary lala, new doc event will be dispatch');
    this.dispatchEvent(new cld.DocsTree.NewDocEvent('diary', date));
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
cld.DiaryTree.prototype.onSelectChange_ = function(e) {
  var tree = e.target;
  var node = tree.getSelectedItem();
  if (node === null) {
    this.selectedDiary_ = null;
    return;
  } else if (node === this.selectedDiary_) {
    return;
  }
  if (this.isDayNode_(node)) {
    this.selectedDiary_ = node;
    this.dispatchEvent(cld.DocsTree.EventType.SELECT_CHANGE);
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

/**
 * Static function for get the date string of today.
 * @return {string} the date string ex. '2011/05/25'.
 */
cld.DiaryTree.getTodayDate = function() {
  var date = new goog.date.Date();
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString();
  if (month.length === 1) {
    month = '0' + month;
  }
  var day = date.getDate().toString();
  if (day.length === 1) {
    day = '0' + day;
  }
  var str = Array.prototype.join.call([year, month, day], '/');
  return str;
};

/**
 * Check date and return good format date.
 * @param {string} date The date will be check.
 * @return {string} If is a good date return good format date string,
 * else return ''.
 */
cld.DiaryTree.getValidDate = function(date) {
  // format YYYY/M(M)/D(D)
  var dateFormat = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
  if (!dateFormat.test(date)) {
    return '';
  }
  var tmp = date.split('/');
  var y = parseInt(tmp[0], 10);
  var m = parseInt(tmp[1], 10) - 1;
  var d = parseInt(tmp[2], 10);
  if (m > 11 || d > 31) {
    return '';
  }
  var oDate = new Date(y, m, d);
  if (oDate.getFullYear() == y && oDate.getMonth() == m &&
      oDate.getDate() == d) {
    var month = tmp[1].toString();
    if (month.length === 1) {
      month = '0' + month;
    }
    var day = tmp[2].toString();
    if (day.length === 1) {
      day = '0' + day;
    }
    return Array.prototype.join.call([y, month, day], '/');
  } else {
    return '';
  }
};
