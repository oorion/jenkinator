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
  },

  get: function(key) {
    return new Promise(function(resolve) {
      this._db.get(key, function(err, doc) {
        resolve(doc);
      })
    }.bind(this));
  },

  set: function(key, values) {
    return new Promise(function(resolve) {
      this._db.save(key, values, function(err) {
        resolve(true);
      })
    }.bind(this));
  },
};

module.exports = PrefsDB;
