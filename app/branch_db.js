var low = require('lowdb')

function BranchDB(storagePath) {
  this._db = low(storagePath + "/branches.json");
}

BranchDB.prototype = {

  addTrackedBranch: function(branchName) {
    this._db("trackedBranches").push({ name: branchName });
  }

};

module.exports = BranchDB;