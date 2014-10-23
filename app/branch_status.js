var request = require('request');
var EventEmitter = require("events").EventEmitter;
var _ = require("underscore")._;

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
          trackedBranches.forEach(function(branch) {
            console.log("looking at " + branch.name);

            var info = branches[branch.name];

            if (info) {
              console.log(info);
              this._db.updateTrackedBranch(branch.name, { name : branch.name, status : info.green ? 'success' : 'failed', lastBuild : { time : info.last_built, url : info.url, sha : info.sha } });
            }
            else {
              console.log("Warning: did not find branch '" + branch.name + "' in server status JSON");
            }
          }, this);
        }.bind(this));
      }
      else {
        console.log("SYNC ERROR with branch status server");
        console.log(error);
        console.log(response.statusCode);
      }
      this.emit("sync:complete");
    }.bind(this));
  }

};

_.extend(BranchStatus.prototype, EventEmitter.prototype);

module.exports = BranchStatus;