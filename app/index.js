var App = require('app');
var TrayMenu = require("./tray_menu");
var Shell = require("shelljs");
var BranchDB = require("./branch_db");
var PrefsDB = require("./prefs_db");
var BranchStatus = require("./branch_status");
var Promise = require("bluebird");
var notifier = require("node-notifier");

function failureNotification(failCount) {
  var message;
  if (failCount === 1) {
    message = failCount + " branch is failing";
  } else {
    message = failCount + " branches are failing"
  };

  notifier.notify({
    title : "Branch Failures",
    message: message,
    sound: "Ping"
  });
}

App.on("window-all-closed", function() {
  if (process.platform !== "darwin") App.quit();
});

App.on("ready", function() {
  var storagePath = App.getHomeDir() + "/Library/Application Support/jenkinator";
  // ensure that we a location to store data in
  Shell.mkdir("-p", storagePath);

  var branchStatus, trayMenu, branchDb = new BranchDB(storagePath), prefsDb = new PrefsDB(storagePath);

  Promise
    .all([branchDb.ready(), prefsDb.ready()])
    .then(function() {
      branchStatus = new BranchStatus(branchDb);
      trayMenu = new TrayMenu(branchDb, prefsDb, branchStatus);

      branchStatus.on("sync:complete", function(syncData) {
        prefsDb.notifyOnStatusChange().then(function(shouldNotify) {
          if (shouldNotify && syncData.failCount > 0) failureNotification(syncData.failCount);
        });
      });

    });
});
