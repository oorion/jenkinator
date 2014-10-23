var nStore = require('nstore')
nStore = nStore.extend(require('nstore/query')());

var _ = require("underscore")._;
var Promise = require("bluebird");

function PrefsDB(storagePath) {
  this.storagePath = storagePath;
}

PrefsDB.prototype = {

  ready: function(cb) {
    return new Promise(function(resolve) {
      this._db = nStore.new(this.storagePath + "/prefs.json", function() {
        resolve(true);
      });
    }.bind(this));
  }
  
};

module.exports = PrefsDB;
