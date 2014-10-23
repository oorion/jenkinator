var request = require('request');
var EventEmitter = require("events").EventEmitter;
var _ = require("underscore")._;
var Promise = require("bluebird");

function BranchStatus(db) {
  this._db = db;
  EventEmitter.call(this);
}

BranchStatus.prototype = {

  sync : function() {
    request('http://jenkinstein.herokuapp.com/branches.json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var branches = JSON.parse(body);

        // walk the DB, look up the status in the branches JSON and update the DB
        this._db.trackedBranches(function(trackedBranches) {
          Promise.all(_.compact(this._createWritePromises(trackedBranches))).then(function(a) {
            this.emit("sync:complete");
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

  _createWritePromises: function(trackedBranches) {
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
  }

};

_.extend(BranchStatus.prototype, EventEmitter.prototype);

module.exports = BranchStatus;