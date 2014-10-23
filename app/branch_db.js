var nStore = require('nstore')
nStore = nStore.extend(require('nstore/query')());

var _ = require("underscore")._;

function BranchDB(storagePath) {
  this.storagePath = storagePath;
}

BranchDB.prototype = {

  ready: function(cb) {
    this._db = nStore.new(this.storagePath + "/branches.json", cb);
  },

  addTrackedBranch: function(branchName, cb) {
    console.log("Tracking Branch:", branchName);
    this._db.save(branchName, {}, function(err, key) {
      cb();
    });
  },

  updateTrackedBranch: function(branchName, values) {
    console.log("Updating Branch:", branchName);
    this._db.save(branchName, values, function(err, key) {
      // cb();
    });
  },

  trackedBranches: function(cb) {
    this._db.all(function(err, results) {
      var resultsArray = [];
      _.each(results, function(v, k) {
        resultsArray.push(_.extend(v, { name : k }));
      });

      cb(resultsArray);
    });
  }

};

module.exports = BranchDB;
