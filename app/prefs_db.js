var nStore = require('nstore')
nStore = nStore.extend(require('nstore/query')());

var _ = require("underscore")._;
var Promise = require("bluebird");

var NOT_FOUND_REGEXP = /Document does not exist for/

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

  get: function(key, defaultValue) {
    return new Promise(function(resolve) {
      this._db.get(key, function(err, doc) {
        // when the document isn't found, resolve with the default value, which itself may not be provided
        if (err && NOT_FOUND_REGEXP.test(err.message)) {
          resolve(defaultValue);
        } else {
          resolve(doc);
        }
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

  notifyOnBuildFailure : function() {
    return this.get("notifyOnBuildFailure", true);
  }
};

module.exports = PrefsDB;
