/**
 * @fileoverview Create new button.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.Creation');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.Css3MenuButtonRenderer');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.ImagelessMenuButtonRenderer');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Separator');

/**
 * Create new.
 * @param {cld.App} app the parent event target.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Creation = function(app, opt_domHelper) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);

  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  this.elContainer = this.dom_.getElement('createnew');

  this.createMenu_();
  this.childnoteMenuItem.setEnabled(false);
  this.siblingnoteMenuItem.setEnabled(false);

  this.createMenuButton_();
};
goog.inherits(cld.Creation, goog.events.EventTarget);

/**
 * Create 'create new' menu.
 * @private
 */
cld.Creation.prototype.createMenu_ = function() {
  this.menu = new goog.ui.Menu();
  var makeItemContent = function(caption) {
    var htmlStr = '<div class="goog-menuitem-icon ' + caption +
                  '-menuitemicon"></div>' + caption;
    return goog.dom.htmlToDocumentFragment(htmlStr);
  };
  var items = [
    this.diaryMenuItem = new goog.ui.MenuItem(makeItemContent('Diary')),
    this.noteMenuItem = new goog.ui.MenuItem(makeItemContent('Note')),
    this.emailMenuItem = new goog.ui.MenuItem(makeItemContent('Email')),
    new goog.ui.MenuSeparator(),
    this.childnoteMenuItem =
      new goog.ui.MenuItem(makeItemContent('Child note')),
    this.siblingnoteMenuItem =
      new goog.ui.MenuItem(makeItemContent('Sibling note'))
  ];
  this.diaryMenuItem.setId('diarymenuitem');
  this.noteMenuItem.setId('notemenuitem');
  this.emailMenuItem.setId('emailmenuitem');
  this.childnoteMenuItem.setId('childnotemenuitem');
  this.siblingnoteMenuItem.setId('siblingnotemenuitem');
  goog.array.forEach(items, function(item) {
      this.menu.addItem(item);
  }, this);
  var el = this.menu.getElement();
  el.id = 'createnewmenu';

  goog.events.listen(this.menu, goog.ui.Component.EventType.ACTION,
    function(e) {
      var id = e.target.getId();
      if (id === 'diarymenuitem') {
        this.createNewDiary();
      } else if (id == 'notemenuitem') {
        this.createNewNote();
      } else if (id == 'emailmenuitem') {
        this.createNewEmail();
      } else if (id == 'childnotemenuitem') {
        this.createNewChildNote();
      } else if (id == 'siblingnotemenuitem') {
        this.createNewSiblingNote();
      }
  }, false, this);
};

/**
 * create menu button.
 * @private
 */
cld.Creation.prototype.createMenuButton_ = function() {
  this.menuButton = new goog.ui.MenuButton('Create new', this.menu,
    cld.ui.utils.getButtonRenderer(true));
  this.menuButton.render(this.dom_.getElement('createnew'));
};

/**
 * Create new diary.
 */
cld.Creation.prototype.createNewDiary = function() {
  alert('new diary');
};
/**
 * Create new Note.
 */
cld.Creation.prototype.createNewNote = function() {
  alert('new note');
};
/**
 * Create new Email.
 */
cld.Creation.prototype.createNewEmail = function() {
  alert('new email');
};
/**
 * Create new child note.
 */
cld.Creation.prototype.createNewChildNote = function() {
  alert('new child note');
};
/**
 * Create new sibling note.
 */
cld.Creation.prototype.createNewSiblingNote = function() {
  alert('new sibling note');
};
