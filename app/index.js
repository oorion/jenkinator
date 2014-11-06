var App = require('app');
var TrayMenu = require("./tray_menu");
var Shell = require("shelljs");
var BranchDB = require("./branch_db");
var PrefsDB = require("./prefs_db");
var BranchStatus = require("./branch_status");
var Promise = require("bluebird");
var notifier = require("node-notifier");
var cp = require("child_process");

// when clicking on the notification, we display the menubar
notifier.on("click", function() {
  cp.exec("osascript '" + __dirname + "/scripts/show-menu-bar.applescript'");
});

function failureNotification(failedBranches) {
  var message;
  if (failedBranches.length === 1) {
    message = failedBranches[0] + " is now failing!";
  } else {
    message = failedBranches.length + " branches are now failing!\n";
    message += failedBranches.join(", ");
  };

  notifier.notify({
    title : "Jenkinator",
    message: message,
    sound: "Ping",
    wait : true
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
        prefsDb.notifyOnBuildFailure().then(function(shouldNotify) {
          if (shouldNotify && syncData.failedBranches.length > 0) failureNotification(syncData.failedBranches);
        });
      });

    });
});
