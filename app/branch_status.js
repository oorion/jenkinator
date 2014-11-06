var request = require('request');
var EventEmitter = require("events").EventEmitter;
var _ = require("underscore")._;
var Promise = require("bluebird");

function BranchStatus(db) {
  this._db = db;
  this._pollInterval = null;
  this.SYNC_URL = "http://jenkinstein.herokuapp.com/branches.json";

  _.bindAll(this, "sync");

  EventEmitter.call(this);
}

BranchStatus.prototype = {

  startPolling: function() {
    this.sync();
    this._pollInterval = setInterval(this.sync, 5 * 60 * 1000);
  },

  stopPolling: function() {
    if (this._pollInterval) {
      clearInterval(this._pollInterval);
      this._pollInterval = null;
    }
  },

  sync : function() {
    this.emit("sync:start");
    console.log("SYNC start: " + this.SYNC_URL);

    request(this.SYNC_URL, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var branches = JSON.parse(body).latest;

        // convert array to hash for convenience below
        var branchesHash = {};
        branches.forEach(function(b){
          branchesHash[b.name] = b;
        });

        this._db.trackedBranches(function(trackedBranches) {
          Promise.all(this._createWritePromises(branchesHash, trackedBranches)).then(function() {
            console.log("Syncing branch status...complete");
            this._db.failCount().then(function(failCount) {
              this.emit("sync:complete", { failCount : failCount });
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }
      else {
        console.log("SYNC ERROR with branch status server");
        console.log(error);
      }
    }.bind(this));
  },

  _createWritePromises: function(branches, trackedBranches) {
    var writePromises = trackedBranches.map(function(branch) {
      console.log("looking at " + branch.name);

      var info = branches[branch.name];
      if (info) {
        console.log(info);
        return this._db.updateTrackedBranch(branch.name, {
          name : branch.name,
          status : info.green ? 'success' : 'failed',
          lastBuild : {
            time : info.last_built,
            url : info.url,
            sha : info.sha
          }
        });
      }
      else {
        console.log("Warning: did not find branch '" + branch.name + "' in server status JSON");
        return null;
      }
    }, this);

    return _.compact(writePromises);
  }

};

_.extend(BranchStatus.prototype, EventEmitter.prototype);

module.exports = BranchStatus;