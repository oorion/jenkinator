var low = require('lowdb')

function BranchDB(storagePath) {
  this.storagePath = storagePath;
}

BranchDB.prototype = {

  // seems like we need to get a fresh handle to the db as writing within a timeout does not actually persist the data
  _getDb : function() {
    return low(this.storagePath + "/branches.json");
  },

  addTrackedBranch: function(branchName) {
    console.log("Tracking Branch:", branchName);
    this._getDb()("trackedBranches").push({ name: branchName });
  },
  
  updateTrackedBranch: function(branchName, values) {
    this._getDb()("trackedBranches").find({ name: branchName }).assign(values);
  },

  trackedBranches: function() {
    return this._getDb()("trackedBranches").value();
  }

};

module.exports = BranchDB;