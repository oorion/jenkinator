var App = require('app');
var TrayMenu = require("./tray_menu");

App.on("window-all-closed", function() {
  if (process.platform !== "darwin") App.quit();
});

App.on("ready", function() {
  var trayMenu = new TrayMenu();
});