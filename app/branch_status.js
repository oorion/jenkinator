var request = require('request');
var EventEmitter = require("events").EventEmitter;
var _ = require("underscore")._;
var Promise = require("bluebird");
var displayNotification = require('display-notification');

function BranchStatus(db) {
  this._db = db;
  EventEmitter.call(this);
}

BranchStatus.prototype = {

  sync : function() {
    console.log("Syncing branch status...starting");
    request('http://jenkinstein.herokuapp.com/branches.json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var branches = JSON.parse(body).latest;
        
        // convert array to hash for convenience below
        var branchesHash = {}
        branches.forEach(function(b){
          branchesHash[b.name] = b;
        });

        this._db.trackedBranches(function(trackedBranches) {
          Promise.all(this._createWritePromises(branchesHash, trackedBranches)).then(function() {
            console.log("Syncing branch status...complete");
            this.emit("sync:complete");
            displayNotification({
              title: 'Sync is complete',
              subtitle: 'Hi Nick!!',
              text: 'We have synced up',
              sound: 'Ping'
            });
          }.bind(this));
        }.bind(this));
      }
      else {
        console.log("SYNC ERROR with branch status server");
        console.log(error);
        console.log(response.statusCode);
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