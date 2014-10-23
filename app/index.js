var App = require('app');
var TrayMenu = require("./tray_menu");
var Shell = require("shelljs");
var BranchDB = require("./branch_db");
var PrefsDB = require("./prefs_db");
var BranchStatus = require("./branch_status");
var Promise = require("bluebird");

App.on("window-all-closed", function() {
  if (process.platform !== "darwin") App.quit();
});

App.on("ready", function() {
  var storagePath = App.getHomeDir() + "/Library/Application Support/jenkinator";
  // ensure that we a location to store data in
  Shell.mkdir("-p", storagePath);

  var branchStatus, trayMenu, branchDb = new BranchDB(storagePath), prefsDb = new PrefsDB(storagePath);

  Promise.all([branchDb.ready(), prefsDb.ready()]).then(function() {
    branchStatus = new BranchStatus(branchDb);
    trayMenu = new TrayMenu(branchDb, branchStatus);
  });

});
