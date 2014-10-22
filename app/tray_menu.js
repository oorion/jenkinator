var Tray = require('tray');
var Menu = require('menu');
var MenuItem = require('menu-item');
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
    console.log("Creating menu");

    var trackedBranches = this._db.trackedBranches();
    var menu = new Menu();

    console.log(trackedBranches);

    // create entry for branch
    trackedBranches.forEach(function(branch) {
      menu.append(new MenuItem({
        label: branch.name
      }));
    }, this);

    menu.append(new MenuItem({ type: "separator" }));
    menu.append(new MenuItem({
      label: "Add Branch",
      click: function() {
        this._createBranchPromptWindow();
      }.bind(this)
    }));
    
    menu.append(new MenuItem({
      label : "Manage Branches...",
      type: "normal",
      click: function() {
        this._openBranchManagementWindow();
      }.bind(this)
    }));
    menu.append(new MenuItem({ type: "separator" }));
    menu.append(new MenuItem({
      label: "Quit",
      click: function() {
        App.quit();
      }
    }));

    this._tray.setContextMenu(menu);
  },

  _initEvents : function() {
    IPC.on("branchName:selected", function(event, branchName) {
      this._branchPromptWindow.close();
      delete this._branchPromptWindow;
      this._db.addTrackedBranch(branchName);

      // writing to the db is throttled, so delay updating of the menu
      setTimeout(function() {
        this._createMenu();
      }.bind(this), 100)
    }.bind(this));
  },

  _createBranchPromptWindow : function() {
    this._branchPromptWindow = new BrowserWindow({ width: 300, height: 100, framse: false, center: true, "always-on-top": true });
    this._branchPromptWindow.loadUrl('file://' + __dirname + '/branch_prompt.html');
    this._branchPromptWindow.focus();
  },
  
  _openBranchManagementWindow : function() {
    if (this._branchManagementWindow) {
      this._branchManagementWindow.focus();
    }
    else {
      this._branchManagementWindow = new BrowserWindow({ width: 600, height: 500, frame: true, center: true });
      this._branchManagementWindow.on('closed', function() {
        this._branchManagementWindow = null;
      }.bind(this));
      
      this._branchManagementWindow.loadUrl('file://' + __dirname + '/branches.html');
      this._branchManagementWindow.focus();

      this._branchManagementWindow.webContents.on('did-finish-load', function() {
        var branches = this._db.trackedBranches();
        console.log(branches);
        
        this._branchManagementWindow.webContents.send("branches:load", branches);
      }.bind(this));
    }
  }
};

module.exports = TrayMenu;