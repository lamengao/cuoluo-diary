/**
 * @fileoverview Create new button.
 *
 * @author lamengao@gmail.com (Lamengao)
 */

goog.provide('cld.Creation');
goog.provide('cld.Creation.EventType');

goog.require('cld.ui.utils');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Separator');

/**
 * Create new.
 * @param {cld.App} app the parent event target.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cld.Creation = function(app) {
  goog.events.EventTarget.call(this);
  this.setParentEventTarget(app);

  this.dom_ = app.getDomHelper();

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
 * Update create new menu
 * @param {string} type The doc type 'diary' ,'note' or 'newnote'.
 */
cld.Creation.prototype.updateMenu = function(type) {
  if (type === 'diary' || type === 'newnote') {
    this.childnoteMenuItem.setEnabled(false);
    this.siblingnoteMenuItem.setEnabled(false);
  } else if (type === 'note') {
    this.childnoteMenuItem.setEnabled(true);
    this.siblingnoteMenuItem.setEnabled(true);
  }
};

/**
 * create menu button.
 * @private
 */
cld.Creation.prototype.createMenuButton_ = function() {
  this.menuButton = cld.ui.utils.newButton('Create new', this.menu);
  this.menuButton.render(this.dom_.getElement('createnew'));
};

/**
 * Create new diary.
 */
cld.Creation.prototype.createNewDiary = function() {
  this.dispatchEvent(cld.Creation.EventType.NEW_DIARY);
};
/**
 * Create new Note.
 */
cld.Creation.prototype.createNewNote = function() {
  this.dispatchEvent(cld.Creation.EventType.NEW_NOTE);
};
/**
 * Create new Email.
 */
cld.Creation.prototype.createNewEmail = function() {
  this.dispatchEvent(cld.Creation.EventType.NEW_EMAIL);
};
/**
 * Create new child note.
 */
cld.Creation.prototype.createNewChildNote = function() {
  this.dispatchEvent(cld.Creation.EventType.NEW_CHILDNOTE);
};
/**
 * Create new sibling note.
 */
cld.Creation.prototype.createNewSiblingNote = function() {
  this.dispatchEvent(cld.Creation.EventType.NEW_SIBLINGNOTE);
};

/** @enum {string} */
cld.Creation.EventType = {
  NEW_DIARY: goog.events.getUniqueId('new_diary'),
  NEW_NOTE: goog.events.getUniqueId('new_note'),
  NEW_EMAIL: goog.events.getUniqueId('new_email'),
  NEW_CHILDNOTE: goog.events.getUniqueId('new_childnote'),
  NEW_SIBLINGNOTE: goog.events.getUniqueId('new_siblingnote')
};
