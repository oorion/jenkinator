var nStore = require('nstore')
nStore = nStore.extend(require('nstore/query')());

var _ = require("underscore")._;
var Promise = require("bluebird");

function BranchDB(storagePath) {
  this.storagePath = storagePath;
}

BranchDB.prototype = {

  ready: function(cb) {
    return new Promise(function(resolve) {
      this._db = nStore.new(this.storagePath + "/branches.json", function() {
        resolve(true);
      });
    }.bind(this));
  },

  addTrackedBranch: function(branchName, cb) {
    console.log("Tracking Branch:", branchName);
    this._db.save(branchName, {}, function(err, key) {
      cb();
    });
  },

  deleteTrackedBranch: function(branchName, cb) {
    this._db.remove(branchName, function(err) {
      cb();
    });
  },

  updateTrackedBranch: function(branchName, values) {
    return new Promise(function(resolve) {
      console.log("Updating Branch:", branchName);
      this._db.save(branchName, values, function(err, key) {
        resolve(true);
      });
    }.bind(this));
  },

  trackedBranches: function(cb) {
    this._db.all(function(err, results) {
      var resultsArray = [];
      _.each(results, function(v, k) {
        resultsArray.push(_.extend(v, { name : k }));
      });

      cb(resultsArray);
    });
  },

  failCount: function() {
    return new Promise(function(resolve) {
      this._db.find({ "status !=" : "success" }, function(err, results) {
        resolve(_.keys(results).length);
      })
    }.bind(this));
  }

};

module.exports = BranchDB;
