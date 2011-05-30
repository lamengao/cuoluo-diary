goog.provide('cld.editor');

goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
//goog.require('goog.editor.SeamlessField');
goog.require('goog.editor.plugins.BasicTextFormatter');
goog.require('goog.editor.plugins.EnterHandler');
goog.require('goog.editor.plugins.HeaderFormatter');
goog.require('goog.editor.plugins.LinkBubble');
goog.require('goog.editor.plugins.LinkDialogPlugin');
goog.require('goog.editor.plugins.ListTabHandler');
goog.require('goog.editor.plugins.LoremIpsum');
goog.require('goog.editor.plugins.RemoveFormatting');
goog.require('goog.editor.plugins.SpacesTabHandler');
//goog.require('goog.editor.plugins.UndoRedo');
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
goog.require('goog.ui.editor.DefaultToolbar');
goog.require('goog.ui.editor.ToolbarController');

cld.editor.elToolbar = goog.dom.getElement('editortoolbar');
cld.editor.field = new goog.editor.Field('editorarea');

  cld.editor.field.registerPlugin(new goog.editor.plugins.BasicTextFormatter());
  cld.editor.field.registerPlugin(new goog.editor.plugins.RemoveFormatting());
  //cld.editor.field.registerPlugin(new goog.editor.plugins.UndoRedo());
  cld.editor.field.registerPlugin(new goog.editor.plugins.ListTabHandler());
  cld.editor.field.registerPlugin(new goog.editor.plugins.SpacesTabHandler());
  cld.editor.field.registerPlugin(new goog.editor.plugins.EnterHandler());
  cld.editor.field.registerPlugin(new goog.editor.plugins.HeaderFormatter());
  cld.editor.field.registerPlugin(
    new goog.editor.plugins.LoremIpsum('Click here to edit'));
  cld.editor.field.registerPlugin(
    new goog.editor.plugins.LinkDialogPlugin());
  cld.editor.field.registerPlugin(new goog.editor.plugins.LinkBubble());

  // Specify the buttons to add to the toolbar, using built in default buttons.
  var buttons = [
    goog.editor.Command.BOLD,
    goog.editor.Command.ITALIC,
    goog.editor.Command.UNDERLINE,
    goog.editor.Command.FONT_COLOR,
    goog.editor.Command.BACKGROUND_COLOR,
    goog.editor.Command.FONT_FACE,
    goog.editor.Command.FONT_SIZE,
    goog.editor.Command.LINK,
    //goog.editor.Command.UNDO,
    //goog.editor.Command.REDO,
    goog.editor.Command.UNORDERED_LIST,
    goog.editor.Command.ORDERED_LIST,
    goog.editor.Command.INDENT,
    goog.editor.Command.OUTDENT,
    goog.editor.Command.JUSTIFY_LEFT,
    goog.editor.Command.JUSTIFY_CENTER,
    goog.editor.Command.JUSTIFY_RIGHT,
    //goog.editor.Command.SUBSCRIPT,
    //goog.editor.Command.SUPERSCRIPT,
    goog.editor.Command.STRIKE_THROUGH,
    goog.editor.Command.REMOVE_FORMAT
  ];
  cld.editor.toolbar = goog.ui.editor.DefaultToolbar.makeToolbar(buttons,
    cld.editor.elToolbar);

  // Hook the toolbar into the field.
  cld.editor.toolbarController =
    new goog.ui.editor.ToolbarController(cld.editor.field, cld.editor.toolbar);

  cld.editor.field.makeEditable();
