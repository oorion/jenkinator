var Tray = require('tray');
var Menu = require('menu');
var App = require('app');
var Dialog = require('dialog');
var BrowserWindow = require('browser-window');



function TrayMenu() {
  this._tray = new Tray(__dirname + "/imgs/blue.png");
  this._createMenu();
}

TrayMenu.prototype = {

  _createMenu : function() {
    var menu = Menu.buildFromTemplate([
      {
        type: "separator"
      },
      {
        label : "Add Branch",
        type: "normal",
        click: function() {
          var prompt = new BrowserWindow({ width: 300, height: 100, framde: false, center: true, "always-on-top": true });
          prompt.loadUrl('file://' + __dirname + '/branch_prompt.html');
        }
      },
      {
        label : "Quit",
        type: "normal",
        click: function() {
          App.quit();
        }
      }
    ]);

    this._tray.setContextMenu(menu);
  }
};

module.exports = TrayMenu;