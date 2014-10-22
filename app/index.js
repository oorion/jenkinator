var App = require('app');
var TrayMenu = require("./tray_menu");
var Shell = require("shelljs");
var BranchDB = require("./branch_db");

App.on("window-all-closed", function() {
  if (process.platform !== "darwin") App.quit();
});

App.on("ready", function() {
  var storagePath = App.getHomeDir() + "/Library/Application Support/jenkinator";
  // ensure that we a location to store data in
  Shell.mkdir("-p", storagePath);

  var db = new BranchDB(storagePath);
  var trayMenu = new TrayMenu(db);
});