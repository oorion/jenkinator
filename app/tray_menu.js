var Tray = require('tray');
var Menu = require('menu');
var MenuItem = require('menu-item');
var App = require('app');
var Dialog = require('dialog');
var BrowserWindow = require('browser-window');
var IPC = require('ipc');
var Shell = require('shell');
var Moment = require('moment');
var _ = require("underscore")._;

var MONTH_NAMES = new Array("Jan", "Feb", "Mar",
"Apr", "May", "June", "July", "Aug", "Sept",
"Oct", "Nov", "Dec");

function TrayMenu(db, branchStatus) {
  this._db = db;
  this._branchStatus = branchStatus;
  this._tray = new Tray(__dirname + "/imgs/icon.png");

  _.bindAll(this, "_initEvents", "_createMenu", "_createBranchSubmenu", "_openBranchPromptWindow", "_openBranchManagementWindow");

  this._initEvents();
  this._branchStatus.startPolling();
}

TrayMenu.prototype = {

  _createMenu : function() {
    this._db.trackedBranches(function(trackedBranches) {
      var menu = new Menu();
      console.log("Creating menu for branches", _.pluck(trackedBranches, "name"));

      // create entry for branch
      trackedBranches.forEach(function(branch) {
        var icon = "🕒";
        switch(branch.status) {
        case 'success':
          icon = "😃";
          break;
        case 'failed':
          icon = "😡";
        }

        menu.append(new MenuItem({
          type: "submenu",
          label: icon + " " + branch.name,
          submenu: this._createBranchSubmenu(branch)
        }));
      }, this);

      //

      menu.append(new MenuItem({ type: "separator" }));
      menu.append(new MenuItem({
        label: "Add Branch...",
        click: function() {
          this._openBranchPromptWindow();
        }.bind(this)
      }));

      menu.append(new MenuItem({
        label: "Refresh status",
        click: function() {
          this._branchStatus.sync();
        }.bind(this)
      }));

      /*menu.append(new MenuItem({
        label : "Manage Branches...",
        type: "normal",
        click: function() {
          this._openBranchManagementWindow();
        }.bind(this)
      }));*/

      menu.append(new MenuItem({ type: "separator" }));
      menu.append(new MenuItem({
        label: "Quit",
        click: function() {
          App.quit();
        }
      }));

      this._tray.setContextMenu(menu);
    }.bind(this));
  },

  _createBranchSubmenu: function(branch) {
    var menu = new Menu();

    if (branch.lastBuild) {
      var builtDateFormatted = branch.lastBuild.time;

      try {
        builtDateFormatted = Moment(builtDateFormatted).format('MMM D, YYYY h:mm A');
      } catch (ex) {
        console.log("Could not parse date: " + builtDateFormatted + ", error: " + ex.message());
      }

      menu.append(new MenuItem({
        label: "Last built: " + builtDateFormatted,
        enabled: false
      }));

      menu.append(new MenuItem({
        label: "View in Github",
        click: function() {
          Shell.openExternal("http://www.github.com/invoca/web/commit/" + branch.lastBuild.sha);
        }
      }));

      menu.append(new MenuItem({
        label: "View in Jenkins",
        click: function() {
          Shell.openExternal(branch.lastBuild.url);
        }
      }));

      menu.append(new MenuItem({ type: "separator" }));
    }
    else {
      menu.append(new MenuItem({
        label: "No build status found",
        enabled: false
      }));
    }

    menu.append(new MenuItem({
      label: "✗ Stop tracking this branch",
      click: function(menuItem) {
        this._db.deleteTrackedBranch(branch.name, this._createMenu);
      }.bind(this)
    }));

    return menu;
  },

  _initEvents : function() {
    IPC.on("branchName:selected", function(event, branchName) {
      this._branchPromptWindow.close();
      delete this._branchPromptWindow;
      this._db.addTrackedBranch(branchName, function() {
        this._createMenu();
        this._branchStatus.sync();
      }.bind(this));
    }.bind(this));

    this._branchStatus.on("sync:start", function() {
      console.log("event: BranchStatus sync is starting");
      var menu = new Menu();
      menu.append(new MenuItem({
        label: "Syncing build statuses...",
        enabled: false
      }));
      
      this._tray.setContextMenu(menu);
      
      this._tray.setImage(__dirname + "/imgs/blue.png");
    }.bind(this));
    
    this._branchStatus.on("sync:complete", function() {
      console.log("event: BranchStatus sync is complete");
      this._createMenu();
      this._tray.setImage(__dirname + "/imgs/icon.png");
      
    }.bind(this));
  },

  _openBranchPromptWindow : function() {
    if (this._branchPromptWindow) {
      this._branchPromptWindow.focus();
    }
    else {
      this._branchPromptWindow = new BrowserWindow({ width: 350, height: 90, frame: true, center: true, "always-on-top": true });
      this._branchPromptWindow.on('closed', function() {
        this._branchPromptWindow = null;
      }.bind(this));
      
      this._branchPromptWindow.loadUrl('file://' + __dirname + '/branch_prompt.html');
      this._branchPromptWindow.webContents.on('did-finish-load', function() {
        this._branchPromptWindow.focus();
      }.bind(this));
    }
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
        this._db.trackedBranches(function(branches) {
          this._branchManagementWindow.webContents.send("branches:load", branches);
        }.bind(this));
      }.bind(this));
    }
  }
};

module.exports = TrayMenu;