/**
 * @fileoverview Section menu button.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.SectionPopupMenu');
goog.provide('cld.SectionPopupMenu.EventType');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.positioning.Corner');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.PopupMenu');
goog.require('goog.ui.Separator');

/**
 * Base class for Section menu button
 * @param {cld.App} app the parent event target.
 * @param {string} type The type.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.SectionPopupMenu = function(app, type) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);

  this.dom_ = app.getDomHelper();

  this.type = type;

  this.createMenu_();

  this.elAttach_ = this.dom_.getElementByClass('zippy-menubutton',
   this.dom_.getElement(this.type + '-tree-header'));

  this.preventZippy();
};
goog.inherits(cld.SectionPopupMenu, goog.events.EventTarget);

/**
 * Create 'create new' menu.
 * @private
 */
cld.SectionPopupMenu.prototype.createMenu_ = function() {
  this.popupMenu = new goog.ui.PopupMenu();
  var items = [
    this.refreshMenuItem = new goog.ui.MenuItem('Refresh'),
    new goog.ui.MenuSeparator(),
    this.expandMenuItem = new goog.ui.MenuItem('Expand all'),
    this.collapseMenuItem = new goog.ui.MenuItem('Collapse all')
  ];
  goog.array.forEach(items, function(item) {
      this.popupMenu.addItem(item);
  }, this);
  var el = this.popupMenu.getElement();
  goog.dom.classes.add(el, 'section-menu-button');

  this.popupMenu.setToggleMode(true);

  goog.events.listen(this.popupMenu, goog.ui.Component.EventType.ACTION,
    function(e) {
      var caption = e.target.getCaption();
      switch (caption) {
        case 'Refresh':
          this.refresh();
          break;
        case 'Expand all':
          this.expandAll();
          break;
        case 'Collapse all':
          this.collapseAll();
          break;
      }
  }, false, this);
};

/**
 * Attach popup menu to element.
 * @param {Element=} opt_element Element whose click event should
 * trigger the menu.
 */
cld.SectionPopupMenu.prototype.attach = function(opt_element) {
  var el = opt_element || this.elAttach_;
  this.popupMenu.attach(el, goog.positioning.Corner.BOTTOM_RIGHT,
                        goog.positioning.Corner.TOP_RIGHT);
  this.popupMenu.render(this.dom_.getDocument().body);

  goog.events.listen(this.popupMenu,
    //[goog.ui.Menu.EventType.SHOW, goog.ui.Menu.EventType.HIDE],
    [goog.ui.Component.EventType.SHOW, goog.ui.Component.EventType.HIDE],
    function(e) {
      if (e.type === goog.ui.Component.EventType.SHOW) {
        goog.dom.classes.add(el, 'zippy-menubutton-open');
      } else {
        goog.dom.classes.remove(el, 'zippy-menubutton-open');
      }
  }, false, this);
};

/**
 * Prevent zippy.
 */
cld.SectionPopupMenu.prototype.preventZippy = function() {
  goog.events.listen(this.elAttach_, goog.events.EventType.CLICK,
    function(e) {
      e.preventDefault();
      e.stopPropagation();
  }, false, this);
};

/**
 * Set tree control.
 * @param {cld.ui.NotesTreeControl} tree The tree control.
 */
cld.SectionPopupMenu.prototype.setTree = function(tree) {
  this.tree_ = tree;
};

/**
 * Get tree control.
 * @return {cld.ui.NotesTreeControl} The tree control.
 */
cld.SectionPopupMenu.prototype.getTree = function() {
  return this.tree_ || null;
};

/**
 * Expand all tree node.
 */
cld.SectionPopupMenu.prototype.expandAll = function() {
  this.getTree().expandAll();
};

/**
 * Collapse all tree node.
 */
cld.SectionPopupMenu.prototype.collapseAll = function() {
  this.getTree().collapseAll();
};

/**
 * Refresh tree, will be override in subclass.
 */
cld.SectionPopupMenu.prototype.refresh = function() {
};

/** @enum {string} */
cld.SectionPopupMenu.EventType = {
  //NEW_SIBLINGNOTE: goog.events.getUniqueId('new_siblingnote')
};
