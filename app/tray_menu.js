var Tray = require('tray');
var Menu = require('menu');
var App = require('app');
var Dialog = require('dialog');
var BrowserWindow = require('browser-window');
var IPC = require('ipc')

function TrayMenu(db) {
  this._db = db;
  this._tray = new Tray(__dirname + "/imgs/blue.png");
  this._createMenu();
  this._initEvents();
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
          this._createBranchPromptWindow();
        }.bind(this)
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
  },

  _initEvents : function() {
    IPC.on("branchName:selected", function(event, branchName) {
      this._branchPromptWindow.close();
      delete this._branchPromptWindow;
      this._db.addTrackedBranch(branchName);
    }.bind(this));
  },

  _createBranchPromptWindow : function() {
    this._branchPromptWindow = new BrowserWindow({ width: 300, height: 100, framse: false, center: true, "always-on-top": true });
    this._branchPromptWindow.loadUrl('file://' + __dirname + '/branch_prompt.html');
    this._branchPromptWindow.focus();
  }
};

module.exports = TrayMenu;